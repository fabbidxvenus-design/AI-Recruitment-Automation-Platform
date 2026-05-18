/**
 * TIP-006: Candidate and Screening Repository Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ImportResult } from '../types';
import { CandidatesRepository } from '../repository';

// ---------------------------------------------------------------------------
// Chainable mock builder — all methods live on the same object
// ---------------------------------------------------------------------------

function createMockClient(returnData: unknown, returnError: unknown = null) {
  // For terminating calls (single, limit) return {data, error}
  // For chainable calls (from, select, eq, insert, update, order) return the same mock client
  const mock = {
    from: vi.fn(() => mock),
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    insert: vi.fn(() => mock),
    update: vi.fn(() => mock),
    order: vi.fn(() => Promise.resolve({ data: returnData, error: returnError })),
    limit: vi.fn(() => Promise.resolve({ data: returnData, error: returnError })),
    single: vi.fn(() => Promise.resolve({ data: returnData, error: returnError })),
  };
  return mock;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Candidate Repository', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let repository: CandidatesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCandidate', () => {
    it('should successfully create a candidate', async () => {
      const mockCandidate = {
        id: 'cand-001',
        job_id: 'job-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'imported',
        cv_source_reference: 'cv-001',
        cv_parsed_metadata: null,
        evidence_metadata: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockClient = createMockClient(mockCandidate);
      repository = new CandidatesRepository(mockClient as never);

      const result: ImportResult = await repository.createCandidate({
        jobId: 'job-001',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        cvSourceReference: 'cv-001',
      });

      expect(result.success).toBe(true);
      expect(result.candidateId).toBe('cand-001');
      expect(result.errors).toHaveLength(0);
      expect(mockClient.from).toHaveBeenCalledWith('candidates');
    });

    it('should return validation errors for invalid candidate data', async () => {
      mockClient = createMockClient(null);
      repository = new CandidatesRepository(mockClient as never);

      const result: ImportResult = await repository.createCandidate({
        jobId: '',
        fullName: '',
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'jobId' }));
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'fullName' }));
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
    });

    it('should throw on database error', async () => {
      mockClient = createMockClient(null, new Error('Database error'));
      repository = new CandidatesRepository(mockClient as never);

      await expect(
        repository.createCandidate({
          jobId: 'job-001',
          fullName: 'John Doe',
          email: 'john@example.com',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getCandidateById', () => {
    it('should return candidate when found', async () => {
      const mockCandidate = {
        id: 'cand-001',
        job_id: 'job-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'imported',
        cv_source_reference: 'cv-001',
        cv_parsed_metadata: null,
        evidence_metadata: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockClient = createMockClient(mockCandidate);
      repository = new CandidatesRepository(mockClient as never);

      const candidate = await repository.getCandidateById('cand-001');

      expect(candidate).not.toBeNull();
      expect(candidate?.id).toBe('cand-001');
      expect(candidate?.fullName).toBe('John Doe');
    });

    it('should return null when candidate not found', async () => {
      mockClient = createMockClient(null, { code: 'PGRST116' });
      repository = new CandidatesRepository(mockClient as never);

      const candidate = await repository.getCandidateById('non-existent');

      expect(candidate).toBeNull();
    });
  });

  describe('listCandidatesByJob', () => {
    it('should return candidates for job', async () => {
      const mockCandidates = [
        {
          id: 'cand-001',
          job_id: 'job-001',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: null,
          status: 'imported',
          cv_source_reference: null,
          cv_parsed_metadata: null,
          evidence_metadata: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockClient = createMockClient(mockCandidates);
      repository = new CandidatesRepository(mockClient as never);

      const candidates = await repository.listCandidatesByJob('job-001');

      expect(candidates).toHaveLength(1);
      expect(candidates[0].id).toBe('cand-001');
    });

    it('should filter by status', async () => {
      mockClient = createMockClient([]);
      repository = new CandidatesRepository(mockClient as never);

      await repository.listCandidatesByJob('job-001', 'screened');

      expect(mockClient.eq).toHaveBeenCalledWith('status', 'screened');
    });
  });

  describe('updateCandidateStatus', () => {
    it('should update candidate status', async () => {
      const mockCandidate = {
        id: 'cand-001',
        job_id: 'job-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        status: 'screened',
        cv_source_reference: null,
        cv_parsed_metadata: null,
        evidence_metadata: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockClient = createMockClient(mockCandidate);
      repository = new CandidatesRepository(mockClient as never);

      const result = await repository.updateCandidateStatus({
        candidateId: 'cand-001',
        status: 'screened',
      });

      expect(result).toBe(true);
      expect(mockClient.update).toHaveBeenCalled();
    });
  });
});

describe('Screening Result Repository', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let repository: CandidatesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createScreeningResult', () => {
    it('should successfully create a screening result', async () => {
      const mockScreening = {
        id: 'scr-001',
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

      mockClient = createMockClient(mockScreening);
      repository = new CandidatesRepository(mockClient as never);

      const result: ImportResult = await repository.createScreeningResult({
        candidateId: 'cand-001',
        jobId: 'job-001',
        jdVersionId: 'jd-ver-001',
        score: 85,
        recommendation: 'advance',
        strengths: ['React', 'TypeScript'],
        risks: ['Limited experience'],
      });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid score', async () => {
      mockClient = createMockClient(null);
      repository = new CandidatesRepository(mockClient as never);

      const result: ImportResult = await repository.createScreeningResult({
        candidateId: 'cand-001',
        jobId: 'job-001',
        jdVersionId: 'jd-ver-001',
        score: 150,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'score' }));
    });

    it('should return validation errors for missing references', async () => {
      mockClient = createMockClient(null);
      repository = new CandidatesRepository(mockClient as never);

      const result: ImportResult = await repository.createScreeningResult({
        candidateId: '',
        jobId: 'job-001',
        jdVersionId: 'jd-ver-001',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'candidateId' }));
    });
  });

  describe('getScreeningResultById', () => {
    it('should return screening result when found', async () => {
      const mockScreening = {
        id: 'scr-001',
        candidate_id: 'cand-001',
        job_id: 'job-001',
        jd_version_id: 'jd-ver-001',
        score: 85,
        recommendation: 'advance',
        strengths: ['React'],
        risks: [],
        evidence_metadata: null,
        reviewer_decision: null,
        reviewed_by: null,
        created_at: '2024-01-01T00:00:00Z',
        reviewed_at: null,
      };

      mockClient = createMockClient(mockScreening);
      repository = new CandidatesRepository(mockClient as never);

      const result = await repository.getScreeningResultById('scr-001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('scr-001');
    });
  });

  describe('reviewScreeningResult', () => {
    it('should successfully review a screening result', async () => {
      const mockScreening = {
        id: 'scr-001',
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

      mockClient = createMockClient(mockScreening);
      repository = new CandidatesRepository(mockClient as never);

      const result = await repository.reviewScreeningResult({
        screeningResultId: 'scr-001',
        decision: 'advanced',
        reviewedBy: 'user-001',
      });

      expect(result).toBe(true);
    });
  });

  describe('getScreeningResultsByCandidate', () => {
    it('should return screening results for candidate', async () => {
      const mockResults = [
        {
          id: 'scr-001',
          candidate_id: 'cand-001',
          job_id: 'job-001',
          jd_version_id: 'jd-ver-001',
          score: 85,
          recommendation: 'advance',
          strengths: ['React'],
          risks: [],
          evidence_metadata: null,
          reviewer_decision: null,
          reviewed_by: null,
          created_at: '2024-01-01T00:00:00Z',
          reviewed_at: null,
        },
      ];

      mockClient = createMockClient(mockResults);
      repository = new CandidatesRepository(mockClient as never);

      const results = await repository.getScreeningResultsByCandidate('cand-001');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('scr-001');
    });
  });

  describe('getScreeningResultsByJob', () => {
    it('should return screening results for job', async () => {
      mockClient = createMockClient([]);
      repository = new CandidatesRepository(mockClient as never);

      await repository.getScreeningResultsByJob('job-001');

      expect(mockClient.from).toHaveBeenCalledWith('screening_results');
    });
  });
});

describe('Audit Event Repository', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let repository: CandidatesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuditEvent', () => {
    it('should successfully create an audit event', async () => {
      const mockAudit = { id: 'audit-001' };

      mockClient = createMockClient(mockAudit);
      repository = new CandidatesRepository(mockClient as never);

      const auditId = await repository.createAuditEvent({
        actorType: 'internal_user',
        actorId: 'user-001',
        entityType: 'candidate',
        entityId: 'cand-001',
        eventType: 'candidate.imported',
        summary: 'Candidate imported: John Doe',
        metadata: { jobId: 'job-001' },
      });

      expect(auditId).toBe('audit-001');
    });

    it('should throw error when audit event creation fails', async () => {
      mockClient = createMockClient(null, new Error('Audit failed'));
      repository = new CandidatesRepository(mockClient as never);

      await expect(
        repository.createAuditEvent({
          actorType: 'internal_user',
          entityType: 'candidate',
          entityId: 'cand-001',
          eventType: 'candidate.imported',
          summary: 'Test audit',
        })
      ).rejects.toThrow('Audit failed');
    });
  });

  describe('getAuditEventsByEntity', () => {
    it('should return audit events for entity', async () => {
      const mockEvents = [
        {
          id: 'audit-001',
          actor_type: 'internal_user',
          actor_id: 'user-001',
          entity_type: 'candidate',
          entity_id: 'cand-001',
          event_type: 'candidate.imported',
          summary: 'Candidate imported',
          metadata: {},
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockClient = createMockClient(mockEvents);
      repository = new CandidatesRepository(mockClient as never);

      const events = await repository.getAuditEventsByEntity('candidate', 'cand-001');

      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('audit-001');
    });
  });
});

describe('Batch Import', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let repository: CandidatesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('importCandidatesBatch', () => {
    it('should import multiple candidates', async () => {
      const mockCandidate = {
        id: 'cand-new',
        job_id: 'job-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        status: 'imported',
        cv_source_reference: null,
        cv_parsed_metadata: null,
        evidence_metadata: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockClient = createMockClient(mockCandidate);
      repository = new CandidatesRepository(mockClient as never);

      const results = await repository.importCandidatesBatch([
        { fullName: 'John Doe', email: 'john@example.com', jobId: 'job-001' },
        { fullName: 'Jane Smith', email: 'jane@example.com', jobId: 'job-001' },
      ]);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });
});