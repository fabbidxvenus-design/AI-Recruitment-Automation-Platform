/**
 * DATA-CV-001, DATA-CV-002, DATA-CV-003
 * CV Intake and Versioning Types
 */

export interface CandidateCV {
  id: string;
  candidateId: string;
  originalFileName: string;
  driveFileId?: string;
  uploadedAt: string;
}

export interface CVVersion {
  id: string;
  candidateId: string;
  cvFileId: string;
  versionNumber: number;
  createdAt: string;
}

export interface CVExtractionResult {
  id: string;
  cvVersionId: string;
  extractedProfile: {
    fullName: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string;
    education: string[];
    language: string[];
  };
  confidence: number;
  extractedAt: string;
}

export interface CandidateApplication {
  id: string;
  candidateId: string;
  jobId: string;
  cvVersionId: string;
  jdVersionId: string;
  parsedCriteriaVersion: number;
  status: string;
  appliedAt: string;
}
