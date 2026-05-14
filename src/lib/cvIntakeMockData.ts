/**
 * Mock Data for CV Intake Domain
 * DATA-CV-001, DATA-CV-002, DATA-CV-003
 */

import type { CandidateCV, CVVersion, CVExtractionResult } from '@/types/cv-intake';

export const mockCandidateCVs: CandidateCV[] = [
  {
    id: 'cv-001',
    candidateId: 'cand-001',
    originalFileName: 'nguyen_van_a_cv.pdf',
    driveFileId: 'drive-file-001',
    uploadedAt: '2026-05-10T08:30:00Z',
  },
  {
    id: 'cv-002',
    candidateId: 'cand-002',
    originalFileName: 'tran_thi_b_cv.pdf',
    uploadedAt: '2026-05-11T09:15:00Z',
  },
  {
    id: 'cv-003',
    candidateId: 'cand-001',
    originalFileName: 'nguyen_van_a_cv_updated.pdf',
    uploadedAt: '2026-05-13T14:20:00Z',
  },
];

export const mockCVVersions: CVVersion[] = [
  {
    id: 'cv-ver-001',
    candidateId: 'cand-001',
    cvFileId: 'cv-001',
    versionNumber: 1,
    createdAt: '2026-05-10T08:30:00Z',
  },
  {
    id: 'cv-ver-002',
    candidateId: 'cand-002',
    cvFileId: 'cv-002',
    versionNumber: 1,
    createdAt: '2026-05-11T09:15:00Z',
  },
  {
    id: 'cv-ver-003',
    candidateId: 'cand-001',
    cvFileId: 'cv-003',
    versionNumber: 2,
    createdAt: '2026-05-13T14:20:00Z',
  },
];

export const mockCVExtractionResults: CVExtractionResult[] = [
  {
    id: 'extract-001',
    cvVersionId: 'cv-ver-001',
    extractedProfile: {
      fullName: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      phone: '+84 123 456 789',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      experience: '5 years in software development',
      education: ['Bachelor of Computer Science, University of Technology, 2017-2021'],
      language: ['Vietnamese (Native)', 'English (Fluent)'],
    },
    confidence: 0.92,
    extractedAt: '2026-05-10T08:31:00Z',
  },
  {
    id: 'extract-002',
    cvVersionId: 'cv-ver-002',
    extractedProfile: {
      fullName: 'Tran Thi B',
      email: 'tranthib@example.com',
      phone: '+84 987 654 321',
      skills: ['Python', 'Django', 'FastAPI', 'MySQL', 'AWS'],
      experience: '3 years in backend development',
      education: ['Bachelor of Information Technology, National University, 2018-2022'],
      language: ['Vietnamese (Native)', 'English (Intermediate)'],
    },
    confidence: 0.88,
    extractedAt: '2026-05-11T09:16:00Z',
  },
  {
    id: 'extract-003',
    cvVersionId: 'cv-ver-003',
    extractedProfile: {
      fullName: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      phone: '+84 123 456 789',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'Next.js'],
      experience: '5 years in software development, recently led migration to Next.js 15',
      education: [
        'Bachelor of Computer Science, University of Technology, 2017-2021',
        'AWS Certified Solutions Architect, 2025',
      ],
      language: ['Vietnamese (Native)', 'English (Fluent)', 'Japanese (Basic)'],
    },
    confidence: 0.94,
    extractedAt: '2026-05-13T14:21:00Z',
  },
];
