// Core entity types for RecruitAI

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: CandidateStatus;
  source: string;
  appliedAt: string;
  updatedAt: string;
  jobId: string;
  skills: string[];
  experience: number;
  location: string;
}

export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interviewing'
  | 'assessment'
  | 'final_review'
  | 'offered'
  | 'hired'
  | 'rejected';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'open' | 'paused' | 'closed';
  postedAt: string;
  candidateCount: number;
  pipelineSummary: PipelineStage[];
}

export interface PipelineStage {
  stage: string;
  count: number;
  color: string;
}

export interface ScreeningEvaluation {
  id: string;
  applicationId?: string; // Links to CandidateApplication (Cross-Domain Traceability)
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  cvVersionId?: string; // Linked CV Version
  jdVersionId?: string; // Linked JD Version
  parsedCriteriaVersion?: number; // Linked Parsed JD Profile
  aiProvenance?: {
    model: string;
    promptVersion: string;
    confidence: number;
    evaluatedAt: string;
  };
  overallScore: number;
  decision: 'approve' | 'reject' | 'needs_review';
  aiSummary: string;
  keyStrengths: string[];
  concerns: string[];
  evaluatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ScheduleSlot {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewerName: string;
  interviewType: string;
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  meetingLink?: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: string;
  expectedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  overallScore?: number;
  aiAnalysis?: string;
}

export interface InterviewResponse {
  questionId: string;
  answer: string;
  score?: number;
  aiFeedback?: string;
}

export interface TestResult {
  id: string;
  candidateId: string;
  candidateName: string;
  testName: string;
  score: number;
  maxScore: number;
  gradedAt: string;
  gradedBy: 'ai' | 'human' | 'override';
  status: 'pending' | 'approved' | 'flagged' | 'overridden';
  aiGrade?: string;
  humanGrade?: string;
  overrideReason?: string;
}

export interface FinalReviewPackage {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  overallScore: number;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  interviewSummary: string;
  testResultsSummary: string;
  compensation: {
    requested: number;
    recommended: number;
    approved: boolean;
  };
  documents: Document[];
  approvers: Approver[];
  decision: 'pending' | 'approved' | 'rejected';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface Approver {
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
}

export interface IntegrationHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSync: string;
  errorCount: number;
  endpoint: string;
}

export interface ErrorRemediationItem {
  id: string;
  errorCode: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  affectedEntities: string[];
  resolutionSteps: string[];
  assignee?: string;
}

export interface BQBlocker {
  id: string;
  code: string;
  title: string;
  description: string;
  screenIds: string[];
  requiresAction: string;
  priority: 'critical' | 'high' | 'medium';
}

// ---------------------------------------------------------------------------
// API contract types (Phase 2)
// ---------------------------------------------------------------------------
export type {
  LanguageCode,
  ApprovalDecision,
  ApprovalStatus,
  ApiError,
  ApiSuccess,
  ApiFailure,
  ApiResponse,
  PaginatedResponse,
} from './api';
export { isSuccess, isFailure, successResponse, failureResponse, paginatedResponse } from './api';

export type { CVEvidenceExtraction, CVStructuredData, ContactInfo, EducationEntry, ExperienceEntry } from './cv-evidence';
export type { CVTranslation, CVTranslationRequest } from './cv-translation';
export type { InterviewTranslation, InterviewTranslationRequest } from './interview-translation';
export type { CandidateCV, CVVersion, CVExtractionResult, CandidateApplication } from './cv-intake';
export type { Job as JobIntake, OriginalJDDocument, JDVersion, ParsedJDProfile, JobStatus, JDSourceType } from './job-intake';