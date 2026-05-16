# recruitAI-web — Project Context (Scan Report)

> Vibecode Kit v5.0 — BƯỚC 1 (SCAN)
> Coding workspace: D:\WORKSPACE\RESEARCH\recruitAI-web
> Scanned: 2026-05-16

---

## SCAN REPORT

### TECH_STACK
| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.3.0 |
| UI Library | React | 19.0.0 |
| Language | TypeScript | 5.8.0 (strict: true) |
| Styling | CSS Modules + globals.css tokens | — |
| i18n | i18next + react-i18next | 26.1.0 / 17.0.7 |
| Testing | Vitest + Testing Library | 4.1.6 |
| E2E | Playwright | 1.60.0 |
| Linting | ESLint | 9.39.4 |
| Package Manager | pnpm | — |

### EXISTING_MODULES
| Module | Path | Purpose |
|--------|------|---------|
| Dashboard | `src/app/dashboard/page.tsx` | Pipeline overview + workspace readiness |
| Job/JD Intake | `src/app/jobs/intake/page.tsx` | Create job requisition + JD upload |
| JD Approval | `src/app/jobs/approval/page.tsx` | Review + approve parsed JD profiles |
| JD Versions | `src/app/jobs/versions/page.tsx` | Version history + diff comparison |
| Screening Review | `src/app/screening/review/page.tsx` | CV-to-JD matching + candidate ranking |
| Schedule Approval | `src/app/interviews/schedule-approval/page.tsx` | Interview slot approval |
| Interview Workspace | `src/app/portal/interview/demo-token/page.tsx` | Async AI interview for candidates |
| Interview Access | `src/app/portal/interview/access/page.tsx` | Candidate portal access |
| Assessment Setup | `src/app/assessments/setup/page.tsx` | Assessment plan + rubric configuration |
| Test Grading | `src/app/tests/grading/page.tsx` | AI-graded test review + human override |
| Final Review | `src/app/final-review/page.tsx` | Complete candidate package + final decision |
| Admin | `src/app/admin/page.tsx` | Integration config + monitoring |
| Candidate Import | `src/app/candidates/import/page.tsx` | CV batch import |
| Tools Hub | `src/app/tools/page.tsx` | AI tools navigation |
| AI Design | `src/app/tools/ai-design/page.tsx` | Poster/design generation |
| Content Generation | `src/app/tools/content-generation/page.tsx` | JD/CV/content drafting |
| CV Evidence | `src/app/tools/cv-evidence/page.tsx` | CV data extraction review |
| CV Translation | `src/app/tools/cv-translation/page.tsx` | CV translation workspace |
| Interview Translation | `src/app/tools/interview-translation/page.tsx` | Transcript translation |
| Error Page | `src/app/errors/ERR-2024-0892/page.tsx` | Error remediation workspace |

### PATTERNS_DETECTED
| Pattern | Where Used |
|---------|------------|
| App Router pages with 'use client' | All page.tsx files |
| CSS Modules for component styles | All component dirs have `*.module.css` |
| CSS custom properties (design tokens) | `src/app/globals.css` |
| Centralized i18n resources | `src/i18n/resources.ts` (EN/VI) |
| Mock data + localStorage state | `src/lib/jobIntakeMockData.ts`, `src/lib/assessmentWorkflowState.ts`, `src/lib/assessmentPlanMockData.ts` |
| Productization contract: State/Timeline/Evidence/Approval/NextAction | Dashboard, jobs approval, assessment setup, error page |
| Component composition (Card + CardHeader + CardContent) | All workflow pages |
| StatusBadge, Notice, Button, Modal, ProgressBar | All pages |
| next/link + Button wrapping | All CTA implementations (replaces `Button as="a"`) |
| formatDateTime utility | All timestamp rendering |

### REUSABLE_COMPONENTS
| Component | Path | Purpose |
|-----------|------|---------|
| AppShell | `src/components/shell/AppShell.tsx` | Top-level layout shell |
| PageTemplate | `src/components/PageTemplate/PageTemplate.tsx` | Generic page scaffold with coverage tracking |
| Card / CardHeader / CardContent | `src/components/ui/Card/` | Surface container |
| Button | `src/components/ui/Button/Button.tsx` | Action trigger (variants: primary, secondary, danger) |
| StatusBadge | `src/components/ui/StatusBadge/StatusBadge.tsx` | Status indicator (variants: success, warning, danger, default, info) |
| Notice | `src/components/ui/Notice/Notice.tsx` | Alert/notice banner (variants: info, warning, success, danger) |
| Modal | `src/components/ui/Modal/Modal.tsx` | Dialog overlay |
| ProgressBar | `src/components/ui/ProgressBar/ProgressBar.tsx` | Progress indicator |
| DataTable | `src/components/ui/DataTable/DataTable.tsx` | Tabular data display |
| EmptyState | `src/components/ui/EmptyState/EmptyState.tsx` | Empty placeholder |
| LoadingState | `src/components/ui/LoadingState/LoadingState.tsx` | Loading spinner |
| MetricCard | `src/components/ui/MetricCard/MetricCard.tsx` | KPI metric display |
| I18nProvider | `src/i18n/I18nProvider.tsx` | i18next context provider |
| formatDateTime | `src/lib/formatDate.ts` | Date/time formatting with locale |
| assessmentWorkflowState | `src/lib/assessmentWorkflowState.ts` | localStorage-backed assessment workflow |

### GAPS_DETECTED
| Gap | Severity | Description |
|-----|----------|-------------|
| No API routes | MEDIUM | All data is mock/localStorage — no REST API layer. Routes in `src/app/api/` don't exist. |
| No real backend/DB | MEDIUM | No Supabase, Prisma, or other DB integration. All state is in-memory or localStorage. |
| No auth middleware | MEDIUM | No authentication or role-based access. NextAuth not present. |
| No real Google Drive/Sheets/Calendar integration | MEDIUM | Admin page shows "readiness" states only — no actual API calls. |
| No real AI/LLM integration | MEDIUM | CV screening, evaluation, translation, content gen all use mock data. |
| Playwright config exists but tests in `test-results/` | LOW | E2E test infrastructure present but not run as part of CI. |
| Vitest tests exist (8 test files) but coverage unknown | LOW | Unit tests present in `src/services/__tests__/` and `src/lib/__tests__/` but no coverage gate enforced. |

### CODE_HEALTH
| Metric | Result |
|--------|--------|
| TypeScript Strict | ✅ Yes (`strict: true` in tsconfig.json) |
| ESLint | ✅ Configured (eslint.config.js + next plugin) |
| Tests | 8 test files, ~40 test cases |
| Console.logs | ✅ Clean (0 found in src/) |
| TODO/FIXME | ✅ Clean (0 found in src/) |
| Build | ✅ Passes (`npm run build`) |
| i18n EN/VI | ✅ Both locales complete |

### ESTIMATED_SIZE
| Metric | Value |
|--------|-------|
| Source files | ~200 TSX + ~140 CSS files |
| Pages (routes) | 21 |
| Reusable components | 15 |
| UI pages | 21 |
| LoC (src/) | ~12,000 |

---

## Auto-Answered Requirements (for RRI)

The following can be SKIPPED in the requirements interview because they're already resolved in the codebase:

1. **Framework**: Next.js 15 App Router with TypeScript — skip "What framework?"
2. **Styling**: CSS Modules + CSS tokens — skip "Tailwind or CSS-in-JS?"
3. **i18n**: i18next with centralized resources.ts — skip "How to handle translations?"
4. **State**: localStorage for workflow state, mock data for content — skip "How to manage state?"
5. **Testing**: Vitest + Testing Library + Playwright — skip "What test setup?"
6. **Design system**: StatusBadge, Notice, Card, Button, Modal, ProgressBar already exist
7. **Date formatting**: formatDateTime utility with locale support already exists
8. **Productization contract**: State/Timeline/Evidence/Approval/NextAction pattern already applied to all workflow pages
9. **Mock data layer**: Mock data in `src/lib/` provides all entity types — no need to redesign data models
10. **Error page pattern**: Deterministic elapsed time via useEffect already implemented

---

## Constraints

1. **No backend integration**: All external integrations (Google Drive, Sheets, Calendar, LLM APIs) are mocked UI states only.
2. **Keep i18n in sync**: Any new text must be added to both EN and VI sections in `src/i18n/resources.ts`.
3. **CSS token-first**: No hardcoded colors — use `var(--color-*)` from `globals.css`.
4. **Don't use `Button as="a"`**: Use `next/link` wrapping `Button` instead for type safety.
5. **No commit/push unless explicitly requested**: Branch: `productize-ui-ux-preview`.
6. **No destructive operations**: Don't delete routes, components, or mock data without explicit approval.

---

## Risks / Tech Debt

| Risk | Severity | Mitigation |
|------|----------|------------|
| No real data persistence | HIGH | Mock data + localStorage — all changes lost on reload. |
| No authentication | HIGH | Any user can access any page. |
| No real Google Calendar integration | MEDIUM | Schedule approval shows mock calendar slots. |
| No real AI evaluation | MEDIUM | All "AI" operations are simulated with mock data. |
| pnpm-lock.yaml + playwright-report/ in git | LOW | These should be in .gitignore. |

---

## Quality Gate: Self-Review
- Completeness: [7/7 items passed]
- Cross-reference: Consistent with actual codebase
- Gaps: No critical gaps — project context fully captured
- Action needed: None

---

## VISION

### PROJECT TYPE: Pattern B/F Hybrid — SaaS Application + Enterprise Recruitment Module

recruitAI-web is a commercial AI HR suite: a multi-workspace SaaS application for HR Managers and Hiring Managers to run end-to-end recruitment from job intake through final decision. It also behaves like an enterprise module because the current codebase already has a complete productized UI surface and must now reuse existing pages/components while adding commercial backend, auth, Google integrations, and AI/OCR providers.

### ARCHITECTURE VISION

```text
┌──────────────────────────────────────────────────────────────────────┐
│                              Next.js 15 App Router                    │
│                                                                      │
│  ┌─────────────────────────────┐   ┌──────────────────────────────┐  │
│  │ Internal HR/HM Workspace    │   │ Candidate Portal             │  │
│  │ - Dashboard                 │   │ - Candidate dashboard        │  │
│  │ - Job/JD Intake             │   │ - Interview workspace        │  │
│  │ - JD Approval/Versions      │   │ - Test/assignment            │  │
│  │ - Screening Review          │   │ - Status visibility          │  │
│  │ - Assessment/Test/Final     │   │                              │  │
│  └──────────────┬──────────────┘   └───────────────┬──────────────┘  │
│                 │                                  │                 │
│                 ▼                                  ▼                 │
│        Supabase Auth + RLS              Supabase Magic Link          │
│        HR Manager / Hiring Manager      Candidate-scoped access      │
└─────────────────┬──────────────────────────────────┬────────────────┘
                  │                                  │
                  ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           Supabase Backend                            │
│  Postgres tables: profiles, jobs, jd_versions, candidates,            │
│  assessment_plans, interviews, test_results, final_decisions,         │
│  audit_events, integration_accounts, ai_evidence                      │
│                                                                      │
│  RLS policies enforce HR/HM role access + candidate record isolation  │
└─────────────────┬──────────────────────────────────┬────────────────┘
                  │                                  │
                  ▼                                  ▼
┌───────────────────────────────┐       ┌──────────────────────────────┐
│ AI Provider Abstraction        │       │ Google Workspace Integrations │
│ - Google Document AI: OCR/JD/CV │       │ - Drive: JD/CV intake         │
│ - Claude: screening/grading     │       │ - Sheets: data sync/export    │
│ - Claude/Translate: translation │       │ - Calendar: scheduling        │
│ - EvidenceMetadata per output   │       │ - Gmail: invites/reminders    │
└───────────────────────────────┘       └──────────────────────────────┘
```

### UI VISION

**Theme:** Evidence-first professional SaaS for HR operations. The UI should feel like a recruitment command center, not a generic AI tool hub.

**Layout pattern:**
- Internal workspace: persistent AppShell, sidebar navigation, page-level workflow cards, timeline/evidence/approval panels.
- Candidate portal: separate lighter shell with deadline, progress, submission status, and minimal distractions.
- Admin/integration screens: readiness-first configuration layout with clear connected/pending/error states.

**Design system:**
- Keep current CSS Modules + global CSS tokens.
- Preserve tokenized semantic palette: primary blue for trust/professionalism, green for approval/readiness, amber for pending review, red for risk/rejection.
- Typography: keep current project font stack unless explicitly redesigned; if adding product fonts later, prefer `Plus Jakarta Sans + Inter` for modern SaaS clarity.
- Spacing: keep existing Card-based rhythm; avoid generic uniform grids when workflow hierarchy needs emphasis.

**UX contract:**
Every commercial workflow page must preserve State / Timeline / Evidence / Approval / Next Action. Backend work must not regress the productized UI pattern.

### API DESIGN

**API style:** Server-side service layer + Supabase client, with route handlers only where external webhooks/callbacks require them.

**Internal service boundaries:**
```text
src/lib/supabase/       # browser/server clients
src/services/auth/      # role/session helpers
src/services/jobs/      # job + jd version persistence
src/services/candidates/# candidate profile + portal state
src/services/ai/        # provider abstraction + evidence metadata
src/services/google/    # Drive/Sheets/Calendar/Gmail adapters
```

**Auth:**
- HR Manager + Hiring Manager: Supabase Auth with Google OAuth.
- Candidate: Supabase magic link / email OTP, isolated via candidate-scoped RLS.
- RBAC: `profiles.role` enum (`hr_manager`, `hiring_manager`) + Postgres RLS policies.

**API envelope for custom routes (when needed):**
```ts
type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
  metadata?: Record<string, unknown>;
};
```

**AI evidence contract:**
```ts
type EvidenceMetadata = {
  provider: 'google-document-ai' | 'anthropic' | 'google-translate';
  modelVersion: string;
  timestamp: string;
  confidence: number;
  requestId: string;
};
```

### MVP SCOPE

#### IN
| Domain | Screens / Systems | Priority |
|--------|-------------------|----------|
| Auth & RBAC | Login, callback, profiles, HR Manager/Hiring Manager access | P0 |
| Supabase Persistence | Jobs, JD versions, candidates, assessments, interviews, tests, final decisions, audit events | P0 |
| Candidate Portal | Candidate dashboard, interview, test/assignment, status | P0 |
| Google Drive | CV/JD intake from configured folders | P0 |
| Google Sheets | Candidate/job operational sync or export | P0 |
| Google Calendar | Interview scheduling and event creation | P0 |
| Gmail | Candidate invite/reminder/status emails | P0 |
| AI/OCR | Document AI for OCR/JD/CV, Claude for screening/grading/content/translation | P0 |
| Evidence/Audit | AI evidence metadata, version IDs, approval history, audit_events table | P0 |
| E2E Demo | Dashboard → intake → approval → screening → interview → assessment → final review | P0 |
| Localization | EN/VI parity for all user-facing copy | P0 |
| Quality Gates | Typecheck, lint, build, unit tests, critical Playwright journeys | P0 |

#### OUT (Post-MVP)
| Domain | Phase |
|--------|-------|
| Admin/Recruiter role expansion | P1 |
| Multi-tenant organization hierarchy | P1 unless commercial launch requires multiple companies immediately |
| ATS/job board publishing | P2 |
| Payment/billing/subscriptions | P2 |
| Advanced analytics dashboards | P2 |
| Custom-trained Document AI processors | P2 after real CV/JD sample evaluation |
| Domain-wide Google delegation hardening | P1 after OAuth scope verification planning |

### KEY DECISIONS
| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Classify as Pattern B/F hybrid | It is both a SaaS app with auth and an existing enterprise recruitment module that must preserve current UI patterns. |
| 2 | Keep current Next.js + React + TypeScript + CSS Modules stack | Scan confirmed a healthy strict TypeScript codebase; replacing the stack would add churn without value. |
| 3 | Use Supabase as commercial MVP backend | RRI decision: user chose Supabase; fits auth, Postgres, RLS, and fast MVP persistence. |
| 4 | Use Supabase Auth + Google OAuth for HR/HM | Research recommends familiar internal login and direct integration with Supabase sessions/RLS. |
| 5 | Use candidate magic link / email OTP for portal access | Keeps candidate access separate from internal roles without requiring account setup friction. |
| 6 | Preserve State/Timeline/Evidence/Approval/NextAction UI contract | This is the core product differentiation and must survive backend integration. |
| 7 | Use multi-provider AI stack | Google Document AI is best for OCR/extraction; Claude is best for reasoning-heavy screening/grading/content. |
| 8 | Use least-privilege Google OAuth scopes | Avoid restricted scopes where possible and reduce verification/security-assessment burden. |
| 9 | Introduce AI provider abstraction layer | Prevents vendor lock-in and keeps provider-specific details out of workflow pages. |
| 10 | Make audit_events a first-class table | Commercial MVP needs evidence/provenance and approval history across all workflows. |

### QUALITY GATE: SELF-REVIEW

- Completeness: 8/8 vision checklist items passed.
  - Project type classified.
  - Tech stack proposed with rationale.
  - Architecture vision included.
  - UI vision included.
  - API design included.
  - MVP IN/OUT scope tables included.
  - Key decisions table included.
  - Appended to `00-PROJECT-CONTEXT.md`.
- Cross-reference: Consistent with Scan Report, RRI requirements, standards, and research reports.
- Gaps: Domain-wide delegation vs per-user Google OAuth remains a Blueprint decision; multi-tenant org hierarchy remains deferred unless user promotes it.
- Action needed: User approval before `/vibecode:blueprint`.