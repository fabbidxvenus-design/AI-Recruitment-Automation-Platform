# Mock Data Location

## Rule

All mock data lives in `src/lib/`. Each domain has its own file. Test data lives alongside source in `__tests__/` subdirectories.

## File Map

| Domain | File |
|--------|------|
| Jobs/JD | `src/lib/jobIntakeMockData.ts` |
| Assessment plans | `src/lib/assessmentPlanMockData.ts` |
| Assessment workflow | `src/lib/assessmentWorkflowState.ts` |
| AI design | `src/lib/ai-design-mock.ts` |
| Content generation | `src/lib/mock-content-data.ts` |
| Shared entities | `src/lib/mockData.ts` |
| Date formatting | `src/lib/formatDate.ts` |

## Test Data Co-location

Test files go in `__tests__/` subdirectory next to the file they test:
```
src/lib/
  jobIntakeMockData.ts
  __tests__/
    phase2MockData.test.ts
```

## Mock Data Structure

- Named exports for each entity array
- Typed with TypeScript interfaces from `src/types/index.ts`
- No `any` types — all mock data is fully typed

## Citation

[SoT: codebase] — All mock data files in `src/lib/` observed during scan.