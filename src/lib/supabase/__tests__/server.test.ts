import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createServiceRoleClient, createServerClient, isSupabaseConfigured, clearClientEnvCache } from '@/lib/supabase/server';

describe('supabase/server', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal('process.env', { ...originalEnv });
    clearClientEnvCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearClientEnvCache();
  });

  describe('createServiceRoleClient', () => {
    it('creates a service role client when env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret';

      const client = createServiceRoleClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('auth');
      expect(client).toHaveProperty('from');
      expect(client).toHaveProperty('rpc');
    });

    it('throws when service role key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => createServiceRoleClient()).toThrow();
    });
  });

  describe('createServerClient', () => {
    it('creates a server client with anon key when env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret';

      const client = createServerClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('auth');
    });

    it('throws when client env vars are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

      expect(() => createServerClient()).toThrow();
    });
  });

  describe('isSupabaseConfigured', () => {
    it('returns true when client env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

      expect(isSupabaseConfigured()).toBe(true);
    });

    it('returns false when URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

      expect(isSupabaseConfigured()).toBe(false);
    });
  });
});