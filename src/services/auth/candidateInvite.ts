import { createServiceRoleClient } from '@/lib/supabase/server';

export interface CandidateInviteResult {
  success: boolean;
  candidateId?: string;
  sentAt?: string;
  error?: string;
}

function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function prepareCandidateInvite(candidateId: string): Promise<CandidateInviteResult> {
  try {
    if (!isValidUUID(candidateId)) {
      return { success: false, error: 'Invalid candidate ID' };
    }

    const supabase = createServiceRoleClient();

    const { data: candidate, error: fetchError } = await supabase
      .from('candidates')
      .select('id, email, full_name, job_id, status')
      .eq('id', candidateId)
      .single();

    if (fetchError || !candidate) {
      return { success: false, error: 'Candidate not found' };
    }

    if (!candidate.email) {
      return { success: false, error: 'Candidate email is required' };
    }

    const eligibleStatuses = ['imported', 'screened', 'shortlisted', 'interview_invited'];
    if (!eligibleStatuses.includes(candidate.status)) {
      return { success: false, error: `Candidate status '${candidate.status}' is not eligible for invitation` };
    }

    const sentAt = new Date().toISOString();

    const { error: tokenError } = await supabase
      .from('candidate_access_tokens')
      .insert({
        candidate_id: candidateId,
        token_type: 'magic_link',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: sentAt,
      });

    if (tokenError) {
      return { success: false, error: 'Candidate invitation could not be prepared' };
    }

    await supabase
      .from('audit_events')
      .insert({
        actor_type: 'internal_user',
        entity_type: 'candidate',
        entity_id: candidateId,
        event_type: 'invite_prepared',
        summary: `Candidate invite prepared`,
        metadata: {
          candidateId,
          jobId: candidate.job_id,
          sentAt,
        },
      });

    return {
      success: true,
      candidateId,
      sentAt,
    };
  } catch (error: unknown) {
    console.error('[candidateInvite] prepareCandidateInvite failed:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function validateCandidateForPortal(candidateId: string): Promise<{
  valid: boolean;
  error?: string;
  candidate?: {
    id: string;
    jobId: string;
    fullName: string;
    email: string;
    status: string;
  };
}> {
  if (!isValidUUID(candidateId)) {
    return { valid: false, error: 'Invalid candidate ID' };
  }

  const supabase = createServiceRoleClient();

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('id, job_id, full_name, email, status')
    .eq('id', candidateId)
    .single();

  if (error || !candidate) {
    return { valid: false, error: 'Candidate not found' };
  }

  const { data: authLink } = await supabase
    .from('candidates')
    .select('candidate_user_id')
    .eq('id', candidateId)
    .single();

  if (!authLink?.candidate_user_id) {
    return { valid: false, error: 'No portal access yet - invitation required' };
  }

  return {
    valid: true,
    candidate: {
      id: candidate.id,
      jobId: candidate.job_id,
      fullName: candidate.full_name,
      email: candidate.email,
      status: candidate.status,
    },
  };
}