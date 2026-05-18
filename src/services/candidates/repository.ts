import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Candidate,
  ScreeningResult,
  AuditEvent,
  CreateCandidateRequest,
  UpdateCandidateStatusRequest,
  CreateScreeningResultRequest,
  ReviewScreeningRequest,
  CreateAuditEventRequest,
  ImportResult,
  ValidationError,
  ValidationResult,
  CandidateStatus,
  ImportCandidateEntry,
} from './types';
import {
  mapToCandidateEntity,
  mapFromCandidateRecord,
  mapToScreeningResultEntity,
  mapFromScreeningResultRecord,
  mapToAuditEventEntity,
  mapFromAuditEventRecord,
  mapToUpdateCandidateEntity,
  mapFromUpdateCandidateRecord,
  mapToReviewScreeningEntity,
  mapImportEntry,
} from './mapper';

export function validateCandidate(data: CreateCandidateRequest): ValidationResult {
  const errors: ValidationError[] = [];
  if (!data.fullName || data.fullName.trim() === '') {
    errors.push({ field: 'fullName', message: 'Full name is required' });
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }
  if (!data.jobId || data.jobId.trim() === '') {
    errors.push({ field: 'jobId', message: 'Job ID is required' });
  }
  return { valid: errors.length === 0, errors };
}

export function validateScreeningScore(score?: number): ValidationResult {
  const errors: ValidationError[] = [];
  if (score !== undefined && (score < 0 || score > 100)) {
    errors.push({ field: 'score', message: 'Screening score must be between 0 and 100' });
  }
  return { valid: errors.length === 0, errors };
}

export function validateScreeningResultReference(data: CreateScreeningResultRequest): ValidationResult {
  const errors: ValidationError[] = [];
  if (!data.candidateId || data.candidateId.trim() === '') {
    errors.push({ field: 'candidateId', message: 'Candidate ID is required' });
  }
  if (!data.jobId || data.jobId.trim() === '') {
    errors.push({ field: 'jobId', message: 'Job ID is required' });
  }
  if (!data.jdVersionId || data.jdVersionId.trim() === '') {
    errors.push({ field: 'jdVersionId', message: 'JD Version ID is required' });
  }
  return { valid: errors.length === 0, errors };
}

export class CandidatesRepository {
  constructor(private readonly client: SupabaseClient) {}

  async createCandidate(request: CreateCandidateRequest): Promise<ImportResult> {
    const validation = validateCandidate(request);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const entity = mapToCandidateEntity(request);
    const { data, error } = await this.client
      .from('candidates')
      .insert([entity])
      .select()
      .single();

    if (error) throw error;

    await this.createAuditEvent({
      actorType: 'internal_user',
      entityType: 'candidate',
      entityId: data.id,
      eventType: 'candidate.imported',
      summary: `Candidate imported: ${data.id}`,
      metadata: { jobId: data.job_id, source: 'manual_import' },
    });

    return { success: true, candidateId: data.id, errors: [] };
  }

  async getCandidateById(candidateId: string): Promise<Candidate | null> {
    const { data, error } = await this.client
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapFromCandidateRecord(data) : null;
  }

  async listCandidatesByJob(jobId: string, status?: CandidateStatus): Promise<Candidate[]> {
    let query = this.client.from('candidates').select('*').eq('job_id', jobId);
    if (status) query = query.eq('status', status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data ? data.map(mapFromCandidateRecord) : [];
  }

  async updateCandidateStatus(request: UpdateCandidateStatusRequest): Promise<boolean> {
    const updateData = mapToUpdateCandidateEntity(request);
    const { error } = await this.client
      .from('candidates')
      .update(updateData)
      .eq('id', request.candidateId);

    if (error) throw error;

    const candidate = await this.getCandidateById(request.candidateId);
    if (candidate) {
      await this.createAuditEvent({
        actorType: 'internal_user',
        entityType: 'candidate',
        entityId: candidate.id,
        eventType: 'candidate.status_changed',
        summary: `Candidate status changed: ${candidate.id}`,
        metadata: { previousStatus: 'imported', newStatus: request.status, jobId: candidate.jobId },
      });
    }
    return true;
  }

  async createScreeningResult(request: CreateScreeningResultRequest): Promise<ImportResult> {
    const scoreValidation = validateScreeningScore(request.score);
    if (!scoreValidation.valid) return { success: false, errors: scoreValidation.errors };
    const refValidation = validateScreeningResultReference(request);
    if (!refValidation.valid) return { success: false, errors: refValidation.errors };

    const entity = mapToScreeningResultEntity(request);
    const { data, error } = await this.client
      .from('screening_results')
      .insert([entity])
      .select()
      .single();

    if (error) throw error;

    await this.createAuditEvent({
      actorType: 'internal_user',
      entityType: 'screening_result',
      entityId: data.id,
      eventType: 'screening_result.created',
      summary: `Screening result created for candidate`,
      metadata: { candidateId: data.candidate_id, jobId: data.job_id, score: data.score },
    });

    return { success: true, candidateId: data.id, errors: [] };
  }

  async getScreeningResultById(id: string): Promise<ScreeningResult | null> {
    const { data, error } = await this.client
      .from('screening_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapFromScreeningResultRecord(data) : null;
  }

  async getScreeningResultsByCandidate(candidateId: string): Promise<ScreeningResult[]> {
    const { data, error } = await this.client
      .from('screening_results')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(mapFromScreeningResultRecord) : [];
  }

  async getScreeningResultsByJob(jobId: string): Promise<ScreeningResult[]> {
    const { data, error } = await this.client
      .from('screening_results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(mapFromScreeningResultRecord) : [];
  }

  async reviewScreeningResult(request: ReviewScreeningRequest): Promise<boolean> {
    const updateData = mapToReviewScreeningEntity(request);
    const { error } = await this.client
      .from('screening_results')
      .update(updateData)
      .eq('id', request.screeningResultId);

    if (error) throw error;

    const screeningResult = await this.getScreeningResultById(request.screeningResultId);
    if (screeningResult) {
      await this.createAuditEvent({
        actorType: 'internal_user',
        actorId: request.reviewedBy,
        entityType: 'screening_result',
        entityId: screeningResult.id,
        eventType: `screening_result.${request.decision}`,
        summary: `Screening result ${request.decision}`,
        metadata: {
          candidateId: screeningResult.candidateId,
          score: screeningResult.score,
          newDecision: request.decision,
        },
      });

      if (request.decision === 'advanced') {
        await this.updateCandidateStatus({ candidateId: screeningResult.candidateId, status: 'screened' });
      }
    }
    return true;
  }

  async createAuditEvent(request: CreateAuditEventRequest): Promise<string> {
    const entity = mapToAuditEventEntity(request);
    const { data, error } = await this.client
      .from('audit_events')
      .insert([entity])
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create audit event: ${error.message}`);
    return data.id;
  }

  async getAuditEventsByEntity(entityType: string, entityId: string): Promise<AuditEvent[]> {
    const { data, error } = await this.client
      .from('audit_events')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(mapFromAuditEventRecord) : [];
  }

  async importCandidatesBatch(entries: ImportCandidateEntry[]): Promise<ImportResult[]> {
    const results: ImportResult[] = [];
    for (const entry of entries) {
      const mappedEntry = mapImportEntry(entry);
      const request: CreateCandidateRequest = {
        jobId: mappedEntry.jobId,
        fullName: mappedEntry.fullName,
        email: mappedEntry.email,
        phone: mappedEntry.phone,
        cvSourceReference: mappedEntry.cvSourceReference,
      };
      results.push(await this.createCandidate(request));
    }
    return results;
  }
}