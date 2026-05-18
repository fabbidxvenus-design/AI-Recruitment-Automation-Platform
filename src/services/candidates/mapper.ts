/**
 * TIP-006: Candidate and Screening Mapper
 * Transforms between domain types and database entities
 */

import type {
  Candidate,
  ScreeningResult,
  AuditEvent,
  CreateCandidateRequest,
  UpdateCandidateStatusRequest,
  CreateScreeningResultRequest,
  ReviewScreeningRequest,
  CreateAuditEventRequest,
  ImportCandidateEntry,
  CandidateStatus,
  ScreeningRecommendation,
  ScreeningDecision,
  ActorType,
} from './types';

interface CandidateEntity {
  id: string;
  candidateUserId?: string;
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;
  status: CandidateStatus;
  cvSourceReference?: string;
  cvParsedMetadata?: Record<string, unknown>;
  evidenceMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ScreeningResultEntity {
  id: string;
  candidateId: string;
  jobId: string;
  jdVersionId: string;
  score?: number;
  recommendation?: ScreeningRecommendation;
  strengths: string[];
  risks: string[];
  evidenceMetadata?: Record<string, unknown>;
  reviewerDecision?: ScreeningDecision;
  reviewedBy?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface AuditEventEntity {
  id: string;
  actorType: ActorType;
  actorId?: string;
  entityType: string;
  entityId: string;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Map domain candidate to database candidate format
 */
export function mapToCandidateEntity(
  request: CreateCandidateRequest,
  candidateId: string = `cand-${Date.now()}`
): CandidateEntity {
  const now = new Date().toISOString();

  return {
    id: candidateId,
    candidateUserId: undefined,
    jobId: request.jobId,
    fullName: request.fullName,
    email: request.email,
    phone: request.phone,
    status: 'imported',
    cvSourceReference: request.cvSourceReference,
    cvParsedMetadata: request.cvParsedMetadata,
    evidenceMetadata: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Map database candidate record to domain candidate
 */
function nullToUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

export function mapFromCandidateRecord(record: Record<string, unknown>): Candidate {
  return {
    id: record.id as string,
    candidateUserId: nullToUndefined(record.candidate_user_id as string | null),
    jobId: record.job_id as string,
    fullName: record.full_name as string,
    email: record.email as string,
    phone: nullToUndefined(record.phone as string | null),
    status: record.status as CandidateStatus,
    cvSourceReference: nullToUndefined(record.cv_source_reference as string | null),
    cvParsedMetadata: nullToUndefined(record.cv_parsed_metadata as Record<string, unknown> | null),
    evidenceMetadata: nullToUndefined(record.evidence_metadata as Record<string, unknown> | null),
    createdAt: record.created_at as string,
    updatedAt: record.updated_at as string,
  };
}

/**
 * Map domain screening result to database screening result format
 */
export function mapToScreeningResultEntity(
  request: CreateScreeningResultRequest,
  screeningResultId: string = `scr-${Date.now()}`
): ScreeningResultEntity {
  const now = new Date().toISOString();

  return {
    id: screeningResultId,
    candidateId: request.candidateId,
    jobId: request.jobId,
    jdVersionId: request.jdVersionId,
    score: request.score,
    recommendation: request.recommendation,
    strengths: request.strengths ?? [],
    risks: request.risks ?? [],
    evidenceMetadata: request.evidenceMetadata,
    reviewerDecision: undefined,
    reviewedBy: undefined,
    createdAt: now,
    reviewedAt: undefined,
  };
}

/**
 * Map database screening result record to domain screening result
 */
export function mapFromScreeningResultRecord(record: Record<string, unknown>): ScreeningResult {
  if (typeof record !== 'object' || record === null || Array.isArray(record)) {
    console.error('[candidates/mapper] mapFromScreeningResultRecord: invalid record type', record);
    throw new Error('Invalid screening result record: expected object');
  }
  return {
    id: record.id as string,
    candidateId: record.candidate_id as string,
    jobId: record.job_id as string,
    jdVersionId: record.jd_version_id as string,
    score: record.score as number,
    recommendation: record.recommendation as ScreeningRecommendation | undefined,
    strengths: (record.strengths ?? []) as string[],
    risks: (record.risks ?? []) as string[],
    evidenceMetadata: record.evidence_metadata as Record<string, unknown> | undefined,
    reviewerDecision: record.reviewer_decision as ScreeningDecision | undefined,
    reviewedBy: record.reviewed_by as string | undefined,
    createdAt: record.created_at as string,
    reviewedAt: record.reviewed_at as string | undefined,
  };
}

/**
 * Map domain audit event to database audit event format
 */
export function mapToAuditEventEntity(
  request: CreateAuditEventRequest,
  auditEventId: string = `audit-${Date.now()}`
): AuditEventEntity {
  const now = new Date().toISOString();

  return {
    id: auditEventId,
    actorType: request.actorType,
    actorId: request.actorId,
    entityType: request.entityType,
    entityId: request.entityId,
    eventType: request.eventType,
    summary: request.summary,
    metadata: request.metadata,
    createdAt: now,
  };
}

/**
 * Map database audit event record to domain audit event
 */
export function mapFromAuditEventRecord(record: Record<string, unknown>): AuditEvent {
  if (typeof record !== 'object' || record === null || Array.isArray(record)) {
    console.error('[candidates/mapper] mapFromAuditEventRecord: invalid record type', record);
    throw new Error('Invalid audit event record: expected object');
  }
  return {
    id: record.id as string,
    actorType: record.actor_type as ActorType,
    actorId: record.actor_id as string | undefined,
    entityType: record.entity_type as string,
    entityId: record.entity_id as string,
    eventType: record.event_type as string,
    summary: record.summary as string,
    metadata: record.metadata as Record<string, unknown> | undefined,
    createdAt: record.created_at as string,
  };
}

/**
 * Map domain candidate update to database candidate update format
 */
export function mapToUpdateCandidateEntity(
  request: UpdateCandidateStatusRequest
): Partial<Pick<Candidate, 'status' | 'updatedAt'>> {
  return {
    status: request.status,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Map database candidate update result to domain candidate
 */
export function mapFromUpdateCandidateRecord(record: Record<string, unknown>): Partial<Candidate> {
  return {
    status: record.status as CandidateStatus,
    updatedAt: record.updated_at as string,
  };
}

/**
 * Map domain screening review to database screening result update
 */
export function mapToReviewScreeningEntity(
  request: ReviewScreeningRequest
): Partial<Pick<ScreeningResult, 'reviewerDecision' | 'reviewedBy' | 'reviewedAt'>> {
  return {
    reviewerDecision: request.decision,
    reviewedBy: request.reviewedBy,
    reviewedAt: new Date().toISOString(),
  };
}

/**
 * Map domain import candidate entry to validation-ready format
 */
export function mapImportEntry(entry: ImportCandidateEntry): ImportCandidateEntry {
  return {
    fullName: entry.fullName.trim(),
    email: entry.email.trim().toLowerCase(),
    phone: entry.phone ? entry.phone.trim() : undefined,
    jobId: entry.jobId,
    cvSourceReference: entry.cvSourceReference?.trim(),
  };
}