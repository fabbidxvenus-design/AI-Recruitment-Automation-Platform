/**
 * API-016, API-017: CV Translation Types
 */

import { LanguageCode, ApprovalStatus } from './api';

export type TargetLanguage = LanguageCode;

export interface CVSection {
  id: string;
  title: string;
  content: string;
}

export interface TranslatedCV {
  id: string;
  candidateName: string;
  candidateId: string;
  originalSections: CVSection[];
  translatedSections: CVSection[];
  aiModel: string;
  confidence: number;
  translatedAt: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CVTranslation {
  id: string;
  cvId: string;
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

export interface CVTranslationRequest {
  cvId: string;
  targetLang: LanguageCode;
}
