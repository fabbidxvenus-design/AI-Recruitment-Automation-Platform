import type {
  AssessmentPlan,
  AssessmentPlanVersion,
  InterviewQuestionSetVersion,
  RubricVersion,
  TestDefinitionVersion,
} from '@/types';

export const mockRubricVersions: RubricVersion[] = [
  {
    id: 'rubric-ver-001',
    versionNumber: 1,
    scoringScale: '0-100 weighted score',
    createdAt: '2026-05-10T16:30:00Z',
    criteria: [
      {
        id: 'crit-technical-depth',
        label: 'Technical Depth',
        category: 'technical',
        weight: 40,
        description: 'Evaluates framework knowledge, implementation quality, and system trade-offs.',
      },
      {
        id: 'crit-problem-solving',
        label: 'Problem Solving',
        category: 'problem_solving',
        weight: 25,
        description: 'Evaluates debugging approach, decomposition, and reasoning clarity.',
      },
      {
        id: 'crit-communication',
        label: 'Communication',
        category: 'communication',
        weight: 20,
        description: 'Evaluates clarity, structure, and ability to explain decisions.',
      },
      {
        id: 'crit-delivery',
        label: 'Delivery Reliability',
        category: 'delivery',
        weight: 15,
        description: 'Evaluates ownership, testing discipline, and production readiness.',
      },
    ],
  },
];

export const mockInterviewQuestionSetVersions: InterviewQuestionSetVersion[] = [
  {
    id: 'iqs-ver-001',
    versionNumber: 1,
    title: 'Senior Frontend Interview Set',
    language: 'en',
    followUpPolicy: '2 guided follow-ups are available after the fixed technical questions.',
    questions: [
      {
        id: 'iq-001',
        text: 'Tell me about your experience with React Hooks.',
        category: 'technical',
        difficulty: 'medium',
      },
      {
        id: 'iq-002',
        text: 'Describe a challenging bug you debugged recently.',
        category: 'problem_solving',
        difficulty: 'medium',
      },
      {
        id: 'iq-003',
        text: 'How do you handle state management in large applications?',
        category: 'technical',
        difficulty: 'hard',
      },
    ],
  },
];

export const mockTestDefinitionVersions: TestDefinitionVersion[] = [
  {
    id: 'test-def-ver-001',
    versionNumber: 1,
    title: 'JavaScript Fundamentals + Frontend Architecture',
    testType: 'mixed',
    answerKeyOrRubric: 'MCQ answer key plus rubric-ver-001 weighted essay/coding criteria.',
    sections: [
      {
        id: 'section-mcq',
        title: 'JavaScript MCQ',
        weight: 35,
        durationMinutes: 25,
      },
      {
        id: 'section-essay',
        title: 'Architecture Essay',
        weight: 30,
        durationMinutes: 30,
      },
      {
        id: 'section-coding',
        title: 'Frontend Coding Challenge',
        weight: 35,
        durationMinutes: 60,
      },
    ],
  },
];

export const mockAssessmentPlans: AssessmentPlan[] = [
  {
    id: 'assess-plan-001',
    jobId: 'job-001',
    jdVersionId: 'jd-ver-001-v2',
    parsedCriteriaVersion: 2,
    title: 'Senior Frontend Developer Assessment Plan',
    status: 'approved',
    currentVersionId: 'assess-plan-ver-001',
    createdAt: '2026-05-10T16:45:00Z',
    updatedAt: '2026-05-10T17:10:00Z',
  },
];

export const mockAssessmentPlanVersions: AssessmentPlanVersion[] = [
  {
    id: 'assess-plan-ver-001',
    assessmentPlanId: 'assess-plan-001',
    versionNumber: 1,
    rubricVersionId: 'rubric-ver-001',
    interviewQuestionSetVersionId: 'iqs-ver-001',
    testDefinitionVersionId: 'test-def-ver-001',
    createdAt: '2026-05-10T17:10:00Z',
    createdBy: 'HR Manager',
  },
];

export const defaultAssessmentPlan = mockAssessmentPlans[0];
export const defaultAssessmentPlanVersion = mockAssessmentPlanVersions[0];
export const defaultRubricVersion = mockRubricVersions[0];
export const defaultInterviewQuestionSetVersion = mockInterviewQuestionSetVersions[0];
export const defaultTestDefinitionVersion = mockTestDefinitionVersions[0];
