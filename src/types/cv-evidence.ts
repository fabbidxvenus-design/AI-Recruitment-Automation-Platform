/**
 * API-015: CV Evidence Types
 */

export interface CVEvidenceExtraction {
  id: string;
  cvId: string;
  candidateId: string;
  originalCvUrl: string;
  extractedAt: string;
  isAiGenerated: boolean;
  structuredData: CVStructuredData;
}

export interface CVStructuredData {
  contactInfo: ContactInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  certifications: string[];
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedIn?: string;
  location?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description: string;
  achievements: string[];
}
