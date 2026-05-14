/**
 * Content Generation Service
 * API-011: POST /api/content/generate
 * API-012: POST /api/content/approve
 */

import type { ApiResponse, ApprovalDecision } from '@/types/api';
import type { ContentBrief, GeneratedContent, ContentVariant } from '@/types/content-generation';
import { mockGeneratedContents } from '@/lib/mock-content-data';

// ---------------------------------------------------------------------------
// Request/Response DTOs
// ---------------------------------------------------------------------------

export interface GenerateContentRequest {
  brief: ContentBrief;
}

export interface GenerateContentResponse {
  contentId: string;
  variants: ContentVariant[];
  status: 'pending';
  isAiGenerated: true;
}

export interface ApproveContentRequest {
  contentId: string;
  decision: ApprovalDecision;
  notes?: string;
  approver: string;
}

export interface ApproveContentResponse {
  contentId: string;
  status: 'approved' | 'rejected';
  publishedContent?: string;
}

// ---------------------------------------------------------------------------
// Service Implementation
// ---------------------------------------------------------------------------

const contentService = {
  /**
   * API-011: Generate content variants from brief
   */
  async generateContent(
    request: GenerateContentRequest
  ): Promise<ApiResponse<GenerateContentResponse>> {
    try {
      // Simulate AI generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const contentId = `content-${Date.now()}`;
      const timestamp = new Date().toISOString();

      const variants: ContentVariant[] = [
        {
          id: `var-${contentId}-1`,
          title: 'Variant A: Technical Focus',
          content: `# ${request.brief.jobTitle}\n\nGenerated content based on your requirements...`,
          aiModel: 'gemini-2.0-flash',
          confidence: 0.92,
          generatedAt: timestamp,
          isAiGenerated: true,
        },
        {
          id: `var-${contentId}-2`,
          title: 'Variant B: Culture Focus',
          content: `# ${request.brief.jobTitle}\n\nAlternative approach emphasizing company culture...`,
          aiModel: 'gemini-2.0-flash',
          confidence: 0.88,
          generatedAt: timestamp,
          isAiGenerated: true,
        },
      ];

      return {
        success: true,
        data: {
          contentId,
          variants,
          status: 'pending',
          isAiGenerated: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content generation failed',
      };
    }
  },

  /**
   * API-012: Approve or reject generated content
   */
  async approveContent(
    request: ApproveContentRequest
  ): Promise<ApiResponse<ApproveContentResponse>> {
    try {
      // Simulate approval processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find content in mock data
      const content = mockGeneratedContents.find((c) => c.id === request.contentId);

      if (!content) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Content with ID ${request.contentId} not found`,
          },
        };
      }

      const status = request.decision === 'approve' ? 'approved' : 'rejected';

      let publishedContent: string | undefined;
      if (status === 'approved' && content.selectedVariantId) {
        const selectedVariant = content.variants.find(
          (v) => v.id === content.selectedVariantId
        );
        publishedContent = selectedVariant?.content;
      }

      return {
        success: true,
        data: {
          contentId: request.contentId,
          status,
          publishedContent,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content approval failed',
      };
    }
  },
};

export default contentService;
