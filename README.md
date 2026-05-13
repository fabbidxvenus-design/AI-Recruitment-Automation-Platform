# RecruitAI Prototype

RecruitAI is a recruitment automation prototype built from the Gate 4 detail definition and Stitch screen implementation. It is intended for demo, UAT, and Gate 5 readiness review rather than production deployment.

## Current status

- Gate 4 requirements status: `CONDITIONAL_PASS`
- Prototype status: demo/UAT ready
- Backend/API integrations: mocked
- Google Workspace, AI scoring, MFA, and notifications: simulated UI only

## Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- CSS Modules with global CSS design tokens
- Static mock data in `src/lib/mockData.ts`

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

## Available scripts

```bash
npm run dev        # start local dev server
npm run build      # production build
npm run start      # start built app
npm run lint       # run Next.js lint command
npm run typecheck  # run TypeScript checks
```

## Prototype routes

| Gate 4 screen | Route | Purpose |
|---|---|---|
| SCREEN-001 Recruitment Pipeline Dashboard | `/dashboard` | Pipeline KPIs, approvals, error queue, integration health |
| SCREEN-002 Candidate Sourcing and Import | `/candidates/import` | Manual import, upload flow, Drive status, duplicate handling |
| SCREEN-003 Screening Review and Approval | `/screening/review` | AI screening score, evidence, risk flags, approval actions |
| SCREEN-004 Interview Scheduling Approval | `/interviews/schedule-approval` | Slot suggestions, availability, conflicts, schedule approval |
| SCREEN-005 Async AI Interview Workspace | `/portal/interview/demo-token` | Candidate-facing async interview flow |
| SCREEN-006 Test Grading Review and Override | `/tests/grading` | Test results, grading states, override workflow |
| SCREEN-007 Final Review and Decision | `/final-review` | Consolidated evidence and final pass/fail decision |
| SCREEN-008 Admin Configuration and Monitoring | `/admin` | Google config, monitoring, retention/escalation placeholders |
| Error Remediation Queue Detail | `/errors/ERR-2024-0892` | Retry backoff, owner assignment, escalation, manual review |

The root route `/` redirects to `/dashboard`.

## Source of truth

Primary requirements and traceability are in:

```text
requirements/04-detail-definition.md
requirements/04-detail-definition.json
requirements/traceability-matrix.md
requirements/traceability-matrix.json
```

The prototype maps to the confirmed Stitch screens from Gate 4:

| Screen | Stitch ID |
|---|---|
| SCREEN-001 | `155d23ba71e44cf9bab0708cc68df670` |
| SCREEN-002 | `8c563e836b1c44fba401f25fc05fbde0` |
| SCREEN-003 | `bab2ca7af2ea4c99952335bb0f2b54fc` |
| SCREEN-004 | `50f70db4534e455190a90a3da5a8b97b` |
| SCREEN-005 | `367bcd74bd49454e84f255bcbdaf42c9` |
| SCREEN-006 | `edcd330a8c1d475aa57a64d56fd41dd6` |
| SCREEN-007 | `b1f39636bae24920ab06efbda3264ba0` |
| SCREEN-008 | `e54adc783e0a4ebda02cf8146e3b241c` |
| Error Remediation Detail | `6b4660bf421b42338a089bc3be0fb4a2` |

## Demo journey

A suggested UAT walkthrough:

1. Start at `/dashboard`.
2. Open candidate import at `/candidates/import`.
3. Review screening at `/screening/review`.
4. Approve scheduling at `/interviews/schedule-approval`.
5. Walk through the candidate interview at `/portal/interview/demo-token`.
6. Review test grading at `/tests/grading`.
7. Make the final decision at `/final-review`.
8. Review admin monitoring at `/admin`.
9. Open remediation detail at `/errors/ERR-2024-0892`.

## Accessibility and UAT notes

The prototype includes:

- Skip link and main landmark
- Visible focus states
- Reduced-motion CSS handling
- Accessible progress bars
- Table captions and scoped headers
- `aria-describedby` / `aria-invalid` on key form fields
- Visual blocker notices for unresolved Gate 4 business questions

Manual UAT should still verify:

- Keyboard-only navigation
- Screen reader announcements
- Color contrast
- Reduced-motion behavior on an actual device/browser setting
- BQ blocker notice visibility against the Stitch screens

## Known limitations

- No real backend or database calls
- No real Google Drive/Gmail/Calendar integration
- No real AI/LLM calls
- MFA and approval flows are mocked
- Some mock dates and data are static for demo consistency
- `npm install` currently reports moderate dependency vulnerabilities; do not run `npm audit fix --force` without reviewing breaking-change impact
