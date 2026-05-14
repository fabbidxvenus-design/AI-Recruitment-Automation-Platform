/**
 * Design Generation Service
 * API-013: POST /api/design/generate
 * API-014: POST /api/design/approve
 */

import type { ApiResponse, ApprovalDecision } from '@/types/api';
import type { DesignBrief, DesignVariant } from '@/types/ai-design';

// ---------------------------------------------------------------------------
// Request/Response DTOs
// ---------------------------------------------------------------------------

export interface GenerateDesignRequest {
  brief: DesignBrief;
}

export interface GenerateDesignResponse {
  designId: string;
  variants: DesignVariant[];
  status: 'pending';
  isAiGenerated: true;
}

export interface ApproveDesignRequest {
  designId: string;
  decision: ApprovalDecision;
  approver: string;
}

export interface ApproveDesignResponse {
  designId: string;
  status: 'approved' | 'rejected';
  approvedDesign?: DesignVariant;
}

// ---------------------------------------------------------------------------
// Service Implementation
// ---------------------------------------------------------------------------

const MOCK_DELAY_MS = 2000;

const designService = {
  /**
   * API-013: Generate design mockups from brief
   */
  async generateDesign(
    request: GenerateDesignRequest
  ): Promise<ApiResponse<GenerateDesignResponse>> {
    try {
      // Validate brief
      if (
        !request.brief.designType ||
        !request.brief.jobTitle ||
        !request.brief.companyName ||
        !request.brief.keyMessage ||
        !request.brief.targetAudience
      ) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Design brief is incomplete',
          },
        };
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

      const designId = `design-${Date.now()}`;
      const timestamp = new Date().toISOString();

      const provenance = {
        model: 'gemini-2.0-flash-exp',
        generatedAt: timestamp,
        confidence: 0.9,
        parameters: { style: 'professional' },
      };

      const variants: DesignVariant[] = [
        {
          id: `var-${designId}-1`,
          imageUrl: `/mock-designs/${request.brief.designType}-1.png`,
          thumbnail: `/mock-designs/${request.brief.designType}-1-thumb.png`,
          title: 'Modern Minimalist',
          description: 'Clean lines, bold typography',
          dimensions: { width: 1920, height: 1080 },
          provenance,
          isAiGenerated: true,
        },
        {
          id: `var-${designId}-2`,
          imageUrl: `/mock-designs/${request.brief.designType}-2.png`,
          thumbnail: `/mock-designs/${request.brief.designType}-2-thumb.png`,
          title: 'Professional Corporate',
          description: 'Traditional layout, corporate colors',
          dimensions: { width: 1920, height: 1080 },
          provenance,
          isAiGenerated: true,
        },
      ];

      return {
        success: true,
        data: {
          designId,
          variants,
          status: 'pending',
          isAiGenerated: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Design generation failed',
      };
    }
  },

  /**
   * API-014: Approve or reject generated design
   */
  async approveDesign(
    request: ApproveDesignRequest
  ): Promise<ApiResponse<ApproveDesignResponse>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const status = request.decision === 'approve' ? 'approved' : 'rejected';

      let approvedDesign: DesignVariant | undefined;
      if (status === 'approved') {
        // Return a mock approved design
        approvedDesign = {
          id: `var-${request.designId}-1`,
          imageUrl: '/mock-designs/job_poster-1.png',
          thumbnail: '/mock-designs/job_poster-1-thumb.png',
          title: 'Modern Minimalist',
          description: 'Clean lines, bold typography',
          dimensions: { width: 1920, height: 1080 },
          provenance: {
            model: 'gemini-2.0-flash-exp',
            generatedAt: new Date().toISOString(),
            confidence: 0.9,
            parameters: {},
          },
          isAiGenerated: true,
        };
      }

      return {
        success: true,
        data: {
          designId: request.designId,
          status,
          approvedDesign,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Design approval failed',
      };
    }
  },
};

export default designService;
