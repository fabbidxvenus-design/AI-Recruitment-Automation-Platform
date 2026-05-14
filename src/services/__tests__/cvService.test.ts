import { describe, it, expect, beforeEach, vi } from 'vitest';
import cvService from '@/services/cvService';

describe('cvService', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('getCVEvidence', () => {
    it('returns ApiResponse with success and correct shape', async () => {
      const result = await cvService.getCVEvidence({ cvId: 'cv-001' });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data).toHaveProperty('cvId');
        expect(result.data).toHaveProperty('structuredData');
        expect(result.data).toHaveProperty('extractedSections');
        expect(result.data).toHaveProperty('originalCvUrl');

        expect(typeof result.data.cvId).toBe('string');
        expect(typeof result.data.structuredData).toBe('object');
        expect(Array.isArray(result.data.extractedSections)).toBe(true);
        expect(typeof result.data.originalCvUrl).toBe('string');
      }
    });

    it('returns requested cvId and original CV URL for known input', async () => {
      const result = await cvService.getCVEvidence({ cvId: 'cv-abc-123' });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.cvId).toBe('cv-abc-123');
        expect(result.data.originalCvUrl).toBe('/uploads/cv/cv-abc-123.pdf');
      }
    });

    it('returns structured contact, education, experience, skills, and certifications data', async () => {
      const result = await cvService.getCVEvidence({ cvId: 'cv-001' });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.structuredData.contactInfo.email).toBe('candidate@example.com');
        expect(result.data.structuredData.contactInfo.phone).toBe('+84 123 456 789');
        expect(result.data.structuredData.education.length).toBeGreaterThan(0);
        expect(result.data.structuredData.experience.length).toBeGreaterThan(0);
        expect(result.data.structuredData.skills).toContain('React');
        expect(result.data.structuredData.certifications).toContain('AWS Certified Developer');
      }
    });

    it('returns all expected extracted section names', async () => {
      const result = await cvService.getCVEvidence({ cvId: 'cv-001' });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.extractedSections).toEqual([
          'contact',
          'education',
          'experience',
          'skills',
          'certifications',
        ]);
      }
    });

    it('preserves empty cvId in response when cvId is missing', async () => {
      const result = await cvService.getCVEvidence({ cvId: '' });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.cvId).toBe('');
        expect(result.data.originalCvUrl).toBe('/uploads/cv/.pdf');
      }
    });

    it('handles unusual cvId values without changing response envelope shape', async () => {
      const result = await cvService.getCVEvidence({ cvId: 'cv with spaces/and-symbols' });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      if (result.data) {
        expect(result.data.cvId).toBe('cv with spaces/and-symbols');
        expect(result.data.originalCvUrl).toBe('/uploads/cv/cv with spaces/and-symbols.pdf');
        expect(result.data.structuredData).toBeDefined();
        expect(result.data.extractedSections.length).toBeGreaterThan(0);
      }
    });
  });
});
