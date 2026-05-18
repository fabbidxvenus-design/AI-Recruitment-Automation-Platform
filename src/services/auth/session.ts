import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function getCurrentUser(supabase: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAuthenticated(supabase: SupabaseClient): Promise<boolean> {
  const user = await getCurrentUser(supabase);
  return user !== null;
}

export async function signOut(supabase: SupabaseClient): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}