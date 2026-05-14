export type AssessmentPlanStatus = 'draft' | 'approved' | 'archived';
export type AssessmentCriteriaCategory = 'technical' | 'problem_solving' | 'communication' | 'culture' | 'delivery';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type TestDefinitionType = 'mcq' | 'essay' | 'coding' | 'mixed';

export interface AssessmentCriterion {
  id: string;
  label: string;
  category: AssessmentCriteriaCategory;
  weight: number;
  description: string;
}

export interface RubricVersion {
  id: string;
  versionNumber: number;
  criteria: AssessmentCriterion[];
  scoringScale: string;
  createdAt: string;
}

export interface InterviewQuestionSetVersion {
  id: string;
  versionNumber: number;
  title: string;
  language: string;
  followUpPolicy: string;
  questions: Array<{
    id: string;
    text: string;
    category: AssessmentCriteriaCategory;
    difficulty: QuestionDifficulty;
  }>;
}

export interface TestDefinitionVersion {
  id: string;
  versionNumber: number;
  title: string;
  testType: TestDefinitionType;
  sections: Array<{
    id: string;
    title: string;
    weight: number;
    durationMinutes: number;
  }>;
  answerKeyOrRubric: string;
}

export interface AssessmentPlanVersion {
  id: string;
  assessmentPlanId: string;
  versionNumber: number;
  rubricVersionId: string;
  interviewQuestionSetVersionId: string;
  testDefinitionVersionId: string;
  createdAt: string;
  createdBy: string;
}

export interface AssessmentPlan {
  id: string;
  jobId: string;
  jdVersionId: string;
  parsedCriteriaVersion: number;
  title: string;
  status: AssessmentPlanStatus;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentTraceability {
  jobId: string;
  jdVersionId: string;
  parsedCriteriaVersion: number;
  assessmentPlanId: string;
  assessmentPlanVersionId: string;
  rubricVersionId: string;
  interviewQuestionSetVersionId?: string;
  testDefinitionVersionId?: string;
}
