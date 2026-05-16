# CSS Tokens First

## Rule

Never hardcode color values in CSS. Always use CSS custom properties (tokens) from `src/app/globals.css`.

## Approved Tokens

| Token | Usage |
|-------|-------|
| `--color-text` | Primary text |
| `--color-text-secondary` | Muted/helper text |
| `--color-border` | Borders and dividers |
| `--color-surface` | Card backgrounds |
| `--color-surface-alt` | Alt surface (slightly different) |
| `--color-success` | Success green text |
| `--color-success-light` | Success green background |
| `--color-danger` | Danger/error red text |
| `--color-danger-light` | Danger/error red background |
| `--color-warning` | Warning text |
| `--color-warning-light` | Warning background |
| `--color-primary` | Primary brand color |
| `--color-info` | Info text |
| `--color-info-light` | Info background |

## Anti-patterns (NEVER do this)

```css
/* BAD — hardcoded hex */
background-color: #d1fae5;
color: #166534;

/* BAD — hardcoded hex */
color: #dc2626;
background: #fee2e2;

/* GOOD — use token */
background-color: var(--color-success-light);
color: var(--color-success);
```

## How to Add a New Token

If you need a color that doesn't exist in globals.css, add it to `:root` in `src/app/globals.css` as `--color-{name}`. Never add one-off hardcoded colors.

## Citation

[SoT: codebase] — `src/app/globals.css` design token definitions; replaced hardcoded colors in `jd-versions.module.css`, `jd-approval.module.css` during productization (2026-05-16).