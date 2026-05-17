/**
 * Jobs Mapper
 * Maps DB rows to domain shapes compatible with existing UI.
 *
 * Scope (TIP-005):
 * - Map job and JD version rows to UI-compatible types
 * - Preserve existing mock data shapes for backward compatibility
 * - Support loading/empty/error states when integrating into pages
 *
 * Key mappings:
 * - Jobs: `jobs` table → `Job` type from types/job-intake.ts
 * - JD Versions: `jd_versions` table → `JDVersion` type
 * - Original JD Documents: `jd_documents` table → `OriginalJDDocument` type
 *
 * UI compatibility requirements:
 * - Return types must match existing mock data shapes
 * - Page behavior must not change
 */

import type { Job, JDVersion, OriginalJDDocument, ParsedJDProfile, JobStatus, JDSourceType } from '@/types';
import { JobsRepository, type CreateJobInput, type CreateJDDocumentInput, type CreateJDVersionInput } from './repository';
import { createServiceRoleClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Result Types for UI Integration
// ---------------------------------------------------------------------------

/** Result of a job creation operation. */
export interface CreateJobResult {
  job: Job;
  document?: OriginalJDDocument;
}

/** Job with associated documents and versions for UI display. */
export interface JobWithDetails {
  job: Job;
  documents: OriginalJDDocument[];
  versions: JDVersion[];
  latestVersion?: JDVersion;
  approvedVersion?: JDVersion;
}

/** Loading/empty/error states for UI. */
export type JobState<T> =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'error'; error: string }
  | { state: 'loaded'; data: T };

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

export class JobsMapper {
  constructor(private readonly repository: JobsRepository) {}

  // -------------------------------------------------------------------------
  // Job Operations
  // -------------------------------------------------------------------------

  /**
   * Create a new job with initial JD document AND first version.
   * This single operation creates:
   * 1. Job row
   * 2. JD document row (source of truth evidence)
   * 3. JD version row (for approval workflow)
   *
   * Used by: `/jobs/intake` page
   */
  async createJob(
    input: {
      title: string;
      department: string;
      location: string;
      sourceType: JDSourceType;
      content: string;
      fileName?: string;
    },
    actorId?: string,
    actorName?: string
  ): Promise<CreateJobResult> {
    // 1. Create job
    const jobInput: CreateJobInput = {
      title: input.title,
      department: input.department,
      location: input.location,
    };
    const job = await this.repository.createJob(jobInput, actorId, actorName);

    // 2. Create JD document
    const docInput: CreateJDDocumentInput = {
      jobId: job.id,
      sourceType: input.sourceType,
      fileName: input.fileName,
      content: input.content,
    };
    const docId = await this.repository.createJDDocument(docInput, actorId, actorName);

    // 3. Create first version using actual document ID
    const versionInput: CreateJDVersionInput = {
      jobId: job.id,
      jdDocumentId: docId,
      versionNumber: 1,
    };
    const version = await this.repository.createJDVersion(versionInput, actorId, actorName);

    // Return job with document
    const document: OriginalJDDocument = {
      id: docId,
      jobId: job.id,
      sourceType: input.sourceType,
      fileName: input.fileName,
      content: input.content,
      uploadedAt: version.createdAt,
    };

    return { job, document };
  }

  /**
   * List all jobs for display.
   *
   * Used by: `/jobs/intake` list, `/jobs/versions` selector
   */
  async listJobs(): Promise<Job[]> {
    return this.repository.listJobs();
  }

  /**
   * Get a single job by ID.
   */
  async getJob(id: string): Promise<Job | null> {
    return this.repository.getJob(id);
  }

  /**
   * Get job details with documents and versions.
   *
   * Used by: `/jobs/versions` page
   */
  async getJobWithDetails(jobId: string): Promise<JobWithDetails | null> {
    const job = await this.repository.getJob(jobId);
    if (!job) return null;

    const versions = await this.repository.listJDVersions(jobId);
    const latestVersion = versions[0];
    const approvedVersion = versions.find((v) => v.status === 'approved');

    return {
      job,
      documents: [], // TODO: Fetch documents separately if needed
      versions,
      latestVersion,
      approvedVersion,
    };
  }

  // -------------------------------------------------------------------------
  // JD Version Operations
  // -------------------------------------------------------------------------

  /**
   * List versions for a job.
   *
   * Used by: `/jobs/versions` page
   */
  async listVersions(jobId: string): Promise<JDVersion[]> {
    return this.repository.listJDVersions(jobId);
  }

  /**
   * Get a single version by ID.
   */
  async getVersion(id: string): Promise<JDVersion | null> {
    return this.repository.getJDVersion(id);
  }

  /**
   * Create a new version for an existing job.
   * Increments version number automatically.
   *
   * Used by: Job re-upload/re-parse workflow
   */
  async createVersion(jobId: string, jdDocumentId: string, actorId?: string, actorName?: string): Promise<JDVersion> {
    const latestNumber = await this.repository.getLatestVersionNumber(jobId);
    const input: CreateJDVersionInput = {
      jobId,
      jdDocumentId,
      versionNumber: latestNumber + 1,
    };
    return this.repository.createJDVersion(input, actorId, actorName);
  }

  // -------------------------------------------------------------------------
  // Approval Operations (HR Manager gate — BR-001, BR-JOB-002)
  // -------------------------------------------------------------------------

  /**
   * Approve a JD version.
   * Only HR Manager can approve (BR-001).
   * After approval, JD becomes matching source of truth (BR-JOB-001).
   *
   * Used by: `/jobs/approval` page
   */
  async approveVersion(
    versionId: string,
    approverId: string,
    approverName: string
  ): Promise<JDVersion> {
    return this.repository.approveJDVersion(versionId, approverId, approverName);
  }

  /**
   * Reject a JD version with reason.
   * Reason is required for audit (BR-012).
   *
   * Used by: `/jobs/approval` page
   */
  async rejectVersion(
    versionId: string,
    rejectorId: string,
    rejectorName: string,
    reason: string
  ): Promise<JDVersion> {
    return this.repository.rejectJDVersion(versionId, rejectorId, rejectorName, reason);
  }

  // -------------------------------------------------------------------------
  // UI State Helpers
  // -------------------------------------------------------------------------

  /**
   * Wrap a repository call in loading/empty/error state for UI.
   */
  async wrapInState<T>(fn: () => Promise<T>): Promise<JobState<T>> {
    try {
      const data = await fn();
      if (Array.isArray(data) && data.length === 0) {
        return { state: 'empty' };
      }
      return { state: 'loaded', data };
    } catch (error: unknown) {
      return {
        state: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get jobs with state.
   */
  async getJobsState(): Promise<JobState<Job[]>> {
    return this.wrapInState(() => this.listJobs());
  }

  /**
   * Get job details with state.
   */
  async getJobWithDetailsState(jobId: string): Promise<JobState<JobWithDetails | null>> {
    return this.wrapInState(() => this.getJobWithDetails(jobId));
  }

  /**
   * Get versions with state.
   */
  async getVersionsState(jobId: string): Promise<JobState<JDVersion[]>> {
    return this.wrapInState(() => this.listVersions(jobId));
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a JobsMapper with a Supabase client.
 * Use createBrowserClient() for client components.
 * Use createServiceRoleClient() for server actions.
 */
export function createJobsMapper(client: ReturnType<typeof import('@/lib/supabase/browser').createBrowserClient>): JobsMapper {
  const repository = new JobsRepository(client);
  return new JobsMapper(repository);
}

export { JobsRepository };