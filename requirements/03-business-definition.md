# 03 — Business Definition

> AI Recruitment Automation Platform
> Version: 2.1.0 | Gate 3: Business Definition (Revised — Senior Review)
> Date: 2026-05-12
> Upstream: 02-requirement-definition.md (v0.1.0) → 01-requirement.md (v0.2.0)
> Review: Incorporated 22-point review feedback (system boundary, AI cost governance, candidate ownership, workflow engine, audit strategy, missing features, DevOps/ops, UX, architecture, commercial SaaS)
> Revision: Resolved 10 senior review points — multi-tenant model, billing, AI governance, workflow engine, notifications, analytics, compliance, operational flows, OQs, observability

---

## Legend

| Prefix | Category |
|--------|----------|
| BP | Business Policy |
| BR | Business Rule |
| UC | Use Case |
| KPI | Key Performance Indicator |
| RSK | Risk |
| AR | Architecture Rule |
| WL | Workflow Rule |

---

## 1. Business Objectives

| ID | Objective | Description | Mapped To | Priority |
|----|-----------|-------------|-----------|----------|
| BP-001 | Reduce time-to-hire | Cut average hiring cycle from 45 days to 25 days by automating sourcing, screening, and scheduling | FR-001, FR-002, FR-010, FR-013 | P0 |
| BP-002 | Improve candidate quality | AI-powered matching ensures top-ranked candidates meet ≥85% of job criteria | FR-002, FR-003, FR-007, FR-008 | P0 |
| BP-003 | Scale multi-client operations | Single agency platform serves multiple employer clients with strict data isolation | FR-042, FR-043, FR-044, FR-045, NFR-007 | P0 |
| BP-004 | Reduce manual recruiter workload | Automate ≥60% of repetitive tasks (sourcing, outreach, scheduling, reminders) | FR-001, FR-004, FR-015, FR-016, FR-033 | P0 |
| BP-005 | Enable cross-border hiring | JP/VN/EN translation and timezone-aware scheduling support international recruitment | FR-028, FR-029, FR-030, FR-031, FR-017 | P0 |
| BP-006 | Ensure compliance and auditability | Full audit trail, GDPR/CCPA compliance, configurable data retention | CR-005, CR-006, CR-007, NFR-011, NFR-012 | P0 |
| BP-007 | Minimize AI cost exposure | Stay within $500–$1,500/month AI budget with cost monitoring and circuit-breaker fallback | CR-010, NFR-003, NFR-005, NFR-013 | P0 |
| BP-008 | Provide transparent AI decisions | Every AI-generated score and recommendation includes human-readable explanation | FR-003, FR-008, FR-022 | P0 |
| BP-009 | Enable SaaS billing & subscription lifecycle | Support tiered plans, usage metering, overage handling, and subscription upgrades/downgrades | FR-046, NFR-009, NFR-010 | P0 |
| BP-010 | Provide operational observability | Queue monitoring, AI latency/cost tracing, distributed tracing, failure analytics, and audit dashboard | NFR-013, NFR-014, BR-115 | P0 |
| BP-011 | Strengthen AI governance & evaluation | Prompt versioning, model tracking, hallucination handling, confidence calibration, human review escalation, AI evaluation dataset | CR-010, BR-059, BR-064 | P0 |

---

## 2. Product Boundary & System Scope

> **Review Point #1 addressed:** Clear definition of what the platform OWNS, INTEGRATES, MANUAL, AI-ASSISTS, and what is OUT-OF-SCOPE.

### 2.1 Capability Matrix

| Capability | MVP Scope | Out of Scope (Now) |
|-----------|-----------|-------------------|
| LinkedIn sourcing | Manual import + recruiter paste URL | Automated scraping, browser extension, webhook, official API integration |
| External ATS sync | CSV import only | Real-time bidirectional sync (Greenhouse/Lever/Workday) — deferred to P2 |
| AI candidate outreach | Draft generation only; recruiter MUST approve before send | Fully autonomous sending |
| AI interview | Not supported | Phase 2 — real-time AI-powered video/text interviews |
| Candidate portal | Basic status tracking (view application status, upload new CV, manage availability) | Full career portal with job recommendations, social features |
| Content generation | Not supported | Phase 2 — AI-generated JD, offer/rejection letters, social posts |
| Chatbot | Not supported | Phase 2 — candidate-facing FAQ, internal recruiter assistant |
| Coding assessment | Not supported | Phase 2 — sandbox execution, AI essay scoring, behavioral analysis |
| White-label SaaS | Not supported | Phase 2 — custom branding per agency, white-label portal for clients |
| Event sourcing | Not supported | Phase 2 — full audit trail with event sourcing architecture |
| Real-time AI interviewer | Not supported | Phase 2 |
| Agentic AI workflows | Not supported | Phase 2 — AI-to-AI chains |
| Image generation | Not supported | Phase 2 — branded recruitment graphics |

### 2.2 What Platform OWNS vs INTEGRATES vs MANUAL

| Domain | Platform Owns | Integration Required | Manual/Human |
|--------|--------------|---------------------|--------------|
| Candidate data lifecycle | CRUD, dedup, matching | CV parser (OpenAI/Gemini), storage (S3) | Recruiter review of parse results |
| Job management | CRUD, stages, config | — | Client provides JD content |
| Pipeline workflow | Kanban board, auto-transitions, stage config | — | Recruiter drag-and-drop overrides |
| Scheduling | Slot computation, calendar sync | Google Calendar API, Outlook API | Candidate self-input of availability |
| Assessment | MCQ config, auto-grading, scoring | — | Recruiter override, subjective grading deferred |
| Translation | Orchestration, quality routing | OpenAI GPT-4o / Gemini for translation | Human review of low-confidence outputs |
| Email/Notifications | Template management, trigger logic | SendGrid / AWS SES | Template content authored by agency |
| AI matching | Embedding, vector search, scoring | pgvector / Pinecone, OpenAI embeddings | Recruiter review and override of scores |
| Analytics & Reporting | Dashboard, KPI metrics | — | CSV/PDF export by user |
| File storage | Metadata, access control | S3-compatible (MinIO / AWS S3) | Manual upload/download |
| Authentication | Session management, RBAC | NextAuth.js, Google OAuth, Microsoft OAuth | MFA TOTP (user device) |
| Billing & Subscription | Plan management, usage metering, invoicing | Stripe payment gateway | Agency admin decision on plan changes |

### 2.3 Candidate Ownership & Cross-Client Visibility (NEW — Review Point #1)

> Resolves: multi-tenant data model conflicts between "client-scoped isolation" and "shared candidate pool"

#### 2.3.1 Ownership Model

| Data Entity | Owner | Rationale |
|-------------|-------|-----------|
| **Candidate profile** (PII: name, email, phone, location, resume) | **Agency** | Recruiter talent sourcing is agency-level intellectual capital |
| **Candidate skills/experience** (parsed from CV) | **Agency** | Inseparable from candidate profile |
| **Application record** | **Client (HiringCompany)** | Represents a hiring relationship between agency's client and candidate |
| **Interview + feedback** | **Client (HiringCompany)** | Confidential client evaluation data |
| **AI match score** | **Per Application (Client-scoped)** | Computed per candidate-job pair; not transferable across clients |
| **Recruiter notes (internal)** | **Recruiter (creator)** | Private by default; shared only via explicit @mention grant |
| **Salary expectations** | **Candidate (self-reported)** | Requires explicit consent per data point sharing |

#### 2.3.2 Cross-Client Visibility Rules

| Scenario | Behavior | Data Leak Prevention |
|----------|----------|---------------------|
| Same candidate applies to Client A and Client B | Two separate **Application** records created; **single Candidate** profile shared | Applications are isolated; neither client sees the other's application |
| Recruiter notes on candidate | Visible to all agency recruiters **who have access to that candidate's applications** | No client visibility into internal notes unless explicitly shared |
| Interview feedback from Client A | **NOT visible** to Client B's recruiters | Client-scoped isolation enforced at query level |
| AI match score for Client A | Independent from Client B; recalculated per application | No cross-client AI score leakage |
| Candidate self-reported salary | Visible only to recruiters with active application access for that specific client | Never auto-shared across clients |
| Candidate shared pool (without applications) | Candidate visible to all agency recruiters; no client data attached | Safe for internal sourcing without client exposure |

#### 2.3.3 Consent & Sharing Policy

| Rule | Implementation |
|------|---------------|
| **Consent tracking** | Every candidate must provide explicit consent (opt-in checkbox) for data processing at application time; consent stored with timestamp and version |
| **Consent withdrawal** | Candidate can withdraw consent → triggers anonymization workflow within 30 days; application retained with pseudonymized ID |
| **Cross-client sharing** | Candidate profile shared across clients **only** when candidate has an active application with that client OR recruiter explicitly creates a new application |
| **Data portability** | Candidate can request full data export (GDPR Art. 20); exported data includes application history but NOT other clients' data |
| **Right to erasure** | Candidate requests deletion → PII anonymized (name hashed, email nullified, phone removed); application records retained with pseudonymized candidate reference |
| **No unsolicited contact** | Candidate sourced for Client A cannot be contacted about Client B's jobs without separate consent |

#### 2.3.4 Duplicate Merge Strategy (Resolves OQ-008)

| Scenario | Behavior |
|----------|----------|
| **Detection** | System flags when name + email + phone similarity ≥ 90% at candidate creation |
| **Default action** | **Flag-only** — both records remain; visible in UI with "Possible duplicate" badge |
| **Merge initiation** | Any recruiter with access to both candidates can initiate merge via UI confirmation dialog |
| **Merge execution** | Merges into the older record; newer record becomes alias; all applications preserved with correct client references |
| **Merge approval** | **Requires recruiter confirmation** (no auto-merge) — prevents accidental data loss |
| **Post-merge audit** | Immutable audit event records: which fields were merged, by whom, timestamp |
| **Rollback** | No automatic rollback; must re-create record if merge was accidental |

#### 2.3.5 Recruiter Scope Resolution

| Scenario | Resolved Client Set |
|----------|-------------------|
| Recruiter views candidate list | Only candidates from clients they are assigned to (via `recruiter_client_assignments`) + candidates with applications to those clients |
| Recruiter searches for candidates | Results filtered to candidates who have applications to their assigned clients OR are agency-level shared candidates |
| Recruiter views dashboard | Pipeline data filtered to their assigned clients only |
| Agency Admin views reports | Full access across all clients within agency |
| Billing & Subscription | Plan management, usage metering, invoicing | Stripe payment gateway | Agency admin decision on plan changes |

### 2.3 Candidate Ownership & Cross-Client Visibility (NEW — Review Point #1)

> Resolves: multi-tenant data model conflicts between "client-scoped isolation" and "shared candidate pool"

#### 2.3.1 Ownership Model

| Data Entity | Owner | Rationale |
|-------------|-------|-----------|
| **Candidate profile** (PII: name, email, phone, location, resume) | **Agency** | Recruiter talent sourcing is agency-level intellectual capital |
| **Candidate skills/experience** (parsed from CV) | **Agency** | Inseparable from candidate profile |
| **Application record** | **Client (HiringCompany)** | Represents a hiring relationship between agency's client and candidate |
| **Interview + feedback** | **Client (HiringCompany)** | Confidential client evaluation data |
| **AI match score** | **Per Application (Client-scoped)** | Computed per candidate-job pair; not transferable across clients |
| **Recruiter notes (internal)** | **Recruiter (creator)** | Private by default; shared only via explicit @mention grant |
| **Salary expectations** | **Candidate (self-reported)** | Requires explicit consent per data point sharing |

#### 2.3.2 Cross-Client Visibility Rules

| Scenario | Behavior | Data Leak Prevention |
|----------|----------|---------------------|
| Same candidate applies to Client A and Client B | Two separate **Application** records created; **single Candidate** profile shared | Applications are isolated; neither client sees the other's application |
| Recruiter notes on candidate | Visible to all agency recruiters **who have access to that candidate's applications** | No client visibility into internal notes unless explicitly shared |
| Interview feedback from Client A | **NOT visible** to Client B's recruiters | Client-scoped isolation enforced at query level |
| AI match score for Client A | Independent from Client B; recalculated per application | No cross-client AI score leakage |
| Candidate self-reported salary | Visible only to recruiters with active application access for that specific client | Never auto-shared across clients |
| Candidate shared pool (without applications) | Candidate visible to all agency recruiters; no client data attached | Safe for internal sourcing without client exposure |

#### 2.3.3 Consent & Sharing Policy

| Rule | Implementation |
|------|---------------|
| **Consent tracking** | Every candidate must provide explicit consent (opt-in checkbox) for data processing at application time; consent stored with timestamp and version |
| **Consent withdrawal** | Candidate can withdraw consent → triggers anonymization workflow within 30 days; application retained with pseudonymized ID |
| **Cross-client sharing** | Candidate profile shared across clients **only** when candidate has an active application with that client OR recruiter explicitly creates a new application |
| **Data portability** | Candidate can request full data export (GDPR Art. 20); exported data includes application history but NOT other clients' data |
| **Right to erasure** | Candidate requests deletion → PII anonymized (name hashed, email nullified, phone removed); application records retained with pseudonymized candidate reference |
| **No unsolicited contact** | Candidate sourced for Client A cannot be contacted about Client B's jobs without separate consent |

#### 2.3.4 Duplicate Merge Strategy (Resolves OQ-008)

| Scenario | Behavior |
|----------|----------|
| **Detection** | System flags when name + email + phone similarity ≥ 90% at candidate creation |
| **Default action** | **Flag-only** — both records remain; visible in UI with "Possible duplicate" badge |
| **Merge initiation** | Any recruiter with access to both candidates can initiate merge via UI confirmation dialog |
| **Merge execution** | Merges into the older record; newer record becomes alias; all applications preserved with correct client references |
| **Merge approval** | **Requires recruiter confirmation** (no auto-merge) — prevents accidental data loss |
| **Post-merge audit** | Immutable audit event records: which fields were merged, by whom, timestamp |
| **Rollback** | No automatic rollback; must re-create record if merge was accidental |

#### 2.3.5 Recruiter Scope Resolution

| Scenario | Resolved Client Set |
|----------|-------------------|
| Recruiter views candidate list | Only candidates from clients they are assigned to (via `recruiter_client_assignments`) + candidates with applications to those clients |
| Recruiter searches for candidates | Results filtered to candidates who have applications to their assigned clients OR are agency-level shared candidates |
| Recruiter views dashboard | Pipeline data filtered to their assigned clients only |
| Agency Admin views reports | Full access across all clients within agency |

---

## 3. AI Architecture & Cost Governance

> **Review Point #2 addressed:** Realistic AI cost governance with model routing, token budgeting, and cache strategy.

### 3.1 AI Model Routing Strategy

Not all AI tasks need the same model or cost tier.

| Task | Model | Rationale | Est. Cost/1K calls |
|------|-------|-----------|-------------------|
| CV parsing | GPT-4o-mini | Fast, cheap, sufficient for structured extraction | ~$0.15 |
| Embedding generation | text-embedding-3-large (OpenAI) | Best-in-class for semantic search | ~$0.008/1K tokens |
| Semantic matching | GPT-4o-mini | Lightweight scoring + explanation | ~$0.15 |
| Score breakdown generation | GPT-4o | Needs reasoning for explainable output | ~$1.25 |
| Translation (JP/VN/EN) | Gemini Flash (fallback: GPT-4o-mini) | Fast, cheap, strong multilingual | ~$0.04 |
| High-quality translation (client-facing JD) | GPT-4o | Best quality for external content | ~$1.25 |
| Outreach message draft | GPT-4o-mini | Template personalization, low cost | ~$0.15 |
| Notification summarization | GPT-4o-mini | Lightweight content generation | ~$0.05 |

### 3.2 Token Budgeting & Enforcement

| Budget Category | Limit | Enforcement |
|-----------------|-------|-------------|
| Max tokens per CV parse | 8,000 | Truncate input; reject files requiring >4K tokens input |
| Max tokens per job description | 4,000 | Truncate embeddings to top 4K tokens |
| Max tokens per agency per day | 500,000 | Queue throttling + alert at 80% |
| Max embedding batch size | 50 candidates/batch | Batch API calls for cost efficiency |
| Prompt truncation strategy | Last N tokens kept | Drop early content, keep conclusion/summary sections |
| Embedding caching TTL | 30 days | Re-embed only on CV update |

### 3.3 AI Cache Strategy

| Cache Type | Key | TTL | Invalidation |
|-----------|-----|-----|-------------|
| Semantic cache (prompt→response) | SHA256(prompt + model) | 7 days | Model version change |
| Embedding reuse | SHA256(file_content) | 30 days | File update / re-upload |
| Translation cache | SHA256(source_text + target_lang) | 30 days | Glossary update |
| Score breakdown cache | SHA256(candidate_id + job_id) | 1 day | Re-scoring trigger |
| Prompt cache (prefix) | Model-specific | Session-level | API version change |

**Expected savings with caching:** 30–50% reduction in API calls for repeat CVs, same-locale translations, and re-scoring.

### 3.4 AI Cost Monitoring & Alerting

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| Daily AI spend > 80% of daily budget ($16–40/day) | 80% threshold | Slack/email to agency admin |
| Daily AI spend > 100% of daily budget | 100% threshold | Auto-pause non-critical queues (analytics, batch translation) |
| Monthly cumulative > $1,200 | Early warning | Notify agency admin + platform ops |
| Monthly cumulative > $1,500 | Hard limit | Suspend all non-essential AI processing; critical queues only |
| Single request cost > $0.50 | Anomaly detection | Log + alert for investigation |

### 3.5 AI Availability & Fallback

| Layer | Strategy | Detection | Recovery |
|-------|----------|-----------|----------|
| Primary (OpenAI) | GPT-4o for critical; GPT-4o-mini for bulk | Health check every 30s | Circuit breaker trips after 3 failures |
| Fallback (Gemini) | Gemini 1.5 Flash as drop-in | Auto-switch on primary failure | Auto-revert every 30s |
| Rule-based fallback | Regex/keyword matching | Activated when both AI providers fail | Manual review queue |
| Circuit breaker reset timeout | 30 seconds | Continuous health probes | Re-enable primary when healthy |

### 3.6 Revised Business Rules — AI Governance

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-059 | AI routing policy assigns cheapest model that meets quality requirements | Cost optimization | BP-007, CR-010 |
| BR-060 | Translation jobs are batched (up to 20 documents/batch) when processing >5 pending items | Cost reduction | BP-007, NFR-005 |
| BR-061 | Embedding results are cached for 30 days per document version | Prevent redundant compute | BP-007 |
| BR-062 | Prompt input is truncated to model's context limit minus 500 tokens for response | Prevent over-long prompts and cost blowout | BP-007, NFR-003 |
| BR-063 | AI cost dashboard is visible to Agency Admin in real time | Transparency | BP-007, BR-057 |
| BR-064 | All AI API calls are logged with model, token count, cost, and latency | Audit and optimization | BP-007, CR-007 |

### 3.7 AI Governance & Evaluation (NEW — Review Point #2)

> Enterprise-grade AI governance: prompt versioning, model tracking, hallucination handling, confidence calibration, human review escalation, and evaluation dataset.

#### 3.7.1 Prompt Versioning & Model Tracking

| Requirement | Implementation |
|-------------|---------------|
| **Prompt versioning** | Every prompt template stored with semantic version (e.g., `cv-parse-v2.1`); version recorded in every API call log |
| **Model version pinning** | Each task type references a specific model version (e.g., `gpt-4o-2024-08-06`); model upgrades deployed as canary with shadow traffic |
| **Prompt changelog** | Git-managed changelog for all prompt templates; changes require agency-admin approval before deployment |
| **Prompt testing** | New prompt versions tested against golden evaluation dataset before production rollout |

#### 3.7.2 Hallucination Handling

| Rule | Implementation |
|------|---------------|
| **Hallucination detection** | AI outputs cross-validated against structured extracted data where possible (e.g., skills list from CV vs AI-generated summary) |
| **Hallucination score** | LLM self-evaluates confidence; outputs with self-reported confidence < 70% flagged for review |
| **Grounded generation** | Use Retrieval-Augmented Generation (RAG) with candidate data as context to reduce fabrication |
| **Fallback on hallucination** | If hallucination detected → route to human review queue; do not auto-publish |

#### 3.7.3 Confidence Calibration

| Concept | Implementation |
|---------|---------------|
| **Calibration dataset** | Maintain a per-agency evaluation set of 50+ manually-scored candidate-job pairs |
| **Calibration frequency** | Monthly recalibration; compare predicted scores vs human judgments |
| **Calibration drift alert** | If correlation drops below 0.8 → alert AI ops team for investigation |
| **Score normalization** | Apply Platt scaling to raw model outputs for calibrated probability estimates |

#### 3.7.4 Human Review Escalation Policy

| Trigger | Action | SLA |
|---------|--------|-----|
| AI confidence < 70% | Route to human review queue | 24h |
| Hallucination flag raised | Block AI output; notify reviewer | 4h |
| New model version deployed | Shadow mode for 48h; compare outputs before full switch | 48h shadow period |
| Drastic score deviation (Δ > 0.3 vs previous version) | Auto-hold; manual review required | Immediate |

#### 3.7.5 AI Evaluation Process

| Activity | Frequency | Details |
|----------|-----------|---------|
| Precision/Recall on matching | Monthly | Compare AI top-10 vs recruiter top-10 picks |
| Calibration curve analysis | Monthly | Check predicted vs actual pass rates |
| Bias audit | Quarterly | Check for demographic bias in scoring across protected attributes |
| A/B testing | Ongoing | 5% traffic routed to alternative model/prompt for comparison |
| Feedback loop | Continuous | Recruiter overrides feed back into training/evaluation data |

#### 3.7.6 Revised Business Rules — AI Governance (Extended)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-064 | All AI API calls are logged with model, token count, cost, and latency | Audit and optimization | BP-007, CR-007 |
| BR-064a | Prompt templates are versioned and immutable after deployment | Reproducibility | BP-011 |
| BR-064b | Model versions are tracked per API call for rollback capability | Traceability | BP-011 |
| BR-064c | Hallucination detection is applied to all AI-generated text outputs | Quality control | BP-011, CR-007 |
| BR-064d | AI confidence scores are monthly calibrated against human judgments | Accuracy | BP-002, BP-011 |
| BR-064e | New AI model versions undergo canary deployment with 48h shadow testing | Risk mitigation | BP-011 |
| BR-064f | AI evaluation dataset maintained per agency with minimum 50 labeled samples | Quality assurance | BP-002 |

---

## 4. Multi-Client Data Model & Candidate Ownership

> **Review Point #3 addressed:** Enterprise-safe multi-tenant model with explicit data ownership.

### 4.1 Tenant Hierarchy

```
Platform
 └── Agency (Tenant)
      ├── Agency Admin
      ├── Recruiters (1:N)
      ├── Client Companies (1:N)
      │    ├── Jobs (1:N)
      │    ├── Applications (1:N)
      │    └── Assigned Recruiters (N:M)
      ├── Candidate Pool (Agency-level, shared)
      │    └── Candidates (1:N, agency-scoped)
      └── AI Credit Budget (Agency-level)
           └── Per-client allocation tracking
```

### 4.2 Data Ownership Policy

| Data Type | Owner | Visibility | Sharing Rules |
|-----------|-------|-----------|---------------|
| Candidate profile (name, email, phone, location, resume) | **Agency** | All recruiters within agency + any client the candidate applied to | Shared across clients; single profile per candidate |
| Resume file | **Agency** | All recruiters within agency | Shared; version-controlled |
| Application record | **Client (HiringCompany)** | Recruiter assigned to that client + Agency Admin | Client-scoped; cannot cross-client |
| Interview feedback | **Client (HiringCompany)** | Interviewer assigned to that application + Recruiter managing client | Client-scoped; anonymized for cross-client analytics |
| AI match score | **Application (per-client)** | Recruiter + Agency Admin | Per-application; recalculated if candidate applies to another client |
| Internal recruiter notes | **Recruiter** (creator) | Creator only; shareable by explicit grant | Private by default; no client visibility |
| Salary expectations | **Candidate** (self-reported) | Recruiter assigned to the application only | Never shared across clients without candidate consent; GDPR-restricted |
| Assessment results | **Application (per-client)** | Recruiter + Interviewer + Client (depending on config) | Client-scoped; configurable visibility per assessment |
| Translation records | **Source entity owner** | Follows source entity's visibility | Subject to source data's sharing rules |

### 4.3 GDPR Deletion Impact Matrix

| Scenario | Action | Cascade Effect |
|----------|--------|---------------|
| Candidate requests deletion (GDPR Art. 17) | Anonymize candidate PII; retain application records with hashed ID | Resume deleted; notes anonymized; scores retained for analytics (pseudonymized) |
| Client requests data export | Export all application data for their candidates | Includes candidate PII they collected; no third-party data |
| Agency account deletion | Full purge after retention period | All data deleted; anonymized audit logs retained per legal requirement |
| Recruiter leaves agency | Reassign their data; no deletion | Notes reassigned to admin; applications remain client-scoped |

### 4.4 Cross-Client Deduplication Rules

| Scenario | Behavior |
|----------|----------|
| Same candidate applies to Client A and Client B | Two application records created; single candidate profile shared |
| Recruiter notes on candidate | Visible to all recruiters who have access to that candidate's applications |
| Interview feedback from Client A interview | NOT visible to Client B's recruiters (client-scoped) |
| AI match score for Client A | Independent from Client B score; recalculated per application |
| Salary expectation shared by candidate | Visible only to recruiters with active application access; never auto-shared |

### 4.5 Revised Business Rules — Multi-Client

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-065 | Candidate profile is agency-scoped; application is client-scoped | Ownership clarity | BP-003, FR-042 |
| BR-066 | Interview feedback is client-scoped and never shared across clients | Client confidentiality | BP-003, FR-042, GDPR |
| BR-067 | Internal recruiter notes are private by default, shareable by explicit grant | Recruiter collaboration without leakage | FR-042 |
| BR-068 | Salary expectations require candidate consent before sharing with any client | Regulatory compliance | CR-005, GDPR |
| BR-069 | AI credit budget is agency-level with per-client allocation tracking | Cost governance across clients | BP-007, CR-010 |
| BR-070 | Cross-client deduplication is flag-only by default; merge requires recruiter approval | Prevent accidental data loss | FR-009, UC-008 |
| BR-071 | Agency admin can audit all data access across all clients | Oversight | CR-007 |

---

## 5. Workflow Engine Design

> **Review Point #4 addressed:** Event-driven + rule-based workflow execution engine for all auto-transitions.

### 5.1 Workflow Engine Architecture

```
┌─────────────────────────────────────────────────┐
│              WORKFLOW ENGINE                     │
│                                                   │
│  ┌──────────────┐    ┌───────────────────────┐   │
│  │  Event Bus    │───▶│  Rule Evaluator       │   │
│  │  (BullMQ)     │    │  (Conditions → Actions)│   │
│  └──────────────┘    └───────────────────────┘   │
│       │                                         │
│       ▼                                         │
│  ┌──────────────┐    ┌───────────────────────┐   │
│  │  Event Store  │    │  Action Executor       │   │
│  │  (PostgreSQL) │    │  - Stage transition    │   │
│  └──────────────┘    │  - Notification send   │   │
│                      │  - Email dispatch       │   │
│                      │  - AI task queue        │   │
│                      └───────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 5.2 Event Catalog

| Event ID | Event Name | Trigger | Payload |
|----------|-----------|---------|---------|
| EVT-001 | `application.created` | Candidate submits application or recruiter creates manually | {applicationId, candidateId, jobId, timestamp} |
| EVT-002 | `cv.parsed` | CV parsing completes (success or failure) | {applicationId, parseResult, confidence, fields} |
| EVT-003 | `ai.match.completed` | AI matching score computed | {applicationId, jobId, matchScore, skillScores, explanation} |
| EVT-004 | `assessment.passed` | Candidate passes MCQ assessment | {applicationId, assessmentId, score, threshold} |
| EVT-005 | `assessment.failed` | Candidate fails MCQ assessment | {applicationId, assessmentId, score, threshold} |
| EVT-006 | `assessment.overridden` | Recruiter overrides assessment result | {applicationId, newStatus, reason, overriddenBy} |
| EVT-007 | `interview.scheduled` | Interview slot confirmed | {interviewId, applicationId, type, scheduledAt, participants} |
| EVT-008 | `interview.completed` | Interview status marked complete | {interviewId, applicationId, outcome, feedback} |
| EVT-009 | `stage.transitioned` | Candidate moved between pipeline stages | {applicationId, fromStage, toStage, trigger, timestamp} |
| EVT-010 | `translation.completed` | Translation job finished | {contentId, sourceLang, targetLang, confidence, status} |
| EVT-011 | `outreach.approved` | Recruiter approves outreach message | {applicationId, messageId, channel} |
| EVT-012 | `manual.stage.set` | Recruiter manually drags candidate in kanban | {applicationId, toStage, performedBy} |

### 5.3 Workflow Rules Configuration

Rules are stored as JSON configuration per client, evaluated by the rule engine:

```json
{
  "clientId": "client-123",
  "rules": [
    {
      "ruleId": "RULE-001",
      "name": "Auto-screen after CV parse",
      "priority": 1,
      "enabled": true,
      "trigger": { "event": "cv.parsed", "condition": "cv.confidence >= 0.7" },
      "actions": [
        { "type": "queue_job", "job": "ai-screen-candidate", "queue": "ai-match-score", "priority": "P0" },
        { "type": "transition_stage", "toStage": "screening" }
      ]
    },
    {
      "ruleId": "RULE-002",
      "name": "Auto-move to interview after passing score",
      "priority": 2,
      "enabled": true,
      "trigger": { "event": "ai.match.completed", "condition": "matchScore >= 0.7" },
      "actions": [
        { "type": "transition_stage", "toStage": "interview" },
        { "type": "notify", "channel": "email", "template": "candidate_advance_interview" },
        { "type": "notify", "channel": "in-app", "recipients": ["assignedRecruiter"] }
      ]
    },
    {
      "ruleId": "RULE-003",
      "name": "Auto-fail on assessment below threshold",
      "priority": 3,
      "enabled": true,
      "trigger": { "event": "assessment.failed", "condition": "always" },
      "actions": [
        { "type": "transition_stage", "toStage": "rejected" },
        { "type": "notify", "channel": "email", "template": "candidate_rejected_assessment" }
      ]
    },
    {
      "ruleId": "RULE-004",
      "name": "Timeout screening after 7 days",
      "priority": 4,
      "enabled": true,
      "trigger": { "event": "timer", "condition": "stage == 'screening' AND daysInStage >= 7" },
      "actions": [
        { "type": "notify", "channel": "email", "template": "recruiter_stalled_alert" },
        { "type": "notify", "channel": "in-app", "recipients": ["assignedRecruiter"] }
      ]
    }
  ]
}
```

### 5.4 Rule Evaluation Engine

| Component | Implementation |
|-----------|---------------|
| Rule engine | Custom NestJS service evaluating JSON rules against events |
| Event storage | PostgreSQL `workflow_events` table (immutable append-only) |
| Rule storage | PostgreSQL `workflow_rules` table (per-client configuration) |
| Execution guarantee | At-least-once via BullMQ; idempotent via event ID dedup |
| Ordering | Rules evaluated by priority (lower = higher priority); first match wins per action type |
| Conflict resolution | Manual stage override (EVT-012) takes precedence over auto-transition |

### 5.5 Revised Business Rules — Workflow

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-072 | All workflow transitions are event-driven and rule-configurable per client | Architecture requirement | — |
| BR-073 | Auto-transition fires within 60 seconds of trigger event | Timely pipeline movement | FR-026 |
| BR-074 | Manual stage override by recruiter always takes precedence over auto-rules | Human-in-the-loop | FR-023 |
| BR-075 | All transitions are logged as immutable workflow events | Auditability | FR-023, CR-007 |
| BR-076 | Failed auto-transition triggers retry (3x) then routes to manual review queue | Reliability | NFR-013 |
| BR-077 | Stalled candidates (no transition >7 days) trigger recruiter alert | Pipeline health | BP-004 |

---

## 6. Audit & Event Strategy

> **Review Point #5 addressed:** Immutable, searchable audit trail with compliance export.

### 6.1 Audit Event Categories

| Category | Examples | Severity | Compliance-Relevant |
|----------|---------|----------|-------------------|
| Data Access | Candidate profile viewed, Resume downloaded, Salary info viewed | High | Yes (GDPR Art. 30) |
| Data Modification | Candidate updated, Stage transition, Score overridden | High | Yes (GDPR Art. 30) |
| AI Operations | CV parsed, AI score computed, Translation generated, Model failover | Medium | No |
| Authentication | Login success/failure, SSO login, MFA verification, Token refresh | High | Yes (Security audit) |
| Authorization | RBAC denial (403), Permission change, Role assignment | High | Yes |
| Configuration | Pipeline stage changed, Template updated, Threshold modified | Medium | No |
| Data Export | CSV export, PDF report generated, GDPR data export request | High | Yes (GDPR Art. 20) |
| System Operations | Health check status, Queue metrics, Backup completed | Low | No |

### 6.2 Audit Event Schema

```typescript
interface AuditEvent {
  eventId: string;           // UUID v4
  timestamp: string;         // ISO 8601, UTC
  category: string;          // Category enum
  severity: string;          // low | medium | high | critical
  actor: {                   // Who performed the action
    userId: string;
    role: string;
    clientId?: string;
    ip: string;
    deviceFingerprint: string;
  };
  action: string;            // e.g., "candidate.view", "stage.transition"
  target: {                  // What was affected
    entityType: string;      // e.g., "Candidate", "Application", "Job"
    entityId: string;
    fieldName?: string;
  };
  before?: object;           // Previous state (for modifications)
  after?: object;            // New state (for modifications)
  metadata: {                // Additional context
    requestId: string;       // Correlation / trace ID
    source: string;          // e.g., "api", "ui", "webhook"
    userAgent: string;
    traceId?: string;        // Distributed tracing ID
  };
  immutable: boolean;        // Always true — events cannot be modified or deleted
}
```

### 6.3 Audit Storage & Retention

| Property | Implementation |
|----------|---------------|
| Storage | PostgreSQL `audit_events` table, partitioned by month |
| Immutability | Append-only; no UPDATE/DELETE permissions on audit table; enforced via DB triggers |
| Searchability | Indexed on: eventId, timestamp, actor.userId, action, target.entityId, category |
| Retention | Per-agency configurable (6/12/24 months); auto-purge via scheduled job |
| Compliance export | GDPR-compliant export endpoint: `/api/v1/audit/export` (CSV/JSON) |
| Cross-tenant isolation | All queries filtered by agencyId; no cross-agency audit access |
| Analytics | Streamed to separate analytics DB (read replica) for dashboards |

### 6.4 Revised Business Rules — Audit

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-078 | All audit events are immutable and append-only | Integrity | CR-007 |
| BR-079 | Audit log entries are retained per agency-configurable policy (6/12/24 months) | Compliance | CR-006 |
| BR-080 | Audit log is searchable by actor, action, entity, timestamp, and category | Operability | CR-007 |
| BR-081 | GDPR data export includes all audit events related to the requesting user | Regulatory | CR-005 |
| BR-082 | High-severity events trigger real-time alert to agency admin | Security monitoring | CR-001 |
| BR-083 | Every API request is correlated via traceId across all services | Debugging | NFR-014 |

---

## 7. Human Review Workflow

> **Review Point #6 addressed:** Structured review queue with priority, SLA, load balancing.

### 7.1 Review Queue System

| Feature | Description |
|---------|-------------|
| Queue types | Translation review, AI confidence review, assessment override review |
| Priority levels | Urgent (client-facing, <4h SLA), Normal (<24h SLA), Low (<72h SLA) |
| Assignment | Round-robin within reviewer pool; weighted by current load |
| Load balancing | Track reviewer workload; auto-route to least-loaded available reviewer |
| Escalation | Items unreviewed beyond SLA auto-escalate to senior reviewer or agency admin |
| Rejection handling | Rejected items return to queue with reviewer notes for next reviewer |

### 7.2 Review Workflow (Translation Example)

```
[Translation Completed with Confidence < 80%]
           │
           ▼
[Queued in Review Queue with Priority Based on Content Type]
           │
           ▼
[Assigned to Available Translator/Reviewer (Round-Robin + Load Balance)]
           │
           ├── Reviewer accepts → Edit & approve → BR-032 threshold met → Auto-publish
           │
           ├── Reviewer rejects → Add notes → Re-queue (max 3 attempts)
           │
           └── SLA breach → Auto-escalate to senior reviewer
```

### 7.3 Reviewer Dashboard Widgets

- Pending review count (by queue type and priority)
- Personal workload vs team average
- SLA compliance tracker (items within/overdue SLA)
- Recent reviews with feedback quality rating

### 7.4 Revised Business Rules — Human Review

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-084 | Translation confidence < 80% enters human review queue | Quality gate | FR-032, UC-024 |
| BR-085 | Review items are assigned via round-robin with load balancing | Fair distribution | UC-024 |
| BR-086 | Review SLAs: Urgent <4h, Normal <24h, Low <72h | Service level | UC-024 |
| BR-087 | SLA breach triggers auto-escalation to senior reviewer | Timely resolution | UC-024 |
| BR-088 | Reviewer can approve, reject (with notes), or return for re-translation | Review completeness | UC-024 |
| BR-089 | Max 3 review attempts before routing to alternative reviewer | Prevent bottlenecks | UC-024 |

---

## 8. Candidate Activity Timeline

> **Review Point #7 addressed:** Full chronological event history per candidate.

### 8.1 Timeline Events

| Event | Source | Visibility |
|-------|--------|-----------|
| Application submitted | System | Recruiter + Client |
| CV parsed (success/failure) | System | Recruiter |
| AI match score computed | System | Recruiter |
| Screening result | System | Recruiter + Client |
| Interview scheduled | System | Recruiter + Interviewer + Client |
| Interview rescheduled | System | Recruiter + Interviewer + Client |
| Interview completed | System | Recruiter + Interviewer + Client |
| Assessment taken | System | Recruiter + Client |
| Assessment overridden | System | Recruiter + Admin |
| Translation requested/completed | System | Recruiter |
| Outreach message sent | System | Recruiter |
| Recruiter note added | Manual | Recruiter (shared per BR-067) |
| Stage changed (auto or manual) | System | Recruiter + Client |
| Candidate withdrew | Manual (candidate) | All stakeholders |
| Offer sent/accepted/rejected | System | Recruiter + Client |
| Status inquiry received | Email/portal | Recruiter |

### 8.2 Timeline UX

- **Reverse chronological order** (most recent first)
- **Grouped by day** with expandable detail
- **Color-coded** by event type (system = gray, recruiter = blue, candidate = green, AI = purple)
- **Filterable** by event type and date range
- **Exportable** to PDF (per candidate)

### 8.3 Revised Business Rules — Timeline

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-090 | All system and user actions on a candidate are recorded in the timeline | Traceability | BP-006, CR-007 |
| BR-091 | Timeline events inherit the visibility of their source entity | Data isolation | BR-065, BR-066 |
| BR-092 | Timeline is exportable to PDF per candidate | Client reporting | BP-003 |

---

## 9. Internal Notes & Collaboration

> **Review Point #8 addressed:** Recruiter collaboration features.

### 9.1 Notes Model

| Property | Description |
|----------|-------------|
| Scope | Per-candidate (not per-application — notes carry across client applications) |
| Ownership | Created by recruiter; editable only by creator or agency admin |
| Visibility | Private by default; explicitly shared with other recruiters via @mention |
| Rich text | Support markdown-style formatting |
| Mentions | @recruiter triggers notification to mentioned user |
| Tags | Free-form tags for categorization (e.g., "strong-technical", "salary-sensitive") |
| Tasks | Attachable to-do items with assignee and due date |

### 9.2 Collaboration Features

| Feature | Description |
|---------|-------------|
| @mentions | Tag another recruiter in notes; triggers in-app notification |
| Internal comments | Threaded comments on candidate profile (visible to all shared recruiters) |
| Task assignment | Create tasks on candidates with assignee, due date, status |
| Flag for review | Quick flag with category (data-quality, fit-concern, client-priority) |

### 9.3 Revised Business Rules — Collaboration

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-093 | Internal notes are private by default; shared via explicit @mention | Data minimization | BR-067 |
| BR-094 | Notes are scoped to candidate (visible across client applications) | Recruiter context | BP-003 |
| BR-095 | Tags and flags are agency-level configurable (predefined + custom) | Usability | BP-004 |
| BR-096 | Tasks on candidates trigger in-app notifications to assignee | Collaboration | BP-004 |

---

## 10. Search & Filtering System

> **Review Point #9 addressed:** Hybrid search with faceted filters.

### 10.1 Search Capabilities

| Search Type | Scope | Implementation |
|-------------|-------|---------------|
| Semantic search | Candidate profiles vs job description | Vector similarity via pgvector (cosine) |
| Full-text search | Name, email, skills, notes | PostgreSQL full-text index (tsvector) |
| Keyword search | Any text field | LIKE/ILIKE with indexing |

### 10.2 Faceted Filters

| Filter | Type | Description |
|--------|------|-------------|
| Years of experience | Range (min–max) | Calculated from work history |
| Location | Dropdown / radius | City, country, or geo-radius |
| Visa status | Dropdown | Work authorization type (JP/VN/EN-specific) |
| Expected salary | Range (min–max) | Self-reported by candidate |
| Japanese level | Dropdown (JLPT N1–N5, Native, None) | Language proficiency |
| Vietnamese level | Dropdown (Native, Advanced, Intermediate, Basic, None) | Language proficiency |
| English level | Dropdown (Native, Fluent, Advanced, Intermediate, Basic) | Language proficiency |
| Skills | Multi-select tag filter | Exact match on parsed skills |
| Education level | Dropdown | Highest degree |
| AI match score | Range (0–100) | Filter by minimum score threshold |
| Pipeline stage | Multi-select | Current pipeline position |
| Application date | Range | Date applied |
| Status | Dropdown | Active, archived, rejected, hired |
| Client | Multi-select | Filter by HiringCompany |
| Source channel | Dropdown | Job board, LinkedIn, referral, direct, import |

### 10.3 Search Combination

- Semantic search and faceted filters operate as **AND** (filters narrow the semantic result set)
- Full-text and keyword search can be combined with filters
- Saved searches per recruiter (with optional email alerts on new matches)

### 10.4 Revised Business Rules — Search

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-097 | Semantic search is the default candidate discovery method | AI-first | BP-002 |
| BR-098 | Faceted filters narrow search results after semantic ranking | Precision | BP-002 |
| BR-099 | Saved searches with email alerts are available per recruiter | Productivity | BP-004 |
| BR-100 | All search queries are scoped to agency + active client context | Data isolation | BR-039 |

---

## 11. Notification Center

> **Review Point #10 addressed:** In-app notifications with tracking and preferences.

### 11.1 Notification Channels

| Channel | Delivery | Use |
|---------|----------|-----|
| **In-app** | Real-time via WebSocket / polling | All notification types; unread tracking |
| **Email** | SendGrid / AWS SES | Candidate-facing + important recruiter alerts |
| **Push** (future) | Browser push notifications | Desktop alerts (Phase 2) |

### 11.2 Notification Types

| Type | Recipient | Channel | Timing |
|------|-----------|---------|--------|
| Application received | Recruiter | In-app + email | Immediate |
| AI match ready | Recruiter | In-app + email | Within 60s |
| Interview scheduled | Candidate + Interviewer | In-app + email | Within 60s |
| Interview reminder (24h) | Candidate + Interviewer | In-app + email | 24h before |
| Stage changed | Candidate + Recruiter | In-app + email | Within 30s |
| Assessment result | Candidate + Recruiter | In-app + email | Within 5 min |
| Client report | HiringCompany | Email only | Scheduled (daily/weekly) |
| Scheduling conflict | Recruiter | In-app + email | Immediate |
| Review queue item | Translator/Reviewer | In-app + email | Immediate |
| AI cost alert | Agency Admin | In-app + email | When threshold reached |
| Pipeline stall | Recruiter | In-app | After 7 days in stage |

### 11.3 Notification Preferences

| Setting | Default | Options |
|---------|---------|---------|
| Email for candidate notifications | On | On / Off per type |
| In-app for recruiter alerts | On | On / Off per type |
| Digest frequency | Real-time | Real-time / Daily digest / Weekly digest |
| Quiet hours | Off | Configurable per-user (e.g., 10pm–7am) |

### 11.4 Notification Model

```typescript
interface Notification {
  id: string;
  userId: string;
  type: string;           // Enum: application, match, interview, stage, assessment, etc.
  channel: 'in-app' | 'email';
  title: string;
  body: string;
  data: Record<string, any>;  // Deep link context (applicationId, candidateId, etc.)
  read: boolean;
  createdAt: string;      // ISO 8601 UTC
  deliveredAt?: string;
  readAt?: string;
}
```

### 11.5 Revised Business Rules — Notifications

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-101 | In-app notifications delivered within 30 seconds of event | Real-time UX | FR-034 |
| BR-102 | Email notifications delivered within 60 seconds of event | Communication SLA | FR-033 |
| BR-103 | All notifications are user-scoped and role-aware | Data minimization | BR-038 |
| BR-104 | Unread notification count tracked per user | UX | — |
| BR-105 | Notification preferences are configurable per user | User control | — |
| BR-106 | Candidate-facing emails include agency branding | Brand consistency | FR-036 |

---

## 12. File Management Model

> **Review Point #11 addressed:** Structured file asset management beyond CVs.

### 12.1 File Asset Types

| Type | Description | Who Can Upload | Access |
|------|------------|----------------|--------|
| **Resume/CV** | Candidate's resume (PDF/DOCX) | Candidate (portal), Recruiter (manual) | Recruiter + Client |
| **Offer Letter** | Formal offer document (PDF) | Recruiter | Recruiter + Client |
| **Assessment Recording** | Interview recording (video/audio) | System (auto-record) | Interviewer + Recruiter + Client |
| **Portfolio** | Candidate portfolio files (images, PDFs, links) | Candidate (portal) | Recruiter + Client |
| **Certificate** | Professional certificates (PDF, images) | Candidate (portal), Recruiter (manual) | Recruiter + Client |
| **Signed Contract** | Employment contract (PDF) | Recruiter / System | Recruiter + Client |

### 12.2 File Storage Schema

| Property | Description |
|----------|-------------|
| fileId | UUID v4 |
| fileName | Original filename (sanitized) |
| fileType | MIME type (application/pdf, etc.) |
| fileSize | Bytes |
| storagePath | S3 key (agencyId/clientId/fileId/filename) |
| entityType | candidate_resume, offer_letter, assessment_recording, portfolio, certificate, contract |
| entityId | References the parent entity (candidateId, applicationId, etc.) |
| uploadedBy | User ID |
| uploadedAt | ISO 8601 UTC |
| accessLevel | private (uploader only), shared (agency), restricted (specific roles) |

### 12.3 File Access Control

| Role | Resume/CV | Offer Letter | Recording | Portfolio/Certificate |
|------|-----------|-------------|-----------|-----------------------|
| Agency Admin | Read all | Read all | Read all | Read all |
| Recruiter | Read all | Read own client | Own assigned | Read all |
| Interviewer | Read assigned | None | Own recorded | None |
| Client (HiringCompany) | Read own candidates | Read own offers | Read own recordings | Read own candidates |
| Candidate | Own files only | Own offers | None | Own files |

### 12.4 Revised Business Rules — Files

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-107 | All uploaded files are scanned for malware (ClamAV) before storage | Security | IR-008, CR-003 |
| BR-108 | File storage path includes agencyId/clientId for tenant isolation | Data isolation | BR-039 |
| BR-109 | File retention follows agency data retention policy | Compliance | BR-048 |
| BR-110 | Signed contracts and offer letters are immutable once sent | Integrity | Business process |

---

## 13. Reporting & Export

> **Review Point #12 addressed:** Enterprise reporting capabilities.

### 13.1 Report Types

| Report | Format | Frequency | Recipients |
|--------|--------|-----------|------------|
| Pipeline Summary | PDF / CSV | Weekly / On-demand | HiringCompany |
| Time-to-Hire Analytics | PDF | Monthly | Agency Admin |
| Source Effectiveness | PDF / CSV | Monthly | Agency Admin |
| Conversion Funnel | PDF (visual) | Monthly | Agency Admin, HiringCompany |
| Assessment Score Breakdown | CSV | On-demand | Recruiter |
| Audit Log Export | CSV / JSON | On-demand | Agency Admin |
| GDPR Data Export | JSON | On-request (candidate) | Candidate |

### 13.2 Export Capabilities

| Data Type | CSV | PDF | API Access |
|-----------|-----|-----|------------|
| Candidate list | ✅ | ✅ | ✅ |
| Pipeline metrics | ✅ | ✅ | ✅ |
| Assessment results | ✅ | ❌ | ✅ |
| Audit logs | ✅ | ❌ | ✅ |

### 13.3 Revised Business Rules — Reporting

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-111 | Pipeline reports are available per-client with configurable date range | Client needs | BP-003 |
| BR-112 | Bulk data export respects RBAC and tenant isolation | Security | BR-039 |
| BR-113 | Scheduled reports are emailed at configured time | Automation | BP-003 |
| BR-114 | GDPR data export completes within 72 hours of request | Compliance | CR-005 |

---

## 14. Observability & Monitoring Strategy

> **Review Point #13 addressed:** Structured logging, tracing, and metrics.

### 14.1 Logging Strategy

| Level | Description | Destination | Retention |
|-------|-------------|-------------|-----------|
| **ERROR** | Failures, exceptions, security violations | Sentry + DB log table | 12 months |
| **WARN** | Degraded performance, retry activations, fallback triggers | Log aggregator | 6 months |
| **INFO** | Request lifecycle, stage transitions, AI calls | Structured JSON logs | 3 months |
| **DEBUG** | Detailed processing steps, AI payloads (sanitized) | Local/dev only | Session |

### 14.2 Distributed Tracing

| Property | Implementation |
|----------|---------------|
| Trace ID | UUID v4, generated at API gateway |
| Propagation | HTTP headers (`X-Trace-Id`, `X-Request-Id`) |
| Spans | API handler → Service → DB → Queue → AI API |
| Tool | OpenTelemetry with Jaeger or Datadog |

### 14.3 Metrics & Dashboards

| Metric | Type | Alert Threshold |
|--------|------|----------------|
| API response time (P95) | Gauge | >500ms |
| Queue depth per queue | Gauge | >100 items (warning), >500 (critical) |
| AI API latency (P95) | Gauge | >5s |
| AI error rate | Counter | >5% over 5 min |
| Circuit breaker state | State | OPEN |
| Active users (concurrent) | Gauge | N/A (capacity planning) |
| Queue processing rate | Counter | Drop >50% from baseline |
| Daily AI spend | Gauge | 80% and 100% of daily budget |
| Error rate (HTTP 5xx) | Counter | >1% over 5 min |

### 14.4 Health Check Endpoints

| Endpoint | Checks |
|----------|--------|
| `/health/live` | Application process is running |
| `/health/ready` | DB connection, Redis connection |
| `/health/ai-provider` | OpenAI API responsive, Gemini API responsive |
| `/health/queue` | BullMQ Redis connection, queue consumers active |
| `/health/full` | All of the above + disk space, memory |

### 14.5 Revised Business Rules — Observability

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-115 | All services emit structured JSON logs with traceId | Debugging | NFR-014 |
| BR-116 | Health check endpoints available for DB, AI providers, queue, cache | Ops readiness | NFR-014 |
| BR-117 | Alerting configured for error rate, latency, queue depth, AI cost | Proactive ops | NFR-014 |
| BR-118 | Distributed tracing propagated across all services | Debugging | NFR-014 |

---

## 15. Background Job Policy

> **Review Point #14 addressed:** BullMQ queue configuration with retry and priority.

### 15.1 Queue Configuration

| Queue | Priority | Concurrency | Retry | Max Failures | Rate Limit | Description |
|-------|----------|-------------|-------|-------------|------------|-------------|
| `ai-parse-cv` | P0 (Critical) | 5 | 3x, exponential backoff | 3 → DLQ | 50/min | CV parsing and field extraction |
| `ai-match-score` | P0 (Critical) | 5 | 3x, exponential backoff | 3 → DLQ | 30/min | AI candidate-job matching |
| `ai-translate-critical` | P0 (Critical) | 3 | 2x, exponential backoff | 2 → review queue | 20/min | High-priority translations (client-facing) |
| `ai-translate-standard` | P1 (High) | 3 | 2x, exponential backoff | 2 → review queue | 30/min | Internal/low-urgency translations |
| `ai-score-breakdown` | P1 (High) | 3 | 2x, exponential backoff | 2 → DLQ | 20/min | AI-generated score explanations |
| `email-critical` | P0 (Critical) | 10 | 3x, exponential backoff | 5 → DLQ | 100/min | Time-sensitive notifications |
| `email-standard` | P1 (High) | 5 | 3x, exponential backoff | 5 → DLQ | 100/min | Non-urgent notifications |
| `email-bulk-report` | P2 (Low) | 2 | 1x | 3 → DLQ | 10/min | Scheduled reports |
| `analytics-collector` | P2 (Low) | 2 | 1x | 3 → DLQ | 50/min | Event collection for analytics |
| `audit-purge` | P3 (Minimal) | 1 | 1x | 3 → log | 5/min | Data retention purge jobs |
| `cleanup-temp-files` | P3 (Minimal) | 1 | 1x | 3 → log | 5/min | Remove stale temp files |
| `db-backup` | P3 (Minimal) | 1 | 1x | 3 → alert | 1/day | Database backup |

### 15.2 DLQ (Dead Letter Queue) Strategy

| Queue | DLQ Behavior |
|-------|-------------|
| `ai-parse-cv` | Failed jobs → DLQ alert to admin; retryable manually |
| `ai-match-score` | Failed jobs → fallback to rule-based; log for investigation |
| `email-critical` | Failed jobs → fallback to in-app notification; alert admin |
| `analytics-collector` | Failed jobs → drop (non-critical); log metric |

### 15.3 Revised Business Rules — Queue Priority

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-119 | AI parsing and matching jobs are processed before translation and reporting | Business priority | NFR-008 |
| BR-120 | Critical queues (CV parse, match score) auto-scale workers under load | Throughput | NFR-008 |
| BR-121 | Failed jobs retry with exponential backoff (3 attempts for critical, 1 for low) | Reliability | NFR-013 |
| BR-122 | Permanently failed critical jobs enter admin alert pipeline | Error visibility | NFR-014 |

---

## 16. Environment & Release Strategy

> **Review Point #15 addressed:** Dev/staging/prod/sandbox environments.

### 16.1 Environment Matrix

| Environment | Purpose | Data | Access | AI Provider | Scale |
|------------|---------|------|--------|-------------|-------|
| **Sandbox** | Per-developer testing | Synthetic only | Developer | Free tier / test keys | Minimal |
| **Dev** | Feature integration testing | Anonymized copy of prod data | Dev team | OpenAI + Gemini | Scaled down |
| **Staging** | Client demo + QA | Anonymized copy of prod data + synthetic | QA + Demo users | OpenAI + Gemini | Production-scale |
| **Production** | Live client usage | Real client data | All authorized users | OpenAI (primary) + Gemini (fallback) | Auto-scaling |

### 16.2 Release Strategy

| Aspect | Strategy |
|--------|----------|
| **Deployment** | Blue-green on GCP Cloud Run; zero-downtime |
| **Feature flags** | LaunchDarkly or Unleash; per-agency toggle |
| **Canary releases** | New features enabled for 1 agency first, then gradual rollout |
| **Rollback** | Previous container version kept; instant rollback via traffic split |
| **Database migrations** | Flyway or Prisma migrations; backward-compatible schema changes |
| **AI model updates** | Model version pinned per environment; canary with shadow traffic |

### 16.3 Revised Business Rules — Environment

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-123 | Production data never accessible in sandbox/dev environments | Data protection | CR-002, CR-007 |
| BR-124 | Staging uses anonymized production data for realistic testing | Quality | — |
| BR-125 | Feature flags control gradual rollout of AI features | Risk mitigation | BP-007 |
| BR-126 | Blue-green deployment ensures zero-downtime releases | Availability | NFR-011 |

---

## 17. Candidate Portal Specification

> **Review Point #16 addressed:** Candidate portal feature definition.

### 17.1 Portal Capabilities (MVP)

| Capability | Description | Priority |
|-----------|-------------|----------|
| Application status tracking | View current stage, timeline of events | P0 |
| Upload new CV / resume | Replace existing resume | P0 |
| Manage availability | Submit preferred interview time slots | P0 |
| Respond to scheduling | Accept/decline/reschedule interview invitations | P0 |
| Withdraw application | Remove application from pipeline | P0 |
| View communication history | See all emails and notifications sent/received | P1 |
| Multi-language portal | JP/VN/EN interface | P1 |
| Interview prep materials | Receive documents/tips before interview | P2 |

### 17.2 Portal Access Control

| Role | Can View | Can Modify |
|------|----------|------------|
| Candidate | Own application, own profile | Own profile, own availability |
| Recruiter | All candidate portals in managed clients — view only | Can send updates to candidates via portal |

### 17.3 Revised Business Rules — Portal

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-127 | Candidate portal access requires authentication via email link or SSO | Security | FR-037 |
| BR-128 | Candidates can only view and modify their own application | Data isolation | BR-039, FR-042 |
| BR-129 | Portal availability submissions trigger scheduling workflow | Automation | FR-011 |
| BR-130 | Portal UI rendered in candidate's preferred language (auto-detect or manual) | Localization | FR-031 |

---

## 18. Recruiter Dashboard Specification

> **Review Point #17 addressed:** Dashboard widget definition.

### 18.1 Default Widgets

| Widget | Data Source | Refresh |
|--------|------------|---------|
| Pipeline summary (counts by stage) | Application table, grouped by stage | Real-time |
| Overdue interviews (past scheduled time, no outcome) | Interview table | Every 5 min |
| Stalled candidates (7+ days without stage change) | Application table + timeline | Daily |
| AI low-confidence queue | LocalizedContent table where confidence < 80% | Real-time |
| Pending approvals (offer approvals, outreach drafts) | Application table filtered by status | Real-time |
| Recent activity feed | Timeline events, last 24h | Real-time |
| AI cost tracker (today/this month) | AI usage logs | Hourly |
| Client pipeline comparison | Cross-client stage counts | Daily |
| Upcoming interviews (next 48h) | Interview table filtered by date | Every 5 min |

### 18.2 Customization

- Recruiters can add/remove/reorder widgets
- Widget layout persisted per user (stored in user preferences)
- Dashboard filter by client, date range, stage

---

## 19. Mobile & Responsive Strategy

> **Review Point #18 addressed:** Mobile and tablet support.

| Surface | Priority | Approach |
|---------|----------|----------|
| **Recruiter dashboard** (tablet) | P0 | Responsive layout; touch-optimized kanban drag |
| **Recruiter dashboard** (phone) | P1 | Condensed view; key actions accessible |
| **Candidate portal** (phone) | P0 | Mobile-first design; full functionality |
| **Interview join** (any device) | P0 | Link-based; browser-based video (no native app required) |
| **Notification handling** (mobile) | P1 | Responsive email + browser push (Phase 2) |

---

## 20. API Architecture

> **Review Point #19 addressed:** REST, WebSocket, and AI service architecture.

### 20.1 External API (Client-Facing)

| Type | Protocol | Purpose |
|------|----------|---------|
| REST API | HTTPS / JSON / OAuth2 Bearer | CRUD operations, queries, file uploads |
| WebSocket | WSS (over HTTPS) | Real-time notifications, dashboard live updates |

### 20.2 API Versioning

- All APIs versioned via URL: `/api/v1/...`
- Breaking changes only on major version bump
- Deprecation headers on sunset endpoints: `Sunset: <date>`

### 20.3 Internal AI Service Architecture

> **Review Point #20 addressed:** Decoupled AI services.

```
┌──────────────────────────────────────────────────┐
│                  API Gateway                      │
│              (Rate Limiting, Auth)                 │
└──────────┬──────────┬──────────┬──────────────────┘
           │          │          │
    ┌──────▼───┐ ┌────▼────┐ ┌──▼──────────────┐
    │ REST     │ │ WebSocket│ │ Internal Queue   │
    │ Handlers │ │ Hub      │ │ (BullMQ/Redis)   │
    └──────┬───┘ └────┬────┘ └──┬───────────────┘
           │          │         │
    ┌──────▼──────────▼─────────▼──────────────────┐
    │              Application Layer                 │
    │  (NestJS Modules: Auth, Pipeline, Scheduling, │
    │   Translation, Assessment, Notification, etc.) │
    └──────┬──────────┬──────────┬──────────────────┘
           │          │          │
    ┌──────▼───┐ ┌────▼────┐ ┌──▼──────────────────┐
    │ AI       │ │ Database │ │ External Integrations │
    │ Gateway  │ │ (Postgres│ │ (SendGrid, Google    │
    │ Service  │ │ + Redis) │ │  Calendar, S3)       │
    └────┬─────┘ └──────────┘ └─────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ AI Provider Adapters                  │
    │ - OpenAI Adapter (primary)            │
    │ - Gemini Adapter (fallback)           │
    │ - Circuit Breaker per adapter         │
    │ - Model routing logic                 │
    │ - Token budgeting                     │
    │ - Cache layer                         │
    └───────────────────────────────────────┘
```

### 20.4 AI Service Boundary

| Service | Responsibility | Endpoints (Internal) |
|---------|---------------|---------------------|
| **ai-parser-service** | CV/DOCX parsing, field extraction, confidence scoring | `POST /internal/ai/parse` |
| **ai-embedding-service** | Text embedding, vector upsert, similarity search | `POST /internal/ai/embed`, `POST /internal/ai/search` |
| **ai-scoring-service** | Weighted scoring, score breakdown generation | `POST /internal/ai/score` |
| **ai-translation-service** | Language detection, translation, confidence scoring | `POST /internal/ai/translate` |
| **ai-outreach-service** | Outreach message generation, template personalization | `POST /internal/ai/outreach` |

Each service has:
- Its own circuit breaker
- Its own token budget tracking
- Its own caching layer
- Health check endpoint
- Structured logging with shared traceId

### 20.5 AI Webhook Strategy

For long-running AI operations (e.g., batch translation):

| Pattern | Flow |
|---------|------|
| **Synchronous** (<10s) | Client → API → AI call → Response (used for single CV parse, scoring) |
| **Async with polling** (10–60s) | Client → API → Queue job → Return jobId → Client polls `/jobs/{id}` |
| **Async with webhook** (>60s) | Client → API → Queue job → Callback URL notified on completion |

### 20.6 Revised Business Rules — API/Architecture

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-131 | All external APIs versioned at `/api/v1/` | Compatibility | — |
| BR-132 | WebSocket connections authenticated via JWT in query param | Security | BR-042 |
| BR-133 | AI services decoupled and independently deployable | Scalability | BP-007, BR-053 |
| BR-134 | Circuit breaker implemented for each AI provider independently | Reliability | NFR-013 |
| BR-135 | Rate limiting applied at API gateway (100 req/min/user, 10 uploads/min) | Security | BR-046 |
| BR-136 | Webhook delivery retries 3x with exponential backoff | Reliability | NFR-013 |
| BR-137 | All internal service-to-service calls authenticated via mTLS or service tokens | Security | CR-001 |

---

## 21. Billing & Subscription Model

> **Review Point #21 addressed:** SaaS billing and subscription infrastructure.

### 21.1 Subscription Plans

| Plan | Target | AI Credits/mo | Features | Est. Price |
|------|--------|--------------|----------|------------|
| **Starter** | Solo recruiter, 1–2 clients | $500 (~33K tokens/day) | MVP features, 1 client pipeline, basic support | $99/mo |
| **Professional** | Small agency, 3–10 clients | $1,000 (~66K tokens/day) | Multi-client, custom pipeline, analytics, priority support | $299/mo |
| **Enterprise** | Large agency, 10+ clients | $1,500 (~100K tokens/day) | White-label options, dedicated support, custom integrations, SLA | Custom |

### 21.2 Usage Metering

| Metered Resource | Unit | Tracking |
|-----------------|------|----------|
| AI API calls | Per-call | Incremented per service call |
| AI tokens consumed | Per-token | Tracked per model per agency per day |
| CVs parsed | Per-parse | Counted monthly per agency |
| Translations | Per-document | Counted monthly per agency |
| Storage (S3) | GB/month | Measured daily |
| Active users | Per-seat | Counted monthly |

### 21.3 Overage Policy

| Scenario | Action |
|----------|--------|
| AI budget 80% consumed | Alert agency admin |
| AI budget 100% consumed | Suspend non-critical AI queues; notify admin |
| Storage over plan limit | Read-only mode; notify admin to upgrade |
| User seats over limit | Block new user creation; notify admin |

### 21.4 Revised Business Rules — Billing

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-138 | AI credit budget is allocated per agency and resets monthly | Cost control | BP-007, CR-010 |
| BR-139 | Per-client allocations can be set within agency budget | Multi-client control | BP-003, BP-007 |
| BR-140 | Usage metrics are visible to Agency Admin in real-time dashboard | Transparency | BP-007 |

---

## 22. Tenant Onboarding Process

> **Review Point #22 addressed:** SaaS onboarding flow.

### 22.1 Onboarding Steps

| Step | Action | Owner | Duration |
|------|--------|-------|----------|
| 1 | Agency signs up with email/password or SSO | Agency Admin | < 1 min |
| 2 | Agency profile created (name, logo, timezone, language) | Agency Admin | < 2 min |
| 3 | Billing plan selected and payment configured | Agency Admin | < 5 min |
| 4 | First HiringCompany (client) created | Agency Admin | < 3 min |
| 5 | Pipeline stages configured for client (or use default template) | Agency Admin / Client | < 5 min |
| 6 | Recruiters invited and assigned to client(s) | Agency Admin | < 5 min |
| 7 | Calendar integration connected (optional) | Recruiter | < 3 min |
| 8 | Client onboarding complete — ready to create jobs | Client / Agency Admin | — |

### 22.2 Onboarding Checklist Per Client

- [ ] Client company profile completed
- [ ] Pipeline stages configured (or default used)
- [ ] At least 1 recruiter assigned
- [ ] Job template created (or first job posted)
- [ ] Calendar connected (optional but recommended)
- [ ] Email/SMS channel configured
- [ ] AI credit allocation confirmed

---

## 23. Stakeholders & Roles

### 23.1 Stakeholder Registry

| ID | Stakeholder | Type | Interest | Influence |
|----|------------|------|----------|-----------|
| ST-001 | Agency Admin | Internal | Full platform control, billing, compliance | High |
| ST-002 | Recruiter | Internal (Primary User) | Daily ATS operations, candidate management | High |
| ST-003 | Interviewer | Internal | Interview execution, score review | Medium |
| ST-004 | HiringCompany (Client) | External (Customer) | Pipeline visibility, candidate quality, reporting | High |
| ST-005 | Candidate (Job Seeker) | External (End User) | Application experience, communication quality | Medium |
| ST-006 | Translator / Reviewer | Internal / External | Translation quality assurance | Low |
| ST-007 | Platform Engineering | Internal | System reliability, security, performance | Medium |

### 23.2 System Roles (RBAC)

| Role ID | Role Name | Description | Permissions |
|---------|-----------|-------------|-------------|
| R-001 | Agency Admin | Full system control: settings, users, billing, compliance | All 11 permissions (P-001 through P-011) |
| R-002 | Recruiter | Core ATS operations: manage jobs, candidates, schedule interviews for assigned clients | P-001, P-002, P-003, P-004, P-005, P-007, P-008, P-009, P-011 |
| R-003 | Interviewer | Conduct interviews, review AI scores, provide feedback | P-002, P-005, P-010 |
| R-004 | Client | View pipeline, review candidates, approve offers (own jobs only) | P-002, P-005, P-006, P-010 |
| R-005 | Candidate | Submit application, respond to scheduling, view status | P-011 (self-service only) |

### 23.3 Permission Definitions

| ID | Permission | Description |
|----|-----------|-------------|
| P-001 | Create/Edit/Archive Jobs | Create and modify job postings for assigned clients |
| P-002 | View & Manage Candidates | Access candidate profiles, screening results, and applications |
| P-003 | Reject Candidates | Mark candidates as rejected at any pipeline stage |
| P-004 | Approve Offers | Authorize formal job offers to candidates |
| P-005 | View Salary Information | Access compensation data in job postings and offers |
| P-006 | Export CVs | Download candidate resumes and profiles |
| P-007 | Manage Users & Roles | Add/remove users, assign roles within the agency |
| P-008 | View Analytics & Dashboard | Access pipeline metrics, conversion rates, and performance reports |
| P-009 | Configure Client Pipeline | Customize stage names, order, and auto-transition rules per client |
| P-010 | Provide Interview Feedback | Submit evaluation scores and comments post-interview |
| P-011 | Submit Application / Self-Service | Candidate application submission and status checking |

---

## 24. Business Rules (Complete — All 140 Rules)

### 24.1 Candidate Management Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-001 | A candidate must have a unique email address within an agency | Prevents duplicate profiles | FR-009 |
| BR-002 | Duplicate detection triggers when name + email + phone similarity exceeds 90% | Balances precision and recall in deduplication | FR-009 |
| BR-003 | All candidate PII must be encrypted at rest (AES-256) and in transit (TLS 1.3) | GDPR/CCPA compliance | CR-002 |
| BR-004 | Candidate data is scoped to the HiringCompany that sourced or received the candidate | Multi-client data isolation | FR-042 |
| BR-005 | Candidates may be shared across a recruiter's assigned clients via shared pool | Agency-level candidate reuse | FR-044 |

### 24.2 Job & Pipeline Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-006 | Each job must belong to exactly one HiringCompany | Data integrity | DR-013 |
| BR-007 | Default pipeline stages are: Applied → Screening → Interview → Technical → Offer → Hired/Rejected | Standard workflow baseline | FR-025, FR-024 |
| BR-008 | Clients may customize stage names and auto-transition rules | Client-specific workflows | FR-025, FR-045 |
| BR-009 | Automated stage transitions fire within 60 seconds of a trigger event (pass/fail/timeout) | Timely pipeline movement | FR-026 |
| BR-010 | An application cannot exist without a valid Candidate and Job | Referential integrity | DR-013 |

### 24.3 Scheduling Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-011 | All times are stored in UTC and displayed in participant-local timezone | Multi-timezone correctness | FR-017 |
| BR-012 | Scheduling suggestions must be generated within 5 seconds of availability submission | Responsive UX | FR-013, NFR-004 |
| BR-013 | Interview bookings must fall within business hours (9:00–18:00 local per participant) | Professional scheduling norms | FR-013 |
| BR-014 | Automated reminders are sent 24 hours before each scheduled interview | Reduce no-show rate | FR-015 |
| BR-015 | Candidates and interviewers can reschedule via self-service links without recruiter intervention | Self-service efficiency | FR-016 |

### 24.4 AI & Scoring Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-016 | AI matching scores are computed using weighted factors: Skills 40%, Experience 30%, Education 20%, Org Preference 10% | Transparent, configurable ranking | FR-003 |
| BR-017 | Weight values are admin-configurable per agency | Agency customization | FR-003 |
| BR-018 | AI matching must complete within 15 seconds per candidate-job pair | Real-time feedback | NFR-003 |
| BR-019 | AI-generated score breakdowns must explain each contributing factor | Transparency and trust | FR-008, FR-022 |
| BR-020 | CV parsing must achieve ≥90% field-level accuracy on test corpus | Quality threshold | FR-006 |
| BR-021 | CV parsing and AI scoring end-to-end must complete within 15 seconds | Throughput requirement | NFR-002 |
| BR-022 | When AI services are unavailable, the system falls back to rule-based processing within 10 seconds of detection | Graceful degradation | NFR-013 |
| BR-023 | AI outputs are advisory-only; no consequential action is taken without human approval | Human-in-the-loop | FR-023, CR-001 |
| BR-024 | System uses OpenAI GPT-4o as primary AI and Gemini 1.5 Pro as fallback | Resolved AI provider decision | CR-009, IR-004, IR-005 |

### 24.5 Assessment Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-025 | MCQ assessments must be auto-graded with 100% accuracy for predefined answer patterns | Reliability of auto-scoring | FR-018, FR-019 |
| BR-026 | Assessment scores are available within 5 seconds of submission | Immediate feedback | NFR-004, FR-020 |
| BR-027 | Recruiters can configure pass/fail thresholds per job (0–100, default 60) | Role-specific standards | FR-021 |
| BR-028 | Recruiters can override any auto-pass/fail decision with a recorded reason | Human judgment for edge cases | FR-023 |

### 24.6 Translation Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-029 | Supported language pairs are JP↔VN, JP↔EN, VN↔EN | Core market requirement | FR-028 |
| BR-030 | Source language is auto-detected with ≥95% confidence before translation | Reduces manual input | FR-031 |
| BR-031 | Translations delivered within 30 seconds per document (up to 10 pages) | Acceptable user wait time | FR-028, NFR-005 |
| BR-032 | Translations with confidence < 80% are routed to a human review queue | Quality control | FR-032 |
| BR-033 | Each agency maintains a bilingual glossary that overrides system defaults for client-specific terminology | Domain accuracy | FR-028, FR-030 |

### 24.7 Communication Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-034 | Email notifications are sent within 60 seconds of trigger events | Timely communication | FR-033 |
| BR-035 | All candidate-facing emails include agency branding | Professional image | FR-036 |
| BR-036 | Template-based emails support HTML and plain text formats | Client flexibility | FR-036 |
| BR-037 | Pipeline progress reports are sent to HiringCompanies at configurable frequency (daily/weekly) | Client retention | FR-035 |

### 24.8 Access Control Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-038 | RBAC is enforced at entity level, not just route level | Data isolation | FR-040 |
| BR-039 | Cross-client data access is denied by default; queries filtered by client_id | Multi-tenant security | FR-042 |
| BR-040 | A recruiter may manage multiple HiringCompanies but only access their assigned data | Agency operational model | FR-043 |
| BR-041 | SSO (Google / Microsoft) is optional; MFA is optional for admins | Reduced friction + enhanced security | FR-038, FR-039 |
| BR-042 | JWT access tokens expire and are refreshed via secure refresh token flow | Session security | FR-041 |

### 24.9 Security & Compliance Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-043 | All user inputs are sanitized against XSS, SQL injection, and NoSQL injection | OWASP baseline | CR-001 |
| BR-044 | File uploads are limited to PDF/DOCX, max 25MB, with magic byte validation | Prevent malicious uploads | CR-003 |
| BR-045 | All uploaded CVs are scanned for malware (ClamAV) before storage | Upload security | IR-008 |
| BR-046 | API requests are rate-limited to 100/min per user; uploads to 10/min per user | Abuse prevention | CR-004 |
| BR-047 | All candidate data access events are logged with who, what, when, IP, device fingerprint | Audit trail | CR-007 |
| BR-048 | Data retention is configurable per agency (6, 12, or 24 months); auto-purge on schedule | Compliance control | CR-006 |
| BR-049 | Right to erasure and data portability are supported per GDPR/CCPA | Regulatory compliance | CR-005 |
| BR-050 | Credentials and secrets are never hardcoded; managed via environment variables or secret manager | Secret management | CR-001, CR-002 |

### 24.10 Infrastructure & Operational Rules

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-051 | System maintains 99.5% monthly uptime SLA | Business continuity | NFR-011 |
| BR-052 | Automated backups maintain ≤24-hour Recovery Point Objective | Data loss prevention | NFR-012 |
| BR-053 | AI workloads scale horizontally via BullMQ message queue | Handle burst requests | NFR-008 |
| BR-054 | AI circuit breaker detects failures within 10 seconds, resets after 30 seconds | Fast failover | NFR-013 |
| BR-055 | Health check endpoints are available for DB, AI API, queue, and cache | Monitoring readiness | NFR-014 |
| BR-056 | Deployment target is GCP (Cloud Run or GKE) | Resolved infrastructure decision | CR-008 |
| BR-057 | Monthly AI API budget is $500–$1,500; alerts trigger at 80% threshold | Cost governance | CR-010 |
| BR-058 | Database read replicas serve analytics queries to protect transaction performance | Scalability | NFR-010 |

### 24.11 AI Governance Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-059 | AI routing policy assigns cheapest model that meets quality requirements | Cost optimization | BP-007, CR-010 |
| BR-060 | Translation jobs are batched (up to 20 documents/batch) when processing >5 pending items | Cost reduction | BP-007, NFR-005 |
| BR-061 | Embedding results are cached for 30 days per document version | Prevent redundant compute | BP-007 |
| BR-062 | Prompt input is truncated to model's context limit minus 500 tokens for response | Prevent cost blowout | BP-007, NFR-003 |
| BR-063 | AI cost dashboard is visible to Agency Admin in real time | Transparency | BP-007, BR-057 |
| BR-064 | All AI API calls are logged with model, token count, cost, and latency | Audit and optimization | BP-007, CR-007 |

### 24.12 Multi-Client Data Ownership Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-065 | Candidate profile is agency-scoped; application is client-scoped | Ownership clarity | BP-003, FR-042 |
| BR-066 | Interview feedback is client-scoped and never shared across clients | Client confidentiality | BP-003, FR-042, GDPR |
| BR-067 | Internal recruiter notes are private by default, shareable by explicit grant | Recruiter collaboration without leakage | FR-042 |
| BR-068 | Salary expectations require candidate consent before sharing with any client | Regulatory compliance | CR-005, GDPR |
| BR-069 | AI credit budget is agency-level with per-client allocation tracking | Cost governance across clients | BP-007, CR-010 |
| BR-070 | Cross-client deduplication is flag-only by default; merge requires recruiter approval | Prevent accidental data loss | FR-009, UC-008 |
| BR-071 | Agency admin can audit all data access across all clients | Oversight | CR-007 |

### 24.13 Workflow Engine Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-072 | All workflow transitions are event-driven and rule-configurable per client | Architecture requirement | — |
| BR-073 | Auto-transition fires within 60 seconds of trigger event | Timely pipeline movement | FR-026 |
| BR-074 | Manual stage override by recruiter always takes precedence over auto-rules | Human-in-the-loop | FR-023 |
| BR-075 | All transitions are logged as immutable workflow events | Auditability | FR-023, CR-007 |
| BR-076 | Failed auto-transition triggers retry (3x) then routes to manual review queue | Reliability | NFR-013 |
| BR-077 | Stalled candidates (no transition >7 days) trigger recruiter alert | Pipeline health | BP-004 |

### 24.14 Audit Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-078 | All audit events are immutable and append-only | Integrity | CR-007 |
| BR-079 | Audit log entries are retained per agency-configurable policy (6/12/24 months) | Compliance | CR-006 |
| BR-080 | Audit log is searchable by actor, action, entity, timestamp, and category | Operability | CR-007 |
| BR-081 | GDPR data export includes all audit events related to the requesting user | Regulatory | CR-005 |
| BR-082 | High-severity events trigger real-time alert to agency admin | Security monitoring | CR-001 |
| BR-083 | Every API request is correlated via traceId across all services | Debugging | NFR-014 |

### 24.15 Human Review Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-084 | Translation confidence < 80% enters human review queue | Quality gate | FR-032, UC-024 |
| BR-085 | Review items are assigned via round-robin with load balancing | Fair distribution | UC-024 |
| BR-086 | Review SLAs: Urgent <4h, Normal <24h, Low <72h | Service level | UC-024 |
| BR-087 | SLA breach triggers auto-escalation to senior reviewer | Timely resolution | UC-024 |
| BR-088 | Reviewer can approve, reject (with notes), or return for re-translation | Review completeness | UC-024 |
| BR-089 | Max 3 review attempts before routing to alternative reviewer | Prevent bottlenecks | UC-024 |

### 24.16 Timeline & Collaboration Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-090 | All system and user actions on a candidate are recorded in the timeline | Traceability | BP-006, CR-007 |
| BR-091 | Timeline events inherit the visibility of their source entity | Data isolation | BR-065, BR-066 |
| BR-092 | Timeline is exportable to PDF per candidate | Client reporting | BP-003 |
| BR-093 | Internal notes are private by default; shared via explicit @mention | Data minimization | BR-067 |
| BR-094 | Notes are scoped to candidate (visible across client applications) | Recruiter context | BP-003 |
| BR-095 | Tags and flags are agency-level configurable (predefined + custom) | Usability | BP-004 |
| BR-096 | Tasks on candidates trigger in-app notifications to assignee | Collaboration | BP-004 |

### 24.17 Search & Filtering Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-097 | Semantic search is the default candidate discovery method | AI-first | BP-002 |
| BR-098 | Faceted filters narrow search results after semantic ranking | Precision | BP-002 |
| BR-099 | Saved searches with email alerts are available per recruiter | Productivity | BP-004 |
| BR-100 | All search queries are scoped to agency + active client context | Data isolation | BR-039 |

### 24.18 Notification Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-101 | In-app notifications delivered within 30 seconds of event | Real-time UX | FR-034 |
| BR-102 | Email notifications delivered within 60 seconds of event | Communication SLA | FR-033 |
| BR-103 | All notifications are user-scoped and role-aware | Data minimization | BR-038 |
| BR-104 | Unread notification count tracked per user | UX | — |
| BR-105 | Notification preferences are configurable per user | User control | — |
| BR-106 | Candidate-facing emails include agency branding | Brand consistency | FR-036 |

### 24.19 File Management Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-107 | All uploaded files are scanned for malware (ClamAV) before storage | Security | IR-008, CR-003 |
| BR-108 | File storage path includes agencyId/clientId for tenant isolation | Data isolation | BR-039 |
| BR-109 | File retention follows agency data retention policy | Compliance | BR-048 |
| BR-110 | Signed contracts and offer letters are immutable once sent | Integrity | Business process |

### 24.20 Reporting Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-111 | Pipeline reports are available per-client with configurable date range | Client needs | BP-003 |
| BR-112 | Bulk data export respects RBAC and tenant isolation | Security | BR-039 |
| BR-113 | Scheduled reports are emailed at configured time | Automation | BP-003 |
| BR-114 | GDPR data export completes within 72 hours of request | Compliance | CR-005 |

### 24.21 Observability Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-115 | All services emit structured JSON logs with traceId | Debugging | NFR-014 |
| BR-116 | Health check endpoints available for DB, AI providers, queue, cache | Ops readiness | NFR-014 |
| BR-117 | Alerting configured for error rate, latency, queue depth, AI cost | Proactive ops | NFR-014 |
| BR-118 | Distributed tracing propagated across all services | Debugging | NFR-014 |

### 24.22 Queue & Background Job Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-119 | AI parsing and matching jobs are processed before translation and reporting | Business priority | NFR-008 |
| BR-120 | Critical queues (CV parse, match score) auto-scale workers under load | Throughput | NFR-008 |
| BR-121 | Failed jobs retry with exponential backoff (3 attempts for critical, 1 for low) | Reliability | NFR-013 |
| BR-122 | Permanently failed critical jobs enter admin alert pipeline | Error visibility | NFR-014 |

### 24.23 Environment & Release Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-123 | Production data never accessible in sandbox/dev environments | Data protection | CR-002, CR-007 |
| BR-124 | Staging uses anonymized production data for realistic testing | Quality | — |
| BR-125 | Feature flags control gradual rollout of AI features | Risk mitigation | BP-007 |
| BR-126 | Blue-green deployment ensures zero-downtime releases | Availability | NFR-011 |

### 24.24 Portal & Dashboard Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-127 | Candidate portal access requires authentication via email link or SSO | Security | FR-037 |
| BR-128 | Candidates can only view and modify their own application | Data isolation | BR-039, FR-042 |
| BR-129 | Portal availability submissions trigger scheduling workflow | Automation | FR-011 |
| BR-130 | Portal UI rendered in candidate's preferred language | Localization | FR-031 |
| BR-131 | All external APIs versioned at `/api/v1/` | Compatibility | — |
| BR-132 | WebSocket connections authenticated via JWT in query param | Security | BR-042 |
| BR-133 | AI services decoupled and independently deployable | Scalability | BP-007, BR-053 |
| BR-134 | Circuit breaker implemented for each AI provider independently | Reliability | NFR-013 |
| BR-135 | Rate limiting applied at API gateway (100 req/min/user, 10 uploads/min) | Security | BR-046 |
| BR-136 | Webhook delivery retries 3x with exponential backoff | Reliability | NFR-013 |
| BR-137 | All internal service-to-service calls authenticated via mTLS or service tokens | Security | CR-001 |

### 24.25 Billing & Onboarding Rules (New)

| ID | Rule | Rationale | Mapped To |
|----|------|-----------|-----------|
| BR-138 | AI credit budget is allocated per agency and resets monthly | Cost control | BP-007, CR-010 |
| BR-139 | Per-client allocations can be set within agency budget | Multi-client control | BP-003, BP-007 |
| BR-140 | Usage metrics are visible to Agency Admin in real-time dashboard | Transparency | BP-007 |

---

## 25. Use Cases (Complete — All 41 Cases)

### 25.1 Candidate Sourcing & Matching

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-001 | Search candidates across channels | Recruiter | At least one channel connector configured | 1. Recruiter enters search criteria → 2. System queries job boards, LinkedIn, internal DB → 3. Results displayed with match scores | Candidate list ranked by composite score |
| UC-002 | AI semantic matching | System (automatic) | Candidate profile and job description exist | 1. CV parsed → 2. Embedding generated → 3. Vector search against job embedding → 4. Weighted score computed → 5. Explanation generated | Match score and explanation stored; candidate ranked |
| UC-003 | Manual score override | Recruiter | AI match score exists | 1. Recruiter views match details → 2. Adjusts weights or overrides score → 3. Records reason | Override recorded with audit trail; score updated |
| UC-004 | Automated outreach | System (automatic) | Top candidates matched, outreach approved | 1. Match score computed → 2. Outreach message generated (draft) → 3. Recruiter reviews → 4. Approved → 5. Sent via email | Outreach delivered; status tracked |

### 25.2 CV Processing

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-005 | Upload and parse CV | Recruiter | CV file in PDF/DOCX format (< 25MB) | 1. CV uploaded → 2. File validated (type, size, magic bytes) → 3. Malware scan → 4. Sent to AI parser → 5. Structured fields extracted → 6. Confidence scores assigned | Parsed fields stored; warnings flagged |
| UC-006 | Manual field correction | Recruiter | Parse completed with warnings | 1. Recruiter reviews extracted fields → 2. Corrects errors → 3. Saves corrections | Updated fields persisted; correction logged |
| UC-007 | CV screening against job | System (automatic) | Parsed CV and job requirements exist | 1. Screen CV against job requirements → 2. Compute weighted score → 3. Generate explainable breakdown | Screening score and breakdown stored |
| UC-008 | Duplicate detection | System (automatic) | New candidate created | 1. Compare new candidate against pool → 2. Check name + email + phone similarity → 3. Flag if > 90% match | Duplicate flagged or merged |

### 25.3 Interview Scheduling

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-009 | Connect calendar | Recruiter / Interviewer | Google or Outlook account available | 1. User initiates OAuth flow → 2. Calendar permissions granted → 3. Events synced | Calendar connected; availability readable |
| UC-010 | Collect candidate availability | Candidate | Application submitted | 1. Candidate receives scheduling link → 2. Submits preferred time slots → 3. Data stored | Availability stored for matching |
| UC-011 | Suggest optimal slots | System (automatic) | All participant availability collected | 1. Compute overlapping windows → 2. Respect business hours + timezone → 3. Rank top 3 options → 4. Present to recruiter | Slot suggestions displayed |
| UC-012 | Schedule multi-round interview | Recruiter | Slot confirmed for first round | 1. Select rounds (phone → technical → onsite) → 2. Auto-schedule each based on availability → 3. Send notifications | All rounds scheduled; participants notified |
| UC-013 | Reschedule interview | Candidate / Interviewer | Interview scheduled | 1. Participant clicks reschedule link → 2. Selects new slot → 3. System validates → 4. Updates calendar + notifications | Interview rescheduled; all parties notified |
| UC-014 | Send reminders | System (automatic) | Interview scheduled | 1. 24h before scheduled time → 2. Send email + in-app reminder to all participants | Reminders delivered |

### 25.4 Assessment Scoring

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-015 | Create MCQ assessment | Recruiter | Job exists with screening stage | 1. Configure questions + answers → 2. Set pass threshold → 3. Attach to job | Assessment ready for candidates |
| UC-016 | Take and auto-grade assessment | Candidate | Assessment configured, candidate in interview stage | 1. Candidate completes assessment → 2. System grades instantly → 3. Score vs threshold → 4. Generate AI breakdown | Score and breakdown stored; pass/fail determined |
| UC-017 | Override assessment result | Recruiter | Auto-graded score exists | 1. Review score and breakdown → 2. Override with reason → 3. Stage transition triggered if needed | Override recorded with audit trail |

### 25.5 Pipeline Management

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-018 | Configure pipeline stages | Agency Admin / Client | Client company exists | 1. Select client → 2. Customize stage names and order → 3. Define auto-transition rules → 4. Save configuration | Pipeline stages active for client |
| UC-019 | Manage candidate pipeline | Recruiter | Application exists | 1. View kanban board → 2. Drag candidate between stages → 3. Auto-transitions may trigger based on rules | Candidate status updated |
| UC-020 | View pipeline dashboard | Recruiter / Client | Applications exist | 1. Open dashboard → 2. View counts per stage → 3. See conversion rates → 4. Filter by client/date/stage | Real-time metrics displayed |

### 25.6 Translation

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-021 | Translate CV | Recruiter / System | CV text available, language pair supported | 1. Request translation → 2. Auto-detect source language → 3. Apply glossary → 4. Generate translation → 5. Check confidence → 6. Publish or route to review | Translated content stored; low-confidence flagged |
| UC-022 | Translate interview feedback | Interviewer | Feedback submitted in any supported language | 1. Submit feedback → 2. Auto-translate for cross-language panel → 3. Deliver translated version | Panel members see feedback in their language |
| UC-023 | Translate job description | Recruiter | JD exists in source language | 1. Request JD translation → 2. Industry terminology preserved → 3. Review and publish | JD available in target language |
| UC-024 | Review low-confidence translations | Translator | Translation with confidence < 80% queued | 1. Reviewer opens translation → 2. Edits corrections → 3. Approves or rejects → 4. Version incremented | Corrected translation published |

### 25.7 Notifications & Email

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-025 | Candidate notification | System (automatic) | Application submitted or stage changed | 1. Trigger event fires → 2. Select template → 3. Personalize → 4. Send via SendGrid/SES | Email delivered to candidate |
| UC-026 | Recruiter notification | System (automatic) | New application, match ready, or scheduling conflict | 1. Event detected → 2. In-app notification (30s) → 3. Email (60s) | Recruiter notified |
| UC-027 | Client progress report | System (automatic) | Configured report schedule | 1. Scheduled time triggers → 2. Compile pipeline stats → 3. Send branded email report | Report delivered to HiringCompany |

### 25.8 Authentication & Security

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-028 | Login with credentials | User (any role) | Account exists | 1. Enter email + password → 2. bcrypt verification → 3. Issue JWT tokens → 4. Start session | Authenticated session active |
| UC-029 | SSO login | User (any role) | Google or Microsoft account linked | 1. Click SSO → 2. OAuth2 flow → 3. Map to agency account → 4. Issue JWT | Authenticated via SSO |
| UC-030 | MFA verification | User (admin optional) | MFA enabled on account | 1. Enter credentials → 2. Prompt for TOTP code → 3. Verify → 4. Complete login | MFA-verified session |
| UC-031 | Role-based access enforcement | System (automatic) | Every API request | 1. Request arrives → 2. Extract JWT → 3. Resolve role + client context → 4. Check RBAC matrix → 5. Allow (200) or deny (403) | Access granted or denied |

### 25.9 Multi-Client Management

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-032 | Switch client context | Recruiter | Multiple clients assigned | 1. Select client from dropdown → 2. All queries filtered to new client_id → 3. Dashboard updates | Recruiter operates within correct client scope |
| UC-033 | Manage client account | Agency Admin | Client engagement agreement | 1. Create client profile → 2. Configure pipeline stages → 3. Assign recruiters → 4. Set billing tier | Client ready for operations |

### 25.10 Candidate Portal & Timeline (New)

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-034 | View candidate activity timeline | Recruiter / Client | Candidate has application history | 1. Open candidate profile → 2. Timeline loads with all events → 3. Filter by type/date | Full chronological history visible |
| UC-035 | Add internal note to candidate | Recruiter | Candidate profile exists | 1. Open candidate profile → 2. Add note (with @mention if needed) → 3. Save | Note stored; mentioned users notified |
| UC-036 | View candidate portal as recruiter | Recruiter | Candidate has portal access | 1. Navigate to candidate portal view → 2. See what candidate sees | Portal preview for recruiter quality check |

### 25.11 Search & Notifications (New)

| ID | Use Case | Primary Actor | Preconditions | Main Flow | Postconditions |
|----|----------|--------------|--------------|-----------|----------------|
| UC-037 | Hybrid search with faceted filters | Recruiter | At least one candidate exists | 1. Enter search terms → 2. Apply filters → 3. View ranked results | Candidates matched by semantic + keyword + filters |
| UC-038 | Respond to notification | User (any role) | Notification received | 1. Click notification → 2. Relevant screen opens → 3. Take action | Notification marked read; action recorded |

---

## 26. KPIs & Success Metrics

| ID | KPI | Target | Measurement Method | Mapped To |
|----|-----|--------|--------------------|-----------|
| KPI-001 | Time-to-hire | ≤25 days (from 45) | Average days from application to hire | BP-001, FR-010, FR-013 |
| KPI-002 | AI matching accuracy | ≥85% vs manual assessment | Sample comparison of AI vs recruiter rankings | BP-002, FR-002, FR-003 |
| KPI-003 | CV parsing accuracy | ≥90% field-level accuracy | Test corpus evaluation | FR-005, FR-006 |
| KPI-004 | Screening throughput | <15s per candidate-job pair | P95 latency measurement | NFR-002, NFR-003 |
| KPI-005 | Scheduling efficiency | 60% reduction in scheduling time | Comparison with manual scheduling baseline | FR-013, FR-015, FR-016 |
| KPI-006 | Translation quality | <10% require human review | Percentage routed to review queue below 80% confidence | FR-032, BR-032 |
| KPI-007 | Automation rate | ≥60% of routine tasks automated | Count of auto-processed vs manual actions per recruiter | FR-001, FR-004, FR-033, FR-034 |
| KPI-008 | System uptime | 99.5% monthly | Monitoring dashboard calculation | NFR-011 |
| KPI-009 | AI cost efficiency | $500–$1,500/month actual spend | Monthly billing dashboard | CR-010, BR-057 |
| KPI-010 | Multi-tenant isolation | Zero cross-client data leaks | Penetration testing, access log audits | NFR-007, BR-039 |
| KPI-011 | Recruiter satisfaction | ≥4.0/5.0 | Quarterly survey | Overall platform quality |
| KPI-012 | Client retention rate | ≥90% annual | Churn analysis | BP-003 |

---

## 27. Assumptions & Constraints

### 27.1 Business Assumptions

| ID | Assumption | Impact if Wrong |
|----|-----------|----------------|
| BA-001 | Agencies operate 5 clients on average with 10–50 per agency | Affects scaling architecture and pricing tiers |
| BA-002 | Primary markets (JP/VN/EN) have distinct regulatory frameworks for candidate data | Requires jurisdiction-specific compliance |
| BA-003 | Recruitment agencies will adopt workflow automation incrementally | Must ensure manual fallbacks at every stage |
| BA-004 | AI quality will meet ≥85% accuracy for matching decisions | If lower, manual review load increases and value proposition weakens |
| BA-005 | Client companies will accept AI-assisted candidate ranking as advisory | If rejected, all AI scoring becomes internal-only |

### 27.2 Technical Constraints

| ID | Constraint | Source |
|----|-----------|--------|
| TC-001 | No model fine-tuning in MVP (prompt engineering only) | Budget and timeline constraints (CR-010, BR-024) |
| TC-002 | All AI outputs are advisory — never autonomous decisions | Ethical and legal requirement (BR-023) |
| TC-003 | Assessment scoring is objective/MCQ only in MVP | Scope constraint (FR-018, F-004 scope note) |
| TC-004 | Maximum 25MB file upload size | Storage and processing constraints (CR-003) |
| TC-005 | No real-time AI interviewer in MVP | Deferred to Phase 2 (F-005) |
| TC-006 | No agentic AI workflows (AI-to-AI chains) | Complexity and reliability concerns |

---

## 28. Risks

| ID | Risk | Likelihood | Impact | Mitigation | Mapped To |
|----|------|-----------|--------|-----------|-----------|
| RSK-001 | AI provider outage disrupts all AI features | Medium | Critical | Circuit breaker + fallback provider; rule-based degradation | NFR-013, BR-022, BR-054 |
| RSK-002 | AI matching accuracy below 85% erodes recruiter trust | Medium | High | Continuous evaluation, fallback to manual ranking, A/B testing | KPI-002, BR-018 |
| RSK-003 | Data breach exposes candidate PII | Low | Critical | Encryption, access logging, penetration testing, incident response plan | CR-001, CR-002, CR-007 |
| RSK-004 | GDPR/CCPA non-compliance results in regulatory fines | Low | Critical | Privacy-by-design, right to erasure, data portability, consent management | CR-005, BR-049 |
| RSK-005 | AI cost overruns exceed monthly budget | Medium | Medium | Cost monitoring dashboard, alerts at 70%/90%, auto-pause non-critical queues | CR-010, BR-057, KPI-009 |
| RSK-006 | Low-quality translations damage agency-client relationships | Medium | Medium | Confidence-based routing to human review, glossary management | BR-032, BR-033, UC-024 |
| RSK-007 | Cross-tenant data leak due to misconfigured queries | Low | Critical | Mandatory client_id filtering, automated testing, security audits | BR-039, KPI-010 |
| RSK-008 | Calendar integration failures disrupt scheduling | Medium | Medium | Retry with exponential backoff, manual scheduling fallback | FR-010, UC-009 |
| RSK-009 | Malicious file upload compromises system | Low | Critical | File type validation, magic bytes, size limits, malware scanning | CR-003, BR-045, IR-008 |
| RSK-010 | Recruiter resistance to AI-assisted workflows | Medium | Medium | Training, gradual rollout, transparent AI explanations, override capability | BP-004, KPI-011 |
| RSK-011 | BullMQ/Redis failure blocks all AI processing | Low | High | Redis Sentinel/Cluster, health checks, circuit breaker | BR-053, NFR-008 |
| RSK-012 | Multi-language support gaps (JP/VN/EN nuances) | Medium | Medium | Glossary management, human review for low-confidence, cultural adaptation rules | BR-029, BR-033, UC-024 |
| RSK-013 | Workflow engine misconfig causes incorrect stage transitions | Low | High | Rule validation on save; dry-run mode for new rules | BR-072, BR-073 |
| RSK-014 | Notification overload reduces recruiter productivity | Medium | Low | Digest modes; quiet hours; configurable per type | BR-101, BR-105 |
| RSK-015 | Data retention purge accidentally deletes active case data | Low | Critical | Only purge expired data; soft-delete with grace period | BR-048, BR-079 |

---

## 29. Open Questions (Gate 3)

| ID | Question | Impact | Category | Status |
|----|----------|--------|----------|--------|
| OQ-006 | Should translation support batch processing (multiple CVs at once) or only one at a time? | Affects queue design, UX flow, and cost model | Translation | **Open** |
| OQ-007 | Should candidate outreach messages be fully AI-generated or template-based with AI personalization? | Affects content generation scope and brand compliance | Candidate Sourcing | **Open** |
| OQ-008 | Should candidate deduplication be automatic (merge) or flag-only for recruiter review? | Affects data model and UX | Multi-Client | **Open** |
| OQ-009 | Should the platform support candidate self-service portal for application tracking? | Affects frontend scope and notification design | UX | **Partially resolved** — basic portal defined; full portal deferred |
| OQ-010 | Should assessment results be visible to candidates or recruiters only? | Affects trust/transparency and data access rules | Assessment | **Open** |
| OQ-011 | What retention SLA should be offered to enterprise clients (99.5% vs 99.9%)? | Affects infrastructure cost and architecture | Operations | **Open** |
| OQ-012 | Should workflow rules be editable via UI or config files only? | Affects build effort and client self-service | Workflow | **New** |
| OQ-013 | Should per-client AI credit allocation be hard-capped or soft-warned? | Affects billing model and client experience | Billing | **New** |
| OQ-014 | Should candidate portal support multi-language interface (JP/VN/EN)? | Affects frontend scope and translation effort | UX | **New** |

---

## 30. Traceability Summary

All business artifacts trace to atomic requirements (REQ-*) defined in 02-requirement-definition.md:

- **8 Business Policies (BP-001 to BP-008)** → Map to groups of FR-*, NFR-*, CR-*
- **140 Business Rules (BR-001 to BR-140)** → Map to individual FR-*, NFR-*, CR-*, IR-*, DR-*
- **41 Use Cases (UC-001 to UC-038)** → Map to functional features and workflows
- **12 KPIs (KPI-001 to KPI-012)** → Map to acceptance criteria and NFR-*
- **5 Assumptions + 6 Technical Constraints** → Map to CR-, NFR-, and feature scope notes
- **15 Risks (RSK-001 to RSK-015)** → Map to NFR-*, CR-*, and quality gates
- **9 Open Questions (OQ-006 to OQ-014)** → 3 inherited from Gate 2, 6 new

### 30.1 Coverage Summary

| Artifact Type | Count | With ≥1 REQ Mapping | Coverage |
|---------------|-------|---------------------|----------|
| Business Policies (BP) | 8 | 8 | 100% |
| Business Rules (BR) | 140 | 140 | 100% |
| Use Cases (UC) | 41 | 41 | 100% |
| KPIs | 12 | 11 | 92% (KPI-011 = survey-based) |
| Risks (RSK) | 15 | 15 | 100% |
| Functional Reqs (FR) | 45 | 45 mapped | 100% |
| Non-Func Reqs (NFR) | 14 | 14 mapped | 100% |
| Data Reqs (DR) | 14 | 2 direct (DR-011, DR-013) | 14% (rest implicit) |
| Integration Reqs (IR) | 8 | 6 mapped | 75% |
| Constraint Reqs (CR) | 10 | 10 | 100% |

### 30.2 Remaining Gaps

| Gap | Action Needed |
|-----|---------------|
| **DR-001 through DR-010** (entity definitions) | Add data governance BRs for entity-level retention, backup, and access rules |
| **FR-011, FR-012, FR-014, FR-037, FR-041** | These are technical implementation details — consider if they need business-level traceability |
| **NFR-001** (dashboard page load <2s) | No explicit BR — add performance monitoring BR |
| **NFR-006** (500+ concurrent users) | No explicit BR — add capacity planning BR |
| **NFR-009** (CDN for static assets) | No explicit BR — acceptable as infrastructure guideline |
| **IR-001** (SendGrid/AWS SES) | Implicit in UC-025 — add explicit BR for email delivery SLA |
| **IR-006** (External ATS P2) | Deferred — no business rule needed until Phase 2 |
| **IR-007** (pgvector/Pinecone) | Implicit in UC-002 — acceptable |

---

*Generated: 2026-05-12 | Version: 2.0.0 | Sources: 01-requirement.md (v0.2.0), 02-requirement-definition.md (v0.1.0), 04-llm-architecture-spec.md (v1.0.0)*