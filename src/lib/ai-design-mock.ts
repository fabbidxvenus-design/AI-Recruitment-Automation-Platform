/**
 * Module B: Mock AI Design Generation
 * Deterministic fixtures for prototype demonstration
 * No external API calls
 */

import { DesignBrief, DesignVariant, AIProvenance } from '@/types/ai-design';

const MOCK_DELAY_MS = 2000;

function generateMockProvenance(): AIProvenance {
  return {
    model: 'gemini-2.0-flash-exp',
    generatedAt: new Date().toISOString(),
    confidence: 0.85 + Math.random() * 0.1,
    parameters: {
      temperature: 0.7,
      style: 'professional',
      aspectRatio: '16:9',
    },
  };
}

function generateMockVariants(brief: DesignBrief): DesignVariant[] {
  const baseId = Date.now();
  const variants: DesignVariant[] = [];

  const styles = [
    { title: 'Modern Minimalist', desc: 'Clean lines, bold typography, ample white space' },
    { title: 'Professional Corporate', desc: 'Traditional layout, corporate colors, structured design' },
    { title: 'Creative Bold', desc: 'Vibrant colors, dynamic composition, eye-catching elements' },
  ];

  styles.forEach((style, index) => {
    variants.push({
      id: `variant-${baseId}-${index}`,
      imageUrl: `/mock-designs/${brief.designType}-${index + 1}.png`,
      thumbnail: `/mock-designs/${brief.designType}-${index + 1}-thumb.png`,
      title: style.title,
      description: style.desc,
      dimensions: {
        width: 1920,
        height: 1080,
      },
      provenance: generateMockProvenance(),
    });
  });

  return variants;
}

export async function generateDesignVariants(brief: DesignBrief): Promise<DesignVariant[]> {
  // Simulate AI generation delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  // Deterministic mock generation
  return generateMockVariants(brief);
}

export function validateDesignBrief(brief: Partial<DesignBrief>): string[] {
  const errors: string[] = [];

  if (!brief.designType) {
    errors.push('Design type is required');
  }

  if (!brief.jobTitle || brief.jobTitle.trim().length === 0) {
    errors.push('Job title is required');
  }

  if (!brief.companyName || brief.companyName.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (!brief.keyMessage || brief.keyMessage.trim().length === 0) {
    errors.push('Key message is required');
  }

  if (!brief.targetAudience || brief.targetAudience.trim().length === 0) {
    errors.push('Target audience is required');
  }

  return errors;
}

export async function mockApprovalRequest(variantId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Mock approval submission - no actual backend call
}

export async function mockExportDesign(
  variantId: string,
  format: string,
  channel: string
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock export - return success with mock download URL
  return {
    success: true,
    downloadUrl: `/mock-exports/${variantId}.${format}`,
  };
}
