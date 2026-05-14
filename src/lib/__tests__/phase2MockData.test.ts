import { describe, it, expect } from 'vitest';
import { mockCVEvidence, mockCVTranslations, mockInterviewTranslations } from '@/lib/phase2MockData';

describe('phase2MockData', () => {
  describe('mockCVEvidence', () => {
    it('has required fields', () => {
      expect(mockCVEvidence).toBeDefined();
      expect(Array.isArray(mockCVEvidence)).toBe(true);
      expect(mockCVEvidence.length).toBeGreaterThan(0);

      mockCVEvidence.forEach((evidence) => {
        expect(evidence).toHaveProperty('id');
        expect(evidence).toHaveProperty('cvId');
        expect(evidence).toHaveProperty('candidateId');
        expect(evidence).toHaveProperty('originalCvUrl');
        expect(evidence).toHaveProperty('extractedAt');
        expect(evidence).toHaveProperty('isAiGenerated');
        expect(evidence).toHaveProperty('structuredData');

        expect(typeof evidence.id).toBe('string');
        expect(typeof evidence.cvId).toBe('string');
        expect(typeof evidence.candidateId).toBe('string');
        expect(typeof evidence.originalCvUrl).toBe('string');
        expect(typeof evidence.extractedAt).toBe('string');
        expect(evidence.isAiGenerated).toBe(true);
      });
    });

    it('has valid structuredData with required sections', () => {
      mockCVEvidence.forEach((evidence) => {
        const data = evidence.structuredData;

        expect(data).toHaveProperty('contactInfo');
        expect(data).toHaveProperty('education');
        expect(data).toHaveProperty('experience');
        expect(data).toHaveProperty('skills');

        expect(data.contactInfo).toHaveProperty('email');
        expect(Array.isArray(data.education)).toBe(true);
        expect(Array.isArray(data.experience)).toBe(true);
        expect(Array.isArray(data.skills)).toBe(true);
      });
    });

    it('has valid education entries', () => {
      mockCVEvidence.forEach((evidence) => {
        evidence.structuredData.education.forEach((edu) => {
          expect(edu).toHaveProperty('institution');
          expect(edu).toHaveProperty('degree');
          expect(edu).toHaveProperty('fieldOfStudy');
          expect(edu).toHaveProperty('startDate');
          expect(edu).toHaveProperty('endDate');
        });
      });
    });

    it('has valid experience entries', () => {
      mockCVEvidence.forEach((evidence) => {
        evidence.structuredData.experience.forEach((exp) => {
          expect(exp).toHaveProperty('company');
          expect(exp).toHaveProperty('title');
          expect(exp).toHaveProperty('startDate');
          expect(exp).toHaveProperty('description');
        });
      });
    });
  });

  describe('mockCVTranslations', () => {
    it('has required fields', () => {
      expect(mockCVTranslations).toBeDefined();
      expect(Array.isArray(mockCVTranslations)).toBe(true);
      expect(mockCVTranslations.length).toBeGreaterThan(0);

      mockCVTranslations.forEach((translation) => {
        expect(translation).toHaveProperty('id');
        expect(translation).toHaveProperty('cvId');
        expect(translation).toHaveProperty('candidateId');
        expect(translation).toHaveProperty('sourceLang');
        expect(translation).toHaveProperty('targetLang');
        expect(translation).toHaveProperty('translatedText');
        expect(translation).toHaveProperty('status');
        expect(translation).toHaveProperty('isAiGenerated');
        expect(translation).toHaveProperty('createdAt');

        expect(typeof translation.id).toBe('string');
        expect(typeof translation.cvId).toBe('string');
        expect(typeof translation.candidateId).toBe('string');
        expect(typeof translation.sourceLang).toBe('string');
        expect(typeof translation.targetLang).toBe('string');
        expect(typeof translation.translatedText).toBe('string');
        expect(typeof translation.status).toBe('string');
        expect(translation.isAiGenerated).toBe(true);
      });
    });

    it('has valid language codes', () => {
      const validLangCodes = ['en', 'vi'];

      mockCVTranslations.forEach((translation) => {
        expect(validLangCodes).toContain(translation.sourceLang);
        expect(validLangCodes).toContain(translation.targetLang);
      });
    });

    it('has valid status values', () => {
      const validStatuses = ['pending', 'approved', 'rejected'];

      mockCVTranslations.forEach((translation) => {
        expect(validStatuses).toContain(translation.status);
      });
    });
  });

  describe('mockInterviewTranslations', () => {
    it('has required fields', () => {
      expect(mockInterviewTranslations).toBeDefined();
      expect(Array.isArray(mockInterviewTranslations)).toBe(true);
      expect(mockInterviewTranslations.length).toBeGreaterThan(0);

      mockInterviewTranslations.forEach((translation) => {
        expect(translation).toHaveProperty('id');
        expect(translation).toHaveProperty('interviewId');
        expect(translation).toHaveProperty('candidateId');
        expect(translation).toHaveProperty('sourceLang');
        expect(translation).toHaveProperty('targetLang');
        expect(translation).toHaveProperty('translatedText');
        expect(translation).toHaveProperty('status');
        expect(translation).toHaveProperty('isAiGenerated');
        expect(translation).toHaveProperty('createdAt');

        expect(typeof translation.id).toBe('string');
        expect(typeof translation.interviewId).toBe('string');
        expect(typeof translation.candidateId).toBe('string');
        expect(typeof translation.sourceLang).toBe('string');
        expect(typeof translation.targetLang).toBe('string');
        expect(typeof translation.translatedText).toBe('string');
        expect(typeof translation.status).toBe('string');
        expect(translation.isAiGenerated).toBe(true);
      });
    });

    it('has valid language codes', () => {
      const validLangCodes = ['en', 'vi'];

      mockInterviewTranslations.forEach((translation) => {
        expect(validLangCodes).toContain(translation.sourceLang);
        expect(validLangCodes).toContain(translation.targetLang);
      });
    });

    it('has valid status values', () => {
      const validStatuses = ['pending', 'approved', 'rejected'];

      mockInterviewTranslations.forEach((translation) => {
        expect(validStatuses).toContain(translation.status);
      });
    });
  });
});
