import { describe, it, expect, beforeEach, vi } from 'vitest';
import contentService from '@/services/contentService';
import { mockGeneratedContents } from '@/lib/mock-content-data';
import type { ContentBrief } from '@/types/content-generation';

describe('contentService', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('generateContent', () => {
    it('returns ApiResponse with success and correct shape', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'Backend Developer',
        department: 'Engineering',
        experienceLevel: 'senior',
        keyRequirements: ['Node.js', 'PostgreSQL'],
      };

      const result = await contentService.generateContent({ brief });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data).toHaveProperty('contentId');
        expect(result.data).toHaveProperty('variants');
        expect(result.data).toHaveProperty('status');
        expect(result.data).toHaveProperty('isAiGenerated');

        expect(typeof result.data.contentId).toBe('string');
        expect(Array.isArray(result.data.variants)).toBe(true);
        expect(result.data.variants.length).toBe(2);
        expect(result.data.status).toBe('pending');
        expect(result.data.isAiGenerated).toBe(true);
      }
    });

    it('generates variants containing jobTitle in content', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'Product Manager',
        department: 'Product',
        experienceLevel: 'mid',
        keyRequirements: ['Agile', 'Scrum'],
      };

      const result = await contentService.generateContent({ brief });

      expect(result.success).toBe(true);
      if (result.data) {
        result.data.variants.forEach((variant) => {
          expect(variant.content).toContain('Product Manager');
        });
      }
    });
  });

  describe('approveContent', () => {
    it('changes status to approved and returns publishedContent when approved', async () => {
      const existingContent = mockGeneratedContents[0];

      const result = await contentService.approveContent({
        contentId: existingContent.id,
        decision: 'approve',
        approver: 'test@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.contentId).toBe(existingContent.id);
        expect(result.data.status).toBe('approved');

        // Find the selected variant
        const selectedVariant = existingContent.variants.find(
          (v) => v.id === existingContent.selectedVariantId
        );
        expect(result.data.publishedContent).toBe(selectedVariant?.content);
      }
    });

    it('changes status to rejected and does not return publishedContent when rejected', async () => {
      const existingContent = mockGeneratedContents[0];

      const result = await contentService.approveContent({
        contentId: existingContent.id,
        decision: 'reject',
        approver: 'test@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.contentId).toBe(existingContent.id);
        expect(result.data.status).toBe('rejected');
        expect(result.data.publishedContent).toBeUndefined();
      }
    });

    it('returns error when content is not found', async () => {
      const result = await contentService.approveContent({
        contentId: 'non-existent-id',
        decision: 'approve',
        approver: 'test@company.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
      expect(result.error).toContain('Content with ID non-existent-id not found');
    });
  });
});
