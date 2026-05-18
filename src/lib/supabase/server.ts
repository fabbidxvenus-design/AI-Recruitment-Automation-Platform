import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getServerEnv,
  getClientEnv,
  isSupabaseConfigured,
  clearClientEnvCache,
} from '@/lib/env';

export function createServiceRoleClient(): SupabaseClient {
  const env = getServerEnv();

  return createSupabaseClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createServerClient(): SupabaseClient {
  const env = getClientEnv();

  return createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey);
}

export { isSupabaseConfigured };
export { clearClientEnvCache };