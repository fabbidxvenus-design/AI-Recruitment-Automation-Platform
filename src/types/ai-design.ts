/**
 * Module B: AI Design & Mock Image Generation Types
 * REQ-F-080, REQ-F-081, REQ-F-082, REQ-F-083
 * BR-026, BR-027, BR-028, BR-033
 */

export type DesignType = 'job_poster' | 'social_media' | 'email_banner' | 'presentation_slide';

export type DesignFormat = 'png' | 'jpg' | 'svg' | 'pdf';

export type PublishChannel = 'linkedin' | 'facebook' | 'email' | 'website' | 'internal';

export type DesignStatus =
  | 'empty'
  | 'generating'
  | 'generated'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'exported';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface DesignBrief {
  designType: DesignType;
  jobTitle: string;
  companyName: string;
  keyMessage: string;
  targetAudience: string;
  colorPreference?: string;
  additionalNotes?: string;
}

export interface AIProvenance {
  model: string;
  generatedAt: string;
  confidence: number;
  parameters: Record<string, unknown>;
}

export interface DesignVariant {
  id: string;
  imageUrl: string;
  thumbnail: string;
  title: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
  provenance: AIProvenance;
  isAiGenerated: boolean;
}

export interface ApprovalRecord {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  timestamp: string;
  reason?: string;
}

export interface DesignProject {
  id: string;
  brief: DesignBrief;
  variants: DesignVariant[];
  selectedVariantId?: string;
  status: DesignStatus;
  approvalHistory: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
}

export interface ValidationMessage {
  severity: ValidationSeverity;
  message: string;
  field?: string;
}

export interface ExportOptions {
  format: DesignFormat;
  channel: PublishChannel;
  includeMetadata: boolean;
}
