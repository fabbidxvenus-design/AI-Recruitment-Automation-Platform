// Mock data for Module A prototype
import type { GeneratedContent, ApprovalHistoryEntry } from '@/types/content-generation';

export const mockGeneratedContents: GeneratedContent[] = [
  {
    id: 'content-001',
    brief: {
      contentType: 'job_description',
      jobTitle: 'Senior Frontend Developer',
      department: 'Engineering',
      experienceLevel: 'senior',
      keyRequirements: ['React', 'TypeScript', 'Next.js', '5+ years experience'],
      additionalNotes: 'Remote-friendly position',
    },
    variants: [
      {
        id: 'var-001-1',
        title: 'Variant A: Technical Focus',
        content: `# Senior Frontend Developer

We are seeking an experienced Senior Frontend Developer to join our Engineering team...

## Key Responsibilities
- Lead frontend architecture decisions
- Mentor junior developers
- Build scalable React applications

## Requirements
- 5+ years of professional frontend development
- Expert knowledge of React, TypeScript, and Next.js
- Strong understanding of web performance optimization`,
        aiModel: 'gemini-2.0-flash',
        confidence: 0.92,
        generatedAt: '2026-05-13T10:30:00Z',
        isAiGenerated: true,
      },
      {
        id: 'var-001-2',
        title: 'Variant B: Culture Focus',
        content: `# Senior Frontend Developer - Join Our Team

Looking for a passionate frontend developer who thrives in collaborative environments...

## What You'll Do
- Shape the future of our product
- Work with a talented, supportive team
- Contribute to open-source projects

## What We're Looking For
- 5+ years building modern web applications
- Deep expertise in React, TypeScript, Next.js
- A collaborative mindset and mentorship skills`,
        aiModel: 'gemini-2.0-flash',
        confidence: 0.88,
        generatedAt: '2026-05-13T10:30:05Z',
        isAiGenerated: true,
      },
    ],
    selectedVariantId: 'var-001-1',
    status: 'pending_approval',
    createdBy: 'recruiter@company.com',
    createdAt: '2026-05-13T10:25:00Z',
    isAiGenerated: true,
  },
];

export const mockApprovalHistory: ApprovalHistoryEntry[] = [
  {
    id: 'hist-001',
    contentId: 'content-001',
    action: 'submitted',
    actor: 'recruiter@company.com',
    actorRole: 'recruiter',
    timestamp: '2026-05-13T10:35:00Z',
    notes: 'Ready for HR review',
  },
];

import type { ContentBrief, ContentVariant } from '@/types/content-generation';

interface AIGenerationResult {
  variants: ContentVariant[];
}

export function simulateAIGeneration(brief: ContentBrief): Promise<AIGenerationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const timestamp = Date.now();
      resolve({
        variants: [
          {
            id: `var-${timestamp}-1`,
            title: 'Variant A',
            content: `# ${brief.jobTitle}\n\nGenerated content based on your requirements...`,
            aiModel: 'gemini-2.0-flash',
            confidence: 0.90,
            generatedAt: new Date().toISOString(),
            isAiGenerated: true,
          },
          {
            id: `var-${timestamp}-2`,
            title: 'Variant B',
            content: `# ${brief.jobTitle}\n\nAlternative approach to your content...`,
            aiModel: 'gemini-2.0-flash',
            confidence: 0.85,
            generatedAt: new Date().toISOString(),
            isAiGenerated: true,
          },
        ],
      });
    }, 2000);
  });
}
