import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getClientEnv,
  getServerEnv,
  isSupabaseConfigured,
  createBrowserClient,
  clearClientEnvCache,
  EnvValidationError,
} from '@/lib/env';

describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal('process.env', { ...originalEnv });
    clearClientEnvCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearClientEnvCache();
  });

  describe('getClientEnv', () => {
    it('returns client config when env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

      const result = getClientEnv();

      expect(result.supabaseUrl).toBe('https://example.supabase.co');
      expect(result.supabaseAnonKey).toBe('anon-key-123');
    });

    it('throws EnvValidationError when URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

      expect(() => getClientEnv()).toThrow(EnvValidationError);
    });

    it('throws EnvValidationError when anon key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => getClientEnv()).toThrow(EnvValidationError);
    });

    it('throws with descriptive message listing missing vars', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => getClientEnv()).toThrow(
        'Missing required client environment variables'
      );
    });
  });

  describe('getServerEnv', () => {
    it('returns server config when all env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret';

      const result = getServerEnv();

      expect(result.supabaseUrl).toBe('https://example.supabase.co');
      expect(result.supabaseAnonKey).toBe('anon-key-123');
      expect(result.supabaseServiceRoleKey).toBe('service-role-secret');
    });

    it('throws EnvValidationError when service role key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => getServerEnv()).toThrow(EnvValidationError);
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

    it('returns false when anon key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(isSupabaseConfigured()).toBe(false);
    });
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
  });

  describe('security', () => {
    it('does not expose service role key in client config', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret';

      const clientEnv = getClientEnv();

      expect('supabaseServiceRoleKey' in clientEnv).toBe(false);
    });

    it('error messages do not include secret values', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'secret-anon-key-123';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'super-secret-key';

      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        getServerEnv();
      } catch (error) {
        if (error instanceof EnvValidationError) {
          expect(error.message).not.toContain('super-secret-key');
        }
      }
    });
  });
});