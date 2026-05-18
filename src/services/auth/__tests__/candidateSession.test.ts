import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentCandidateUser, isCandidateSession, getCurrentCandidate } from '../candidateSession';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
} as any;

describe('candidateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentCandidateUser', () => {
    it('returns null when no user is authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await getCurrentCandidateUser(mockSupabase);
      expect(result).toBeNull();
    });

    it('returns user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const result = await getCurrentCandidateUser(mockSupabase);
      expect(result).toEqual(mockUser);
    });
  });

  describe('isCandidateSession', () => {
    it('returns false when no user is authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await isCandidateSession(mockSupabase);
      expect(result).toBe(false);
    });

    it('returns false when user has no linked candidate record', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('No record') }),
          }),
        }),
      });

      const result = await isCandidateSession(mockSupabase);
      expect(result).toBe(false);
    });

    it('returns true when user has linked candidate record', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'candidate-456' },
              error: null,
            }),
          }),
        }),
      });

      const result = await isCandidateSession(mockSupabase);
      expect(result).toBe(true);
    });
  });

  describe('getCurrentCandidate', () => {
    it('returns null when no user authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await getCurrentCandidate(mockSupabase);
      expect(result).toBeNull();
    });

    it('returns candidate details when session is valid', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'candidate-456',
                job_id: 'job-789',
                full_name: 'John Doe',
                email: 'john@example.com',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await getCurrentCandidate(mockSupabase);
      expect(result).toEqual({
        id: 'candidate-456',
        jobId: 'job-789',
        fullName: 'John Doe',
        email: 'john@example.com',
      });
    });
  });
});