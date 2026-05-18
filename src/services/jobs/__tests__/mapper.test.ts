/**
 * Mapper Tests (TIP-005)
 * Tests for JobsMapper using mock repository.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobsMapper, type CreateJobResult, type JobWithDetails, type JobState } from '../mapper';
import type { Job, JDVersion, ApprovalStatus } from '@/types';

// ---------------------------------------------------------------------------
// Mock Repository
// ---------------------------------------------------------------------------

const mockJob: Job = {
  id: 'job-001',
  title: 'Senior Frontend Developer',
  department: 'Engineering',
  location: 'Ho Chi Minh City',
  status: 'open',
  postedAt: '2026-05-01T00:00:00Z',
  candidateCount: 12,
  pipelineSummary: [],
};

const mockVersions: JDVersion[] = [
  {
    id: 'jd-ver-001-v2',
    jobId: 'job-001',
    versionNumber: 2,
    status: 'approved' as ApprovalStatus,
    jdDocumentId: 'jd-doc-001-v2',
    createdAt: '2026-05-10T14:00:00Z',
    approvedAt: '2026-05-10T16:00:00Z',
  },
  {
    id: 'jd-ver-001',
    jobId: 'job-001',
    versionNumber: 1,
    status: 'approved' as ApprovalStatus,
    jdDocumentId: 'jd-doc-001',
    createdAt: '2026-05-01T08:00:00Z',
    approvedAt: '2026-05-01T10:30:00Z',
  },
];

function createMockRepository() {
  return {
    createJob: vi.fn().mockResolvedValue(mockJob),
    listJobs: vi.fn().mockResolvedValue([mockJob]),
    getJob: vi.fn().mockResolvedValue(mockJob),
    createJDDocument: vi.fn().mockResolvedValue('jd-doc-new-001'),
    createJDVersion: vi.fn().mockResolvedValue(mockVersions[0]),
    listJDVersions: vi.fn().mockResolvedValue(mockVersions),
    getLatestVersionNumber: vi.fn().mockResolvedValue(1),
    approveJDVersion: vi.fn().mockResolvedValue({
      ...mockVersions[0],
      status: 'approved' as ApprovalStatus,
    }),
    rejectJDVersion: vi.fn().mockResolvedValue({
      ...mockVersions[0],
      status: 'rejected' as ApprovalStatus,
    }),
    getJDVersion: vi.fn().mockResolvedValue(mockVersions[0]),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('JobsMapper', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let mapper: JobsMapper;

  beforeEach(() => {
    repository = createMockRepository();
    mapper = new JobsMapper(repository as never);
  });

  // -------------------------------------------------------------------------
  // listJobs
  // -------------------------------------------------------------------------
  describe('listJobs', () => {
    it('returns jobs from repository', async () => {
      const result = await mapper.listJobs();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job-001');
      expect(repository.listJobs).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // getJob
  // -------------------------------------------------------------------------
  describe('getJob', () => {
    it('returns job when found', async () => {
      const result = await mapper.getJob('job-001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('job-001');
      expect(repository.getJob).toHaveBeenCalledWith('job-001');
    });

    it('returns null when not found', async () => {
      vi.mocked(repository.getJob).mockResolvedValueOnce(null);
      const result = await mapper.getJob('non-existent');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getJobWithDetails
  // -------------------------------------------------------------------------
  describe('getJobWithDetails', () => {
    it('returns job with versions', async () => {
      const result = await mapper.getJobWithDetails('job-001');

      expect(result).not.toBeNull();
      expect(result?.job.id).toBe('job-001');
      expect(result?.versions).toHaveLength(2);
      expect(result?.latestVersion?.versionNumber).toBe(2);
      expect(result?.approvedVersion).toBeDefined();
    });

    it('returns null when job not found', async () => {
      vi.mocked(repository.getJob).mockResolvedValueOnce(null);
      const result = await mapper.getJobWithDetails('non-existent');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // listVersions
  // -------------------------------------------------------------------------
  describe('listVersions', () => {
    it('returns versions for job', async () => {
      const result = await mapper.listVersions('job-001');

      expect(result).toHaveLength(2);
      expect(repository.listJDVersions).toHaveBeenCalledWith('job-001');
    });
  });

  // -------------------------------------------------------------------------
  // approveVersion (HR Manager gate — BR-001)
  // -------------------------------------------------------------------------
  describe('approveVersion', () => {
    it('approves version with approver info', async () => {
      const result = await mapper.approveVersion('jd-ver-001', 'hr-manager-001', 'HR Manager');

      expect(result.status).toBe('approved');
      expect(repository.approveJDVersion).toHaveBeenCalledWith('jd-ver-001', 'hr-manager-001', 'HR Manager');
    });
  });

  // -------------------------------------------------------------------------
  // rejectVersion (requires reason)
  // -------------------------------------------------------------------------
  describe('rejectVersion', () => {
    it('rejects version with reason', async () => {
      const result = await mapper.rejectVersion(
        'jd-ver-001',
        'hr-manager-001',
        'HR Manager',
        'Missing requirements'
      );

      expect(result.status).toBe('rejected');
      expect(repository.rejectJDVersion).toHaveBeenCalledWith(
        'jd-ver-001',
        'hr-manager-001',
        'HR Manager',
        'Missing requirements'
      );
    });
  });

  // -------------------------------------------------------------------------
  // createVersion (auto-increment version number)
  // -------------------------------------------------------------------------
  describe('createVersion', () => {
    it('creates version with auto-incremented number', async () => {
      const result = await mapper.createVersion('job-001', 'jd-doc-new-001');

      expect(result.versionNumber).toBe(2); // 1 + 1
      expect(repository.createJDVersion).toHaveBeenCalledWith(
        {
          jobId: 'job-001',
          jdDocumentId: 'jd-doc-new-001',
          versionNumber: 2,
        },
        undefined,
        undefined
      );
    });
  });

  // -------------------------------------------------------------------------
  // wrapInState (loading/empty/error states)
  // -------------------------------------------------------------------------
  describe('wrapInState', () => {
    it('returns loaded state when data exists', async () => {
      const result = await mapper.wrapInState(() => mapper.listJobs());

      expect(result).toEqual({ state: 'loaded', data: [mockJob] });
    });

    it('returns empty state when array is empty', async () => {
      vi.mocked(repository.listJobs).mockResolvedValueOnce([]);
      const result = await mapper.wrapInState(() => mapper.listJobs());

      expect(result).toEqual({ state: 'empty' });
    });

    it('returns error state on exception', async () => {
      vi.mocked(repository.listJobs).mockRejectedValueOnce(new Error('Database error'));
      const result = await mapper.wrapInState(() => mapper.listJobs());

      expect(result).toEqual({ state: 'error', error: 'Database error' });
    });
  });

  // -------------------------------------------------------------------------
  // getJobsState
  // -------------------------------------------------------------------------
  describe('getJobsState', () => {
    it('returns jobs in loading/empty/error state', async () => {
      const result = await mapper.getJobsState();

      expect(result.state).toBe('loaded');
      if (result.state === 'loaded') {
        expect(result.data).toHaveLength(1);
      }
    });

    it('returns empty state when no jobs', async () => {
      vi.mocked(repository.listJobs).mockResolvedValueOnce([]);
      const result = await mapper.getJobsState();

      expect(result.state).toBe('empty');
    });
  });

  // -------------------------------------------------------------------------
  // getJobWithDetailsState
  // -------------------------------------------------------------------------
  describe('getJobWithDetailsState', () => {
    it('returns job details in state', async () => {
      const result = await mapper.getJobWithDetailsState('job-001');

      expect(result.state).toBe('loaded');
      if (result.state === 'loaded') {
        expect(result.data?.job.id).toBe('job-001');
      }
    });
  });

  // -------------------------------------------------------------------------
  // getVersionsState
  // -------------------------------------------------------------------------
  describe('getVersionsState', () => {
    it('returns versions in state', async () => {
      const result = await mapper.getVersionsState('job-001');

      expect(result.state).toBe('loaded');
      if (result.state === 'loaded') {
        expect(result.data).toHaveLength(2);
      }
    });

    it('returns empty state when no versions', async () => {
      vi.mocked(repository.listJDVersions).mockResolvedValueOnce([]);
      const result = await mapper.getVersionsState('job-001');

      expect(result.state).toBe('empty');
    });
  });
});

// ---------------------------------------------------------------------------
// UI State Type Tests
// ---------------------------------------------------------------------------

describe('JobState types', () => {
  it('supports loading state', () => {
    const state: JobState<Job[]> = { state: 'loading' };
    expect(state.state).toBe('loading');
  });

  it('supports empty state', () => {
    const state: JobState<Job[]> = { state: 'empty' };
    expect(state.state).toBe('empty');
  });

  it('supports error state', () => {
    const state: JobState<Job[]> = { state: 'error', error: 'Database error' };
    expect(state.state).toBe('error');
    expect(state.error).toBe('Database error');
  });

  it('supports loaded state', () => {
    const state: JobState<Job[]> = { state: 'loaded', data: [mockJob] };
    expect(state.state).toBe('loaded');
    expect(state.data).toHaveLength(1);
  });
});