import type { SupabaseClient } from '@supabase/supabase-js';

export async function getProfileRole(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('[roles] getProfileRole profile lookup failed', error);
    return null;
  }

  return data?.role ?? null;
}