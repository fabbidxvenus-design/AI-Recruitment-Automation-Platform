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
| TIP-014 | Keyboard accessibility for schedule slot items | — | P1 | 2 | 1 |
| TIP-015 | Aria-label for dashboard review action links | — | P1 | 1 | 1 |
| TIP-016 | Accessible icon spans in slot detail | — | P2 | 1 | 1 |
| TIP-017 | Fix primary light background contrast | — | P1 | 1 | 1 |
| TIP-018 | Add aria-label to dashboard emoji icons | — | P1 | 1 | 1 |
| TIP-019 | Add aria-label to job intake page buttons | — | P1 | 1 | 1 |
| TIP-020 | Fix candidates import file input labels | — | P1 | 1 | 1 |
| TIP-021 | Add aria-label to final-review buttons and modal elements | — | P1 | 2 | 1 |
| TIP-022 | Fix AI design tool form label associations | — | P1 | 1 | 1 |
| TIP-023 | Add aria-label to jobs approval review button | — | P1 | 1 | 1 |
| TIP-024 | Add aria-label to admin page icons and form inputs | — | P1 | 2 | 1 |
| TIP-025 | Card component semantic refactor | — | P2 | 2 | 1 |
| TIP-026 | StatusBadge accessibility fix (RECURRING) | — | P2 | 1 | 1 |
| TIP-027 | Tool cards semantic refactor | — | P2 | 1 | 1 |
| TIP-028 | Session 20 quality fix batch | — | P1 | 4 | 1 |
| TIP-029 | Fill empty catch blocks with error logging | — | P1 | 3 | 1 |
| TIP-030 | Add localStorage failure logging | — | P1 | 1 | 1 |
| TIP-031 | Modal keyboard dismiss accessibility | — | P1 | 2 | 1 |
| TIP-032 | Candidate session DB error logging | — | P1 | 1 | 1 |
| TIP-033 | Focus outline restoration | — | P1 | 1 | 1 |
| TIP-034 | Portal interview i18n feedback types | — | P2 | 1 | 1 |
| TIP-035 | Form aria-invalid logic | — | P1 | 1 | 1 |
| TIP-036 | Final review candidate selector button semantics | — | P1 | 1 | 1 |
| TIP-037 | StatusBadge static role fix | — | P1 | 1 | 1 |
| TIP-038 | Interview translation LanguageCode cast validation | — | P2 | 1 | 1 |
| TIP-039 | Button default type | — | P1 | 1 | 1 |
| TIP-040 | DataTable translation key fallbacks | — | P2 | 1 | 1 |
| TIP-041 | DataTable stable default selection set | — | P1 | 1 | 1 |
| TIP-042 | Auth and job mapper error logging | — | P1 | 1 | 1 |
| TIP-043 | Inline modal semantics + candidate invite logging | — | P1 | 2 | 1 |
| TIP-044 | Auth callback session exchange logging | — | P1 | 1 | 1 |
| TIP-045 | App error boundaries | — | P1 | 1 | 1 |
| TIP-046 | Content generation error feedback | — | P1 | 1 | 1 |
| TIP-047 | AI design error feedback | — | P1 | 1 | 1 |
| TIP-048 | Auth callback error context preservation | TIP-044 | P1 | 1 | 1 |
| TIP-049 | Error detail textarea focus outline | — | P1 | 1 | 1 |
| TIP-050 | CV evidence load error feedback | — | P1 | 1 | 1 |
| TIP-051 | CV translation error feedback | — | P1 | 1 | 1 |
| TIP-052 | Test grading modal close button accessibility verification | — | P2 | 1 | 1 |
| TIP-053 | Content generation empty variants guard | — | P1 | 1 | 1 |
| TIP-054 | JD approval missing version guard | — | P1 | 1 | 1 |
| TIP-055 | Productization quality batch | — | P1 | 6 | 1 |
| TIP-056 | Productization quality batch 2 | — | P1 | 6 | 1 |
| TIP-057 | Productization quality batch 3 | — | P1 | 6 | 1 |
| TIP-058 | Productization quality batch 4 | — | P1 | 6 | 1 |
| TIP-059 | Productization quality batch 5 | — | P1 | 6 | 1 |
| TIP-060 | Productization quality batch 6 (HIGH a11y + type safety) | — | P1 | 4 | 1 |
| TIP-061 | Productization quality batch 7 (keys + modal + secondary aria) | — | P1 | 4 | 1 |
| TIP-062 | Productization quality batch 8 (i18n aria + env casts) | — | P1 | 3 | 1 |
| TIP-063 | Productization quality batch 9 (type guards + dashboard keys) | — | P1 | 2 | 1 |
| TIP-064 | Productization quality batch 10 (user-visible error feedback) | — | P1 | 3 | 1 |
| TIP-065 | Productization quality batch 11 (landmarks, keyboard semantics, type guards) | — | P1 | 3 | 1 |
| TIP-066 | Productization quality batch 12 (remaining stable keys) | — | P1 | 2 | 1 |
| TIP-067 | Productization quality batch 13 (cv-evidence + demo-token keys) | — | P1 | 2 | 1 |
| TIP-068 | Productization quality batch 14 (a11y + type safety + E2E) | — | P1 | 3 | 1 |
| TIP-069 | Security + accessibility productization batch 15 (CRITICAL eval/XSS + HIGH a11y) | — | P0 | 4 | 1 |
| TIP-070 | Productization stability and UX batch | — | P0 | 4 | 1 |
| TIP-071 | Productization batch 16 stability and accessibility | — | P0 | 4 | 1 |
| TIP-072 | Productization batch 17 error UX and smoke coverage | — | P0 | 4 | 1 |
| TIP-073 | Productization batch 18 responsive feedback and accessibility | — | P0 | 4 | 1 |
| TIP-073 | Productization batch 18 responsive feedback and accessibility | — | P0 | 4 | 1 |

## GENERATED TIP FILES

| TIP | File |
|-----|------|
| TIP-001 | `tips/TIP-001-supabase-foundation.md` |
| TIP-002 | `tips/TIP-002-schema-rls-audit.md` |
| TIP-003 | `tips/TIP-003-internal-auth-rbac.md` |
| TIP-004 | `tips/TIP-004-candidate-magic-link.md` |
| TIP-005 | `tips/TIP-005-jobs-jd-repositories.md` |
| TIP-006 | `tips/TIP-006-candidate-screening-persistence.md` |
| TIP-007 | `tips/TIP-007-downstream-workflow-persistence.md` |
| TIP-008 | `tips/TIP-008-ai-ocr-abstraction.md` |
| TIP-009 | `tips/TIP-009-google-workspace-services.md` |
| TIP-010 | `tips/TIP-010-file-intake-storage.md` |
| TIP-011 | `tips/TIP-011-candidate-portal-workflow.md` |
| TIP-012 | `tips/TIP-012-audit-evidence-timelines.md` |
| TIP-013 | `tips/TIP-013-e2e-quality-gates.md` |
| TIP-014 | `tips/TIP-014-keyboard-accessible-slot-items.md` |
| TIP-015 | `tips/TIP-015-aria-label-review-links.md` |
| TIP-016 | `tips/TIP-016-accessible-slot-detail-icons.md` |
| TIP-017 | `tips/TIP-017-primary-light-contrast.md` |
| TIP-018 | `tips/TIP-018-job-intake-button-labels.md` |
| TIP-019 | `tips/TIP-019-candidates-import-labels.md` |
| TIP-020 | `tips/TIP-020-final-review-a11y.md` |
| TIP-021 | `tips/TIP-021-ai-design-form-labels.md` |
| TIP-022 | `tips/TIP-022-jobs-approval-button-label.md` |
| TIP-023 | `tips/TIP-023-admin-page-a11y.md` |
| TIP-024 | `tips/TIP-024-card-semantic-refactor.md` |
| TIP-025 | `tips/TIP-025-statusbadge-a11y-fix.md` |
| TIP-026 | `tips/TIP-026-tool-cards-semantic.md` |
| TIP-028 | `tips/TIP-028-session20-quality-fix-batch.md` |
| TIP-029 | `tips/TIP-029-empty-catch-blocks.md` |
| TIP-030 | `tips/TIP-030-localstorage-failure-logging.md` |
| TIP-031 | `tips/TIP-031-modal-keyboard-accessibility.md` |
| TIP-032 | `tips/TIP-032-candidate-session-error-logging.md` |
| TIP-033 | `tips/TIP-033-focus-outline-restoration.md` |
| TIP-034 | `tips/TIP-034-portal-interview-i18n-feedback-types.md` |
| TIP-035 | `tips/TIP-035-form-aria-invalid-logic.md` |
| TIP-036 | `tips/TIP-036-final-review-candidate-selector-button.md` |
| TIP-037 | `tips/TIP-037-statusbadge-static-role-fix.md` |
| TIP-038 | `tips/TIP-038-interview-translation-languagecode-cast.md` |
| TIP-039 | `tips/TIP-039-button-default-type.md` |
| TIP-040 | `tips/TIP-040-datatable-translation-fallbacks.md` |
| TIP-041 | `tips/TIP-041-datatable-stable-default-selection.md` |
| TIP-042 | `tips/TIP-042-auth-job-error-logging.md` |
| TIP-043 | `tips/TIP-043-inline-modal-and-candidate-invite-logging.md` |
| TIP-044 | `tips/TIP-044-auth-callback-session-exchange-logging.md` |
| TIP-045 | `tips/TIP-045-app-error-boundaries.md` |
| TIP-046 | `tips/TIP-046-content-generation-error-feedback.md` |
| TIP-047 | `tips/TIP-047-ai-design-error-feedback.md` |
| TIP-048 | `tips/TIP-048-auth-callback-error-context.md` |
| TIP-049 | `tips/TIP-049-error-detail-textarea-focus-outline.md` |
| TIP-050 | `tips/TIP-050-cv-evidence-load-error-feedback.md` |
| TIP-051 | `tips/TIP-051-cv-translation-error-feedback.md` |
| TIP-052 | `tips/TIP-052-test-grading-modal-close-button.md` |
| TIP-053 | `tips/TIP-053-content-generation-empty-variants.md` |
| TIP-054 | `tips/TIP-054-jd-approval-missing-version-guard.md` |
| TIP-055 | `tips/TIP-055-productization-quality-batch.md` |
| TIP-056 | `tips/TIP-056-productization-quality-batch-2.md` |
| TIP-057 | `tips/TIP-057-productization-quality-batch-3.md` |
| TIP-058 | `tips/TIP-058-productization-quality-batch-4.md` |
| TIP-059 | `tips/TIP-059-productization-quality-batch-5.md` |
| TIP-060 | `tips/TIP-060-productization-quality-batch-6.md` |
| TIP-061 | `tips/TIP-061-productization-quality-batch-7.md` |
| TIP-062 | `tips/TIP-062-productization-quality-batch-8.md` |
| TIP-063 | `tips/TIP-063-productization-quality-batch-9.md` |
| TIP-064 | `tips/TIP-064-productization-quality-batch-10.md` |
| TIP-065 | `tips/TIP-065-productization-quality-batch-11.md` |
| TIP-066 | `tips/TIP-066-productization-quality-batch-12.md` |
| TIP-067 | `tips/TIP-067-productization-quality-batch-13.md` |
| TIP-068 | `tips/TIP-068-productization-quality-batch-14.md` |
| TIP-069 | `tips/TIP-069-security-a11y-productization-batch-15.md` |
| TIP-070 | `tips/TIP-070-productization-stability-ux-batch.md` |
| TIP-071 | `tips/TIP-071-productization-batch-16-stability-a11y.md` |
| TIP-072 | `tips/TIP-072-productization-batch-17-error-ux-smoke.md` |
| TIP-073 | `tips/TIP-073-productization-batch-18-responsive-feedback-a11y.md` |

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
