# Vibecode Kit v5.0 — recruitAI-web Builder Handoff

> Paste this into Claude Code at the START of each build session.
> Then paste the specific TIP(s) for that session.

---

## VAI TRO

You are the Builder for recruitAI-web, a commercial AI HR suite moving from productized mock UI toward a backend-backed MVP. Implement only the assigned TIP scope, preserve the current Next.js App Router structure, and keep the existing productized recruitment UX contract intact.

Work like a careful production engineer:
- Prefer small, focused files and clear domain boundaries.
- Preserve TypeScript strict mode, lint, build, unit tests, and critical E2E journeys.
- Use existing UI components and patterns before adding new abstractions.
- Keep EN/VI localization in sync for every visible string.
- Do not commit, push, delete branches, or perform destructive actions unless explicitly requested.

## QUY TAC TUYET DOI

1. **Preserve the recruitment flow**: Dashboard → Job/JD Intake → JD Approval/Versioning → Candidate Import/Screening → Interview Scheduling → Candidate Portal → Assessment → Test Grading → Final Review.
2. **Preserve the UI contract**: every workflow surface must keep State / Timeline / Evidence / Approval / Next Action where applicable.
3. **Use Supabase as the MVP source of truth** for auth, Postgres persistence, RLS, and candidate-scoped access.
4. **Use provider abstractions** for AI/OCR and Google Workspace integrations; never call provider SDKs directly from page components.
5. **Never hardcode secrets**; all Supabase, Google, Anthropic, SMTP, and processor identifiers must come from environment variables or server-side config.
6. **Keep i18n bilingual**: every visible key must exist in both EN and VI under `src/i18n/resources.ts` unless a later TIP explicitly introduces namespace splitting.
7. **No unsupported UI patterns**: use CSS Modules + design tokens, `formatDateTime`, Card composition, and `next/link` wrapping `Button` for navigation CTAs.

## PROJECT CONTEXT

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js App Router | 15.3.0 |
| UI Runtime | React | 19.0.0 |
| Language | TypeScript | 5.8.0 strict |
| Styling | CSS Modules + CSS custom properties | — |
| i18n | i18next + react-i18next | 26.1.0 / 17.0.7 |
| Unit Testing | Vitest | 4.1.6 |
| Component Testing | Testing Library + jsdom | package-managed |
| E2E Testing | Playwright | 1.60.0 |
| Linting | ESLint + Next config | 9.39.4 |
| Package Manager | pnpm | lockfile present |

### Workspace Structure

Current app routes live under `src/app/` and should be preserved unless a TIP explicitly says otherwise.

```text
src/
  app/
    dashboard/page.tsx
    jobs/intake/page.tsx
    jobs/approval/page.tsx
    jobs/versions/page.tsx
    candidates/import/page.tsx
    screening/review/page.tsx
    interviews/schedule-approval/page.tsx
    portal/interview/access/page.tsx
    portal/interview/demo-token/page.tsx
    assessments/setup/page.tsx
    tests/grading/page.tsx
    final-review/page.tsx
    admin/page.tsx
    tools/**/page.tsx
    errors/ERR-2024-0892/page.tsx
  components/
    shell/AppShell.tsx
    PageTemplate/PageTemplate.tsx
    ui/{Button,Card,DataTable,EmptyState,LoadingState,MetricCard,Modal,Notice,ProgressBar,StatusBadge}/
  i18n/
    I18nProvider.tsx
    resources.ts
  lib/
    formatDate.ts
    *MockData.ts
    *WorkflowState.ts
  services/
    __tests__/
```

Target backend-ready structure:

```text
src/
  lib/
    supabase/
      browser.ts        # Browser client for client components
      server.ts         # Server client for route handlers/server actions
      middleware.ts     # Session refresh helpers if middleware is introduced
    env.ts              # Server/client env parsing and validation
  services/
    auth/
      roles.ts          # HR/HM/candidate role helpers
      session.ts        # Auth/session helper functions
      access.ts         # Route/workspace access checks
    jobs/
      repository.ts     # jobs + jd_versions persistence
      mapper.ts         # DB rows <-> UI domain types
    candidates/
      repository.ts     # candidates + candidate portal state
      mapper.ts
    assessments/
      repository.ts     # assessment_plans + test_results
    interviews/
      repository.ts     # interviews + scheduling state
    decisions/
      repository.ts     # final_decisions
    audit/
      repository.ts     # audit_events writer and readers
    ai/
      types.ts          # EvidenceMetadata, provider interfaces, result envelopes
      documentParser.ts # Use-case wrapper for JD/CV extraction
      evaluator.ts      # Screening/grading/content use cases
      translator.ts     # Translation use cases
      providers/
        googleDocumentAI.ts
        anthropicClaude.ts
    google/
      types.ts
      auth.ts           # OAuth/service-account token acquisition
      drive.ts
      sheets.ts
      calendar.ts
      gmail.ts
  app/
    (auth)/login/page.tsx
    auth/callback/route.ts
    api/google/oauth/callback/route.ts
    api/google/webhooks/route.ts
```

### API Patterns

Preferred pattern: server-side service layer + Supabase client. Add custom route handlers only where browser/service callbacks, webhooks, or file upload boundaries require them.

All custom route handlers must return:

```ts
type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
  metadata?: Record<string, unknown>;
};
```

Error strategy:
- Validate all external input at route/server boundaries.
- Return user-safe error messages through `error`.
- Keep provider-specific diagnostic detail in server logs/audit events, not in UI copy.
- Do not silently swallow integration failures; map them to visible readiness/error states.

### Product Mission

recruitAI-web solves repetitive, scattered HR recruitment work by turning CV screening, JD drafting, translation, interview scheduling, assessment grading, and final decisioning into structured AI-assisted workspaces with ownership, evidence trails, and approval gates.

Primary users: HR Manager, Recruiter, and Hiring Manager. MVP optimization priority is HR Manager, with Hiring Manager RBAC in scope and Admin/Recruiter role expansion deferred unless explicitly promoted.

Differentiation: AI tools are full business workspaces, not generic sidebar modules. Every workflow should feel like part of a coherent recruitment operating system with state, timeline, evidence, approval owner, and next action.

### Roadmap Priorities

MVP backend track:
1. Authentication and RBAC.
2. Supabase persistence replacing mock/localStorage runtime sources.
3. Candidate portal with separate candidate-scoped access.
4. Google Drive/Sheets/Calendar/Gmail integrations.
5. AI/OCR provider abstraction using Google Document AI + Claude.
6. Evidence metadata and audit logs across AI outputs, approvals, and integration actions.
7. Critical E2E demo path and bilingual UI parity.

Post-MVP/deferred unless promoted:
- Admin/Recruiter role expansion.
- Multi-tenant organization hierarchy.
- ATS/job board publishing.
- Payment/billing.
- Advanced analytics.
- Custom-trained Document AI processors.
- Domain-wide delegation hardening beyond MVP scope.

### Applicable Standards

- [i18n/bilingual-keys](standards/i18n/bilingual-keys.md) — every visible key exists in EN and VI.
- [i18n/namespace-organization](standards/i18n/namespace-organization.md) — resource structure remains consistent and dot-keyed.
- [mock-state/localStorage-workflow](standards/mock-state/localStorage-workflow.md) — localStorage state stays in typed helpers while it remains.
- [mock-state/mock-data-location](standards/mock-state/mock-data-location.md) — mock data stays in `src/lib/` by domain until replaced.
- [styling/css-tokens-first](standards/styling/css-tokens-first.md) — CSS uses design tokens; no hardcoded colors.
- [testing/test-file-organization](standards/testing/test-file-organization.md) — tests live under nearby `__tests__/` folders.
- [ui/productization-contract](standards/ui/productization-contract.md) — State/Timeline/Evidence/Approval/NextAction remains mandatory.
- [ui/component-cta](standards/ui/component-cta.md) — navigation CTAs use `next/link` + `Button`, never `Button as="a"`.
- [ui/component-composition](standards/ui/component-composition.md) — use Card/CardHeader/CardContent composition.
- [ui/date-formatting](standards/ui/date-formatting.md) — timestamps use `formatDateTime`.

## MODULE ARCHITECTURE

### Auth & RBAC Module

Responsibilities:
- Supabase client setup.
- Google OAuth login for HR/HM.
- Candidate magic link/email OTP access.
- Role helpers for `hr_manager`, `hiring_manager`, and candidate-scoped users.
- Route protection for internal workspace and portal surfaces.

Core files:
```text
src/lib/supabase/browser.ts
src/lib/supabase/server.ts
src/services/auth/roles.ts
src/services/auth/session.ts
src/services/auth/access.ts
src/app/(auth)/login/page.tsx
src/app/auth/callback/route.ts
```

Entry points:
- Internal users start at login and enter `/dashboard` after OAuth callback.
- Candidate users enter candidate portal via magic link and only see records tied to their candidate identity.

### Persistence Module

Responsibilities:
- Replace mock/localStorage runtime state with Supabase repositories.
- Keep page components focused on rendering workflow state, not query details.
- Map Supabase rows to existing UI-friendly domain objects to minimize UI churn.

Core repositories:
```text
src/services/jobs/repository.ts
src/services/candidates/repository.ts
src/services/interviews/repository.ts
src/services/assessments/repository.ts
src/services/decisions/repository.ts
src/services/audit/repository.ts
```

Migration direction:
- Start by adding schema and read repositories.
- Then switch one workflow at a time from mock data to repository data.
- Keep localStorage only for client-only drafts that are not source of truth.

### Candidate Portal Module

Responsibilities:
- Candidate dashboard, interview, test/assignment, and status visibility.
- Separate shell from internal AppShell.
- Candidate-scoped RLS and server-side access checks.
- Clear deadline, submission, and confirmation states.

Target routes:
```text
src/app/portal/dashboard/page.tsx
src/app/portal/interview/page.tsx
src/app/portal/test/page.tsx
src/app/portal/status/page.tsx
```

Existing routes may be kept as compatibility/demo routes during transition, but UI copy must not expose demo/prototype language.

### Google Workspace Module

Responsibilities:
- Drive: CV/JD source folder intake.
- Sheets: candidate/job operational sync or export.
- Calendar: interview event creation and availability workflows.
- Gmail: candidate invite, reminder, and status emails.
- Persist integration readiness, account config, and audit events.

Core files:
```text
src/services/google/types.ts
src/services/google/auth.ts
src/services/google/drive.ts
src/services/google/sheets.ts
src/services/google/calendar.ts
src/services/google/gmail.ts
src/app/api/google/oauth/callback/route.ts
src/app/api/google/webhooks/route.ts
```

Scope guidance:
- Drive intake: prefer folder-scoped/configured access; avoid full Drive unless explicitly approved.
- Calendar: `calendar.events` for event creation; add readonly only if availability checking requires it.
- Gmail: `gmail.send` only.
- Sheets: `spreadsheets` for sync/export.

### AI/OCR Module

Responsibilities:
- Google Document AI for OCR/JD/CV extraction.
- Claude for screening, grading, content generation, and translation unless later evaluation chooses otherwise.
- Standard evidence metadata across all AI outputs.
- Provider-specific code isolated in `providers/`.

Core files:
```text
src/services/ai/types.ts
src/services/ai/documentParser.ts
src/services/ai/evaluator.ts
src/services/ai/translator.ts
src/services/ai/providers/googleDocumentAI.ts
src/services/ai/providers/anthropicClaude.ts
```

Provider evidence contract:
```ts
type EvidenceMetadata = {
  provider: 'google-document-ai' | 'anthropic' | 'google-translate';
  modelVersion: string;
  timestamp: string;
  confidence: number;
  requestId: string;
};
```

### Audit & Evidence Module

Responsibilities:
- First-class `audit_events` table.
- Persist every approval/rejection/request-change action.
- Persist AI evidence metadata and provider request IDs.
- Persist Google integration event IDs and sync/export references.
- Feed timeline/evidence UI blocks from durable records.

Core file:
```text
src/services/audit/repository.ts
```

## DATA MODELS

### Role and Auth Types

```ts
type InternalRole = 'hr_manager' | 'hiring_manager';
type ActorType = 'internal_user' | 'candidate' | 'system' | 'provider';
```

### `profiles`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK, references `auth.users.id` |
| email | text | unique enough for display/search |
| full_name | text nullable | from OAuth metadata |
| role | enum | `hr_manager` or `hiring_manager` |
| created_at | timestamptz | default now |
| updated_at | timestamptz | maintained by trigger/app |

### `jobs`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| title | text | required |
| department | text | required |
| location | text nullable | display/filter |
| employment_type | text nullable | display/filter |
| status | enum | `draft`, `intake_ready`, `jd_review`, `screening`, `interviewing`, `assessment`, `final_review`, `closed` |
| owner_id | uuid | references profiles |
| hiring_manager_id | uuid nullable | references profiles |
| created_at / updated_at | timestamptz | audit timestamps |

### `jd_versions`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| job_id | uuid | references jobs |
| version_number | int | increments per job |
| source_type | enum | `manual`, `drive`, `upload`, `generated` |
| source_reference | text nullable | Drive file ID/upload ID |
| content | text | JD body |
| parsed_profile | jsonb | structured extracted requirements |
| status | enum | `pending`, `approved`, `rejected`, `archived` |
| evidence_metadata | jsonb nullable | AI/OCR evidence |
| created_by | uuid | profile id |
| approved_by | uuid nullable | profile id |
| created_at / approved_at | timestamptz | timeline |

### `candidates`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| candidate_user_id | uuid nullable | references `auth.users.id` after magic link |
| job_id | uuid | references jobs |
| full_name | text | required |
| email | text | required |
| phone | text nullable | optional |
| status | enum | `imported`, `screened`, `shortlisted`, `interview_invited`, `interview_submitted`, `assessment_assigned`, `test_submitted`, `final_review`, `hired`, `rejected` |
| cv_source_reference | text nullable | upload/Drive reference |
| cv_parsed_profile | jsonb nullable | extracted CV fields |
| evidence_metadata | jsonb nullable | OCR evidence |
| created_at / updated_at | timestamptz | audit timestamps |

### `screening_results`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| candidate_id | uuid | references candidates |
| job_id | uuid | references jobs |
| jd_version_id | uuid | references jd_versions |
| score | numeric | 0-100 |
| recommendation | enum | `advance`, `review`, `reject` |
| strengths | jsonb | string array |
| risks | jsonb | string array |
| evidence_metadata | jsonb | Claude/provider metadata |
| reviewer_decision | enum nullable | `advanced`, `rejected`, `changes_requested` |
| reviewed_by | uuid nullable | profile id |
| created_at / reviewed_at | timestamptz | timeline |

### `interviews`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| candidate_id | uuid | references candidates |
| job_id | uuid | references jobs |
| scheduled_start | timestamptz nullable | slot time |
| scheduled_end | timestamptz nullable | slot time |
| calendar_event_id | text nullable | Google Calendar event |
| status | enum | `slot_pending`, `approved`, `invite_prepared`, `candidate_started`, `submitted`, `review_ready` |
| transcript | jsonb nullable | candidate answers/segments |
| evidence_metadata | jsonb nullable | AI interview/translation evidence |
| approved_by | uuid nullable | profile id |
| created_at / updated_at | timestamptz | audit timestamps |

### `assessment_plans`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| job_id | uuid | references jobs |
| plan_version | text | display evidence ID |
| rubric_version | text | display evidence ID |
| title | text | required |
| rubric | jsonb | scoring criteria |
| status | enum | `draft`, `approved`, `archived` |
| created_by | uuid | profile id |
| approved_by | uuid nullable | profile id |
| created_at / approved_at | timestamptz | timeline |

### `test_results`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| candidate_id | uuid | references candidates |
| assessment_plan_id | uuid | references assessment_plans |
| submission_reference | text nullable | upload/storage reference |
| ai_score | numeric nullable | 0-100 |
| human_score | numeric nullable | 0-100 override |
| rubric_breakdown | jsonb | criteria scores |
| status | enum | `submitted`, `graded`, `reviewed`, `approved` |
| evidence_metadata | jsonb nullable | Claude grading metadata |
| reviewed_by | uuid nullable | profile id |
| created_at / reviewed_at | timestamptz | timeline |

### `final_decisions`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| candidate_id | uuid | references candidates |
| job_id | uuid | references jobs |
| decision | enum | `pending`, `hire`, `reject`, `request_info` |
| rationale | text nullable | reviewer-facing reason |
| evidence_package | jsonb | references JD/CV/screening/interview/test evidence IDs |
| decided_by | uuid nullable | profile id |
| decided_at | timestamptz nullable | timeline |
| created_at | timestamptz | audit timestamp |

### `integration_accounts`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| provider | enum | `google` |
| account_email | text | connected account |
| scopes | text[] | granted scopes |
| status | enum | `pending`, `connected`, `needs_attention`, `revoked` |
| token_reference | text | reference to encrypted/managed token storage, not raw token |
| created_by | uuid | profile id |
| created_at / updated_at | timestamptz | audit timestamps |

### `ai_evidence`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| subject_type | text | `jd_version`, `candidate`, `screening_result`, `test_result`, etc. |
| subject_id | uuid | record id |
| provider | text | provider name |
| model_version | text | provider model/processor version |
| confidence | numeric | 0-1 |
| request_id | text | provider request id |
| metadata | jsonb | provider-specific non-secret data |
| created_at | timestamptz | audit timestamp |

### `audit_events`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| actor_type | enum | `internal_user`, `candidate`, `system`, `provider` |
| actor_id | uuid nullable | profile/candidate auth user when applicable |
| entity_type | text | table/domain name |
| entity_id | uuid | affected record |
| event_type | text | `created`, `approved`, `rejected`, `synced`, `generated`, etc. |
| summary | text | user-safe timeline label |
| metadata | jsonb | non-secret event details |
| created_at | timestamptz | default now |

## API CONTRACTS

Custom API routes should stay minimal. Most application reads/writes should use server services and Supabase RLS.

### Auth

```text
GET /auth/callback?code=string
Request: OAuth callback query from Supabase/Google
Response: redirect to /dashboard or /auth/login?error=...
Auth: public callback
```

```text
POST /api/auth/candidate-invite
Request: { candidateId: string }
Response: ApiResponse<{ sentAt: string; candidateId: string }>
Auth: internal HR/HM only
```

### Google Integration

```text
GET /api/google/oauth/callback?code=string&state=string
Request: Google OAuth callback query
Response: redirect to /admin?integration=google&status=connected or error state
Auth: internal HR/HM initiated flow
```

```text
POST /api/google/drive/intake-sync
Request: { folderId: string; jobId?: string }
Response: ApiResponse<{ importedFiles: number; auditEventId: string }>
Auth: internal HR/HM only
```

```text
POST /api/google/sheets/export
Request: { jobId: string; sheetId: string; range?: string }
Response: ApiResponse<{ exportedRows: number; auditEventId: string }>
Auth: internal HR/HM only
```

```text
POST /api/google/calendar/events
Request: { interviewId: string; attendeeEmails: string[]; start: string; end: string }
Response: ApiResponse<{ calendarEventId: string; auditEventId: string }>
Auth: internal HR/HM only
```

```text
POST /api/google/gmail/send-invite
Request: { candidateId: string; interviewId?: string; template: 'interview_invite' | 'assessment_invite' | 'status_update' }
Response: ApiResponse<{ sentAt: string; auditEventId: string }>
Auth: internal HR/HM only
```

### AI/OCR

```text
POST /api/ai/extract-cv
Request: multipart form data { file: File; jobId?: string; candidateId?: string }
Response: ApiResponse<{ candidateId?: string; parsedProfile: ParsedCV; evidence: EvidenceMetadata }>
Auth: internal HR/HM only
```

```text
POST /api/ai/parse-jd
Request: multipart form data { file?: File; text?: string; jobId: string }
Response: ApiResponse<{ jdVersionId: string; parsedProfile: ParsedJD; evidence: EvidenceMetadata }>
Auth: internal HR/HM only
```

```text
POST /api/ai/screen-candidate
Request: { candidateId: string; jdVersionId: string }
Response: ApiResponse<{ screeningResultId: string; score: number; recommendation: string; evidence: EvidenceMetadata }>
Auth: internal HR/HM only
```

```text
POST /api/ai/grade-submission
Request: { testResultId: string; assessmentPlanId: string }
Response: ApiResponse<{ testResultId: string; aiScore: number; evidence: EvidenceMetadata }>
Auth: internal HR/HM only
```

```text
POST /api/ai/translate
Request: { subjectType: 'cv' | 'interview_transcript' | 'content'; subjectId: string; targetLanguage: 'en' | 'vi' }
Response: ApiResponse<{ translatedText: string; evidence: EvidenceMetadata }>
Auth: internal HR/HM only
```

## COMPONENT TREE

### Internal Workspace Shell

```text
AppShell
  PageTemplate (where already used)
    WorkflowPage
      StateCard
      TimelineCard
      EvidenceCard
      ApprovalCard
      NextActionCard
      DomainSpecificContent
```

Shared props pattern:
```ts
type WorkflowSummaryProps = {
  stateLabel: string;
  stateDescription: string;
  timelineEvents: Array<{ timestamp: string; label: string; actor?: string }>;
  evidenceItems: Array<{ label: string; value: string }>;
  approvalLabel: string;
  approvalState: string;
  nextAction: { label: string; href?: string; disabled?: boolean; onClick?: () => void };
};
```

Do not create this shared component until repetition becomes concrete across backend integration TIPs; preserve current page-specific sections when that is simpler.

### Auth Pages

```text
LoginPage
  Card
    CardHeader
    CardContent
      GoogleSignInButton
      RoleReadinessNotice
```

### Admin Integration Page

```text
AdminPage
  IntegrationReadinessSection
    GoogleDriveCard
    GoogleSheetsCard
    GoogleCalendarCard
    GmailCard
  ProviderReadinessSection
    DocumentAICard
    ClaudeCard
  AuditRecentEventsSection
```

### Candidate Portal

```text
CandidatePortalLayout
  CandidateHeader
  CandidateProgressRail
  CandidateDashboardPage
    DeadlineCard
    NextStepCard
    SubmissionStatusCard
    EvidenceVisibilityCard
  InterviewPage
    InterviewStateCard
    QuestionWorkspace
    SubmissionConfirmation
  TestPage
    AssignmentCard
    UploadSubmissionCard
    ConfirmationCard
  StatusPage
    TimelineCard
    DecisionStatusCard
```

## INTEGRATION POINTS

### Supabase

Environment variables:
```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # server-only, never exposed to client
```

Rules:
- Browser client uses anon key and RLS.
- Server privileged operations use service role only in server-only modules.
- RLS must be enabled on every application table.
- Candidate rows must be isolated by `candidate_user_id`.

### Google Workspace

Environment variables:
```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
GOOGLE_SERVICE_ACCOUNT_EMAIL       # if service account path is approved
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY # server-only, escaped/managed safely
```

Rules:
- Store token references, not raw tokens, in application tables.
- Avoid restricted scopes.
- Persist all sync/send/create actions to `audit_events`.
- Keep admin UI as readiness-first: connected, pending, needs attention, revoked.

### AI/OCR Providers

Environment variables:
```text
GOOGLE_DOCUMENT_AI_PROJECT_ID
GOOGLE_DOCUMENT_AI_LOCATION
GOOGLE_DOCUMENT_AI_PROCESSOR_ID
ANTHROPIC_API_KEY
ANTHROPIC_SCREENING_MODEL
ANTHROPIC_GRADING_MODEL
```

Rules:
- Provider implementations are server-only.
- Normalize all outputs through typed use-case wrappers.
- Persist `EvidenceMetadata` and raw provider request IDs.
- Do not expose raw provider responses containing sensitive document content to client components.

### File Storage / Media

Preferred MVP path:
- Store uploaded CV/JD/test submission files in Supabase Storage or Drive references depending on source.
- Store only references and metadata in Postgres tables.
- Validate file type and size at upload boundaries.
- Avoid public buckets for CVs, transcripts, or submissions.

## NON-FUNCTIONAL REQUIREMENTS

### Performance Budgets

| Surface | Target |
|---------|--------|
| Internal app pages | JS < 300kb gzipped per route where practical |
| Candidate portal pages | FCP < 1.5s, LCP < 2.5s on normal broadband |
| API route response | < 500ms for non-provider operations |
| Provider-backed operations | show queued/loading state immediately; do not block the UI without feedback |

### Security

- No hardcoded secrets.
- Validate every API route input.
- RLS enabled for all application tables.
- Candidate access scoped to candidate records only.
- Server-only provider SDKs and service credentials.
- User-safe errors only in client responses.
- No raw CV/transcript content in logs.

### Loading / Empty / Error States

Every backend-backed workflow page must define:
- Loading state while session/data resolves.
- Empty state when no job/candidate/plan exists.
- Permission state when user lacks access.
- Integration attention state when provider config is missing or revoked.
- Retry/next-action state for provider failures.

Use existing `LoadingState`, `EmptyState`, `Notice`, and `StatusBadge` components where possible.

### Testing Requirements

Minimum checks per TIP:
- `npx tsc --noEmit`
- `npm run lint`
- targeted Vitest tests for changed services/components
- `npm run build` before preview push or release handoff

Backend/provider TIPs must include:
- unit tests for mappers and service logic
- integration tests for repository behavior where test Supabase setup exists
- route handler tests for validation/error envelopes
- Playwright coverage for critical demo flows before MVP release

## EXECUTION ORDER

### Week 1 — Foundation and Auth

1. **TIP-001: Supabase project foundation and environment contract**
   - Add Supabase clients, env validation, server/client boundaries.
   - No UI data migration yet.
2. **TIP-002: Database schema v1 with RLS and audit base**
   - Add profiles, jobs, jd_versions, candidates, interviews, assessment_plans, test_results, final_decisions, ai_evidence, integration_accounts, audit_events.
3. **TIP-003: Internal auth and RBAC shell**
   - Add login/callback, session helpers, role helpers, and protected internal routes.
4. **TIP-004: Candidate magic-link access foundation**
   - Add candidate auth flow and candidate-scoped access helpers.

### Week 2 — Persistence Migration

5. **TIP-005: Jobs and JD versions repository migration**
   - Switch job intake/approval/version surfaces to Supabase-backed repositories.
6. **TIP-006: Candidate import and screening persistence**
   - Persist candidates and screening results with audit events.
7. **TIP-007: Interviews, assessments, tests, final decisions persistence**
   - Replace localStorage/mock runtime source for downstream workflow state.

### Week 3 — Provider Abstractions

8. **TIP-008: AI/OCR abstraction and evidence metadata**
   - Add AI service interfaces, provider wrappers, mockable tests, and evidence persistence.
9. **TIP-009: Google Workspace integration services**
   - Add Drive/Sheets/Calendar/Gmail adapters and admin readiness state.
10. **TIP-010: File intake and storage references**
   - Add secure CV/JD/test upload/reference flow.

### Week 4 — Workflow Integration and QA

11. **TIP-011: Candidate portal full workflow**
   - Candidate dashboard/interview/test/status backed by candidate-scoped records.
12. **TIP-012: End-to-end audit/evidence timeline integration**
   - Feed State/Timeline/Evidence/Approval/NextAction blocks from durable audit/evidence records.
13. **TIP-013: Critical E2E demo and release quality gates**
   - Playwright journeys, bilingual QA, build/lint/typecheck/test hardening.

## HOW TO USE TIPs

For each TIP:
1. Read this handoff first.
2. Read `00-PROJECT-CONTEXT.md`, `01-REQUIREMENTS-MATRIX.md`, and `02-TASK-GRAPH.md`.
3. Read the specific TIP file from `coding-packs/tips/` when generated.
4. Implement only that TIP scope.
5. Preserve all standards and UI contracts.
6. Run required checks and return the completion report below.

## COMPLETION REPORT FORMAT

```markdown
## Completion Report — TIP-XXX

### Summary
- [What changed]

### Files Changed
- `path/to/file.ts` — [purpose]

### Requirements Covered
- REQ-...

### Tests / Verification
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] targeted unit/integration tests
- [ ] `npm run build` when required
- [ ] Playwright/browser verification when UI changed

### Risks / Follow-ups
- [Any remaining issue or explicit none]

### Deviations From TIP
- [Any deviation and why, or none]
```

## ESCALATION RULES

### Level 1 — Builder resolves locally
Use for straightforward type errors, missing keys, small test updates, or local refactors that stay inside TIP scope.

### Level 2 — Ask Architect/User before continuing
Use when a decision changes scope, data model, auth behavior, OAuth scopes, provider selection, or route structure.

### Level 3 — Stop and escalate immediately
Use for destructive operations, possible secret exposure, data loss risk, RLS bypass risk, credential/token handling uncertainty, or any action requiring production/shared-system access.

## QUALITY GATE: SELF-REVIEW

- Completeness: Blueprint covers module architecture, data models, API contracts, component tree, integration points, NFRs, and execution order.
- Cross-reference: Aligned with Scan, RRI, Vision, product docs, and AI/OCR + Supabase/Google research reports.
- Standards: All discovered standards are referenced and enforced in builder rules.
- Gaps: Google domain-wide delegation vs per-user OAuth, SMTP provider choice, and multi-tenant org isolation remain explicit future decisions.
- Action needed: Generate TIP files from this task graph before implementation begins.
