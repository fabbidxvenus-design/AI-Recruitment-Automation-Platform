# recruitAI-web — Task Graph

> Vibecode Kit v5.0 — BƯỚC 5 (TASK GRAPH)
> 13 TIPs across 4 weeks.

---

## DEPENDENCY GRAPH

```text
                         ┌────────────────────────────────────┐
                         │ TIP-001 Supabase foundation         │
                         └─────────────────┬──────────────────┘
                                           │
                         ┌─────────────────▼──────────────────┐
                         │ TIP-002 Schema v1 + RLS + audit     │
                         └───────┬───────────────┬────────────┘
                                 │               │
                 ┌───────────────▼──────┐  ┌────▼─────────────────────┐
                 │ TIP-003 Internal auth │  │ TIP-004 Candidate access │
                 └──────────┬───────────┘  └────────┬─────────────────┘
                            │                       │
        ┌───────────────────▼───────────────────────▼──────────────────┐
        │                  Persistence migration                         │
        └──────────────┬────────────────┬──────────────────────────────┘
                       │                │
       ┌───────────────▼─────┐  ┌───────▼────────────────┐
       │ TIP-005 Jobs + JD    │  │ TIP-006 Candidates +    │
       │ repository migration │  │ screening persistence   │
       └───────────────┬─────┘  └───────┬────────────────┘
                       │                │
                       └────────┬───────┘
                                │
                ┌───────────────▼────────────────────────┐
                │ TIP-007 Interviews/assessments/tests/   │
                │ final decisions persistence             │
                └───────────────┬────────────────────────┘
                                │
       ┌────────────────────────┼──────────────────────────┐
       │                        │                          │
┌──────▼─────────────┐  ┌───────▼────────────┐  ┌─────────▼────────────┐
│ TIP-008 AI/OCR      │  │ TIP-009 Google      │  │ TIP-010 File intake   │
│ abstraction         │  │ Workspace services  │  │ + storage references  │
└──────┬─────────────┘  └───────┬────────────┘  └─────────┬────────────┘
       │                        │                         │
       └────────────────────────┼─────────────────────────┘
                                │
                 ┌──────────────▼─────────────────┐
                 │ TIP-011 Candidate portal full   │
                 │ workflow                        │
                 └──────────────┬─────────────────┘
                                │
                 ┌──────────────▼─────────────────┐
                 │ TIP-012 Audit/evidence timeline │
                 │ integration                     │
                 └──────────────┬─────────────────┘
                                │
                 ┌──────────────▼─────────────────┐
                 │ TIP-013 E2E demo + quality gates│
                 └────────────────────────────────┘
```

## TIP SUMMARY TABLE

| TIP | Name | Depends On | Priority | Est. Hours | Week |
|-----|------|------------|----------|------------|------|
| TIP-001 | Supabase project foundation and environment contract | — | P0 | 6 | 1 |
| TIP-002 | Database schema v1 with RLS and audit base | TIP-001 | P0 | 12 | 1 |
| TIP-003 | Internal auth and RBAC shell | TIP-001, TIP-002 | P0 | 10 | 1 |
| TIP-004 | Candidate magic-link access foundation | TIP-001, TIP-002 | P0 | 8 | 1 |
| TIP-005 | Jobs and JD versions repository migration | TIP-002, TIP-003 | P0 | 14 | 2 |
| TIP-006 | Candidate import and screening persistence | TIP-002, TIP-003 | P0 | 14 | 2 |
| TIP-007 | Interviews, assessments, tests, final decisions persistence | TIP-005, TIP-006 | P0 | 18 | 2 |
| TIP-008 | AI/OCR abstraction and evidence metadata | TIP-002, TIP-007 | P0 | 14 | 3 |
| TIP-009 | Google Workspace integration services | TIP-002, TIP-003 | P0 | 16 | 3 |
| TIP-010 | File intake and storage references | TIP-002, TIP-005, TIP-006 | P0 | 10 | 3 |
| TIP-011 | Candidate portal full workflow | TIP-004, TIP-007, TIP-010 | P0 | 16 | 4 |
| TIP-012 | End-to-end audit/evidence timeline integration | TIP-007, TIP-008, TIP-009, TIP-010, TIP-011 | P0 | 14 | 4 |
| TIP-013 | Critical E2E demo and release quality gates | TIP-011, TIP-012 | P0 | 12 | 4 |
| TIP-P08 | Productization WCAG 2.2 — StatusBadge, form errors, grading modal | — | P1 | 0.75 | UI/UX loop |
| TIP-P09 | Productization UX resilience — error feedback, flow guards | — | P1 | 0.75 | UI/UX loop |
| TIP-P05 | Productization accessibility — final-review CRITICAL modals | — | P1 | 0.75 | UI/UX loop |
| TIP-P06 | Productization error boundaries and loading states | — | P1 | 0.5 | UI/UX loop |
| TIP-P07 | Productization keyboard navigation and ARIA polish | — | P1 | 0.75 | UI/UX loop |
| TIP-P01 | Productization error logging and feedback fixes | — | P1 | 0.5 | UI/UX loop |
| TIP-P02 | Productization accessibility fixes | — | P1 | 0.75 | UI/UX loop |
| TIP-P03 | Productization code quality fixes | — | P1 | 0.5 | UI/UX loop |
| TIP-P04 | Productization visual refinements | — | P2 | 0.35 | UI/UX loop |

## TIP DETAILS

### TIP-001 — Supabase project foundation and environment contract

**Goal:** Add safe Supabase client foundation and environment contract without changing runtime data sources yet.

**Requirements:** REQ-AUTH-001, REQ-DATA-001, REQ-QA-001

**Deliverables:**
- `src/lib/env.ts` with validated environment access.
- `src/lib/supabase/browser.ts` and `src/lib/supabase/server.ts`.
- Server-only boundary for service role key.
- Unit tests for env parsing and missing variable behavior.

**Acceptance:** Typecheck/lint pass, no hardcoded credentials, existing UI unchanged.

### TIP-002 — Database schema v1 with RLS and audit base

**Goal:** Define Supabase schema and RLS policies for core recruitment entities.

**Requirements:** REQ-AUTH-002, REQ-AUTH-004, REQ-DATA-002, REQ-GGL-006, REQ-AI-003

**Deliverables:**
- Migrations for `profiles`, `jobs`, `jd_versions`, `candidates`, `screening_results`, `interviews`, `assessment_plans`, `test_results`, `final_decisions`, `integration_accounts`, `ai_evidence`, `audit_events`.
- RLS enabled on every app table.
- Policies for HR/HM internal access and candidate own-record access.
- Profile creation trigger for new Supabase auth users.

**Acceptance:** Schema is documented in migration comments or adjacent schema notes; RLS has no public unrestricted table access.

### TIP-003 — Internal auth and RBAC shell

**Goal:** Add HR/HM Google OAuth login and protected internal workspace access.

**Requirements:** REQ-AUTH-001, REQ-AUTH-002, REQ-CM-004

**Deliverables:**
- Login page and auth callback route.
- Session and role helpers.
- Protected internal workspace guard.
- Bilingual login/access copy.

**Acceptance:** Unauthenticated users cannot access internal workspace; HR/HM roles resolve from profile records.

### TIP-004 — Candidate magic-link access foundation

**Goal:** Establish candidate portal authentication separate from internal HR/HM access.

**Requirements:** REQ-AUTH-004, REQ-PORTAL-001, REQ-PORTAL-003

**Deliverables:**
- Candidate invite/magic-link initiation route or service.
- Candidate-scoped session helper.
- Candidate portal access guard.
- Candidate-specific permission/empty states.

**Acceptance:** Candidate identity can only read candidate-linked records through RLS and app access checks.

### TIP-005 — Jobs and JD versions repository migration

**Goal:** Move Job/JD Intake, JD Approval, and JD Versions from mock runtime data to Supabase repositories.

**Requirements:** REQ-CM-002, REQ-DATA-002, REQ-DATA-003, REQ-UI-001

**Deliverables:**
- `src/services/jobs/repository.ts` and mappers.
- Read/write paths for job intake and JD version approval.
- Audit events for create/approve/reject/version actions.
- Loading/empty/error states on affected pages.

**Acceptance:** Existing productized UI contract remains visible and data persists through Supabase.

### TIP-006 — Candidate import and screening persistence

**Goal:** Persist candidate import and screening review state.

**Requirements:** REQ-CM-002, REQ-DATA-002, REQ-DATA-003, REQ-AI-003

**Deliverables:**
- Candidate and screening repositories.
- Candidate import writes candidates and source references.
- Screening review reads candidate/JD context from Supabase.
- Audit events for import, screen, advance, reject.

**Acceptance:** Candidate ranking and stage advancement survive reload and preserve evidence context.

### TIP-007 — Interviews, assessments, tests, final decisions persistence

**Goal:** Replace downstream mock/localStorage runtime sources with durable records.

**Requirements:** REQ-DATA-002, REQ-DATA-004, REQ-PORTAL-002, REQ-UI-001

**Deliverables:**
- Repositories for interviews, assessment plans, test results, final decisions.
- Assessment approval persists to Supabase.
- Test grading review and final decision persist with audit timeline.
- localStorage narrowed to client-only drafts if still needed.

**Acceptance:** Schedule approval → assessment → grading → final review can persist and reload core state.

### TIP-008 — AI/OCR abstraction and evidence metadata

**Goal:** Add provider abstraction for Google Document AI and Claude with standardized evidence metadata.

**Requirements:** REQ-AI-002, REQ-AI-003, REQ-AI-004, REQ-QA-002

**Deliverables:**
- `src/services/ai/types.ts` with provider interfaces.
- Document parser, evaluator, translator use-case wrappers.
- Provider implementations for Google Document AI and Claude.
- Tests using mocked provider clients.
- Persistence of `ai_evidence` records.

**Acceptance:** Pages/services consume typed use cases only; provider-specific responses do not leak into UI components.

### TIP-009 — Google Workspace integration services

**Goal:** Add Google Drive/Sheets/Calendar/Gmail service adapters and admin readiness state.

**Requirements:** REQ-GGL-001, REQ-GGL-002, REQ-GGL-003, REQ-GGL-004, REQ-GGL-005, REQ-GGL-006

**Deliverables:**
- Google auth/token service.
- Drive intake service.
- Sheets export/sync service.
- Calendar event service.
- Gmail send service.
- Admin integration readiness backed by `integration_accounts`.
- Audit events for all integration actions.

**Acceptance:** Least-privilege scopes are documented in code/config; no raw tokens are exposed to client code.

### TIP-010 — File intake and storage references

**Goal:** Add secure file intake/reference handling for JD, CV, and test submissions.

**Requirements:** REQ-DATA-002, REQ-GGL-002, REQ-QA-002

**Deliverables:**
- Upload boundary validation for file type and size.
- Storage/reference abstraction for Supabase Storage or Drive references.
- Candidate/JD/test records store references, not raw blobs.
- Error states for invalid uploads.

**Acceptance:** CV/JD/test file paths are private references; no public bucket leakage.

### TIP-011 — Candidate portal full workflow

**Goal:** Implement full candidate dashboard/interview/test/status flow backed by candidate-scoped data.

**Requirements:** REQ-PORTAL-001, REQ-PORTAL-002, REQ-PORTAL-003, REQ-PORTAL-004

**Deliverables:**
- Candidate dashboard route.
- Candidate interview route backed by interview records.
- Candidate test/assignment route backed by test records.
- Candidate status route backed by audit/final decision records.
- Candidate-facing bilingual copy and confirmation states.

**Acceptance:** Candidate cannot access internal AppShell or other candidates' records.

### TIP-012 — End-to-end audit/evidence timeline integration

**Goal:** Feed workflow timeline/evidence/approval blocks from durable audit and evidence records.

**Requirements:** REQ-CM-003, REQ-GGL-006, REQ-UI-001, REQ-UI-005

**Deliverables:**
- Shared audit/evidence readers.
- Page-level integration across dashboard, job/JD, screening, interview, assessment, grading, final review, and admin.
- Locale-aware timestamps using `formatDateTime`.
- Approval histories from `audit_events`.

**Acceptance:** Productized UI contract is backed by real records across the full demo path.

### TIP-013 — Critical E2E demo and release quality gates

**Goal:** Verify commercial MVP readiness across core flows.

**Requirements:** REQ-QA-001, REQ-QA-002, REQ-QA-003, REQ-QA-004, REQ-UI-002

**Deliverables:**
- Playwright journeys for internal recruitment flow and candidate portal flow.
- Language toggle QA for EN/VI critical pages.
- Build/lint/typecheck/test gate documentation.
- Fix critical/high issues found by review agents.

**Acceptance:** Critical demo path passes E2E; no raw i18n keys; build/lint/typecheck pass.

## PARALLELIZATION OPPORTUNITIES

- After TIP-002, TIP-003 and TIP-004 can run in parallel if they coordinate shared auth helpers.
- TIP-005 and TIP-006 can run in parallel after TIP-003 because jobs/JD and candidate/screening repositories are separate domains.
- TIP-008, TIP-009, and TIP-010 can run in parallel after TIP-007, with shared agreement on evidence and storage reference types.
- TIP-013 should not start until TIP-011 and TIP-012 are complete, but test scaffolding can be prepared earlier if it does not assert unfinished flows.

## TEAM ALLOCATION

If multiple builders are available:

| Builder | Suggested Ownership |
|---------|---------------------|
| Backend/Auth Builder | TIP-001, TIP-002, TIP-003, TIP-004 |
| Workflow Persistence Builder | TIP-005, TIP-006, TIP-007 |
| Integration Builder | TIP-008, TIP-009, TIP-010 |
| Portal/QA Builder | TIP-011, TIP-012, TIP-013 |

For solo execution, follow TIP order strictly and avoid starting a downstream TIP before dependencies are merged.

## QUALITY GATE: SELF-REVIEW

- Completeness: 13 TIPs cover all P0 domains from RRI and Vision MVP scope.
- Dependency integrity: Auth/schema foundation precedes persistence, providers, portal, audit integration, and E2E verification.
- Parallelization: Independent workstreams are identified only after shared schema/auth dependencies.
- Standards: i18n, UI contract, CSS tokens, CTA, date formatting, mock-state migration, and test organization are reflected in TIP acceptance criteria.
- Gaps: Domain-wide delegation vs per-user OAuth, SMTP provider choice, and multi-tenant org isolation remain outside the current TIP graph unless promoted.
