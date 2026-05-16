# CTA Component Usage

## Rule

For navigation CTAs, always wrap `Button` inside `next/link`. Never use `Button as="a"` because it breaks TypeScript types.

## Pattern

```tsx
// CORRECT
import Link from 'next/link';
import { Button } from '@/components';

<Link href="/screening/review">
  <Button variant="primary">
    {t('jobs.approval.workflow.nextAction')}
  </Button>
</Link>

// WRONG — TypeScript error: Property 'as' does not exist on ButtonProps
<Button as="a" href="/screening/review" variant="primary">
  {t('jobs.approval.workflow.nextAction')}
</Button>
```

## Button Variants

| Variant | When to Use |
|---------|------------|
| `primary` | Main CTA, one per section |
| `secondary` | Secondary action (cancel, back, dismiss) |
| `danger` | Destructive action (reject, delete) |
| default | Minimal action |

## Citation

[SoT: codebase] — `Button as="a"` caused TypeScript errors across multiple pages; fixed by switching to `Link + Button` pattern during productization (2026-05-16).