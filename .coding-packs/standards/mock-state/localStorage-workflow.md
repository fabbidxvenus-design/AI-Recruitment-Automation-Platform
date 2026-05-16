# localStorage Workflow State

## Rule

Workflow state that needs to persist across page reloads uses localStorage via a typed helper in `src/lib/`. No direct localStorage calls in page components.

## Pattern

```ts
// src/lib/assessmentWorkflowState.ts
export function getActiveAssessmentWorkflowState(): WorkflowState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_STATE;
}

export function saveAssessmentPlanDraft(plan: AssessmentPlan, version: AssessmentPlanVersion): void {
  const state = getActiveAssessmentWorkflowState();
  const updated = { ...state, stages: { ...state.stages, planApproved: false } };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
```

## Naming Convention for Helper Functions

- `getActive{Entity}WorkflowState` — read current state
- `save{Entity}Draft` — save draft (status = 'draft')
- `approve{Entity}` — approve (status = 'approved')
- Do NOT use `-ForPrototype` suffixes — rename to production names

## localStorage Schema

Schema lives in the same file as the helpers. Export it as a typed constant for testability.

## Citation

[SoT: codebase] — `src/lib/assessmentWorkflowState.ts`, `src/lib/jobIntakeMockData.ts`.