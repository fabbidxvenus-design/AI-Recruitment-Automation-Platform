/**
 * Repository Tests (TIP-005)
 * Tests for JobsRepository using mock Supabase client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobsRepository, type CreateJobInput, type ApprovalAction } from '../repository';

// ---------------------------------------------------------------------------
// Mock Supabase Client Factory
// ---------------------------------------------------------------------------

interface MockRow {
  id: string;
  title?: string;
  department?: string;
  location?: string;
  status?: string;
  created_at?: string;
  candidate_count?: number;
  job_id?: string;
  version_number?: number;
  jd_document_id?: string;
  approved_at?: string;
  approved_by_id?: string;
  approved_by_name?: string;
  rejection_reason?: string;
  entity_type?: string;
  entity_id?: string;
  event_type?: string;
  actor_id?: string;
  actor_name?: string;
  metadata?: Record<string, unknown>;
}

function createMockClient(overrides?: {
  jobs?: MockRow[];
  jdVersions?: MockRow[];
  auditEvents?: MockRow[];
  throwError?: string;
}) {
  const jobs = overrides?.jobs ?? [];
  const jdVersions = overrides?.jdVersions ?? [];
  const auditEvents: MockRow[] = [];

  const from = vi.fn((table: string) => {
    if (overrides?.throwError) {
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: { message: overrides.throwError } }),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: overrides.throwError } }),
      };
    }

    return {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        if (table === 'jobs' && jobs.length > 0) {
          return Promise.resolve({ data: jobs[0], error: null });
        }
        if (table === 'jd_versions' && jdVersions.length > 0) {
          return Promise.resolve({ data: jdVersions[0], error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
    };
  });

  return {
    from,
    _jobs: jobs,
    _jdVersions: jdVersions,
    _auditEvents: auditEvents,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('JobsRepository', () => {
  // -------------------------------------------------------------------------
  // createJob
  // -------------------------------------------------------------------------
  describe('createJob', () => {
    it('creates a job and returns mapped Job', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'job-new-001',
            title: 'Backend Engineer',
            department: 'Engineering',
            location: 'Hanoi',
            status: 'open',
            created_at: '2026-05-16T10:00:00Z',
            candidate_count: 0,
          },
          error: null,
        }),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
      } as never);

      const input: CreateJobInput = {
        title: 'Backend Engineer',
        department: 'Engineering',
        location: 'Hanoi',
      };

      const result = await repo.createJob(input);

      expect(result.title).toBe('Backend Engineer');
      expect(result.department).toBe('Engineering');
      expect(result.location).toBe('Hanoi');
      expect(result.status).toBe('open');
      expect(result.candidateCount).toBe(0);
    });

    it('throws on database error', async () => {
      const mock = createMockClient({ throwError: 'Insert failed' });
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
      } as never);

      const input: CreateJobInput = {
        title: 'Test',
        department: 'Test',
        location: 'Test',
      };

      await expect(repo.createJob(input)).rejects.toThrow('Failed to create job');
    });
  });

  // -------------------------------------------------------------------------
  // listJobs
  // -------------------------------------------------------------------------
  describe('listJobs', () => {
    it('returns mapped jobs', async () => {
      const mock = createMockClient({
        jobs: [
          {
            id: 'job-001',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'Ho Chi Minh City',
            status: 'open',
            created_at: '2026-05-01T00:00:00Z',
            candidate_count: 12,
          },
          {
            id: 'job-002',
            title: 'Backend Engineer',
            department: 'Engineering',
            location: 'Hanoi',
            status: 'open',
            created_at: '2026-05-05T00:00:00Z',
            candidate_count: 8,
          },
        ],
      });

      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mock._jobs,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.listJobs();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('job-001');
      expect(result[0].title).toBe('Senior Frontend Developer');
      expect(result[1].id).toBe('job-002');
    });
  });

  // -------------------------------------------------------------------------
  // getJob
  // -------------------------------------------------------------------------
  describe('getJob', () => {
    it('returns job when found', async () => {
      const mock = createMockClient({
        jobs: [
          {
            id: 'job-001',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'Ho Chi Minh City',
            status: 'open',
            created_at: '2026-05-01T00:00:00Z',
            candidate_count: 12,
          },
        ],
      });

      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mock._jobs[0],
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.getJob('job-001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('job-001');
      expect(result?.title).toBe('Senior Frontend Developer');
    });

    it('returns null when not found (PGRST116)', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
        insert: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.getJob('non-existent');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // createJDVersion
  // -------------------------------------------------------------------------
  describe('createJDVersion', () => {
    it('creates version and returns mapped JDVersion', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'jd-ver-new-001',
            job_id: 'job-001',
            jd_document_id: 'jd-doc-001',
            version_number: 1,
            status: 'pending',
            created_at: '2026-05-16T10:00:00Z',
          },
          error: null,
        }),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.createJDVersion({
        jobId: 'job-001',
        jdDocumentId: 'jd-doc-001',
        versionNumber: 1,
      });

      expect(result.id).toBe('jd-ver-new-001');
      expect(result.jobId).toBe('job-001');
      expect(result.versionNumber).toBe(1);
      expect(result.status).toBe('pending');
    });
  });

  // -------------------------------------------------------------------------
  // listJDVersions
  // -------------------------------------------------------------------------
  describe('listJDVersions', () => {
    it('returns versions for job ordered by version number descending', async () => {
      const mock = createMockClient({
        jdVersions: [
          {
            id: 'jd-ver-002',
            job_id: 'job-001',
            jd_document_id: 'jd-doc-001-v2',
            version_number: 2,
            status: 'approved',
            created_at: '2026-05-10T14:00:00Z',
            approved_at: '2026-05-10T16:00:00Z',
          },
          {
            id: 'jd-ver-001',
            job_id: 'job-001',
            jd_document_id: 'jd-doc-001',
            version_number: 1,
            status: 'approved',
            created_at: '2026-05-01T08:00:00Z',
            approved_at: '2026-05-01T10:30:00Z',
          },
        ],
      });

      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mock._jdVersions,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.listJDVersions('job-001');

      expect(result).toHaveLength(2);
      expect(result[0].versionNumber).toBe(2);
      expect(result[1].versionNumber).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // approveJDVersion
  // -------------------------------------------------------------------------
  describe('approveJDVersion', () => {
    it('approves version and records approver info', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'jd-ver-001',
            job_id: 'job-001',
            jd_document_id: 'jd-doc-001',
            version_number: 1,
            status: 'approved',
            created_at: '2026-05-01T08:00:00Z',
            approved_at: '2026-05-01T10:30:00Z',
            approved_by_id: 'hr-manager-001',
            approved_by_name: 'HR Manager',
          },
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.approveJDVersion('jd-ver-001', 'hr-manager-001', 'HR Manager');

      expect(result.status).toBe('approved');
      expect(result.approvedAt).toBeDefined();
    });

    it('throws on database error during approval', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
        insert: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      } as never);

      await expect(repo.approveJDVersion('jd-ver-001', 'hr-manager-001', 'HR Manager')).rejects.toThrow(
        'Failed to approve JD version'
      );
    });
  });

  // -------------------------------------------------------------------------
  // rejectJDVersion
  // -------------------------------------------------------------------------
  describe('rejectJDVersion', () => {
    it('rejects version with reason and records rejector info', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'jd-ver-001',
            job_id: 'job-001',
            jd_document_id: 'jd-doc-001',
            version_number: 1,
            status: 'rejected',
            created_at: '2026-05-01T08:00:00Z',
            approved_at: '2026-05-01T09:00:00Z',
            approved_by_id: 'hr-manager-001',
            approved_by_name: 'HR Manager',
            rejection_reason: 'Missing senior-level requirements',
          },
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.rejectJDVersion(
        'jd-ver-001',
        'hr-manager-001',
        'HR Manager',
        'Missing senior-level requirements'
      );

      expect(result.status).toBe('rejected');
    });

    it('throws if rejection reason is empty', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      await expect(
        repo.rejectJDVersion('jd-ver-001', 'hr-manager-001', 'HR Manager', '   ')
      ).rejects.toThrow('Rejection reason is required');
    });
  });

  // -------------------------------------------------------------------------
  // getLatestVersionNumber
  // -------------------------------------------------------------------------
  describe('getLatestVersionNumber', () => {
    it('returns latest version number', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ version_number: 3 }],
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.getLatestVersionNumber('job-001');

      expect(result).toBe(3);
    });

    it('returns 0 when no versions exist', async () => {
      const mock = createMockClient();
      const repo = new JobsRepository(mock as never);

      vi.mocked(mock.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      } as never);

      const result = await repo.getLatestVersionNumber('job-001');

      expect(result).toBe(0);
    });
  });
});
