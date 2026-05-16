# recruitAI-web — Tech Stack

## Confirmed Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js App Router | 15.3.0 |
| UI Runtime | React | 19.0.0 |
| Language | TypeScript | 5.8.0 strict |
| Styling | CSS Modules + CSS custom properties | — |
| i18n | i18next + react-i18next | 26.1.0 / 17.0.7 |
| Unit Testing | Vitest | 4.1.6 |
| Component Testing | Testing Library + jsdom | latest in package.json |
| E2E Testing | Playwright | 1.60.0 |
| Linting | ESLint + Next config | 9.39.4 |
| Package Manager | pnpm | project lockfile present |

## Current Data Layer

- Mock data in `src/lib/`
- localStorage-backed workflow state via typed helpers
- No backend API routes
- No database
- No auth middleware

## Future Backend Track

Post-launch backend integration should preserve current frontend patterns while adding:

1. Auth/RBAC
2. Persistent database
3. API routes or service layer
4. LLM/OCR provider integration
5. Google Drive/Sheets/Calendar integrations
6. Audit/event log persistence

## Constraints

1. Preserve App Router structure under `src/app/`.
2. Keep TypeScript strict.
3. Keep i18n centralized in `src/i18n/resources.ts`.
4. Use CSS Modules and tokenized global CSS.
5. Keep reusable UI components in `src/components/ui/`.
6. Do not add backend dependencies until backend integration phase is explicitly planned.
