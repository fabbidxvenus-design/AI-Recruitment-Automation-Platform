/**
 * Mock Data for CandidateApplication (Cross-Domain Traceability)
 * DATA-APP-001: Links Candidate → Job → CV Version → JD Version
 */

import type { CandidateApplication } from '@/types/cv-intake';

export const mockCandidateApplications: CandidateApplication[] = [
  {
    id: 'app-001',
    candidateId: 'cand-001',
    jobId: 'job-001',
    cvVersionId: 'cv-ver-001',
    jdVersionId: 'jd-ver-001',
    parsedCriteriaVersion: 1,
    status: 'screening',
    appliedAt: '2026-05-10T09:00:00Z',
  },
  {
    id: 'app-002',
    candidateId: 'cand-002',
    jobId: 'job-002',
    cvVersionId: 'cv-ver-002',
    jdVersionId: 'jd-ver-002',
    parsedCriteriaVersion: 1,
    status: 'screening',
    appliedAt: '2026-05-11T10:00:00Z',
  },
  {
    id: 'app-003',
    candidateId: 'cand-001',
    jobId: 'job-001',
    cvVersionId: 'cv-ver-003',
    jdVersionId: 'jd-ver-001',
    parsedCriteriaVersion: 1,
    status: 'new',
    appliedAt: '2026-05-13T14:30:00Z',
  },
];
