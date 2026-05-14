/**
 * Mock Data for Job/JD Intake Domain
 * DATA-JOB-001, DATA-JOB-002, DATA-JOB-003, DATA-JOB-004
 */

import type { JobIntake, OriginalJDDocument, JDVersion, ParsedJDProfile } from '@/types';

export const mockJobs: JobIntake[] = [
  {
    id: 'job-001',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Ho Chi Minh City',
    status: 'open',
    postedAt: '2026-05-01T00:00:00Z',
    candidateCount: 12,
  },
  {
    id: 'job-002',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Hanoi',
    status: 'open',
    postedAt: '2026-05-05T00:00:00Z',
    candidateCount: 8,
  },
  {
    id: 'job-003',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Remote',
    status: 'paused',
    postedAt: '2026-04-20T00:00:00Z',
    candidateCount: 5,
  },
];

export const mockOriginalJDDocuments: OriginalJDDocument[] = [
  {
    id: 'jd-doc-001',
    jobId: 'job-001',
    sourceType: 'pdf',
    fileName: 'senior_frontend_jd.pdf',
    content: '/uploads/jd/senior_frontend_jd.pdf',
    uploadedAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'jd-doc-002',
    jobId: 'job-002',
    sourceType: 'text',
    content: `Backend Engineer - Job Description

We are looking for an experienced Backend Engineer to join our team.

Requirements:
- 3+ years of experience in backend development
- Strong knowledge of Python, Django, FastAPI
- Experience with PostgreSQL, Redis
- Understanding of RESTful API design
- Experience with AWS or GCP

Responsibilities:
- Design and implement scalable backend services
- Write clean, maintainable code
- Collaborate with frontend team
- Participate in code reviews`,
    uploadedAt: '2026-05-05T09:00:00Z',
  },
  {
    id: 'jd-doc-003',
    jobId: 'job-003',
    sourceType: 'drive',
    fileName: 'devops_engineer_jd.docx',
    content: 'https://drive.google.com/file/d/mock-drive-id-003',
    uploadedAt: '2026-04-20T10:00:00Z',
  },
];

export const mockJDVersions: JDVersion[] = [
  {
    id: 'jd-ver-001',
    jobId: 'job-001',
    versionNumber: 1,
    status: 'approved',
    jdDocumentId: 'jd-doc-001',
    createdAt: '2026-05-01T08:00:00Z',
    approvedAt: '2026-05-01T10:30:00Z',
  },
  {
    id: 'jd-ver-002',
    jobId: 'job-002',
    versionNumber: 1,
    status: 'approved',
    jdDocumentId: 'jd-doc-002',
    createdAt: '2026-05-05T09:00:00Z',
    approvedAt: '2026-05-05T11:00:00Z',
  },
  {
    id: 'jd-ver-003',
    jobId: 'job-003',
    versionNumber: 1,
    status: 'pending',
    jdDocumentId: 'jd-doc-003',
    createdAt: '2026-04-20T10:00:00Z',
  },
];

export const mockParsedJDProfiles: ParsedJDProfile[] = [
  {
    id: 'parsed-jd-001',
    jdVersionId: 'jd-ver-001',
    parsedCriteriaVersion: 1,
    title: 'Senior Frontend Developer',
    skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'JavaScript', 'HTML'],
    responsibilities: [
      'Lead frontend architecture decisions',
      'Mentor junior developers',
      'Implement responsive UI components',
      'Optimize application performance',
    ],
    requirements: [
      '5+ years of frontend development experience',
      'Strong React and TypeScript skills',
      'Experience with Next.js or similar frameworks',
      'Understanding of web performance optimization',
    ],
    language: ['English (Fluent)', 'Vietnamese (Preferred)'],
    seniority: 'Senior',
    education: ['Bachelor degree in Computer Science or related field'],
    status: 'approved',
  },
  {
    id: 'parsed-jd-002',
    jdVersionId: 'jd-ver-002',
    parsedCriteriaVersion: 1,
    title: 'Backend Engineer',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS'],
    responsibilities: [
      'Design and implement scalable backend services',
      'Write clean, maintainable code',
      'Collaborate with frontend team',
      'Participate in code reviews',
    ],
    requirements: [
      '3+ years of backend development experience',
      'Strong Python knowledge',
      'Experience with Django or FastAPI',
      'Database design and optimization skills',
    ],
    language: ['English (Intermediate)'],
    seniority: 'Mid-level',
    education: ['Bachelor degree in Computer Science or equivalent experience'],
    status: 'approved',
  },
  {
    id: 'parsed-jd-003',
    jdVersionId: 'jd-ver-003',
    parsedCriteriaVersion: 1,
    title: 'DevOps Engineer',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    responsibilities: [
      'Manage cloud infrastructure',
      'Implement CI/CD pipelines',
      'Monitor system performance',
      'Ensure security best practices',
    ],
    requirements: [
      '3+ years of DevOps experience',
      'Strong knowledge of containerization',
      'Experience with Kubernetes',
      'Infrastructure as Code experience',
    ],
    language: ['English (Fluent)'],
    seniority: 'Mid to Senior',
    education: ['Bachelor degree in Computer Science or related field'],
    status: 'draft',
  },
];
