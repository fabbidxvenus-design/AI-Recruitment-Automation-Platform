import { createBrowserClient as createSupabaseBrowserClient, clearClientEnvCache as clearEnvCache, type SupabaseClient } from '@/lib/env';

export function createBrowserClient(): SupabaseClient {
  return createSupabaseBrowserClient();
}

export const clearClientEnvCache: () => void = clearEnvCache;

export default createBrowserClient;
