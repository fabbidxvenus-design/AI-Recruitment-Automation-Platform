/**
 * Job Intake Service
 * API-JOB-001: Create/Import Job/JD
 * API-JOB-002: Parse and Approve JD
 */

import type { ApiResponse } from '@/types/api';
import type {
  JobIntake,
  OriginalJDDocument,
  JDVersion,
  ParsedJDProfile,
  JDSourceType
} from '@/types';
import { mockJobs, mockOriginalJDDocuments, mockJDVersions, mockParsedJDProfiles } from '@/lib/jobIntakeMockData';

export interface CreateJobRequest {
  title: string;
  department: string;
  location: string;
  sourceType: JDSourceType;
  content: string;
  fileName?: string;
}

export interface ParseJDRequest {
  jobId: string;
  jdDocumentId: string;
}

const jobService = {
  /**
   * API-JOB-001: Create a new job with JD
   */
  async createJob(request: CreateJobRequest): Promise<ApiResponse<{ job: JobIntake; document: OriginalJDDocument }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const jobId = `job-${Date.now()}`;
      const docId = `jd-doc-${Date.now()}`;

      const newJob: JobIntake = {
        id: jobId,
        title: request.title,
        department: request.department,
        location: request.location,
        status: 'open',
        postedAt: new Date().toISOString(),
        candidateCount: 0,
      };

      const newDoc: OriginalJDDocument = {
        id: docId,
        jobId: jobId,
        sourceType: request.sourceType,
        fileName: request.fileName,
        content: request.content,
        uploadedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: { job: newJob, document: newDoc },
      };
    } catch (error: unknown) {
      console.error('[jobService] createJob failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      };
    }
  },

  /**
   * API-JOB-002: Parse JD document using AI
   */
  async parseJD(request: ParseJDRequest): Promise<ApiResponse<ParsedJDProfile>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const jdVersionId = `jd-ver-${Date.now()}`;

      // Mock parsing logic
      const parsedProfile: ParsedJDProfile = {
        id: `parsed-jd-${Date.now()}`,
        jdVersionId: jdVersionId,
        parsedCriteriaVersion: 1,
        title: 'Extracted Job Title',
        skills: ['React', 'TypeScript', 'Node.js'],
        responsibilities: ['Develop features', 'Write tests'],
        requirements: ['3+ years experience'],
        language: ['English'],
        seniority: 'Mid-level',
        education: ['Bachelor degree'],
        status: 'draft',
      };

      return {
        success: true,
        data: parsedProfile,
      };
    } catch (error: unknown) {
      console.error('[jobService] parseJD failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse JD',
      };
    }
  },

  /**
   * Get job by ID
   */
  async getJob(id: string): Promise<ApiResponse<JobIntake>> {
    const job = mockJobs.find(j => j.id === id);
    if (!job) return { success: false, error: 'Job not found' };
    return { success: true, data: job };
  }
};

export default jobService;
