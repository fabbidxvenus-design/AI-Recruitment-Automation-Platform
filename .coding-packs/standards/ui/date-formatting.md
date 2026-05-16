# Date Formatting

## Rule

Always use `formatDateTime` from `src/lib/formatDate.ts` for all timestamp rendering. Never use `new Date().toLocaleDateString()` directly.

## Usage

```tsx
import { formatDateTime } from '@/lib/formatDate';
import { useLanguage } from '@/i18n';

const { locale } = useLanguage();
<p>{formatDateTime(item.createdAt, locale)}</p>
```

## Why Not Inline?

- Ensures consistent format across all pages
- Supports locale (EN vs VI) via the `locale` param
- Centralized formatting logic — easy to change format globally
- Testable in isolation

## Relative Time

For relative timestamps (e.g., "4d ago", "Today"), use a separate `formatRelativeTime` function on the same file. Don't mix relative and absolute in the same component.

## Citation

[SoT: codebase] — `src/lib/formatDate.ts` formatRelativeTime used in `assessments/setup/page.tsx`, formatDateTime used across all 21 pages.