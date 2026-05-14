/**
 * Phase 2 Mock Data Fixtures
 * For CV evidence, CV translation, and interview translation
 */

import type { CVEvidenceExtraction } from '@/types/cv-evidence';
import type { CVTranslation } from '@/types/cv-translation';
import type { InterviewTranslation } from '@/types/interview-translation';

export const mockCVEvidence: CVEvidenceExtraction[] = [
  {
    id: 'evid-001',
    cvId: 'cv-001',
    candidateId: 'cand-001',
    originalCvUrl: '/uploads/cv/cv-001.pdf',
    extractedAt: '2026-05-13T10:00:00Z',
    isAiGenerated: true,
    structuredData: {
      contactInfo: {
        email: 'john.doe@example.com',
        phone: '+84 900 000 001',
        linkedIn: 'linkedin.com/in/johndoe',
        location: 'Ho Chi Minh City, Vietnam',
      },
      education: [
        {
          institution: 'Hanoi University of Science and Technology',
          degree: 'Bachelor of Engineering',
          fieldOfStudy: 'Computer Science',
          startDate: '2015-09',
          endDate: '2019-06',
        },
      ],
      experience: [
        {
          company: 'Software Solutions Corp',
          title: 'Senior Developer',
          startDate: '2019-07',
          endDate: '2026-05',
          description: 'Working on core banking systems',
          achievements: ['Optimized database queries', 'Mentored junior developers'],
        },
      ],
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      certifications: ['Oracle Certified Professional'],
    },
  },
];

export const mockCVTranslations: CVTranslation[] = [
  {
    id: 'cv-trans-001',
    cvId: 'cv-001',
    candidateId: 'cand-001',
    sourceLang: 'vi',
    targetLang: 'en',
    translatedText: 'Translated CV content in English...',
    status: 'approved',
    isAiGenerated: true,
    createdAt: '2026-05-13T11:00:00Z',
    approvedBy: 'hr-manager@company.com',
    approvedAt: '2026-05-13T11:30:00Z',
  },
];

export const mockInterviewTranslations: InterviewTranslation[] = [
  {
    id: 'int-trans-001',
    interviewId: 'int-001',
    candidateId: 'cand-001',
    sourceLang: 'en',
    targetLang: 'vi',
    translatedText: 'Nội dung phỏng vấn đã được dịch sang tiếng Việt...',
    status: 'pending',
    isAiGenerated: true,
    createdAt: '2026-05-14T09:00:00Z',
  },
];
