import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBrowserClient, clearClientEnvCache } from '@/lib/supabase/browser';

describe('supabase/browser', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal('process.env', { ...originalEnv });
    clearClientEnvCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearClientEnvCache();
  });

  describe('createBrowserClient', () => {
    it('creates a client when env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

      const client = createBrowserClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('auth');
      expect(client).toHaveProperty('from');
      expect(client).toHaveProperty('rpc');
    });

    it('throws when client env vars are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

      expect(() => createBrowserClient()).toThrow();
    });
  });
});