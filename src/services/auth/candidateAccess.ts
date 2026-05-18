import type { SupabaseClient } from '@supabase/supabase-js';
import {
  hasActiveSession,
  isCandidateSession,
  validateCandidateAccess,
  getCurrentCandidate,
} from './candidateSession';
import { validateInternalAccess } from './access';

/**
 * Access control result types
 */
export type AccessResult =
  | { allowed: true; candidateId: string; jobId: string; fullName: string; email: string }
  | { allowed: false; reason: 'auth.accessRequired' | 'auth.accessDenied.candidateNotFound' | 'auth.accessDenied.invalidSession' };

/**
 * Validate candidate portal access.
 * Returns access result with candidate details if allowed.
 */
export async function validateCandidatePortalAccess(
  supabase: SupabaseClient
): Promise<AccessResult> {
  // First check if user is authenticated at all
  const hasSession = await hasActiveSession(supabase);
  if (!hasSession) {
    return { allowed: false, reason: 'auth.accessRequired' };
  }

  // Check if this is a candidate session (not internal user)
  const isCandidate = await isCandidateSession(supabase);
  if (!isCandidate) {
    // Could be an internal user attempting to access candidate portal
    const internalError = await validateInternalAccess(supabase);
    if (!internalError) {
      // They have internal access - deny candidate portal access
      return { allowed: false, reason: 'auth.accessDenied.invalidSession' };
    }
    // No session at all
    return { allowed: false, reason: 'auth.accessRequired' };
  }

  // Get the candidate record
  const candidate = await getCurrentCandidate(supabase);
  if (!candidate) {
    return { allowed: false, reason: 'auth.accessDenied.candidateNotFound' };
  }

  return {
    allowed: true,
    candidateId: candidate.id,
    jobId: candidate.jobId,
    fullName: candidate.fullName,
    email: candidate.email,
  };
}

/**
 * Validate access to a specific candidate record.
 * Used when accessing candidate-specific data.
 */
export async function validateSpecificCandidateAccess(
  supabase: SupabaseClient,
  candidateId: string
): Promise<AccessResult> {
  const hasSession = await hasActiveSession(supabase);
  if (!hasSession) {
    return { allowed: false, reason: 'auth.accessRequired' };
  }

  const candidate = await validateCandidateAccess(supabase, candidateId);
  if (!candidate) {
    return { allowed: false, reason: 'auth.accessDenied.candidateNotFound' };
  }

  return {
    allowed: true,
    candidateId: candidate.id,
    jobId: candidate.jobId,
    fullName: candidate.fullName,
    email: candidate.email,
  };
}

/**
 * Check if candidate session can access internal routes.
 * Candidate sessions should never access internal AppShell.
 */
export async function preventCandidateFromInternalRoutes(
  supabase: SupabaseClient
): Promise<boolean> {
  const isCandidate = await isCandidateSession(supabase);
  if (isCandidate) {
    // Candidate trying to access internal routes - block
    return true;
  }
  return false;
}

/**
 * Combined validation for internal workspace access.
 * Ensures candidate sessions are blocked from internal routes.
 */
export async function validateInternalWorkspaceAccess(
  supabase: SupabaseClient
): Promise<{ allowed: boolean; reason?: string }> {
  const internalError = await validateInternalAccess(supabase);
  if (internalError) {
    return { allowed: false, reason: internalError };
  }

  // Additional check: ensure this isn't a candidate session trying to sneak in
  const isCandidate = await isCandidateSession(supabase);
  if (isCandidate) {
    return { allowed: false, reason: 'auth.accessDenied.invalidSession' };
  }

  return { allowed: true };
}