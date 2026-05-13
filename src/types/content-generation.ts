export type ContentType = 'job_description' | 'interview_questions' | 'email_template';

export type ContentStatus =
  | 'draft'
  | 'generating'
  | 'generated'
  | 'editing'
  | 'pending_approval'
  | 'approved'
  | 'rejected';

export type UserRole = 'recruiter' | 'hr_manager';

export interface ContentBrief {
  contentType: ContentType;
  jobTitle: string;
  department: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  keyRequirements: string[];
  additionalNotes?: string;
}

export interface GeneratedContent {
  id: string;
  brief: ContentBrief;
  variants: ContentVariant[];
  selectedVariantId: string | null;
  status: ContentStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ContentVariant {
  id: string;
  title: string;
  content: string;
  aiModel: string;
  confidence: number;
  generatedAt: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  contentId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'edited';
  actor: string;
  actorRole: UserRole;
  timestamp: string;
  notes?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt';
  includeMetadata: boolean;
}
