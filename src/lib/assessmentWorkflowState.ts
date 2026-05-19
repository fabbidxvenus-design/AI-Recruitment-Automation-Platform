import type { AssessmentPlan, AssessmentPlanVersion, AssessmentTraceability } from '@/types';
import type { FinalReviewPackage, InterviewQuestion, InterviewSession, TestResult } from '@/types';
import {
  defaultAssessmentPlan,
  defaultAssessmentPlanVersion,
  mockAssessmentPlans,
  mockAssessmentPlanVersions,
  mockInterviewQuestionSetVersions,
} from './assessmentPlanMockData';
import { mockFinalReviewPackages, mockInterviewSessions, mockTestResults } from './mockData';

const STORAGE_KEY = 'recruitai:assessment-workflow-state';
const DEFAULT_CANDIDATE_ID = 'cand-001';
const DEFAULT_CANDIDATE_NAME = 'Sarah Chen';
const DEFAULT_CV_VERSION_ID = 'cv-ver-001';
const DEFAULT_INTERVIEW_SESSION_ID = 'int-001';
const DEFAULT_TEST_RESULT_ID = 'test-001';
const DEFAULT_FINAL_REVIEW_PACKAGE_ID = 'final-001';
const DEFAULT_TIMESTAMP = '2026-05-14T00:00:00Z';

export interface AssessmentWorkflowState {
  activeAssessmentPlanId: string;
  frozenPlanVersion: AssessmentPlanVersion;
  traceability: AssessmentTraceability;
  candidateId: string;
  candidateName: string;
  cvVersionId: string;
  stages: {
    planApproved: boolean;
    interviewCompleted: boolean;
    testGraded: boolean;
    finalReviewSubmitted: boolean;
  };
  artifacts: {
    interviewSessionId: string;
    testResultId: string;
    finalReviewPackageId: string;
  };
  createdAt: string;
  updatedAt: string;
}

function buildTraceability(plan: AssessmentPlan, planVersion: AssessmentPlanVersion): AssessmentTraceability {
  return {
    jobId: plan.jobId,
    jdVersionId: plan.jdVersionId,
    parsedCriteriaVersion: plan.parsedCriteriaVersion,
    assessmentPlanId: plan.id,
    assessmentPlanVersionId: planVersion.id,
    rubricVersionId: planVersion.rubricVersionId,
    interviewQuestionSetVersionId: planVersion.interviewQuestionSetVersionId,
    testDefinitionVersionId: planVersion.testDefinitionVersionId,
  };
}

function resolvePlanVersion(plan: AssessmentPlan): AssessmentPlanVersion {
  return mockAssessmentPlanVersions.find((version) => version.id === plan.currentVersionId) ?? defaultAssessmentPlanVersion;
}

function isAssessmentWorkflowState(value: unknown): value is AssessmentWorkflowState {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<AssessmentWorkflowState>;
  return Boolean(
    candidate.activeAssessmentPlanId &&
    candidate.frozenPlanVersion &&
    candidate.traceability &&
    candidate.candidateId &&
    candidate.candidateName &&
    candidate.cvVersionId &&
    candidate.stages &&
    candidate.artifacts
  );
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getDefaultAssessmentWorkflowState(): AssessmentWorkflowState {
  return {
    activeAssessmentPlanId: defaultAssessmentPlan.id,
    frozenPlanVersion: defaultAssessmentPlanVersion,
    traceability: buildTraceability(defaultAssessmentPlan, defaultAssessmentPlanVersion),
    candidateId: DEFAULT_CANDIDATE_ID,
    candidateName: DEFAULT_CANDIDATE_NAME,
    cvVersionId: DEFAULT_CV_VERSION_ID,
    stages: {
      planApproved: defaultAssessmentPlan.status === 'approved',
      interviewCompleted: false,
      testGraded: true,
      finalReviewSubmitted: false,
    },
    artifacts: {
      interviewSessionId: DEFAULT_INTERVIEW_SESSION_ID,
      testResultId: DEFAULT_TEST_RESULT_ID,
      finalReviewPackageId: DEFAULT_FINAL_REVIEW_PACKAGE_ID,
    },
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
  };
}

export function getActiveAssessmentWorkflowState(): AssessmentWorkflowState {
  if (!canUseLocalStorage()) return getDefaultAssessmentWorkflowState();

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return getDefaultAssessmentWorkflowState();

    const parsedValue: unknown = JSON.parse(storedValue);
    return isAssessmentWorkflowState(parsedValue) ? parsedValue : getDefaultAssessmentWorkflowState();
  } catch (error) {
    console.warn('Failed to parse stored workflow state, using default:', error);
    return getDefaultAssessmentWorkflowState();
  }
}

export function saveActiveAssessmentWorkflowState(state: AssessmentWorkflowState): void {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save workflow state to localStorage:', error);
    return;
  }
}

export function approveAssessmentPlan(
  plan: AssessmentPlan,
  planVersion: AssessmentPlanVersion,
  candidateId = DEFAULT_CANDIDATE_ID,
  candidateName = DEFAULT_CANDIDATE_NAME,
  cvVersionId = DEFAULT_CV_VERSION_ID
): AssessmentWorkflowState {
  const now = new Date().toISOString();
  const existingState = getActiveAssessmentWorkflowState();
  const nextState: AssessmentWorkflowState = {
    ...existingState,
    activeAssessmentPlanId: plan.id,
    frozenPlanVersion: planVersion,
    traceability: buildTraceability(plan, planVersion),
    candidateId,
    candidateName,
    cvVersionId,
    stages: {
      ...existingState.stages,
      planApproved: true,
    },
    createdAt: existingState.createdAt,
    updatedAt: now,
  };

  saveActiveAssessmentWorkflowState(nextState);
  return nextState;
}

export function saveAssessmentPlanDraft(plan: AssessmentPlan, planVersion: AssessmentPlanVersion): AssessmentWorkflowState {
  const now = new Date().toISOString();
  const existingState = getActiveAssessmentWorkflowState();
  const nextState: AssessmentWorkflowState = {
    ...existingState,
    activeAssessmentPlanId: plan.id,
    frozenPlanVersion: planVersion,
    traceability: buildTraceability(plan, planVersion),
    stages: {
      ...existingState.stages,
      planApproved: false,
    },
    updatedAt: now,
  };

  saveActiveAssessmentWorkflowState(nextState);
  return nextState;
}

export function resolveAssessmentTraceability(): AssessmentTraceability {
  return getActiveAssessmentWorkflowState().traceability;
}

export function resolveAssessmentPlanForActiveState(): AssessmentPlan {
  const state = getActiveAssessmentWorkflowState();
  return mockAssessmentPlans.find((plan) => plan.id === state.activeAssessmentPlanId) ?? defaultAssessmentPlan;
}

export function resolveAssessmentPlanVersionForActiveState(): AssessmentPlanVersion {
  const plan = resolveAssessmentPlanForActiveState();
  const state = getActiveAssessmentWorkflowState();
  return mockAssessmentPlanVersions.find((version) => version.id === state.frozenPlanVersion.id) ?? resolvePlanVersion(plan);
}

export function resolveInterviewSessionForActivePlan(): InterviewSession {
  const state = getActiveAssessmentWorkflowState();
  const baseSession = mockInterviewSessions.find((session) => session.id === state.artifacts.interviewSessionId) ?? mockInterviewSessions[0];
  const questionSet = mockInterviewQuestionSetVersions.find(
    (version) => version.id === state.traceability.interviewQuestionSetVersionId
  );
  const questions: InterviewQuestion[] = questionSet
    ? questionSet.questions.map((question, index) => ({
        id: question.id,
        text: question.text,
        category: question.category,
        difficulty: question.difficulty,
        expectedDuration: baseSession.questions[index]?.expectedDuration ?? 4,
      }))
    : baseSession.questions;

  return {
    ...baseSession,
    candidateId: state.candidateId,
    candidateName: state.candidateName,
    assessmentTraceability: state.traceability,
    questions,
  };
}

export function resolveTestResultForActivePlan(): TestResult {
  const state = getActiveAssessmentWorkflowState();
  const baseResult = mockTestResults.find((result) => result.id === state.artifacts.testResultId) ?? mockTestResults[0];
  return {
    ...baseResult,
    candidateId: state.candidateId,
    candidateName: state.candidateName,
    assessmentTraceability: state.traceability,
  };
}

export function resolveFinalReviewPackageForActivePlan(): FinalReviewPackage {
  const state = getActiveAssessmentWorkflowState();
  const basePackage = mockFinalReviewPackages.find((reviewPackage) => reviewPackage.id === state.artifacts.finalReviewPackageId) ?? mockFinalReviewPackages[0];
  return {
    ...basePackage,
    candidateId: state.candidateId,
    candidateName: state.candidateName,
    cvVersionId: state.cvVersionId,
    assessmentTraceability: state.traceability,
  };
}

export function markInterviewCompleted(sessionId: string): void {
  const state = getActiveAssessmentWorkflowState();
  saveActiveAssessmentWorkflowState({
    ...state,
    stages: {
      ...state.stages,
      interviewCompleted: true,
    },
    artifacts: {
      ...state.artifacts,
      interviewSessionId: sessionId,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function markTestGraded(testResultId: string): void {
  const state = getActiveAssessmentWorkflowState();
  saveActiveAssessmentWorkflowState({
    ...state,
    stages: {
      ...state.stages,
      testGraded: true,
    },
    artifacts: {
      ...state.artifacts,
      testResultId,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function markFinalReviewSubmitted(finalReviewPackageId: string): void {
  const state = getActiveAssessmentWorkflowState();
  saveActiveAssessmentWorkflowState({
    ...state,
    stages: {
      ...state.stages,
      finalReviewSubmitted: true,
    },
    artifacts: {
      ...state.artifacts,
      finalReviewPackageId,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function clearAssessmentWorkflowState(): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
