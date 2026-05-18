import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export type { SupabaseClient };

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface ServerEnvConfig extends EnvConfig {
  supabaseServiceRoleKey: string;
}

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

function validateServerEnv(): ServerEnvConfig {
  const SERVER_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVER_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SERVER_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];

  if (!SERVER_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!SERVER_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!SERVER_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required server environment variables: ${missing.join(', ')}`
    );
  }

  // Use non-null assertions since validation above guarantees these are defined
  const supabaseUrl = SERVER_SUPABASE_URL!;
  const supabaseAnonKey = SERVER_SUPABASE_ANON_KEY!;
  const supabaseServiceRoleKey = SERVER_SERVICE_ROLE_KEY!;

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

let cachedClientEnv: EnvConfig | null = null;

export function clearClientEnvCache(): void {
  cachedClientEnv = null;
}

export function getClientEnv(): EnvConfig {
  if (isE2ETestEnv()) {
    return { supabaseUrl: E2E_DUMMY_URL, supabaseAnonKey: E2E_DUMMY_KEY };
  }

  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const SERVER_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVER_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];

  if (!SERVER_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!SERVER_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required client environment variables: ${missing.join(', ')}`
    );
  }

  // Use non-null assertions since validation above guarantees these are defined
  const supabaseUrl = SERVER_SUPABASE_URL!;
  const supabaseAnonKey = SERVER_SUPABASE_ANON_KEY!;

  const env: EnvConfig = {
    supabaseUrl,
    supabaseAnonKey,
  };

  cachedClientEnv = env;
  return env;
}

export function getServerEnv(): ServerEnvConfig {
  return validateServerEnv();
}

export function isSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function createBrowserClient(): SupabaseClient {
  const env = getClientEnv();
  return createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey);
}

const E2E_DUMMY_URL = 'http://127.0.0.1:54321';
const E2E_DUMMY_KEY = 'test-anon-key-for-e2e';

function isE2ETestEnv(): boolean {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL === E2E_DUMMY_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === E2E_DUMMY_KEY ||
    process.env.PW_E2E === 'true'
  );
}