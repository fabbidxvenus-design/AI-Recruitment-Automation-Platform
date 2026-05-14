import { describe, it, expect, beforeEach, vi } from 'vitest';
import { simulateAIGeneration } from '@/lib/mock-content-data';
import type { ContentBrief } from '@/types/content-generation';

describe('mock-content-data', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('simulateAIGeneration', () => {
    it('returns correct shape with variants array', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'Senior Frontend Developer',
        department: 'Engineering',
        experienceLevel: 'senior',
        keyRequirements: ['React', 'TypeScript'],
        additionalNotes: 'Remote position',
      };

      const result = await simulateAIGeneration(brief);

      expect(result).toHaveProperty('variants');
      expect(Array.isArray(result.variants)).toBe(true);
      expect(result.variants.length).toBeGreaterThan(0);
    });

    it('returns variants with all required fields', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'Backend Engineer',
        department: 'Engineering',
        experienceLevel: 'mid',
        keyRequirements: ['Node.js', 'PostgreSQL'],
      };

      const result = await simulateAIGeneration(brief);

      result.variants.forEach((variant) => {
        expect(variant).toHaveProperty('id');
        expect(variant).toHaveProperty('title');
        expect(variant).toHaveProperty('content');
        expect(variant).toHaveProperty('aiModel');
        expect(variant).toHaveProperty('confidence');
        expect(variant).toHaveProperty('generatedAt');
        expect(variant).toHaveProperty('isAiGenerated');

        expect(typeof variant.id).toBe('string');
        expect(typeof variant.title).toBe('string');
        expect(typeof variant.content).toBe('string');
        expect(typeof variant.aiModel).toBe('string');
        expect(typeof variant.confidence).toBe('number');
        expect(typeof variant.generatedAt).toBe('string');
        expect(variant.isAiGenerated).toBe(true);
      });
    });

    it('resolves after delay', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'Test Position',
        department: 'Test',
        experienceLevel: 'entry',
        keyRequirements: ['Testing'],
      };

      const startTime = Date.now();
      await simulateAIGeneration(brief);
      const endTime = Date.now();

      const elapsed = endTime - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(1900);
    });

    it('returns variants with valid confidence range 0-1', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'Data Scientist',
        department: 'Data',
        experienceLevel: 'senior',
        keyRequirements: ['Python', 'ML'],
      };

      const result = await simulateAIGeneration(brief);

      result.variants.forEach((variant) => {
        expect(variant.confidence).toBeGreaterThanOrEqual(0);
        expect(variant.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('includes job title in generated content', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'DevOps Engineer',
        department: 'Infrastructure',
        experienceLevel: 'mid',
        keyRequirements: ['Docker', 'Kubernetes'],
      };

      const result = await simulateAIGeneration(brief);

      result.variants.forEach((variant) => {
        expect(variant.content).toContain(brief.jobTitle);
      });
    });

    it('generates unique variant IDs', async () => {
      const brief: ContentBrief = {
        contentType: 'job_description',
        jobTitle: 'QA Engineer',
        department: 'Quality',
        experienceLevel: 'mid',
        keyRequirements: ['Testing', 'Automation'],
      };

      const result = await simulateAIGeneration(brief);

      const ids = result.variants.map((v) => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
