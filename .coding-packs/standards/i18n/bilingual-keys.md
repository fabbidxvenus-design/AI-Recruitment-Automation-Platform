# i18n Bilingual Keys

## Rule

Every visible string key MUST exist in **both** EN (`resources.ts`) and VI sections. A key that exists only in EN or only in VI is a bug.

## Implementation

1. All UI text keys live in `src/i18n/resources.ts`.
2. The file has two main sections: EN (top) and VI (bottom).
3. When adding a new key, add it to **both sections** at the same structural path.
4. Do NOT add keys to only one locale to "mark it as future work" — this causes silent UI breakage.
5. Keys that are truly optional (e.g., feature-flagged content) should not use `t('key')` at all; use inline conditional rendering instead.

## Example

```ts
// WRONG — only EN, VI will show raw key
title: 'Assessment Plan Setup',  // EN
// VI section missing this key → UI shows "jobs.approval.title"

// CORRECT — same key, both locales
title: 'Assessment Plan Setup',           // EN
title: 'Thiết lập kế hoạch đánh giá',    // VI
```

## When Adding a New Key

1. Add to `resources.ts` EN section first.
2. Immediately add the VI translation.
3. If the VI translation is not yet known, use the EN text as a temporary placeholder **with a comment** `// TODO: translate`, and create a follow-up task.
4. Never merge code where a visible key exists in one locale but not the other.

## Anti-patterns

```ts
// BAD — key used in code but no VI translation
workflow: {
  state: {
    label: 'Plan status',  // EN only
    // VI will render "assessments.setup.workflow.state.label"
  }
}

// GOOD — both locales present
workflow: {
  state: {
    label: 'Plan status',       // EN
    label: 'Trạng thái kế hoạch', // VI
  }
}
```

## Citation

[SoT: codebase] — Missing VI translations found during Vibecode scan 2026-05-16 on `src/i18n/resources.ts`.