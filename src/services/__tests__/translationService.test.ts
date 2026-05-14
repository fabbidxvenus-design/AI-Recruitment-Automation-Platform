import { describe, it, expect, beforeEach, vi } from 'vitest';
import translationService from '@/services/translationService';

describe('translationService', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('translateCV', () => {
    it('returns ApiResponse with success and correct shape', async () => {
      const result = await translationService.translateCV({
        candidateId: 'cand-001',
        targetLanguage: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.translatedCV).toBeDefined();
        expect(result.data.translatedCV.id).toContain('cv-trans-');
        expect(result.data.translatedCV.status).toBe('pending_approval');
      }
    });

    it('returns correct candidate name for known candidate', async () => {
      const result = await translationService.translateCV({
        candidateId: 'cand-001',
        targetLanguage: 'vi',
      });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.translatedCV.candidateName).toBe('John Doe');
        expect(result.data.translatedCV.originalSections.length).toBeGreaterThan(0);
        expect(result.data.translatedCV.translatedSections.length).toBeGreaterThan(0);
      }
    });
  });

  describe('approveCVTranslation', () => {
    it('returns approved status when decision is approve', async () => {
      const result = await translationService.approveCVTranslation({
        translationId: 'cv-trans-001',
        decision: 'approve',
        approver: 'hr@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.translationId).toBe('cv-trans-001');
        expect(result.data.status).toBe('approved');
      }
    });

    it('returns rejected status when decision is reject', async () => {
      const result = await translationService.approveCVTranslation({
        translationId: 'cv-trans-002',
        decision: 'reject',
        approver: 'hr@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.translationId).toBe('cv-trans-002');
        expect(result.data.status).toBe('rejected');
      }
    });
  });

  describe('translateInterview', () => {
    it('returns ApiResponse with success and correct shape', async () => {
      const result = await translationService.translateInterview({
        interviewId: 'int-001',
        targetLang: 'vi',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data).toHaveProperty('translationId');
        expect(result.data).toHaveProperty('translatedText');
        expect(result.data).toHaveProperty('status');
        expect(result.data).toHaveProperty('isAiGenerated');

        expect(typeof result.data.translationId).toBe('string');
        expect(result.data.translationId).toContain('interview-trans-');
        expect(typeof result.data.translatedText).toBe('string');
        expect(result.data.status).toBe('pending');
        expect(result.data.isAiGenerated).toBe(true);
      }
    });

    it('includes targetLang and interviewId in translated text', async () => {
      const result = await translationService.translateInterview({
        interviewId: 'int-456',
        targetLang: 'en',
      });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.translatedText).toContain('en');
        expect(result.data.translatedText).toContain('int-456');
      }
    });
  });

  describe('approveInterviewTranslation', () => {
    it('returns approved status when decision is approve', async () => {
      const result = await translationService.approveInterviewTranslation({
        translationId: 'int-trans-001',
        decision: 'approve',
        approver: 'hr@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.translationId).toBe('int-trans-001');
        expect(result.data.status).toBe('approved');
      }
    });

    it('returns rejected status when decision is reject', async () => {
      const result = await translationService.approveInterviewTranslation({
        translationId: 'int-trans-002',
        decision: 'reject',
        approver: 'hr@company.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.translationId).toBe('int-trans-002');
        expect(result.data.status).toBe('rejected');
      }
    });
  });
});
