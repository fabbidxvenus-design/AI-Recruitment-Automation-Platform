import { describe, it, expect, beforeEach, vi } from 'vitest';
import cvService from '@/services/cvService';

describe('cvService', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('importCV', () => {
    it('returns ApiResponse with success and correct shape', async () => {
      const request = {
        candidateId: 'cand-123',
        fileName: 'resume.pdf',
      };

      const result = await cvService.importCV(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data).toHaveProperty('cv');
        expect(result.data).toHaveProperty('version');

        const { cv, version } = result.data;

        expect(cv.candidateId).toBe(request.candidateId);
        expect(cv.originalFileName).toBe(request.fileName);
        expect(typeof cv.id).toBe('string');
        expect(typeof cv.uploadedAt).toBe('string');

        expect(version.candidateId).toBe(request.candidateId);
        expect(version.cvFileId).toBe(cv.id);
        expect(version.versionNumber).toBe(1);
        expect(typeof version.id).toBe('string');
      }
    });
  });

  describe('extractCVProfile', () => {
    it('returns ApiResponse with success and extracted profile data', async () => {
      const cvVersionId = 'cv-ver-123';
      const result = await cvService.extractCVProfile(cvVersionId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.cvVersionId).toBe(cvVersionId);
        expect(result.data.confidence).toBeGreaterThan(0);
        expect(result.data.extractedProfile).toBeDefined();

        const profile = result.data.extractedProfile;
        expect(profile.fullName).toBeDefined();
        expect(Array.isArray(profile.skills)).toBe(true);
        expect(typeof result.data.id).toBe('string');
      }
    });
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
