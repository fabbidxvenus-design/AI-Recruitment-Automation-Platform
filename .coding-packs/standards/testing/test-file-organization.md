# Test File Organization

## Rule

Unit tests live in `__tests__/` subdirectory next to the file they test. E2E tests live in root-level `tests/` or `e2e/` directories.

## Unit Test Pattern

```
src/lib/
  formatDate.ts
  __tests__/
    formatDate.test.ts    ← co-located unit test
src/services/
  cvService.ts
  __tests__/
    cvService.test.ts     ← co-located unit test
```

## Test Runner

- **Unit**: Vitest (`vitest.config.ts`)
- **E2E**: Playwright (`playwright.config.ts`)

## Test File Naming

- Unit: `{filename}.test.ts` or `{filename}.spec.ts`
- E2E: `*.spec.ts` (Playwright convention)

## Import Pattern

```ts
import { describe, it, expect } from 'vitest';
import { formatDateTime } from '@/lib/formatDate';
import '@testing-library/jest-dom'; // for DOM matchers
```

## Coverage Target

- 80% minimum line coverage
- All mock data files should have corresponding tests

## Citation

[SoT: codebase] — 8 test files found in `src/services/__tests__/` and `src/lib/__tests__/` during scan.