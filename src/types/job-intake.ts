/**
 * DATA-JOB-001, DATA-JOB-002, DATA-JOB-003, DATA-JOB-004
 * Job and JD Management Types
 */

import { ApprovalStatus } from './api';

export type JobStatus = 'open' | 'paused' | 'closed';
export type JDSourceType = 'manual' | 'text' | 'pdf' | 'docx' | 'drive' | 'sheet';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: JobStatus;
  postedAt: string;
  candidateCount: number;
}

export interface OriginalJDDocument {
  id: string;
  jobId: string;
  sourceType: JDSourceType;
  fileName?: string;
  content: string; // Text content or link to file
  uploadedAt: string;
}

export interface JDVersion {
  id: string;
  jobId: string;
  versionNumber: number;
  status: ApprovalStatus;
  jdDocumentId: string;
  createdAt: string;
  approvedAt?: string;
}

export interface ParsedJDProfile {
  id: string;
  jdVersionId: string;
  parsedCriteriaVersion: number;
  title: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  language: string[];
  seniority: string;
  education: string[];
  status: 'draft' | 'approved';
}
