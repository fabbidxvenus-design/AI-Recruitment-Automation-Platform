import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function getCurrentCandidateUser(supabase: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isCandidateSession(supabase: SupabaseClient): Promise<boolean> {
  const user = await getCurrentCandidateUser(supabase);
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('candidates')
    .select('id')
    .eq('candidate_user_id', user.id)
    .single();

  if (error) {
    console.error('[candidateSession] isCandidateSession candidate lookup failed', error);
    return false;
  }

  return data !== null;
}

export async function getCurrentCandidate(supabase: SupabaseClient): Promise<{ id: string; jobId: string; fullName: string; email: string } | null> {
  const user = await getCurrentCandidateUser(supabase);
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('candidates')
    .select('id, job_id, full_name, email')
    .eq('candidate_user_id', user.id)
    .single();

  if (error) {
    console.error('[candidateSession] getCurrentCandidate candidate lookup failed', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    jobId: data.job_id,
    fullName: data.full_name,
    email: data.email,
  };
}

export async function validateCandidateAccess(
  supabase: SupabaseClient,
  candidateId: string
): Promise<{ id: string; jobId: string; fullName: string; email: string } | null> {
  const user = await getCurrentCandidateUser(supabase);
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('candidates')
    .select('id, job_id, full_name, email')
    .eq('candidate_user_id', user.id)
    .eq('id', candidateId)
    .single();

  if (error || !data) {
    console.error('[candidateSession] validateCandidateAccess failed', error);
    return null;
  }

  return {
    id: data.id,
    jobId: data.job_id,
    fullName: data.full_name,
    email: data.email,
  };
}

export async function signOutCandidate(supabase: SupabaseClient): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: unknown) {
    console.error('[candidateSession] signOutCandidate failed', err);
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function hasActiveSession(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user !== null;
}