/**
 * TIP-006: Candidate and Screening Mapper Tests
 */

import { describe, it, expect } from 'vitest';
import {
  mapToCandidateEntity,
  mapFromCandidateRecord,
  mapToScreeningResultEntity,
  mapFromScreeningResultRecord,
  mapToAuditEventEntity,
  mapFromAuditEventRecord,
  mapToUpdateCandidateEntity,
  mapToReviewScreeningEntity,
  mapImportEntry,
} from '../mapper';

describe('Candidate Mapper', () => {
  describe('mapToCandidateEntity', () => {
    it('maps request to candidate entity with generated ID', () => {
      const request = {
        jobId: 'job-001',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        cvSourceReference: 'cv-001',
      };

      const result = mapToCandidateEntity(request);

      expect(result.id).toMatch(/^cand-/);
      expect(result.jobId).toBe('job-001');
      expect(result.fullName).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('+1234567890');
      expect(result.status).toBe('imported');
      expect(result.cvSourceReference).toBe('cv-001');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('mapFromCandidateRecord', () => {
    it('maps database record to domain candidate', () => {
      const dbRecord = {
        id: 'cand-123',
        job_id: 'job-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'imported',
        cv_source_reference: 'cv-001',
        cv_parsed_metadata: { skills: ['JavaScript'] },
        evidence_metadata: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = mapFromCandidateRecord(dbRecord);

      expect(result.id).toBe('cand-123');
      expect(result.jobId).toBe('job-001');
      expect(result.fullName).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.status).toBe('imported');
      expect(result.cvParsedMetadata).toEqual({ skills: ['JavaScript'] });
    });

    it('handles null optional fields', () => {
      const dbRecord = {
        id: 'cand-123',
        job_id: 'job-001',
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        phone: null,
        status: 'imported',
        cv_source_reference: null,
        cv_parsed_metadata: null,
        evidence_metadata: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = mapFromCandidateRecord(dbRecord);

      expect(result.phone).toBeUndefined();
      expect(result.cvSourceReference).toBeUndefined();
      expect(result.cvParsedMetadata).toBeUndefined();
    });
  });
});

describe('Screening Result Mapper', () => {
  describe('mapToScreeningResultEntity', () => {
    it('maps request to screening result entity', () => {
      const request = {
        candidateId: 'cand-001',
        jobId: 'job-001',
        jdVersionId: 'jd-ver-001',
        score: 85,
        recommendation: 'advance' as const,
        strengths: ['React', 'TypeScript'],
        risks: ['Limited experience'],
      };

      const result = mapToScreeningResultEntity(request);

      expect(result.id).toMatch(/^scr-/);
      expect(result.candidateId).toBe('cand-001');
      expect(result.jobId).toBe('job-001');
      expect(result.jdVersionId).toBe('jd-ver-001');
      expect(result.score).toBe(85);
      expect(result.recommendation).toBe('advance');
      expect(result.strengths).toEqual(['React', 'TypeScript']);
      expect(result.risks).toEqual(['Limited experience']);
    });
  });

  describe('mapFromScreeningResultRecord', () => {
    it('maps database record to domain screening result', () => {
      const dbRecord = {
        id: 'scr-123',
        candidate_id: 'cand-001',
        job_id: 'job-001',
        jd_version_id: 'jd-ver-001',
        score: 85,
        recommendation: 'advance',
        strengths: ['React', 'TypeScript'],
        risks: ['Limited experience'],
        evidence_metadata: null,
        reviewer_decision: null,
        reviewed_by: null,
        created_at: '2024-01-01T00:00:00Z',
        reviewed_at: null,
      };

      const result = mapFromScreeningResultRecord(dbRecord);

      expect(result.id).toBe('scr-123');
      expect(result.candidateId).toBe('cand-001');
      expect(result.jobId).toBe('job-001');
      expect(result.jdVersionId).toBe('jd-ver-001');
      expect(result.score).toBe(85);
      expect(result.recommendation).toBe('advance');
    });

    it('handles reviewed screening result', () => {
      const dbRecord = {
        id: 'scr-123',
        candidate_id: 'cand-001',
        job_id: 'job-001',
        jd_version_id: 'jd-ver-001',
        score: 85,
        recommendation: 'advance',
        strengths: ['React'],
        risks: [],
        evidence_metadata: null,
        reviewer_decision: 'advanced',
        reviewed_by: 'user-001',
        created_at: '2024-01-01T00:00:00Z',
        reviewed_at: '2024-01-02T00:00:00Z',
      };

      const result = mapFromScreeningResultRecord(dbRecord);

      expect(result.reviewerDecision).toBe('advanced');
      expect(result.reviewedBy).toBe('user-001');
      expect(result.reviewedAt).toBe('2024-01-02T00:00:00Z');
    });
  });
});

describe('Audit Event Mapper', () => {
  describe('mapToAuditEventEntity', () => {
    it('maps request to audit event entity', () => {
      const request = {
        actorType: 'internal_user' as const,
        actorId: 'user-001',
        entityType: 'candidate',
        entityId: 'cand-001',
        eventType: 'candidate.imported',
        summary: 'Candidate imported: John Doe',
        metadata: { jobId: 'job-001' },
      };

      const result = mapToAuditEventEntity(request);

      expect(result.id).toMatch(/^audit-/);
      expect(result.actorType).toBe('internal_user');
      expect(result.actorId).toBe('user-001');
      expect(result.entityType).toBe('candidate');
      expect(result.entityId).toBe('cand-001');
      expect(result.eventType).toBe('candidate.imported');
      expect(result.summary).toBe('Candidate imported: John Doe');
      expect(result.metadata).toEqual({ jobId: 'job-001' });
      expect(result.createdAt).toBeDefined();
    });
  });

  describe('mapFromAuditEventRecord', () => {
    it('maps database record to domain audit event', () => {
      const dbRecord = {
        id: 'audit-123',
        actor_type: 'internal_user',
        actor_id: 'user-001',
        entity_type: 'candidate',
        entity_id: 'cand-001',
        event_type: 'candidate.imported',
        summary: 'Candidate imported',
        metadata: { jobId: 'job-001' },
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = mapFromAuditEventRecord(dbRecord);

      expect(result.id).toBe('audit-123');
      expect(result.actorType).toBe('internal_user');
      expect(result.actorId).toBe('user-001');
      expect(result.entityType).toBe('candidate');
      expect(result.eventType).toBe('candidate.imported');
    });
  });
});

describe('Update Mappers', () => {
  describe('mapToUpdateCandidateEntity', () => {
    it('maps status update request', () => {
      const request = {
        candidateId: 'cand-001',
        status: 'screened' as const,
      };

      const result = mapToUpdateCandidateEntity(request);

      expect(result.status).toBe('screened');
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('mapToReviewScreeningEntity', () => {
    it('maps screening review request', () => {
      const request = {
        screeningResultId: 'scr-001',
        decision: 'advanced' as const,
        reviewedBy: 'user-001',
      };

      const result = mapToReviewScreeningEntity(request);

      expect(result.reviewerDecision).toBe('advanced');
      expect(result.reviewedBy).toBe('user-001');
      expect(result.reviewedAt).toBeDefined();
    });
  });
});

describe('Import Entry Mapper', () => {
  describe('mapImportEntry', () => {
    it('normalizes import entry data', () => {
      const entry = {
        fullName: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        phone: '  +1234567890  ',
        jobId: 'job-001',
        cvSourceReference: '  cv-001  ',
      };

      const result = mapImportEntry(entry);

      expect(result.fullName).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('+1234567890');
      expect(result.cvSourceReference).toBe('cv-001');
    });
  });
});