# recruitAI-web — Requirements Matrix (RRI Report)

> Vibecode Kit v5.0 — BƯỚC 2 (RRI) Output
> Date: 2026-05-16

---

## REQUIREMENTS MATRIX

### Domain 1: Commercial MVP Direction
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-CM-001 | Product must move from mock-backed demo/UAT UI toward commercial MVP readiness. | P0 | Business Analyst | TBD |
| REQ-CM-002 | Commercial MVP must preserve current end-to-end recruitment flow: Dashboard → Job/JD Intake → JD Approval/Versioning → Candidate Import/Screening → Interview Scheduling → Candidate Portal → Assessment → Test Grading → Final Review. | P0 | HR Manager | TBD |
| REQ-CM-003 | The primary success criterion is a smooth end-to-end demo across the full flow, not isolated page polish. | P0 | QA/Tester | TBD |
| REQ-CM-004 | The initial target user for optimization is HR Manager. | P0 | End User | TBD |

### Domain 2: Auth & RBAC
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-AUTH-001 | Commercial MVP must introduce authentication. | P0 | Operator/DevOps | TBD |
| REQ-AUTH-002 | Commercial MVP RBAC must support at least HR Manager and Hiring Manager roles. | P0 | HR Manager | TBD |
| REQ-AUTH-003 | Admin/Recruiter roles are not P0 unless later promoted during vision/blueprint. | P1 | Business Analyst | TBD |
| REQ-AUTH-004 | Candidate access must be separate from internal HR/HM access. | P0 | Developer | TBD |

### Domain 3: Data & Persistence
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-DATA-001 | Commercial MVP must use Supabase for backend persistence. | P0 | Developer | TBD |
| REQ-DATA-002 | Supabase should become the source of truth for jobs, JD versions, candidate profiles, assessment plans, interview sessions, test results, final decisions, and audit events. | P0 | Developer | TBD |
| REQ-DATA-003 | Existing mock data structures should guide initial schema design but not remain the runtime source of truth for commercial MVP. | P0 | Developer | TBD |
| REQ-DATA-004 | localStorage-backed workflow state should be replaced or narrowed to client-only UI draft state after Supabase integration. | P1 | Developer | TBD |

### Domain 4: AI/OCR Provider Selection
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-AI-001 | AI/OCR provider selection is not decided yet and requires research before implementation. | P0 | Business Analyst | TBD |
| REQ-AI-002 | Research must evaluate providers for JD parsing, CV extraction/OCR, screening, translation, grading, and content generation. | P0 | Developer | TBD |
| REQ-AI-003 | Provider choice must support evidence/provenance capture for AI outputs. | P0 | QA/Tester | TBD |
| REQ-AI-004 | Commercial MVP must avoid hardcoding provider-specific assumptions before provider research is complete. | P0 | Developer | TBD |

### Domain 5: Google Integrations
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-GGL-001 | Google Drive, Google Sheets, Google Calendar, and Gmail are P0 integrations for commercial MVP. | P0 | HR Manager | TBD |
| REQ-GGL-002 | Google Drive must support JD/CV file intake source configuration. | P0 | Recruiter | TBD |
| REQ-GGL-003 | Google Sheets must support candidate/job operational data sync or export. | P0 | HR Manager | TBD |
| REQ-GGL-004 | Google Calendar must support interview scheduling and availability workflows. | P0 | Hiring Manager | TBD |
| REQ-GGL-005 | Gmail must support candidate communication such as interview invites, reminders, and status messages. | P0 | HR Manager | TBD |
| REQ-GGL-006 | Google integrations must preserve audit/evidence trail semantics in the current UI contract. | P0 | QA/Tester | TBD |

### Domain 6: Candidate Portal
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-PORTAL-001 | Candidate portal is part of commercial MVP. | P0 | End User | TBD |
| REQ-PORTAL-002 | Candidate portal must include a dashboard, interview, test/assignment, and status visibility. | P0 | End User | TBD |
| REQ-PORTAL-003 | Candidate portal must be separate from HR/Hiring Manager internal workspace access. | P0 | Developer | TBD |
| REQ-PORTAL-004 | Candidate-facing flows must provide clear state, deadlines, submissions, and confirmation feedback. | P0 | QA/Tester | TBD |

### Domain 7: UI/Product Standards
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-UI-001 | All commercial MVP workflow surfaces must continue following the State/Timeline/Evidence/Approval/NextAction productization contract where applicable. | P0 | HR Manager | TBD |
| REQ-UI-002 | All visible copy must be localized in both EN and VI. | P0 | QA/Tester | TBD |
| REQ-UI-003 | CSS must use design tokens from `globals.css`; no hardcoded colors. | P0 | Developer | TBD |
| REQ-UI-004 | Navigation CTAs must use `next/link` wrapping `Button`, not unsupported `Button as="a"`. | P0 | Developer | TBD |
| REQ-UI-005 | Dates/timestamps must use shared formatting utilities and locale-aware rendering. | P0 | QA/Tester | TBD |

### Domain 8: Testing & Quality Gates
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|-------------|----------|---------|-----|
| REQ-QA-001 | Commercial MVP changes must preserve TypeScript strict mode, lint, build, and existing test suite health. | P0 | QA/Tester | TBD |
| REQ-QA-002 | New backend/provider integrations must include unit and integration tests. | P0 | QA/Tester | TBD |
| REQ-QA-003 | Critical user journeys must have Playwright E2E coverage before commercial MVP release. | P0 | QA/Tester | TBD |
| REQ-QA-004 | Coverage target is 80%+ where measurable. | P1 | QA/Tester | TBD |

---

## AUTO-ANSWERED (from Scan Report)

1. Framework: Next.js 15 App Router with TypeScript strict.
2. Styling: CSS Modules + CSS custom properties from `globals.css`.
3. i18n: i18next + react-i18next with centralized `src/i18n/resources.ts`.
4. State: localStorage helpers and mock data currently power workflow state.
5. Testing: Vitest, Testing Library, and Playwright are configured.
6. Design system: Card, Button, Notice, StatusBadge, Modal, ProgressBar, DataTable, EmptyState, LoadingState exist.
7. Date formatting: `formatDateTime` utility exists and should be reused.
8. UI contract: State/Timeline/Evidence/Approval/NextAction pattern exists and should continue.
9. Mock data: Entity models exist in `src/lib/` and can guide schema planning.
10. Error workflow: deterministic elapsed-time pattern exists via React state/effect.
11. No real backend/API/auth currently exists — commercial MVP must add these rather than assume they are present.

---

## APPLICABLE STANDARDS (from coding-packs/standards/)

- [i18n/bilingual-keys](standards/i18n/bilingual-keys.md) — every visible key must exist in both EN and VI.
- [i18n/namespace-organization](standards/i18n/namespace-organization.md) — keep resource namespace structure consistent.
- [mock-state/localStorage-workflow](standards/mock-state/localStorage-workflow.md) — use typed localStorage helpers, not direct page calls.
- [mock-state/mock-data-location](standards/mock-state/mock-data-location.md) — mock data lives in `src/lib/` per domain.
- [styling/css-tokens-first](standards/styling/css-tokens-first.md) — CSS token-first, no hardcoded hex values.
- [testing/test-file-organization](standards/testing/test-file-organization.md) — tests co-located under `__tests__/`.
- [ui/productization-contract](standards/ui/productization-contract.md) — State/Timeline/Evidence/Approval/NextAction for workflow pages.
- [ui/component-cta](standards/ui/component-cta.md) — `next/link` + `Button`, never `Button as="a"`.
- [ui/component-composition](standards/ui/component-composition.md) — Card/CardHeader/CardContent composition.
- [ui/date-formatting](standards/ui/date-formatting.md) — use shared date formatting utilities.

---

## DECISIONS LOG

| # | Decision | Options | Chosen | Rationale |
|---|----------|---------|--------|-----------|
| 1 | Commercial target | Demo/UAT ready / Backend MVP / Commercial MVP | Commercial MVP | User explicitly chose commercial MVP. |
| 2 | Primary audience | HR Manager / Recruiter / Hiring Manager | HR Manager | HR Manager is the primary role to optimize first. |
| 3 | Success criterion | Clear workflow / No raw keys / End-to-end demo | End-to-end demo | Commercial readiness requires the whole recruitment flow to run smoothly. |
| 4 | RBAC scope | HR+Recruiter+HM+Admin / HR+HM only / Custom | HR Manager + Hiring Manager | User chose lean internal role set for commercial MVP. |
| 5 | Database | Supabase / Prisma+provider / Research first | Supabase | User stated "sẽ dùng supabase". |
| 6 | AI/OCR provider | Claude+OCR TBD / Gemini stack / Research first | Research first | Provider selection is not decided. |
| 7 | Google integrations | Drive+Calendar / None first / All Google | All Google | User chose Drive, Sheets, Calendar, Gmail as P0. |
| 8 | Candidate portal | Interview only / Full portal / Defer | Full portal | Candidate portal with dashboard, interview, test, status is P0. |
| 9 | Standards inclusion | Include all / UI only / Skip | Include all | User confirmed all standards should constrain RRI. |

---

## OPEN QUESTIONS

| # | Question | Impact | Suggested Resolution |
|---|----------|--------|---------------------|
| 1 | Which AI/OCR provider(s) should commercial MVP use? | Blocks AI/OCR architecture and data contracts. | Run `/vibecode:research` for AI/OCR provider comparison before `/vibecode:vision` finalizes provider architecture. |
| 2 | Should Supabase Auth be used for HR/HM and candidate auth, or should candidate access use signed links/tokens? | Affects auth schema and portal access model. | Decide in Vision/Blueprint after auth architecture review. |
| 3 | What Google Workspace permission model should be used? | Affects OAuth scopes, admin consent, audit boundaries. | Research Google integration scopes during backend planning. |
| 4 | What data retention/privacy constraints apply to CVs, interviews, transcripts, and AI outputs? | Affects Supabase schema, storage, audit logs, and deletion workflows. | Add privacy/compliance requirements in Vision or research phase. |

---

## SCOPE BOUNDARIES

### In Scope (MVP)

- Commercial MVP readiness direction.
- Supabase-backed persistence.
- Authentication and RBAC for HR Manager + Hiring Manager.
- Separate candidate portal access.
- Full candidate portal: dashboard, interview, test/assignment, status.
- Google Drive, Sheets, Calendar, and Gmail integrations.
- AI/OCR provider research before implementation.
- End-to-end recruitment flow continuity.
- EN/VI localization.
- Existing UI productization contract preserved.
- Typecheck/lint/build/test quality gates.

### Out of Scope (defer)

- Final AI/OCR provider implementation before provider research.
- Admin/Recruiter role expansion unless explicitly promoted.
- Real ATS/job board publishing.
- Payment/billing.
- Multi-tenant organization hierarchy unless introduced in Vision.
- Production infrastructure/deployment architecture beyond preview workflow.

---

## Quality Gate: Self-Review

- Completeness: 6/6 RRI checklist items passed.
  - P0 requirements identified with REQ-IDs.
  - Auto-answered items marked from scan report.
  - Decisions log includes rationale.
  - Open questions listed.
  - Requirements matrix includes REQ-ID, description, priority, persona, TIP.
  - Applicable standards section populated from `coding-packs/standards/README.md`.
- Cross-reference: Consistent with `coding-packs/00-PROJECT-CONTEXT.md` and selected standards.
- Gaps: AI/OCR provider, candidate auth model, Google permissions, and privacy constraints remain open by design.
- Action needed: Run research for AI/OCR provider and Google/Supabase auth architecture before implementation blueprint.
