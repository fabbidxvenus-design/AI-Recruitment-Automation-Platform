/**
 * Translation Service
 * API-016: POST /api/cv/translate
 * API-017: POST /api/cv/translation/approve
 * API-018: POST /api/interview/translate
 * API-019: POST /api/interview/translation/approve
 */

import type { ApiResponse, ApprovalDecision, LanguageCode } from '@/types/api';
import type { CVTranslation, TranslatedCV } from '@/types/cv-translation';
import type { InterviewTranslation } from '@/types/interview-translation';

// ---------------------------------------------------------------------------
// Request/Response DTOs
// ---------------------------------------------------------------------------

export interface TranslateCVRequest {
  candidateId: string;
  targetLanguage: LanguageCode;
}

export interface TranslateCVResponse {
  translatedCV: TranslatedCV;
}

export interface ApproveCVTranslationRequest {
  translationId: string;
  decision: ApprovalDecision;
  approver: string;
}

export interface ApproveCVTranslationResponse {
  translationId: string;
  status: 'approved' | 'rejected';
}

export interface TranslateInterviewRequest {
  interviewId: string;
  targetLang: LanguageCode;
}

export interface TranslateInterviewResponse {
  translationId: string;
  translatedText: string;
  status: 'pending';
  isAiGenerated: true;
}

export interface ApproveInterviewTranslationRequest {
  translationId: string;
  decision: ApprovalDecision;
  approver: string;
}

export interface ApproveInterviewTranslationResponse {
  translationId: string;
  status: 'approved' | 'rejected';
}

// ---------------------------------------------------------------------------
// Service Implementation
// ---------------------------------------------------------------------------

const getCandidateName = (candidateId: string): string => {
  const names: Record<string, string> = {
    'cand-001': 'John Doe',
    'cand-002': 'Jane Smith',
    'cand-003': 'Alice Nguyen',
  };
  return names[candidateId] || `Candidate ${candidateId}`;
};

const getOriginalSections = (candidateId: string) => {
  return [
    { id: 'section-1', title: 'Contact', content: 'john.doe@example.com | +84 900 000 001' },
    { id: 'section-2', title: 'Summary', content: 'Experienced software engineer with 5+ years in enterprise development.' },
    { id: 'section-3', title: 'Experience', content: 'Senior Developer at Software Solutions Corp (2019-2026)\n- Core banking systems development\n- Team mentoring and code review' },
    { id: 'section-4', title: 'Education', content: 'Bachelor of Engineering in Computer Science, Hanoi University of Science and Technology (2015-2019)' },
    { id: 'section-5', title: 'Skills', content: 'Java, Spring Boot, PostgreSQL, Docker, AWS' },
  ];
};

const getTranslatedSections = (candidateId: string, targetLang: LanguageCode) => {
  const langLabels: Record<LanguageCode, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
    ja: '日本語',
  };
  return [
    { id: 'section-1', title: 'Liên hệ', content: 'john.doe@example.com | +84 900 000 001' },
    { id: 'section-2', title: 'Tóm tắt', content: 'Kỹ sư phần mềm giàu kinh nghiệm với 5+ năm phát triển doanh nghiệp.' },
    { id: 'section-3', title: 'Kinh nghiệm', content: 'Senior Developer tại Software Solutions Corp (2019-2026)\n- Phát triển hệ thống ngân hàng cốt lõi\n- Đào tạo và code review' },
    { id: 'section-4', title: 'Học vấn', content: 'Cử nhân Kỹ thuật Khoa học Máy tính, Đại học Bách khoa Hà Nội (2015-2019)' },
    { id: 'section-5', title: 'Kỹ năng', content: 'Java, Spring Boot, PostgreSQL, Docker, AWS' },
  ];
};

const translationService = {
  /**
   * API-016: Translate CV content
   */
  async translateCV(
    request: TranslateCVRequest
  ): Promise<ApiResponse<TranslateCVResponse>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const translatedSections = getTranslatedSections(request.candidateId, request.targetLanguage);
      const originalSections = getOriginalSections(request.candidateId);

      const translatedCV: TranslatedCV = {
        id: `cv-trans-${Date.now()}`,
        candidateName: getCandidateName(request.candidateId),
        candidateId: request.candidateId,
        originalSections,
        translatedSections,
        aiModel: 'GPT-4o',
        confidence: 0.92,
        translatedAt: new Date().toISOString(),
        status: 'pending_approval',
      };

      return {
        success: true,
        data: { translatedCV },
      };
    } catch (error: unknown) {
      console.error('[translationService] translateCV failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CV translation failed',
      };
    }
  },

  /**
   * API-017: Approve CV translation
   */
  async approveCVTranslation(
    request: ApproveCVTranslationRequest
  ): Promise<ApiResponse<ApproveCVTranslationResponse>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const status = request.decision === 'approve' ? 'approved' : 'rejected';

      return {
        success: true,
        data: {
          translationId: request.translationId,
          status,
        },
      };
    } catch (error: unknown) {
      console.error('[translationService] approveCVTranslation failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CV translation approval failed',
      };
    }
  },

  /**
   * API-018: Translate interview content
   */
  async translateInterview(
    request: TranslateInterviewRequest
  ): Promise<ApiResponse<TranslateInterviewResponse>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const translationId = `interview-trans-${Date.now()}`;

      // Mock translated content
      const translatedText = `[Translated to ${request.targetLang}] Interview content for interviewId: ${request.interviewId}`;

      return {
        success: true,
        data: {
          translationId,
          translatedText,
          status: 'pending',
          isAiGenerated: true,
        },
      };
    } catch (error: unknown) {
      console.error('[translationService] translateInterview failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interview translation failed',
      };
    }
  },

  /**
   * API-019: Approve interview translation
   */
  async approveInterviewTranslation(
    request: ApproveInterviewTranslationRequest
  ): Promise<ApiResponse<ApproveInterviewTranslationResponse>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const status = request.decision === 'approve' ? 'approved' : 'rejected';

      return {
        success: true,
        data: {
          translationId: request.translationId,
          status,
        },
      };
    } catch (error: unknown) {
      console.error('[translationService] approveInterviewTranslation failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interview translation approval failed',
      };
    }
  },
};

export const {
  translateCV,
  approveCVTranslation,
  translateInterview,
  approveInterviewTranslation
} = translationService;

export default translationService;