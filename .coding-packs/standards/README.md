# Standards Index

| Area | Standard | Description |
|------|----------|-------------|
| i18n | [bilingual-keys](i18n/bilingual-keys.md) | Every key must exist in both EN and VI |
| i18n | [namespace-organization](i18n/namespace-organization.md) | Resource structure conventions |
| mock-state | [localStorage-workflow](mock-state/localStorage-workflow.md) | localStorage-backed workflow state patterns |
| mock-state | [mock-data-location](mock-state/mock-data-location.md) | Mock data file organization |
| styling | [css-tokens-first](styling/css-tokens-first.md) | Use CSS custom properties, never hardcode colors |
| testing | [test-file-organization](testing/test-file-organization.md) | Vitest test file placement in `__tests__/` |
| ui | [productization-contract](ui/productization-contract.md) | State/Timeline/Evidence/Approval/NextAction for workflow pages |
| ui | [component-cta](ui/component-cta.md) | CTA implementations use next/link + Button, never Button as="a" |
| ui | [component-composition](ui/component-composition.md) | Card/CardHeader/CardContent composition pattern |
| ui | [date-formatting](ui/date-formatting.md) | Always use formatDateTime from lib/formatDate.ts |