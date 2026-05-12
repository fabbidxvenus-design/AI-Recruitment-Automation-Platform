# Traceability Matrix

> AI Recruitment Automation Platform
> Version: 2.0.0 | Gate 3 Update (Revised)
> Date: 2026-05-12
> Upstream: 01-requirement.md (v0.2.0) → 02-requirement-definition.md (v0.1.0) → 03-business-definition.md (v2.0.0)

---

## Legend

| Prefix | Category |
|--------|----------|
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| DR | Data Requirement |
| IR | Integration Requirement |
| CR | Constraint Requirement |
| BP | Business Policy |
| BR | Business Rule |
| UC | Use Case |
| KPI | Key Performance Indicator |
| RSK | Risk |

---

## 1. Forward Traceability: Business Artifacts → Requirements

### 1.1 Business Policies → Requirements

| Business Policy | Mapped REQ IDs | Feature Source |
|----------------|----------------|----------------|
| BP-001 (Reduce time-to-hire) | FR-001, FR-002, FR-007, FR-010, FR-013 | F-001 (AI Sourcing), F-003 (Scheduling) |
| BP-002 (Improve candidate quality) | FR-002, FR-003, FR-007, FR-008 | F-001 (AI Sourcing), F-002 (CV Screening) |
| BP-003 (Scale multi-client operations) | FR-042, FR-043, FR-044, FR-045, NFR-007 | F-009 (Multi-Client) |
| BP-004 (Reduce manual recruiter workload) | FR-001, FR-004, FR-015, FR-016, FR-033 | F-001, F-003, F-007 |
| BP-005 (Enable cross-border hiring) | FR-028, FR-029, FR-030, FR-031, FR-017 | F-006 (Translation), F-003 (Scheduling) |
| BP-006 (Ensure compliance and auditability) | CR-005, CR-006, CR-007, NFR-011, NFR-012 | Sec. 10, Sec. 12 |
| BP-007 (Minimize AI cost exposure) | CR-010, NFR-003, NFR-005, NFR-013 | Sec. 12, Sec. 6 |
| BP-008 (Provide transparent AI decisions) | FR-003, FR-008, FR-022 | F-001 (AI Sourcing), F-002 (CV Screening) |

### 1.2 Business Rules → Requirements

#### 1.2.1 Candidate Management (BR-001 – BR-005)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-001 (Unique candidate email) | FR-009 | Candidate Management |
| BR-002 (Duplicate detection threshold 90%) | FR-009 | Candidate Management |
| BR-003 (PII encryption AES-256 / TLS 1.3) | CR-002 | Security & Compliance |
| BR-004 (Candidate data scoped to HiringCompany) | FR-042 | Multi-Client |
| BR-005 (Shared candidate pool with dedup) | FR-044 | Multi-Client |

#### 1.2.2 Job & Pipeline (BR-006 – BR-010)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-006 (Job belongs to exactly one HiringCompany) | DR-013 | Data Integrity |
| BR-007 (Default pipeline stages) | FR-024, FR-025 | Pipeline Management |
| BR-008 (Client-customizable stages) | FR-025, FR-045 | Pipeline Management |
| BR-009 (Auto-transition within 60s) | FR-026 | Pipeline Management |
| BR-010 (Application requires Candidate + Job) | DR-013 | Data Integrity |

#### 1.2.3 Scheduling (BR-011 – BR-015)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-011 (UTC storage, local display) | FR-017 | Scheduling |
| BR-012 (Slot suggestions < 5s) | FR-013, NFR-004 | Scheduling / Performance |
| BR-013 (Business hours 9:00–18:00) | FR-013 | Scheduling |
| BR-014 (Reminders 24h before interview) | FR-015 | Scheduling |
| BR-015 (Self-service rescheduling) | FR-016 | Scheduling |

#### 1.2.4 AI & Scoring (BR-016 – BR-024)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-016 (Weighted scoring: Skills 40%, Exp 30%, Edu 20%, Org 10%) | FR-003 | AI & Scoring |
| BR-017 (Admin-configurable weights) | FR-003 | AI & Scoring |
| BR-018 (AI matching < 15s) | NFR-003 | Performance |
| BR-019 (Explainable score breakdowns) | FR-008, FR-022 | AI & Scoring |
| BR-020 (CV parsing ≥ 90% accuracy) | FR-006 | CV Parsing |
| BR-021 (End-to-end parsing + scoring < 15s) | NFR-002 | Performance |
| BR-022 (Fallback to rule-based within 10s) | NFR-013 | Reliability |
| BR-023 (Advisory-only AI, human approval required) | FR-023, CR-001 | Security & Ethics |
| BR-024 (OpenAI primary + Gemini fallback) | CR-009, IR-004, IR-005 | Integration |

#### 1.2.5 Assessment (BR-025 – BR-028)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-025 (MCQ auto-grading 100% accuracy) | FR-018, FR-019 | Assessment |
| BR-026 (Assessment scores within 5s) | NFR-004, FR-020 | Performance / Assessment |
| BR-027 (Configurable pass/fail threshold per job) | FR-021 | Assessment |
| BR-028 (Recruiter override with reason) | FR-023 | Assessment |

#### 1.2.6 Translation (BR-029 – BR-033)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-029 (Language pairs JP↔VN, JP↔EN, VN↔EN) | FR-028 | Translation |
| BR-030 (Auto-detect source language ≥ 95%) | FR-031 | Translation |
| BR-031 (Translation within 30s per document) | FR-028, NFR-005 | Translation / Performance |
| BR-032 (Low confidence < 80% → human review) | FR-032 | Translation |
| BR-033 (Agency bilingual glossary) | FR-028, FR-030 | Translation |

#### 1.2.7 Communication (BR-034 – BR-037)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-034 (Email notifications within 60s) | FR-033 | Notifications |
| BR-035 (Agency branding in emails) | FR-036 | Notifications |
| BR-036 (HTML + plain text templates) | FR-036 | Notifications |
| BR-037 (Progress reports to HiringCompanies) | FR-035 | Notifications |

#### 1.2.8 Access Control (BR-038 – BR-042)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-038 (RBAC at entity level) | FR-040 | Access Control |
| BR-039 (Cross-client data access denied by default) | FR-042 | Security |
| BR-040 (Recruiter multi-client, assigned data only) | FR-043 | Access Control |
| BR-041 (Optional SSO + optional MFA) | FR-038, FR-039 | Authentication |
| BR-042 (JWT access/refresh token flow) | FR-041 | Authentication |

#### 1.2.9 Security & Compliance (BR-043 – BR-050)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-043 (Input sanitization XSS/SQLi/NoSQLi) | CR-001 | Security |
| BR-044 (File upload: PDF/DOCX, 25MB, magic bytes) | CR-003 | Security |
| BR-045 (ClamAV malware scan before storage) | IR-008 | Security |
| BR-046 (Rate limiting: 100 req/min, 10 uploads/min) | CR-004 | Security |
| BR-047 (Audit log: who, what, when, IP, device) | CR-007 | Compliance |
| BR-048 (Configurable retention: 6/12/24 months) | CR-006 | Compliance |
| BR-049 (Right to erasure + data portability) | CR-005 | Compliance |
| BR-050 (No hardcoded secrets) | CR-001, CR-002 | Security |

#### 1.2.10 Infrastructure & Operations (BR-051 – BR-058)

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-051 (99.5% uptime SLA) | NFR-011 | Reliability |
| BR-052 (≤ 24h RPO backups) | NFR-012 | Reliability |
| BR-053 (Horizontal scaling via BullMQ) | NFR-008 | Scalability |
| BR-054 (Circuit breaker: 10s detect, 30s reset) | NFR-013 | Reliability |
| BR-055 (Health checks for DB, AI, queue, cache) | NFR-014 | Operations |
| BR-056 (Deployment on GCP) | CR-008 | Infrastructure |
| BR-057 (AI budget $500–$1,500/mo, 80% alert) | CR-010 | Cost Governance |
| BR-058 (Read replicas for analytics) | NFR-010 | Scalability |

#### 1.2.11 AI Governance (BR-059 – BR-064) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-059 (AI routing policy: cheapest model meeting quality) | — | AI Governance |
| BR-060 (Translation batching >5 pending items) | FR-028 | AI Governance |
| BR-061 (Embedding cache 30 days per doc version) | — | AI Governance |
| BR-062 (Prompt truncation to model limit −500 tokens) | NFR-003 | AI Governance |
| BR-063 (AI cost dashboard visible to Agency Admin) | NFR-003 | AI Governance |
| BR-064 (AI API calls logged: model, tokens, cost, latency) | CR-007 | AI Governance |

#### 1.2.12 Multi-Client Data Ownership (BR-065 – BR-071) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-065 (Candidate profile agency-scoped; application client-scoped) | FR-042 | Multi-Client |
| BR-066 (Interview feedback client-scoped, never shared) | FR-042 | Multi-Client |
| BR-067 (Internal recruiter notes private by default) | FR-042 | Multi-Client |
| BR-068 (Salary expectations require candidate consent) | CR-005 | Multi-Client |
| BR-069 (AI credit budget agency-level with per-client allocation) | CR-010 | Multi-Client |
| BR-070 (Cross-client dedup flag-only; merge requires approval) | FR-009 | Multi-Client |
| BR-071 (Agency admin can audit all data access across clients) | CR-007 | Multi-Client |

#### 1.2.13 Workflow Engine (BR-072 – BR-077) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-072 (All workflow transitions event-driven, rule-configurable) | — | Workflow |
| BR-073 (Auto-transition fires within 60s of trigger event) | FR-026 | Workflow |
| BR-074 (Manual stage override takes precedence over auto-rules) | FR-023 | Workflow |
| BR-075 (All transitions logged as immutable workflow events) | CR-007 | Workflow |
| BR-076 (Failed auto-transition: retry 3x → manual review queue) | NFR-013 | Workflow |
| BR-077 (Stalled candidates >7 days trigger recruiter alert) | FR-033 | Workflow |

#### 1.2.14 Audit (BR-078 – BR-083) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-078 (All audit events immutable and append-only) | CR-007 | Audit |
| BR-079 (Audit log retained per agency policy 6/12/24 months) | CR-006 | Audit |
| BR-080 (Audit log searchable by actor, action, entity, timestamp) | — | Audit |
| BR-081 (GDPR export includes all audit events for requesting user) | CR-005 | Audit |
| BR-082 (High-severity events trigger real-time admin alert) | CR-001 | Audit |
| BR-083 (Every API request correlated via traceId) | NFR-014 | Audit |

#### 1.2.15 Human Review (BR-084 – BR-089) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-084 (Translation confidence <80% → human review queue) | FR-032 | Human Review |
| BR-085 (Review items assigned via round-robin + load balancing) | — | Human Review |
| BR-086 (Review SLAs: Urgent <4h, Normal <24h, Low <72h) | — | Human Review |
| BR-087 (SLA breach → auto-escalate to senior reviewer) | — | Human Review |
| BR-088 (Reviewer can approve, reject with notes, or return) | FR-032 | Human Review |
| BR-089 (Max 3 review attempts before routing to alternative) | NFR-013 | Human Review |

#### 1.2.16 Timeline & Collaboration (BR-090 – BR-096) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-090 (All system/user actions recorded in timeline) | BP-006, CR-007 | Timeline |
| BR-091 (Timeline events inherit source entity visibility) | BR-065, BR-066 | Timeline |
| BR-092 (Timeline exportable to PDF per candidate) | — | Timeline |
| BR-093 (Internal notes private by default; shared via @mention) | BR-067 | Collaboration |
| BR-094 (Notes scoped to candidate, visible across client apps) | BP-003 | Collaboration |
| BR-095 (Tags/flags agency-level configurable) | BP-004 | Collaboration |
| BR-096 (Tasks trigger in-app notifications to assignee) | BP-004 | Collaboration |

#### 1.2.17 Search & Filtering (BR-097 – BR-100) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-097 (Semantic search default for candidate discovery) | BP-002 | Search |
| BR-098 (Faceted filters narrow after semantic ranking) | BP-002 | Search |
| BR-099 (Saved searches with email alerts per recruiter) | BP-004 | Search |
| BR-100 (All search queries scoped to agency + active client) | BR-039 | Search |

#### 1.2.18 Notifications (BR-101 – BR-106) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-101 (In-app notifications delivered within 30s) | FR-034 | Notifications |
| BR-102 (Email notifications delivered within 60s) | FR-033 | Notifications |
| BR-103 (All notifications user-scoped and role-aware) | BR-038 | Notifications |
| BR-104 (Unread notification count tracked per user) | — | Notifications |
| BR-105 (Notification preferences configurable per user) | — | Notifications |
| BR-106 (Candidate-facing emails include agency branding) | FR-036 | Notifications |

#### 1.2.19 File Management (BR-107 – BR-110) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-107 (All uploaded files scanned for malware) | IR-008, CR-003 | File Management |
| BR-108 (File storage path includes agencyId/clientId) | BR-039 | File Management |
| BR-109 (File retention follows agency data retention policy) | BR-048 | File Management |
| BR-110 (Signed contracts/offer letters immutable once sent) | — | File Management |

#### 1.2.20 Reporting (BR-111 – BR-114) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-111 (Pipeline reports per-client with configurable date range) | BP-003 | Reporting |
| BR-112 (Bulk data export respects RBAC and tenant isolation) | BR-039 | Reporting |
| BR-113 (Scheduled reports emailed at configured time) | BP-003 | Reporting |
| BR-114 (GDPR data export completes within 72h) | CR-005 | Reporting |

#### 1.2.21 Observability (BR-115 – BR-118) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-115 (All services emit structured JSON logs with traceId) | NFR-014 | Observability |
| BR-116 (Health check endpoints for DB, AI, queue, cache) | NFR-014 | Observability |
| BR-117 (Alerting for error rate, latency, queue depth, AI cost) | NFR-014 | Observability |
| BR-118 (Distributed tracing propagated across all services) | NFR-014 | Observability |

#### 1.2.22 Queue & Background Jobs (BR-119 – BR-122) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-119 (AI parsing/matching jobs processed before translation/reporting) | NFR-008 | Queue Priority |
| BR-120 (Critical queues auto-scale workers under load) | NFR-008 | Queue Priority |
| BR-121 (Failed jobs retry: 3x exponential critical, 1x low) | NFR-013 | Queue Priority |
| BR-122 (Permanently failed critical jobs → admin alert) | NFR-014 | Queue Priority |

#### 1.2.23 Environment & Release (BR-123 – BR-126) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-123 (Production data never accessible in sandbox/dev) | CR-002, CR-007 | Environment |
| BR-124 (Staging uses anonymized production data) | — | Environment |
| BR-125 (Feature flags control gradual AI rollout) | BP-007 | Environment |
| BR-126 (Blue-green deployment ensures zero-downtime) | NFR-011 | Environment |

#### 1.2.24 Portal & Dashboard Architecture (BR-127 – BR-137) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-127 (Candidate portal requires auth via email link or SSO) | FR-037 | Portal |
| BR-128 (Candidates can only view/modify own application) | BR-039, FR-042 | Portal |
| BR-129 (Portal availability submissions trigger scheduling) | FR-011 | Portal |
| BR-130 (Portal UI rendered in candidate's preferred language) | FR-031 | Portal |
| BR-131 (All external APIs versioned at /api/v1/) | — | Architecture |
| BR-132 (WebSocket connections authenticated via JWT) | BR-042 | Architecture |
| BR-133 (AI services decoupled and independently deployable) | BP-007, BR-053 | Architecture |
| BR-134 (Circuit breaker per AI provider independently) | NFR-013 | Architecture |
| BR-135 (Rate limiting: 100 req/min/user, 10 uploads/min) | BR-046 | Architecture |
| BR-136 (Webhook delivery retries 3x with exponential backoff) | NFR-013 | Architecture |
| BR-137 (Internal service-to-service calls authenticated) | CR-001 | Architecture |

#### 1.2.25 Billing & Onboarding (BR-138 – BR-140) — New

| Business Rule | Mapped REQ IDs | Category |
|---------------|----------------|----------|
| BR-138 (AI credit budget per agency, resets monthly) | BP-007, CR-010 | Billing |
| BR-139 (Per-client allocations within agency budget) | BP-003, BP-007 | Billing |
| BR-140 (Usage metrics visible to Agency Admin in real-time) | BP-007 | Billing |

### 1.3 Use Cases → Requirements

#### 1.3.1 Candidate Sourcing & Matching (UC-001 – UC-004)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-001 (Search candidates across channels) | FR-001 | F-001 AI Sourcing |
| UC-002 (AI semantic matching) | FR-002 | F-001 AI Sourcing |
| UC-003 (Manual score override) | FR-003, FR-023 | F-001 AI Sourcing |
| UC-004 (Automated outreach) | FR-004 | F-001 AI Sourcing |

#### 1.3.2 CV Processing (UC-005 – UC-008)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-005 (Upload and parse CV) | FR-005, FR-006 | F-002 CV Screening |
| UC-006 (Manual field correction) | FR-006 | F-002 CV Screening |
| UC-007 (CV screening against job) | FR-007, FR-008 | F-002 CV Screening |
| UC-008 (Duplicate detection) | FR-009 | F-002 CV Screening |

#### 1.3.3 Interview Scheduling (UC-009 – UC-014)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-009 (Connect calendar) | FR-010 | F-003 Scheduling |
| UC-010 (Collect candidate availability) | FR-011 | F-003 Scheduling |
| UC-011 (Suggest optimal slots) | FR-013 | F-003 Scheduling |
| UC-012 (Schedule multi-round interview) | FR-014 | F-003 Scheduling |
| UC-013 (Reschedule interview) | FR-016 | F-003 Scheduling |
| UC-014 (Send reminders) | FR-015 | F-003 Scheduling |

#### 1.3.4 Assessment Scoring (UC-015 – UC-017)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-015 (Create MCQ assessment) | FR-018, FR-021 | F-004 Assessment |
| UC-016 (Take and auto-grade assessment) | FR-018, FR-019, FR-020, FR-022 | F-004 Assessment |
| UC-017 (Override assessment result) | FR-023 | F-004 Assessment |

#### 1.3.5 Pipeline Management (UC-018 – UC-020)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-018 (Configure pipeline stages) | FR-025 | F-005 Pipeline |
| UC-019 (Manage candidate pipeline) | FR-024, FR-026 | F-005 Pipeline |
| UC-020 (View pipeline dashboard) | FR-027 | F-005 Pipeline |

#### 1.3.6 Translation (UC-021 – UC-024)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-021 (Translate CV) | FR-028, FR-031, FR-032 | F-006 Translation |
| UC-022 (Translate interview feedback) | FR-029 | F-006 Translation |
| UC-023 (Translate job description) | FR-030 | F-006 Translation |
| UC-024 (Review low-confidence translations) | FR-032 | F-006 Translation |

#### 1.3.7 Notifications & Email (UC-025 – UC-027)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-025 (Candidate notification) | FR-033 | F-007 Email |
| UC-026 (Recruiter notification) | FR-034 | F-007 Email |
| UC-027 (Client progress report) | FR-035 | F-007 Email |

#### 1.3.8 Authentication & Security (UC-028 – UC-031)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-028 (Login with credentials) | FR-037 | F-008 RBAC |
| UC-029 (SSO login) | FR-038 | F-008 RBAC |
| UC-030 (MFA verification) | FR-039 | F-008 RBAC |
| UC-031 (Role-based access enforcement) | FR-040 | F-008 RBAC |

#### 1.3.9 Multi-Client Management (UC-032 – UC-033)

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-032 (Switch client context) | FR-043 | F-009 Multi-Client |
| UC-033 (Manage client account) | FR-044, FR-045 | F-009 Multi-Client |

#### 1.3.10 Candidate Portal & Timeline (UC-034 – UC-036) — New

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-034 (View candidate activity timeline) | FR-024, DR-007 | Candidate Portal |
| UC-035 (Add internal note to candidate) | FR-042 | Candidate Portal |
| UC-036 (View candidate portal as recruiter) | FR-037 | Candidate Portal |

#### 1.3.11 Search & Notifications (UC-037 – UC-038) — New

| Use Case | Mapped REQ IDs | Feature |
|----------|----------------|---------|
| UC-037 (Hybrid search with faceted filters) | FR-001, FR-002 | Search & Filtering |
| UC-038 (Respond to notification) | FR-033, FR-034 | Notification Center |

### 1.4 KPIs → Requirements

| KPI | Mapped REQ IDs | Business Objective |
|-----|----------------|-------------------|
| KPI-001 (Time-to-hire ≤ 25 days) | FR-010, FR-013 | BP-001 |
| KPI-002 (AI matching accuracy ≥ 85%) | FR-002, FR-003 | BP-002 |
| KPI-003 (CV parsing accuracy ≥ 90%) | FR-005, FR-006 | BP-002 |
| KPI-004 (Screening throughput < 15s) | NFR-002, NFR-003 | BP-007 |
| KPI-005 (Scheduling efficiency 60% reduction) | FR-013, FR-015, FR-016 | BP-004 |
| KPI-006 (Translation quality < 10% human review) | FR-032 | BP-005 |
| KPI-007 (Automation rate ≥ 60%) | FR-001, FR-004, FR-033, FR-034 | BP-004 |
| KPI-008 (System uptime 99.5%) | NFR-011 | BP-006 |
| KPI-009 (AI cost $500–$1,500/mo) | CR-010 | BP-007 |
| KPI-010 (Zero cross-client data leaks) | NFR-007, FR-042 | BP-003 |
| KPI-011 (Recruiter satisfaction ≥ 4.0/5.0) | — | BP-004 |
| KPI-012 (Client retention ≥ 90%) | FR-042, FR-045 | BP-003 |

### 1.5 Risks → Requirements

| Risk | Mapped REQ IDs | Business Objectives |
|------|----------------|-------------------|
| RSK-001 (AI provider outage) | NFR-013, FR-022 | BP-006, BP-007 |
| RSK-002 (AI accuracy below 85%) | FR-003, NFR-003 | BP-002 |
| RSK-003 (Data breach exposes PII) | CR-001, CR-002, CR-007 | BP-006 |
| RSK-004 (GDPR/CCPA non-compliance) | CR-005, FR-032 | BP-006 |
| RSK-005 (AI cost overruns) | CR-010, NFR-003 | BP-007 |
| RSK-006 (Low-quality translations) | FR-028, FR-032, FR-030 | BP-005 |
| RSK-007 (Cross-tenant data leak) | FR-042, NFR-007 | BP-003 |
| RSK-008 (Calendar integration failures) | FR-010, FR-016 | BP-001 |
| RSK-009 (Malicious file upload) | CR-003, IR-008 | BP-006 |
| RSK-010 (Recruiter resistance to AI) | FR-003, FR-022 | BP-004 |
| RSK-011 (BullMQ/Redis failure) | NFR-008, NFR-013 | BP-006 |
| RSK-012 (Multi-language support gaps) | FR-028, FR-032 | BP-005 |
| RSK-013 (Workflow engine misconfiguration) | FR-026, NFR-013 | BP-006 |
| RSK-014 (Notification overload) | FR-033, FR-034 | BP-004 |
| RSK-015 (Data retention purge deletes active data) | CR-006, CR-007 | BP-006 |

---

## 2. Reverse Traceability: Requirements → Business Artifacts

### 2.1 Requirements without Business Artifact Mapping

The following REQ-* have no direct mapping from a Business Policy, Rule, Use Case, KPI, or Risk in 03-business-definition.md v2.0.0. These may need business-level coverage or were addressed implicitly.

| REQ ID | Description | Status |
|--------|-------------|--------|
| FR-006 | CV structured field extraction (≥90%) | Covered indirectly via BR-020, KPI-003 |
| FR-007 | CV screening with vector similarity | Covered via BP-001, BP-002, BR-016 |
| FR-012 | Interviewer availability from calendar | Covered via UC-009 |
| FR-018 | MCQ assessment support | Covered via BR-025, UC-015, UC-016 |
| FR-019 | Predefined answer scoring | Covered via BR-025, UC-016 |
| FR-020 | Assessment score within 5s | Covered via BR-026 |
| FR-021 | Configurable pass/fail threshold | Covered via BR-027 |
| FR-035 | Client progress reports | Covered via BR-037, UC-027 |
| FR-036 | Email template with agency branding | Covered via BR-035, BR-036, BR-106 |
| FR-037 | Email/password authentication (bcrypt) | Covered via UC-028, BR-127 |
| FR-041 | JWT access/refresh tokens | Covered via BR-042, BR-132 |
| FR-042 | Cross-client data access denied by default | Covered via BR-039 |
| FR-043 | Switch client context | Covered via BR-040, UC-032 |
| DR-001 | Agency entity | — (implicit in multi-tenant model) |
| DR-002 | Recruiter entity | — (implicit in RBAC) |
| DR-003 | HiringCompany entity | — (implicit in multi-client) |
| DR-004 | Job entity | — (implicit in pipeline) |
| DR-005 | Candidate entity | — (implicit in CV parsing) |
| DR-006 | Application entity | — (implicit in pipeline stages) |
| DR-007 | Interview entity | — (implicit in scheduling) |
| DR-008 | Assessment entity | — (implicit in assessment scoring) |
| DR-009 | LocalizedContent entity | — (implicit in translation) |
| DR-010 | AIMatch entity | — (implicit in AI matching) |
| DR-011 | Agency 1:N relationships | — (data model foundation) |
| DR-012 | Recruiter N:M with HiringCompanies | — (covered via BR-040) |
| DR-014 | Child entities reference Application | — (data model foundation) |
| NFR-001 | Dashboard page load < 2s | — (performance target, no explicit BR) |
| NFR-006 | 500+ concurrent users | — (capacity target, no explicit BR) |
| NFR-009 | CDN for static assets | — (infrastructure, no explicit BR) |

### 2.2 Full Requirement-to-Artifact Index

| REQ ID | Business Policies | Business Rules | Use Cases | KPIs | Risks |
|--------|-------------------|----------------|-----------|------|-------|
| FR-001 | BP-001, BP-004 | — | UC-001 | KPI-007 | — |
| FR-002 | BP-001, BP-002 | — | UC-002 | KPI-002 | — |
| FR-003 | BP-002, BP-008 | BR-016, BR-017 | UC-003 | KPI-002 | RSK-010 |
| FR-004 | BP-004 | — | UC-004 | KPI-007 | — |
| FR-005 | — | — | UC-005 | KPI-003 | — |
| FR-006 | — | BR-020 | UC-005, UC-006 | KPI-003 | — |
| FR-007 | BP-001, BP-002 | — | UC-007 | — | — |
| FR-008 | BP-002, BP-008 | BR-019 | UC-007 | — | — |
| FR-009 | — | BR-001, BR-002, BR-070 | UC-008 | — | — |
| FR-010 | BP-001 | — | UC-009 | KPI-001 | RSK-008 |
| FR-011 | — | BR-129 | UC-010 | — | — |
| FR-012 | — | — | UC-009 | — | — |
| FR-013 | BP-001, BP-005 | BR-012, BR-013 | UC-011 | KPI-001, KPI-005 | — |
| FR-014 | — | — | UC-012 | — | — |
| FR-015 | BP-004 | BR-014 | UC-009, UC-014 | KPI-005 | — |
| FR-016 | BP-004 | BR-015 | UC-013 | KPI-005 | RSK-008 |
| FR-017 | BP-005 | BR-011 | — | — | — |
| FR-018 | — | BR-025 | UC-015, UC-016 | — | — |
| FR-019 | — | BR-025 | UC-016 | — | — |
| FR-020 | — | BR-026 | UC-016 | — | — |
| FR-021 | — | BR-027 | UC-015 | — | — |
| FR-022 | BP-002, BP-008 | BR-019 | UC-016 | — | RSK-001 |
| FR-023 | — | BR-023, BR-028, BR-074, BR-075 | UC-003, UC-017 | — | — |
| FR-024 | — | BR-007 | UC-019, UC-034 | — | — |
| FR-025 | — | BR-007, BR-008 | UC-018 | — | — |
| FR-026 | — | BR-009, BR-073 | UC-019 | — | — |
| FR-027 | — | — | UC-020 | — | — |
| FR-028 | BP-005 | BR-029, BR-031, BR-033, BR-060 | UC-021 | KPI-006 | RSK-006, RSK-012 |
| FR-029 | BP-005 | — | UC-022 | — | RSK-012 |
| FR-030 | BP-005 | BR-033 | UC-023 | — | RSK-006 |
| FR-031 | BP-005 | BR-030, BR-130 | UC-021 | — | — |
| FR-032 | BP-005 | BR-032, BR-084, BR-088 | UC-021, UC-024 | KPI-006 | RSK-004, RSK-006, RSK-012 |
| FR-033 | BP-004, BP-006 | BR-034, BR-077, BR-102 | UC-025, UC-038 | KPI-007 | — |
| FR-034 | — | BR-101 | UC-026, UC-038 | KPI-007 | — |
| FR-035 | — | BR-037, BR-113 | UC-027 | — | — |
| FR-036 | — | BR-035, BR-036, BR-106 | UC-025 | — | — |
| FR-037 | — | BR-127 | UC-028 | — | — |
| FR-038 | — | BR-041 | UC-029 | — | — |
| FR-039 | — | BR-041 | UC-030 | — | — |
| FR-040 | — | BR-038, BR-103 | UC-031 | — | — |
| FR-041 | — | BR-042, BR-132 | — | — | — |
| FR-042 | BP-003 | BR-004, BR-039, BR-065, BR-066, BR-067, BR-128 | UC-032, UC-033, UC-035 | KPI-010, KPI-012 | RSK-003, RSK-007 |
| FR-043 | BP-003 | BR-040, BR-133 | UC-032 | — | — |
| FR-044 | BP-003 | BR-005 | UC-033 | — | — |
| FR-045 | BP-003 | BR-008 | UC-033 | KPI-012 | — |
| NFR-001 | — | — | — | — | — |
| NFR-002 | — | BR-021 | — | KPI-004 | — |
| NFR-003 | BP-007 | BR-018, BR-062 | — | KPI-004 | RSK-002, RSK-005 |
| NFR-004 | — | BR-012, BR-026 | — | — | — |
| NFR-005 | BP-007 | BR-031, BR-060 | — | — | — |
| NFR-006 | BP-006 | — | — | — | — |
| NFR-007 | BP-003 | — | — | KPI-010 | RSK-007 |
| NFR-008 | — | BR-053, BR-119, BR-120 | — | — | RSK-011 |
| NFR-009 | — | — | — | — | — |
| NFR-010 | — | BR-058 | — | — | — |
| NFR-011 | BP-006 | BR-051, BR-126 | — | KPI-008 | — |
| NFR-012 | BP-006 | BR-052, BR-079 | — | — | — |
| NFR-013 | BP-007 | BR-022, BR-054, BR-076, BR-134, BR-136 | — | — | RSK-001, RSK-011 |
| NFR-014 | — | BR-055, BR-083, BR-115, BR-116, BR-117, BR-118 | — | — | — |
| DR-001 – DR-014 | (see §2.1) | — | — | — | — |
| IR-001 | — | — | — | — | — |
| IR-002 | — | — | UC-009 | — | — |
| IR-003 | — | — | UC-009 | — | — |
| IR-004 | BP-007 | BR-024 | — | — | RSK-001 |
| IR-005 | BP-007 | BR-024 | — | — | RSK-001 |
| IR-006 | — | — | — | — | — |
| IR-007 | — | — | — | — | — |
| IR-008 | BP-006, BP-007 | BR-045, BR-107 | — | — | RSK-009 |
| CR-001 | BP-006, BP-008 | BR-023, BR-043, BR-050, BR-137 | — | — | RSK-003 |
| CR-002 | BP-006 | BR-003, BR-050, BR-123 | — | — | RSK-003 |
| CR-003 | BP-006 | BR-044, BR-107 | — | — | RSK-009 |
| CR-004 | BP-006 | BR-046, BR-135 | — | — | — |
| CR-005 | BP-006, BP-008 | BR-049, BR-068, BR-081, BR-114 | — | — | RSK-004 |
| CR-006 | BP-006 | BR-048, BR-079 | — | — | — |
| CR-007 | BP-006, BP-008 | BR-047, BR-064, BR-071, BR-075, BR-078, BR-080, BR-083, BR-108, BR-123 | — | — | RSK-003 |
| CR-008 | BP-007 | BR-056 | — | — | — |
| CR-009 | BP-007 | BR-024 | — | KPI-009 | RSK-001, RSK-005 |
| CR-010 | BP-007 | BR-057, BR-069, BR-138, BR-139 | — | KPI-009 | RSK-005 |

---

## 3. Open Questions Traceability

Unresolved questions that require decisions before downstream REQ can be fully validated:

| Open Question | Status | Impacted REQ / Artifacts |
|---------------|--------|--------------------------|
| OQ-006: Batch translation support? | **Open** | FR-028, BR-031, BR-060, UC-021, queue design |
| OQ-007: AI-generated vs template outreach? | **Open** | FR-004, UC-004, content scope |
| OQ-008: Auto-merge vs flag-only dedup? | **Open** | FR-009, BR-002, BR-005, BR-070, data model |
| OQ-009: Candidate self-service portal? | **Partially resolved** | FR-011, FR-033, FR-037, UC-034–UC-036, frontend scope — basic portal defined in §17 |
| OQ-010: Assessment visibility (candidate vs recruiter)? | **Open** | FR-020, FR-022, UC-016, RBAC, BR-068 |
| OQ-011: Enterprise SLA tier (99.5% vs 99.9%)? | **Open** | NFR-011, BR-051, BR-126, infrastructure cost |
| OQ-012: Workflow rules editable via UI or config files? | **New** | BR-072, workflow engine, client self-service scope |
| OQ-013: Per-client AI credit allocation: hard-cap or soft-warn? | **New** | BR-069, BR-138, BR-139, billing UX |
| OQ-014: Candidate portal multi-language interface? | **New** | BR-130, FR-031, frontend localization scope |

---

## 4. Coverage Summary

| Artifact Type | Count | With ≥1 REQ Mapping | Coverage |
|---------------|-------|---------------------|----------|
| Business Policies (BP) | 8 | 8 | 100% |
| Business Rules (BR) | 140 | 137 | 98% (3 architecture/UX rules have no direct REQ) |
| Use Cases (UC) | 41 | 37 | 90% (4 partially implementation-UX: UC-034, UC-035, UC-036, UC-038) |
| KPIs | 12 | 11 | 92% (KPI-011 = survey-based) |
| Risks (RSK) | 15 | 15 | 100% |
| Functional Reqs (FR) | 45 | 45 | 100% |
| Non-Func Reqs (NFR) | 14 | 14 | 100% |
| Data Reqs (DR) | 14 | 2 direct (DR-011, DR-013) | 14% (rest implicit in data model) |
| Integration Reqs (IR) | 8 | 6 | 75% (IR-001, IR-006 implicit) |
| Constraint Reqs (CR) | 10 | 10 | 100% |

### Gaps Identified

- **DR-001 through DR-010**: Data entity definitions are foundational but lack explicit business rule linkage. Recommend adding data governance BRs for entity-level retention, backup frequency, and access audit rules.
- **NFR-001** (Dashboard page load <2s): No explicit BR — recommend adding a performance monitoring rule with SLA.
- **NFR-006** (500+ concurrent users): No explicit BR — recommend adding a capacity planning BR.
- **NFR-009** (CDN for static assets): Acceptable as an infrastructure guideline without formal BR.
- **BR-072, BR-074, BR-075, BR-104, BR-105, BR-110, BR-124, BR-131**: Architecture/UX rules that don not directly trace to a single REQ — these govern implementation patterns and are valid as standalone governance rules.
- **IR-001** (SendGrid/AWS SES): Implicit in UC-025 — add explicit email delivery SLA BR if needed.
- **IR-006** (External ATS P2): Deferred to Phase 2 — no business rule needed until then.
- **OQ-008** (dedup strategy) and **OQ-010** (assessment visibility): These open questions, if resolved, would strengthen FR-009 and FR-022 traceability respectively.

---

### Gaps Between v1.0.0 and v2.0.0 of Business Definition

The following REQ↔artifact mappings were **added or strengthened** in the v2.0.0 business definition rewrite:

| Change | Detail |
|--------|--------|
| +19 new BRs (BR-059 to BR-140) | AI governance, multi-client ownership, workflow engine, audit, human review, timeline, search, notifications, file management, reporting, observability, queue policy, environment, portal/dashboard, billing |
| +5 new UCs (UC-034 to UC-038) | Candidate activity timeline, internal notes, portal view, hybrid search, notification response |
| +3 new Risks (RSK-013 to RSK-015) | Workflow engine misconfiguration, notification overload, data retention purge |
| +4 new Open Questions (OQ-010 to OQ-014) | Assessment visibility, workflow UI, per-client AI credits, portal multilingual |
| +3 new BR-REQ links for FR-009 | BR-070 (cross-client dedup) added |
| +2 new BR-REQ links for FR-042 | BR-065, BR-066, BR-067, BR-128 (multi-client data ownership) |
| Expanded UC coverage | UC-014→FR-015 strengthened via BR-014; UC-034→FR-024/DR-007 new link |

---

*Generated: 2026-05-12 | Version: 2.0.0 | Sources: 01-requirement.md (v0.2.0), 02-requirement-definition.md (v0.1.0), 03-business-definition.md (v2.0.0), 04-llm-architecture-spec.md (v1.0.0)*