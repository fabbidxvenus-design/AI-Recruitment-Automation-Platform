/**
 * Jobs Repository
 * DB access layer for jobs and JD versions.
 *
 * Scope (TIP-005):
 * - Job CRUD
 * - JD version create/list
 * - JD approval/rejection with approver+timestamp
 * - Audit events for create/approve/reject
 *
 * Key rules (03-business-definition.json):
 * - BR-JOB-001: Approved parsed JD is matching source of truth
 * - BR-JOB-002: JD approval required before screening
 * - BR-JOB-003: JD and criteria versioning preserves reproducibility
 * - BR-012: Audit trail is mandatory for accountability
 * - BR-001: Human approval mandatory at business decision gates
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Job, JDVersion, ApprovalStatus } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Input for creating a job row. */
export interface CreateJobInput {
  title: string;
  department: string;
  location: string;
}

/** Input for creating an original JD document row. */
export interface CreateJDDocumentInput {
  jobId: string;
  sourceType: string;
  fileName?: string;
  content: string;
}

/** Input for creating a JD version row. */
export interface CreateJDVersionInput {
  jobId: string;
  jdDocumentId: string;
  versionNumber: number;
}

/** Approval action taken by HR Manager. */
export interface ApprovalAction {
  jdVersionId: string;
  action: 'approve' | 'reject';
  approverId: string;
  approverName: string;
  reason?: string; // Required for rejection; optional for approval
}

/** Audit event recorded for accountability. */
export interface AuditEvent {
  id: string;
  entityType: 'job' | 'jd_version' | 'jd_document';
  entityId: string;
  eventType: string;
  actorType: 'internal_user' | 'candidate' | 'system' | 'provider';
  actorId?: string;
  actorName?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class JobsRepository {
  constructor(private readonly client: SupabaseClient) {}

  // -------------------------------------------------------------------------
  // Jobs
  // -------------------------------------------------------------------------

  /**
   * Create a new job row.
   * Triggers: AUDIT-001 (job created)
   */
  async createJob(input: CreateJobInput, actorId?: string, actorName?: string): Promise<Job> {
    const { data, error } = await this.client
      .from('jobs')
      .insert({
        title: input.title,
        department: input.department,
        location: input.location,
        status: 'open',
        owner_id: actorId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create job: ${error.message}`);

    await this.recordAuditEvent({
      entityType: 'job',
      entityId: data.id,
      eventType: 'created',
      actorType: 'internal_user',
      actorId,
      actorName,
      summary: `Job created: ${input.title}`,
      metadata: { title: input.title, department: input.department },
    });

    return this.mapJobRow(data);
  }

  /**
   * List all jobs ordered by most recent first.
   */
  async listJobs(): Promise<Job[]> {
    const { data, error } = await this.client
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to list jobs: ${error.message}`);
    return (data ?? []).map(this.mapJobRow);
  }

  /**
   * Get a single job by ID.
   */
  async getJob(id: string): Promise<Job | null> {
    const { data, error } = await this.client
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get job: ${error.message}`);
    }
    return this.mapJobRow(data);
  }

  // -------------------------------------------------------------------------
  // JD Documents
  // -------------------------------------------------------------------------

  /**
   * Create an original JD document row (source of truth evidence).
   */
  async createJDDocument(
    input: CreateJDDocumentInput,
    actorId?: string,
    actorName?: string
  ): Promise<string> {
    const { data, error } = await this.client
      .from('jd_documents')
      .insert({
        job_id: input.jobId,
        source_type: input.sourceType,
        file_name: input.fileName,
        content: input.content,
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create JD document: ${error.message}`);

    await this.recordAuditEvent({
      entityType: 'jd_document',
      entityId: data.id,
      eventType: 'uploaded',
      actorType: 'internal_user',
      actorId,
      actorName,
      summary: `JD document uploaded for job ${input.jobId}`,
      metadata: { job_id: input.jobId, source_type: input.sourceType },
    });

    return data.id;
  }

  // -------------------------------------------------------------------------
  // JD Versions
  // -------------------------------------------------------------------------

  /**
   * Create a new JD version row.
   * Triggers: AUDIT-002 (version created)
   */
  async createJDVersion(
    input: CreateJDVersionInput,
    actorId?: string,
    actorName?: string
  ): Promise<JDVersion> {
    const { data, error } = await this.client
      .from('jd_versions')
      .insert({
        job_id: input.jobId,
        jd_document_id: input.jdDocumentId,
        version_number: input.versionNumber,
        status: 'pending',
        created_by: actorId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create JD version: ${error.message}`);

    await this.recordAuditEvent({
      entityType: 'jd_version',
      entityId: data.id,
      eventType: 'created',
      actorType: 'internal_user',
      actorId,
      actorName,
      summary: `JD version ${input.versionNumber} created for job ${input.jobId}`,
      metadata: {
        job_id: input.jobId,
        jd_document_id: input.jdDocumentId,
        version_number: input.versionNumber,
      },
    });

    return this.mapJDVersionRow(data);
  }

  /**
   * List JD versions for a job, ordered by version number descending.
   */
  async listJDVersions(jobId: string): Promise<JDVersion[]> {
    const { data, error } = await this.client
      .from('jd_versions')
      .select('*')
      .eq('job_id', jobId)
      .order('version_number', { ascending: false });

    if (error) throw new Error(`Failed to list JD versions: ${error.message}`);
    return (data ?? []).map(this.mapJDVersionRow);
  }

  /**
   * Get the latest JD version number for a job.
   */
  async getLatestVersionNumber(jobId: string): Promise<number> {
    const { data, error } = await this.client
      .from('jd_versions')
      .select('version_number')
      .eq('job_id', jobId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Failed to get latest version number: ${error.message}`);
    return data && data.length > 0 ? data[0].version_number : 0;
  }

  // -------------------------------------------------------------------------
  // Approval / Rejection (HR Manager gate — BR-001, BR-JOB-002)
  // -------------------------------------------------------------------------

  /**
   * Approve a JD version.
   * Records approver, timestamp, and AUDIT-003 audit event.
   * HR Manager is the only authorized role (RE-quired by BR-001).
   */
  async approveJDVersion(
    jdVersionId: string,
    approverId: string,
    approverName: string
  ): Promise<JDVersion> {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('jd_versions')
      .update({
        status: 'approved' as ApprovalStatus,
        approved_at: now,
        approved_by_id: approverId,
        approved_by_name: approverName,
      })
      .eq('id', jdVersionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve JD version: ${error.message}`);

    await this.recordAuditEvent({
      entityType: 'jd_version',
      entityId: jdVersionId,
      eventType: 'approved',
      actorType: 'internal_user',
      actorId: approverId,
      actorName: approverName,
      summary: `JD version approved`,
      metadata: { status: 'approved', approved_at: now },
    });

    return this.mapJDVersionRow(data);
  }

  /**
   * Reject a JD version with a required reason.
   * Records rejector, timestamp, reason, and AUDIT-004 audit event.
   */
  async rejectJDVersion(
    jdVersionId: string,
    rejectorId: string,
    rejectorName: string,
    reason: string
  ): Promise<JDVersion> {
    if (!reason.trim()) {
      throw new Error('Rejection reason is required');
    }

    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('jd_versions')
      .update({
        status: 'rejected' as ApprovalStatus,
        approved_at: now,
        approved_by_id: rejectorId,
        approved_by_name: rejectorName,
        rejection_reason: reason,
      })
      .eq('id', jdVersionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to reject JD version: ${error.message}`);

    await this.recordAuditEvent({
      entityType: 'jd_version',
      entityId: jdVersionId,
      eventType: 'rejected',
      actorType: 'internal_user',
      actorId: rejectorId,
      actorName: rejectorName,
      summary: `JD version rejected`,
      metadata: { status: 'rejected', rejection_reason: reason, rejected_at: now },
    });

    return this.mapJDVersionRow(data);
  }

  /**
   * Get a single JD version by ID.
   */
  async getJDVersion(id: string): Promise<JDVersion | null> {
    const { data, error } = await this.client
      .from('jd_versions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get JD version: ${error.message}`);
    }
    return this.mapJDVersionRow(data);
  }

  // -------------------------------------------------------------------------
  // Audit
  // -------------------------------------------------------------------------

  /**
   * Record an audit event (BR-012: Audit trail is mandatory).
   */
  private async recordAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await this.client.from('audit_events').insert({
      entity_type: event.entityType,
      entity_id: event.entityId,
      event_type: event.eventType,
      actor_type: event.actorType,
      actor_id: event.actorId,
      actor_name: event.actorName,
      summary: event.summary,
      metadata: event.metadata ?? {},
    });

    if (error) {
      // Log but do not throw — audit failure must not block the primary operation
      console.error('[JobsRepository] Failed to record audit event:', error.message);
    }
  }

  /**
   * List audit events for a given entity.
   */
  async listAuditEvents(entityType: string, entityId: string): Promise<AuditEvent[]> {
    const { data, error } = await this.client
      .from('audit_events')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to list audit events: ${error.message}`);
    return (data ?? []).map(this.mapAuditRow);
  }

  // -------------------------------------------------------------------------
  // Row mappers
  // -------------------------------------------------------------------------

  private mapJobRow(row: Record<string, unknown>): Job {
    return {
      id: row.id as string,
      title: row.title as string,
      department: row.department as string,
      location: row.location as string,
      status: (row.status as string) as Job['status'],
      postedAt: row.created_at as string,
      candidateCount: (row.candidate_count as number) ?? 0,
      pipelineSummary: [],
    };
  }

  private mapJDVersionRow(row: Record<string, unknown>): JDVersion {
    return {
      id: row.id as string,
      jobId: row.job_id as string,
      versionNumber: row.version_number as number,
      status: (row.status as string) as ApprovalStatus,
      jdDocumentId: row.jd_document_id as string,
      createdAt: row.created_at as string,
      approvedAt: (row.approved_at as string) ?? undefined,
    };
  }

  private mapAuditRow(row: Record<string, unknown>): AuditEvent {
    return {
      id: row.id as string,
      entityType: row.entity_type as AuditEvent['entityType'],
      entityId: row.entity_id as string,
      eventType: row.event_type as string,
      actorType: (row.actor_type as AuditEvent['actorType']) ?? 'internal_user',
      actorId: (row.actor_id as string) ?? undefined,
      actorName: (row.actor_name as string) ?? undefined,
      summary: row.summary as string,
      metadata: (row.metadata as Record<string, unknown>) ?? undefined,
      createdAt: row.created_at as string,
    };
  }
}
