import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateDesignVariants, validateDesignBrief, mockExportDesign } from '@/lib/ai-design-mock';
import type { DesignBrief } from '@/types/ai-design';

describe('ai-design-mock', () => {
  describe('generateDesignVariants', () => {
    const mockBrief: DesignBrief = {
      designType: 'social_media',
      jobTitle: 'Senior UI Designer',
      companyName: 'Creative Solutions',
      keyMessage: 'Looking for talented designers!',
      targetAudience: 'Product Designers in HCMC',
    };

    it('returns array of DesignVariant objects', async () => {
      const variants = await generateDesignVariants(mockBrief);

      expect(Array.isArray(variants)).toBe(true);
      expect(variants.length).toBe(3); // Based on styles array in source

      variants.forEach((variant) => {
        expect(variant).toHaveProperty('id');
        expect(variant).toHaveProperty('imageUrl');
        expect(variant).toHaveProperty('thumbnail');
        expect(variant).toHaveProperty('title');
        expect(variant).toHaveProperty('description');
        expect(variant).toHaveProperty('dimensions');
        expect(variant).toHaveProperty('provenance');
        expect(variant).toHaveProperty('isAiGenerated');
      });
    });

    it('sets isAiGenerated to true for all variants', async () => {
      const variants = await generateDesignVariants(mockBrief);

      variants.forEach((variant) => {
        expect(variant.isAiGenerated).toBe(true);
      });
    });

    it('includes required provenance fields', async () => {
      const variants = await generateDesignVariants(mockBrief);

      variants.forEach((variant) => {
        const prov = variant.provenance;
        expect(prov).toHaveProperty('model');
        expect(prov).toHaveProperty('generatedAt');
        expect(prov).toHaveProperty('confidence');
        expect(prov).toHaveProperty('parameters');
        expect(prov.confidence).toBeGreaterThanOrEqual(0);
        expect(prov.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('generates variants with styles-based titles and descriptions', async () => {
      const variants = await generateDesignVariants(mockBrief);

      const titles = variants.map((v) => v.title);
      expect(titles).toContain('Modern Minimalist');
      expect(titles).toContain('Professional Corporate');
      expect(titles).toContain('Creative Bold');
    });
  });

  describe('validateDesignBrief', () => {
    it('returns empty errors for valid brief', () => {
      const validBrief: DesignBrief = {
        designType: 'job_poster',
        jobTitle: 'Frontend Lead',
        companyName: 'Tech Co',
        keyMessage: 'Join us!',
        targetAudience: 'Developers',
      };

      const errors = validateDesignBrief(validBrief);
      expect(errors).toHaveLength(0);
    });

    it('rejects empty designType', () => {
      const invalidBrief = {
        jobTitle: 'Frontend Lead',
        companyName: 'Tech Co',
        keyMessage: 'Join us!',
        targetAudience: 'Developers',
      } as any;

      const errors = validateDesignBrief(invalidBrief);
      expect(errors).toContain('Design type is required');
    });

    it('rejects empty fields', () => {
      const emptyBrief: Partial<DesignBrief> = {
        designType: 'email_banner',
        jobTitle: '',
        companyName: '  ',
        keyMessage: '',
        targetAudience: '\n',
      };

      const errors = validateDesignBrief(emptyBrief);
      expect(errors).toContain('Job title is required');
      expect(errors).toContain('Company name is required');
      expect(errors).toContain('Key message is required');
      expect(errors).toContain('Target audience is required');
    });
  });

  describe('mockExportDesign', () => {
    it('returns expected shape with success', async () => {
      const result = await mockExportDesign('variant-1', 'png', 'linkedin');

      expect(result).toEqual({
        success: true,
        downloadUrl: '/mock-exports/variant-1.png',
      });
    });
  });
});
