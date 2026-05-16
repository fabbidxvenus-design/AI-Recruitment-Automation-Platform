# recruitAI-web Coding Packs — Vibecode Kit v5.0

> AI Quality Command Center — Coding Packs for recruitAI-web
> Generated from Vibecode Kit v5.0 framework

## How to Use

### Power Triangle

```text
CON NGUOI (Chu nha)          ← You: Approve, decide, relay
      |
  ----+----
  |        |
CLAUDE CHAT               CLAUDE CODE
(Chu thau)                (Tho thi cong)
Design, interview         Implement TIPs
Orchestrate              Self-test, report
```

### Workflow

1. Read `BUILDER-HANDOFF.md` — implementation rules, architecture, data models, API contracts, and quality gates.
2. Read `00-PROJECT-CONTEXT.md` — scan report and approved vision.
3. Read `01-REQUIREMENTS-MATRIX.md` — P0/P1 requirements and decisions.
4. Read `02-TASK-GRAPH.md` — dependency graph and TIP execution order.
5. Generate or pick the next TIP from `tips/` in dependency order.
6. Paste the handoff + TIP into Claude Code — builder implements it.
7. Builder returns Completion Report — relay to Architect.
8. Repeat until all TIPs are done and verified.

## File Structure

```text
coding-packs/
├── README.md
├── 00-PROJECT-CONTEXT.md
├── 01-REQUIREMENTS-MATRIX.md
├── 02-TASK-GRAPH.md
├── BUILDER-HANDOFF.md
├── plans/
├── product/
│   ├── mission.md
│   ├── roadmap.md
│   └── tech-stack.md
├── reports/
├── research/
│   ├── ai-ocr-provider-research.md
│   └── supabase-auth-google-integration.md
├── standards/
└── tips/
```

## Tech Stack

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
| Backend Target | Supabase Auth + Postgres + RLS | MVP |
| AI/OCR Target | Google Document AI + Anthropic Claude | MVP |
| Google Target | Drive, Sheets, Calendar, Gmail | MVP |

## TIP Execution Order

| Week | TIP | Name | Depends On |
|------|-----|------|------------|
| 1 | TIP-001 | Supabase project foundation and environment contract | — |
| 1 | TIP-002 | Database schema v1 with RLS and audit base | TIP-001 |
| 1 | TIP-003 | Internal auth and RBAC shell | TIP-001, TIP-002 |
| 1 | TIP-004 | Candidate magic-link access foundation | TIP-001, TIP-002 |
| 2 | TIP-005 | Jobs and JD versions repository migration | TIP-002, TIP-003 |
| 2 | TIP-006 | Candidate import and screening persistence | TIP-002, TIP-003 |
| 2 | TIP-007 | Interviews, assessments, tests, final decisions persistence | TIP-005, TIP-006 |
| 3 | TIP-008 | AI/OCR abstraction and evidence metadata | TIP-002, TIP-007 |
| 3 | TIP-009 | Google Workspace integration services | TIP-002, TIP-003 |
| 3 | TIP-010 | File intake and storage references | TIP-002, TIP-005, TIP-006 |
| 4 | TIP-011 | Candidate portal full workflow | TIP-004, TIP-007, TIP-010 |
| 4 | TIP-012 | End-to-end audit/evidence timeline integration | TIP-007, TIP-008, TIP-009, TIP-010, TIP-011 |
| 4 | TIP-013 | Critical E2E demo and release quality gates | TIP-011, TIP-012 |

## Source Documents

- Builder Handoff: `BUILDER-HANDOFF.md`
- Task Graph: `02-TASK-GRAPH.md`
- Scan + Vision: `00-PROJECT-CONTEXT.md`
- Requirements Matrix: `01-REQUIREMENTS-MATRIX.md`
- Product Mission: `product/mission.md`
- Product Roadmap: `product/roadmap.md`
- Product Tech Stack: `product/tech-stack.md`
- AI/OCR Research: `research/ai-ocr-provider-research.md`
- Supabase/Auth/Google Research: `research/supabase-auth-google-integration.md`
- Standards Index: `standards/README.md`

## Current Blueprint Scope

This blueprint plans the commercial MVP backend track:

- Supabase Auth and RBAC for HR Manager + Hiring Manager.
- Candidate magic-link portal access with candidate-scoped RLS.
- Supabase persistence for jobs, JD versions, candidates, screening, interviews, assessment plans, test results, final decisions, integration accounts, AI evidence, and audit events.
- Google Drive/Sheets/Calendar/Gmail service adapters.
- Google Document AI + Claude provider abstraction.
- Durable audit/evidence timelines feeding the existing productized UI contract.
- Critical EN/VI and Playwright quality gates.

## Deferred / Explicitly Out of Scope

- Admin/Recruiter role expansion unless promoted.
- Multi-tenant organization hierarchy unless commercial launch requires multiple companies immediately.
- ATS/job board publishing.
- Payment/billing/subscriptions.
- Advanced analytics dashboards.
- Custom-trained Document AI processors.
- Full domain-wide Google delegation hardening beyond MVP verification.

---

*Generated: 2026-05-16 | Framework: Vibecode Kit v5.0 | Project: recruitAI-web*
