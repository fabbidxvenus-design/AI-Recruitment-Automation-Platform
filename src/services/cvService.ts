/**
 * CV Service
 * API-015: GET /api/cv/{cvId}/evidence
 */

import type { ApiResponse } from '@/types/api';
import type { CVEvidenceExtraction } from '@/types/cv-evidence';

// ---------------------------------------------------------------------------
// Request/Response DTOs
// ---------------------------------------------------------------------------

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
              company: 'Tech Company Ltd.',
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve CV evidence',
      };
    }
  },
};

export default cvService;
