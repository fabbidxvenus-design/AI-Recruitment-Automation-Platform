/**
 * CV Service
 * API-015: GET /api/cv/{cvId}/evidence
 */

import type { ApiResponse } from '@/types/api';
import type { CVEvidenceExtraction } from '@/types/cv-evidence';
import type { CandidateCV, CVVersion, CVExtractionResult } from '@/types/cv-intake';
import { mockCandidateCVs, mockCVVersions, mockCVExtractionResults } from '@/lib/cvIntakeMockData';

const MOCK_COMPANY = 'Tech Company Ltd.';

// ---------------------------------------------------------------------------
// Request/Response DTOs
// ---------------------------------------------------------------------------

export interface ImportCVRequest {
  candidateId: string;
  fileName: string;
  driveFileId?: string;
  fileContent?: string;
}

export interface GetCVEvidenceRequest {
  cvId: string;
}

export interface GetCVEvidenceResponse {
  cvId: string;
  structuredData: CVEvidenceExtraction['structuredData'];
  extractedSections: string[];
  originalCvUrl: string;
}

// ---------------------------------------------------------------------------
// Service Implementation
// ---------------------------------------------------------------------------

const cvService = {
  /**
   * API-001: Import CV (Manual, Drive, etc.)
   */
  async importCV(request: ImportCVRequest): Promise<ApiResponse<{ cv: CandidateCV; version: CVVersion }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const cvId = `cv-${Date.now()}`;
      const versionId = `cv-ver-${Date.now()}`;

      const newCV: CandidateCV = {
        id: cvId,
        candidateId: request.candidateId,
        originalFileName: request.fileName,
        driveFileId: request.driveFileId,
        uploadedAt: new Date().toISOString(),
      };

      const newVersion: CVVersion = {
        id: versionId,
        candidateId: request.candidateId,
        cvFileId: cvId,
        versionNumber: 1, // Default to 1 for first import
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: { cv: newCV, version: newVersion },
      };
    } catch (error: unknown) {
      console.error('[cvService] importCV failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import CV',
      };
    }
  },

  /**
   * API-002: Extract profile from CV PDF using AI
   */
  async extractCVProfile(cvVersionId: string): Promise<ApiResponse<CVExtractionResult>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result: CVExtractionResult = {
        id: `extract-${Date.now()}`,
        cvVersionId,
        extractedProfile: {
          fullName: 'Nguyen Van A',
          email: 'vana.nguyen@example.com',
          phone: '+84 900 123 456',
          skills: ['React', 'TypeScript', 'Node.js'],
          experience: '5 years',
          education: ['BSc Computer Science'],
          language: ['Vietnamese', 'English'],
        },
        confidence: 0.95,
        extractedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      console.error('[cvService] extractCVProfile failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Extraction failed',
      };
    }
  },

  /**
   * API-015: Get CV evidence extraction
   */
  async getCVEvidence(
    request: GetCVEvidenceRequest
  ): Promise<ApiResponse<GetCVEvidenceResponse>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock CV evidence data
      const mockEvidence: GetCVEvidenceResponse = {
        cvId: request.cvId,
        structuredData: {
          contactInfo: {
            email: 'candidate@example.com',
            phone: '+84 123 456 789',
            linkedIn: 'linkedin.com/in/candidate',
            location: 'Ho Chi Minh City, Vietnam',
          },
          education: [
            {
              institution: 'University of Technology',
              degree: 'Bachelor of Computer Science',
              fieldOfStudy: 'Software Engineering',
              startDate: '2018-09',
              endDate: '2022-06',
            },
          ],
          experience: [
            {
              company: MOCK_COMPANY,
              title: 'Frontend Developer',
              startDate: '2022-07',
              endDate: '2024-12',
              description: 'Developed web applications using React and TypeScript',
              achievements: [
                'Led migration to Next.js 14',
                'Improved page load time by 40%',
              ],
            },
          ],
          skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL'],
          certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
        },
        extractedSections: ['contact', 'education', 'experience', 'skills', 'certifications'],
        originalCvUrl: `/uploads/cv/${request.cvId}.pdf`,
      };

      return {
        success: true,
        data: mockEvidence,
      };
    } catch (error: unknown) {
      console.error('[cvService] getCVEvidence failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve CV evidence',
      };
    }
  },
};

export default cvService;
