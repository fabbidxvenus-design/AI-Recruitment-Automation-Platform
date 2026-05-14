import { describe, it, expect, beforeEach, vi } from 'vitest';
import designService from '@/services/designService';
import type { DesignBrief } from '@/types/ai-design';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validBrief(overrides: Partial<DesignBrief> = {}): DesignBrief {
  return {
    designType: 'job_poster',
    jobTitle: 'Frontend Developer',
    companyName: 'Acme Corp',
    keyMessage: 'Join our team',
    targetAudience: 'Senior engineers',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('designService', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  // -----------------------------------------------------------------------
  // generateDesign
  // -----------------------------------------------------------------------
  describe('generateDesign', () => {
    it('returns ApiResponse with success and correct shape', async () => {
      const result = await designService.generateDesign({ brief: validBrief() });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data).toHaveProperty('designId');
        expect(result.data).toHaveProperty('variants');
        expect(result.data).toHaveProperty('status');
        expect(result.data).toHaveProperty('isAiGenerated');

        expect(typeof result.data.designId).toBe('string');
        expect(Array.isArray(result.data.variants)).toBe(true);
        expect(result.data.variants.length).toBe(2);
        expect(result.data.status).toBe('pending');
        expect(result.data.isAiGenerated).toBe(true);
      }
    });

    it('generates variants with provenance and dimensions', async () => {
      const result = await designService.generateDesign({ brief: validBrief() });

      expect(result.success).toBe(true);
      if (result.data) {
        result.data.variants.forEach((variant) => {
          expect(variant.isAiGenerated).toBe(true);
          expect(variant.provenance.model).toBe('gemini-2.0-flash-exp');
          expect(variant.provenance.confidence).toBe(0.9);
          expect(variant.dimensions).toEqual({ width: 1920, height: 1080 });
        });
      }
    });

    it('generates image URLs based on designType in the brief', async () => {
      const result = await designService.generateDesign({
        brief: validBrief({ designType: 'social_media' }),
      });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.variants[0].imageUrl).toContain('social_media');
        expect(result.data.variants[1].imageUrl).toContain('social_media');
      }
    });

    it('returns validation error when designType is missing', async () => {
      const incompleteBrief = {
        designType: '',
        jobTitle: 'Developer',
        companyName: 'Acme',
        keyMessage: 'Hiring',
        targetAudience: 'Engineers',
      } as unknown as DesignBrief;

      const result = await designService.generateDesign({ brief: incompleteBrief });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      if (typeof result.error === 'object' && result.error !== null) {
        expect(result.error).toHaveProperty('code', 'VALIDATION_ERROR');
        expect(result.error).toHaveProperty('message', 'Design brief is incomplete');
      }
    });

    it('returns validation error when jobTitle is missing', async () => {
      const incompleteBrief = {
        designType: 'job_poster',
        jobTitle: '',
        companyName: 'Acme',
        keyMessage: 'Hiring',
        targetAudience: 'Engineers',
      } as unknown as DesignBrief;

      const result = await designService.generateDesign({ brief: incompleteBrief });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns validation error when companyName is missing', async () => {
      const incompleteBrief = {
        designType: 'job_poster',
        jobTitle: 'Developer',
        companyName: '',
        keyMessage: 'Hiring',
        targetAudience: 'Engineers',
      } as unknown as DesignBrief;

      const result = await designService.generateDesign({ brief: incompleteBrief });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns validation error when keyMessage is missing', async () => {
      const incompleteBrief = {
        designType: 'job_poster',
        jobTitle: 'Developer',
        companyName: 'Acme',
        keyMessage: '',
        targetAudience: 'Engineers',
      } as unknown as DesignBrief;

      const result = await designService.generateDesign({ brief: incompleteBrief });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns validation error when targetAudience is missing', async () => {
      const incompleteBrief = {
        designType: 'job_poster',
        jobTitle: 'Developer',
        companyName: 'Acme',
        keyMessage: 'Hiring',
        targetAudience: '',
      } as unknown as DesignBrief;

      const result = await designService.generateDesign({ brief: incompleteBrief });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('succeeds when optional fields are omitted', async () => {
      const brief = validBrief();
      // colorPreference and additionalNotes are optional
      delete brief.colorPreference;
      delete brief.additionalNotes;

      const result = await designService.generateDesign({ brief });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // approveDesign
  // -----------------------------------------------------------------------
  describe('approveDesign', () => {
    it('returns approved status and approvedDesign when decision is approve', async () => {
      const result = await designService.approveDesign({
        designId: 'design-001',
        decision: 'approve',
        approver: 'manager@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.designId).toBe('design-001');
        expect(result.data.status).toBe('approved');
        expect(result.data.approvedDesign).toBeDefined();
      }
    });

    it('includes correct approvedDesign variant shape when approved', async () => {
      const result = await designService.approveDesign({
        designId: 'design-001',
        decision: 'approve',
        approver: 'manager@company.com',
      });

      expect(result.success).toBe(true);
      if (result.data && result.data.approvedDesign) {
        expect(result.data.approvedDesign).toHaveProperty('id');
        expect(result.data.approvedDesign).toHaveProperty('imageUrl');
        expect(result.data.approvedDesign).toHaveProperty('thumbnail');
        expect(result.data.approvedDesign).toHaveProperty('title');
        expect(result.data.approvedDesign).toHaveProperty('dimensions');
        expect(result.data.approvedDesign).toHaveProperty('provenance');
        expect(result.data.approvedDesign.isAiGenerated).toBe(true);
      }
    });

    it('returns rejected status and no approvedDesign when decision is reject', async () => {
      const result = await designService.approveDesign({
        designId: 'design-002',
        decision: 'reject',
        approver: 'manager@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.designId).toBe('design-002');
        expect(result.data.status).toBe('rejected');
        expect(result.data.approvedDesign).toBeUndefined();
      }
    });

    it('echoes the designId back in the response regardless of decision', async () => {
      const approveResult = await designService.approveDesign({
        designId: 'custom-id-abc',
        decision: 'approve',
        approver: 'admin@company.com',
      });
      const rejectResult = await designService.approveDesign({
        designId: 'custom-id-xyz',
        decision: 'reject',
        approver: 'admin@company.com',
      });

      expect(approveResult.data?.designId).toBe('custom-id-abc');
      expect(rejectResult.data?.designId).toBe('custom-id-xyz');
    });
  });
});
