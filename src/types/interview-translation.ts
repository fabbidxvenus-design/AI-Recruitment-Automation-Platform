/**
 * API-018, API-019: Interview Translation Types
 */

import { LanguageCode, ApprovalStatus } from './api';

export interface InterviewTranslation {
  id: string;
  interviewId: string;
  candidateId: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  translatedText: string;
  status: ApprovalStatus;
  isAiGenerated: boolean;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface InterviewTranslationRequest {
  interviewId: string;
  targetLang: LanguageCode;
}
