/**
 * TIP-006: Candidate and Screening Persistence Types
 * Maps to database schema in supabase/migrations/001_schema_rls_audit.sql
 */

// ---------------------------------------------------------------------------
// Domain Enums (matching database enum types)
// ---------------------------------------------------------------------------

export type CandidateStatus =
  | 'imported'
  | 'screened'
  | 'shortlisted'
  | 'interview_invited'
  | 'interview_submitted'
  | 'assessment_assigned'
  | 'test_submitted'
  | 'final_review'
  | 'hired'
  | 'rejected';

export type ScreeningRecommendation = 'advance' | 'review' | 'reject';
export type ScreeningDecision = 'advanced' | 'rejected' | 'changes_requested';
export type ActorType = 'internal_user' | 'candidate' | 'system' | 'provider';

// ---------------------------------------------------------------------------
// Core Entity Types
// ---------------------------------------------------------------------------

export interface Candidate {
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

export interface ScreeningResult {
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

export interface AuditEvent {
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

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface CreateCandidateRequest {
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;
  cvSourceReference?: string;
  cvParsedMetadata?: Record<string, unknown>;
}

export interface UpdateCandidateStatusRequest {
  candidateId: string;
  status: CandidateStatus;
}

export interface CreateScreeningResultRequest {
  candidateId: string;
  jobId: string;
  jdVersionId: string;
  score?: number;
  recommendation?: ScreeningRecommendation;
  strengths?: string[];
  risks?: string[];
  evidenceMetadata?: Record<string, unknown>;
}

export interface ReviewScreeningRequest {
  screeningResultId: string;
  decision: ScreeningDecision;
  reviewedBy: string;
}

export interface CreateAuditEventRequest {
  actorType: ActorType;
  actorId?: string;
  entityType: string;
  entityId: string;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Validation Types
// ---------------------------------------------------------------------------

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ---------------------------------------------------------------------------
// Import Candidate Entry (for batch import)
// ---------------------------------------------------------------------------

export interface ImportCandidateEntry {
  fullName: string;
  email: string;
  phone?: string;
  jobId: string;
  cvSourceReference?: string;
}

export interface ImportResult {
  success: boolean;
  candidateId?: string;
  errors: ValidationError[];
}
