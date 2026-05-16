# Card Component Composition

## Rule

Use Card with optional CardHeader and CardContent sub-components for consistent surface containers.

## Usage

```tsx
import { Card, CardHeader, CardContent } from '@/components';
import styles from './page.module.css';

<Card className={styles.versionsCard}>
  <CardHeader>
    <h2>{t('section.title')}</h2>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

## When CardHeader/CardContent Are Optional

For simple single-content cards, just use `Card` with a `className`:

```tsx
<Card className={styles.comparisonCard}>
  {/* content directly in Card */}
</Card>
```

## CSS Module Pattern

Keep page-specific styles in `*.module.css` in the same directory as the page. Card wrapper gets `className={styles.container}` from the page.

## Citation

[SoT: codebase] — Card/CardHeader/CardContent found in `src/components/ui/Card/`.