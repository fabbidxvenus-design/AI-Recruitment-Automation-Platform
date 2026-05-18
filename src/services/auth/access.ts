import type { SupabaseClient } from '@supabase/supabase-js';
import { getCurrentUser } from './session';
import { getProfileRole } from './roles';

export type InternalRole = 'hr_manager' | 'hiring_manager';

export async function hasInternalAccess(supabase: SupabaseClient): Promise<boolean> {
  const user = await getCurrentUser(supabase);
  if (!user) {
    return false;
  }

  const role = await getProfileRole(supabase);
  return role === 'hr_manager' || role === 'hiring_manager';
}

export async function isHrManager(supabase: SupabaseClient): Promise<boolean> {
  const role = await getProfileRole(supabase);
  return role === 'hr_manager';
}

export async function isHiringManager(supabase: SupabaseClient): Promise<boolean> {
  const role = await getProfileRole(supabase);
  return role === 'hiring_manager';
}

export async function validateInternalAccess(supabase: SupabaseClient): Promise<string | null> {
  const user = await getCurrentUser(supabase);
  if (!user) {
    return 'auth.accessRequired';
  }

  const role = await getProfileRole(supabase);
  if (!role) {
    return 'auth.accessDenied.noRole';
  }

  if (role !== 'hr_manager' && role !== 'hiring_manager') {
    return 'auth.accessDenied.invalidRole';
  }

  return null;
}