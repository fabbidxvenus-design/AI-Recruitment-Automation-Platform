# Namespace Organization

## Rule

i18n keys follow a flat-ish namespace with dot-notation for nesting. Keep depth ≤ 3 levels (page.section.element).

## Structure Convention

```
{page}.{section}.{element}
```

Example: `jobs.approval.timeline.title`

- Max depth: 3 dots (page.section.element.something)
- Common top-level namespaces: `common`, `dashboard`, `jobs`, `assessments`, `tests`, `finalReview`, `tools`, `errors`, `portal`, `admin`

## Nested Pattern

```ts
jobs: {
  approval: {
    workflow: {      // 3 levels deep — OK
      title: '...',
      timeline: {   // 4 levels — consider flattening if used directly in t() calls
        title: '...',
      }
    }
  }
}
```

## When to Use `common`

Anything shared across pages goes in `common:`:
- `common.notAvailable`, `common.pending`, `common.status.*`, `common.dismiss`, `common.save`, `common.cancel`

## Citation

[SoT: codebase] — `src/i18n/resources.ts` structure pattern observed during scan.