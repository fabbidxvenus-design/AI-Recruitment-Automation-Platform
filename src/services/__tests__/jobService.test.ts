import { describe, it, expect } from 'vitest';
import jobService from '@/services/jobService';

describe('jobService', () => {
  describe('createJob', () => {
    it('returns success with job and document', async () => {
      const result = await jobService.createJob({
        title: 'Frontend Engineer',
        department: 'Engineering',
        location: 'Remote',
        sourceType: 'text',
        content: 'We need a frontend engineer...',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.job.title).toBe('Frontend Engineer');
        expect(result.data.job.department).toBe('Engineering');
        expect(result.data.job.status).toBe('open');
        expect(result.data.job.candidateCount).toBe(0);
        expect(result.data.document.sourceType).toBe('text');
        expect(result.data.document.jobId).toBe(result.data.job.id);
      }
    });
  });

  describe('parseJD', () => {
    it('returns success with parsed profile in draft status', async () => {
      const result = await jobService.parseJD({
        jobId: 'job-001',
        jdDocumentId: 'jd-doc-001',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.status).toBe('draft');
        expect(result.data.parsedCriteriaVersion).toBe(1);
        expect(Array.isArray(result.data.skills)).toBe(true);
        expect(Array.isArray(result.data.responsibilities)).toBe(true);
      }
    });
  });

  describe('getJob', () => {
    it('returns success for existing job', async () => {
      const result = await jobService.getJob('job-001');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.id).toBe('job-001');
        expect(result.data.title).toBe('Senior Frontend Developer');
      }
    });

    it('returns failure for non-existent job', async () => {
      const result = await jobService.getJob('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Job not found');
    });
  });
});
