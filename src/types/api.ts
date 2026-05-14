/**
 * Shared API contract types for all service layers.
 * Used by services in src/services/ and consumed across modules.
 */

// ---------------------------------------------------------------------------
// Primitive / shared enums
// ---------------------------------------------------------------------------

export type LanguageCode = 'vi' | 'en' | 'ja';

export type ApprovalDecision = 'approve' | 'reject' | 'request_revision';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ---------------------------------------------------------------------------
// API response envelope
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  error?: never;
}

export interface ApiFailure {
  success: false;
  data?: never;
  error: string | ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  error?: never;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

export function isSuccess<T>(resp: ApiResponse<T>): resp is ApiSuccess<T> {
  return resp.success === true;
}

export function isFailure<T>(resp: ApiResponse<T>): resp is ApiFailure {
  return resp.success === false;
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function failureResponse(error: string | ApiError): ApiFailure {
  return { success: false, error };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}