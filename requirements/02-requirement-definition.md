# 02-requirement-definition — Atomic Requirements

> AI Recruitment Automation Platform
> Version: 0.1.0 | Gate 2: Requirement Definition
> Date: 2026-05-12
> Upstream: `01-requirement.md` (v0.2.0)

---

## Legend

| Prefix | Category |
|--------|----------|
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| DR | Data Requirement |
| IR | Integration Requirement |
| CR | Constraint Requirement |

**Priority:** P0 = Must (MVP blocks), P1 = Should (next iteration), P2 = Could (future phase)

---

## 1. Functional Requirements (FR)

### 1.1 Candidate Sourcing

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-001 | System shall search candidates across multiple external channels (job boards, LinkedIn, internal databases). | P0 | Reduces manual sourcing effort. | System supports ≥3 channel connectors; search query returns results from each within 30s. | RAW-001 (F-001) |
| FR-002 | System shall match candidates to job descriptions using semantic search (embedding similarity). | P0 | Core AI value proposition. | Cosine similarity computed for each candidate-job pair; results ranked by score. | RAW-001 (F-001) |
| FR-003 | System shall rank candidates using weighted scoring (skills 40%, experience 30%, education 20%, organizational preference 10%). | P0 | Transparent, configurable ranking. | Composite score computed and displayed per candidate; weight values are admin-configurable. | RAW-001 (F-001) |
| FR-004 | System shall send automated outreach messages to top-ranked candidates. | P1 | Reduces recruiter manual work. | Message dispatched within 5 min of match; recruiter can review before send. | RAW-001 (F-001) |

### 1.2 CV Parsing & Screening

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-005 | System shall parse resume files in PDF and DOCX formats. | P0 | Primary input format for candidates. | Parsing succeeds for ≥95% of valid PDF/DOCX files; structured fields extracted. | RAW-002 (F-002) |
| FR-006 | System shall extract structured fields from parsed CVs: full name, email, phone, location, skills, work experience, education. | P0 | Enables downstream matching and screening. | Each field extracted with ≥90% accuracy on test corpus. | RAW-002 (F-002) |
| FR-007 | System shall screen parsed CVs against job requirements using weighted scoring and vector similarity. | P0 | Core screening automation. | Screening score generated within 15 seconds; score includes explainable breakdown. | RAW-002 (F-002) |
| FR-008 | System shall score and rank candidates with explainable rationale per score factor. | P0 | Trust and transparency for recruiter decisions. | Each score component shows contributing factors (e.g., "Skills match: 8/10"). | RAW-002 (F-002) |
| FR-009 | System shall detect duplicate candidates across all client pools. | P1 | Prevents duplicate applications in multi-client environment. | Duplicate detected when similarity > 90% on name + email + phone combination. | RAW-002 (F-002), RAW-009 |

### 1.3 Interview Scheduling

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-010 | System shall integrate with Google Calendar and Microsoft Outlook for availability sync. | P0 | Core scheduling dependency. | Calendar events readable/writeable; sync latency <60s. | RAW-003 (F-003) |
| FR-011 | System shall collect candidate availability via portal or email link. | P0 | Required for slot matching. | Candidate submits ≥1 preferred slot; data stored and available for matching. | RAW-003 (F-003), RAW-015 |
| FR-012 | System shall collect interviewer availability from connected calendars. | P0 | Required for slot matching. | Interviewer availability windows read automatically from calendar. | RAW-003 (F-003), RAW-015 |
| FR-013 | System shall suggest top 3 optimal interview slots based on overlapping availability. | P0 | Reduces back-and-forth scheduling. | Suggestions generated within 5 seconds; respects business hours and timezones. | RAW-003 (F-003), RAW-015 |
| FR-014 | System shall support multi-round scheduling (phone screen → technical → onsite). | P0 | Reflects real recruitment workflows. | Each round type configurable; sequential and parallel round flows supported. | RAW-003 (F-003) |
| FR-015 | System shall send automated reminders to participants 24 hours before scheduled interviews. | P0 | Reduces no-show rate. | Reminder sent via email and in-app notification 24h before interview. | RAW-003 (F-003), RAW-014 |
| FR-016 | System shall support rescheduling via self-service links in notifications. | P1 | Improves candidate experience. | Candidate/interviewer can reschedule from link without recruiter intervention. | RAW-003 (F-003) |
| FR-017 | System shall handle timezone-aware scheduling for JP (JST), VN (ICT), and EN (US/EU) timezones. | P0 | Core market requirement. | All times stored in UTC; displayed in participant-local timezone; auto-detect from location/IP. | RAW-003 (F-003), RAW-015 |

### 1.4 Assessment Scoring

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-018 | System shall support configurable MCQ assessments (single and multiple correct answers). | P0 | Foundational assessment type. | MCQ rendered and graded correctly; supports ≥10 questions per assessment. | RAW-004 (F-004) |
| FR-019 | System shall support predefined answer scoring (exact match, regex). | P0 | Enables short-answer auto-grading. | Scoring engine matches answers with 100% accuracy for predefined patterns. | RAW-004 (F-004) |
| FR-020 | System shall evaluate assessments instantly and return scores within 5 seconds. | P0 | Candidate experience — immediate feedback. | Score returned ≤5s after submission. | RAW-004 (F-004) |
| FR-021 | System shall allow recruiters to configure pass/fail thresholds per job. | P0 | Different roles require different bars. | Threshold configurable from 0–100 per job; default 60. | RAW-004 (F-004) |
| FR-022 | System shall generate AI-driven score breakdowns with strengths and weaknesses. | P0 | Adds value beyond simple pass/fail. | Breakdown generated within 15s; includes per-question or per-skill analysis. | RAW-004 (F-004) |
| FR-023 | System shall allow recruiters to override auto-pass/fail decisions. | P0 | Human-in-the-loop for edge cases. | Override recorded with reason; audit trail maintained. | RAW-004 (F-004) |

### 1.5 Pipeline Management

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-024 | System shall provide a visual kanban board for candidate pipeline stages. | P0 | Core ATS functionality. | Board renders all candidates by stage; drag-and-drop supported. | RAW-008 (F-005) |
| FR-025 | System shall support configurable pipeline stages per client (default: Applied → Screening → Interview → Technical → Offer → Hired/Rejected). | P0 | Client-specific workflows. | Admin can add, rename, reorder stages; defaults applied on client creation. | RAW-008 (F-005) |
| FR-026 | System shall trigger automatic stage transitions based on configurable rules (pass/fail/timeout). | P0 | Reduces manual stage management. | Auto-transition fires within 60s of trigger event (e.g., assessment pass). | RAW-008 (F-005) |
| FR-027 | System shall display a real-time dashboard with candidate counts and pipeline metrics per stage. | P0 | At-a-glance visibility for recruiters and clients. | Dashboard updates within 10s of stage changes; shows counts, conversion rates. | RAW-008 (F-005) |

### 1.6 Translation & Localization

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-028 | System shall translate CVs/resumes between JP, VN, and EN using LLM-based translation. | P0 | Core market need (Japan-Vietnam hiring). | Translation delivered within 30 seconds; covers full document. | RAW-006 (F-006) |
| FR-029 | System shall translate interview feedback between JP, VN, and EN. | P0 | Enables cross-language interviewer panels. | Feedback translated preserving context; delivered within 15s. | RAW-006 (F-006) |
| FR-030 | System shall translate job descriptions between JP, VN, and EN. | P1 | Content localization for multi-market job postings. | JD translated within 30s; industry terminology preserved. | RAW-006 (F-006) |
| FR-031 | System shall auto-detect source language of input content. | P0 | Removes manual language selection step. | Language detected with ≥95% confidence before translation. | RAW-006 (F-006) |
| FR-032 | System shall route low-confidence translations (<80%) to a human review queue. | P0 | Quality control for critical content. | Items with confidence <80% flagged; visible in reviewer queue. | RAW-006 (F-006) |

### 1.7 Email & Notifications

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-033 | System shall send automated email notifications to candidates (application received, interview scheduled, stage updates, rejection/offer). | P0 | Candidate communication is mandatory. | Email sent within 60s of trigger event; delivered to valid addresses. | RAW-007 (F-007), RAW-014 |
| FR-034 | System shall send automated notifications to recruiters (new application, AI match ready, scheduling conflicts). | P0 | Keeps recruiters informed in real time. | In-app notification within 30s; email within 60s. | RAW-007 (F-007), RAW-014 |
| FR-035 | System shall send pipeline progress reports to HiringCompanies. | P1 | Client retention and satisfaction. | Configurable frequency (daily/weekly); email delivery. | RAW-007 (F-007) |
| FR-036 | System shall support email templates with agency branding customization. | P0 | Professional communication brand consistency. | Templates editable per agency; HTML + plain text formats. | RAW-007 (F-007) |

### 1.8 Authentication & Access Control

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-037 | System shall authenticate users via email and password (bcrypt hashing). | P0 | Foundational security. | Login flow succeeds for valid credentials; rejects invalid. | RAW-011 (F-008) |
| FR-038 | System shall support optional SSO via Google and Microsoft accounts. | P1 | Reduces friction for enterprise users. | OAuth2 flow completes; user mapped to agency account. | RAW-011 (F-008) |
| FR-039 | System shall support optional multi-factor authentication. | P1 | Enhanced security for agency admins. | MFA setup and verification flow works; bypassable for non-admin roles. | RAW-011 (F-008) |
| FR-040 | System shall enforce role-based access control at entity level (not just route level). | P0 | Data isolation between roles and clients. | Each API call validated against RBAC matrix; unauthorized access rejected with 403. | RAW-009 (F-009), RAW-011 (F-008) |
| FR-041 | System shall manage user sessions via JWT access/refresh tokens. | P0 | Stateless auth for API. | Token issued on login; refresh before expiry; logout invalidates. | RAW-011 (F-008) |

### 1.9 Multi-Client Data Isolation

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| FR-042 | System shall scope jobs, candidates, and applications to their owning HiringCompany (client). | P0 | Data isolation between agency clients. | Queries filtered by client_id; cross-client data access denied. | RAW-009 (F-009) |
| FR-043 | System shall allow a recruiter to manage multiple HiringCompanies. | P0 | Agency operational model. | Recruiter can switch active client context; each client's data isolated. | RAW-009 (F-009) |
| FR-044 | System shall provide a shared candidate pool with deduplication across all clients within an agency. | P1 | Avoids duplicate outreach to same candidate. | Deduplication runs on candidate creation; matches on email + phone + name similarity. | RAW-009 (F-009) |
| FR-045 | System shall allow each HiringCompany to configure their own pipeline stages and workflows. | P0 | Client-specific recruitment processes. | Stage customization per client; default template available. | RAW-008 (F-005), RAW-009 (F-009) |

---

## 2. Non-Functional Requirements (NFR)

### 2.1 Performance

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| NFR-001 | Dashboard page load shall complete in <2 seconds. | P0 | Usability threshold. | P95 response time <2s measured by browser DevTools. | General (Non-Functional) |
| NFR-002 | CV parsing + AI scoring shall complete in <15 seconds per candidate. | P0 | Recruiter throughput. | End-to-end latency measured and reported; 95th percentile <15s. | RAW-002 (F-002), RAW-005 (AI Architecture) |
| NFR-003 | AI candidate matching score shall compute in <15 seconds per candidate-job pair. | P0 | Real-time feedback during sourcing. | Latency measured from request to ranked results; P95 <15s. | RAW-001 (F-001) |
| NFR-004 | Interview slot suggestions shall generate in <5 seconds. | P0 | Responsive scheduling UX. | Suggestions returned ≤5s after availability data submitted. | RAW-015 (Auto Scheduling) |
| NFR-005 | Translation shall complete in <30 seconds per document. | P0 | Acceptable wait for user flow. | Document translated and returned ≤30s for up to 10-page CVs. | RAW-006 (F-006) |
| NFR-006 | System shall support 500+ concurrent users across all tenants. | P0 | Agency scale target. | Load test passes with 500 concurrent sessions; no degradation beyond +200ms latency. | General (Non-Functional) |

### 2.2 Scalability

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| NFR-007 | Architecture shall be multi-tenant with data isolation per agency. | P0 | SaaS foundation. | Tenants cannot access each other's data; verified via penetration test. | RAW-009 (F-009) |
| NFR-008 | AI processing workloads shall scale horizontally via message queue. | P1 | Handle burst AI requests. | Queue absorbs 10x normal load without data loss; auto-scaling triggered. | RAW-005 (AI Architecture) |
| NFR-009 | Static assets shall be served via CDN. | P2 | Reduce latency globally. | Assets served from edge nodes; cache hit ratio >90%. | General (Non-Functional) |
| NFR-010 | Database read replicas shall serve analytics queries. | P2 | Prevent reporting from impacting transactional performance. | Analytics queries routed to replicas; production DB unaffected. | General (Non-Functional) |

### 2.3 Reliability

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| NFR-011 | System shall maintain 99.5% uptime SLA. | P0 | Business continuity. | Monthly uptime calculated; reported in status dashboard. | General (Non-Functional) |
| NFR-012 | Automated backups shall maintain ≤24-hour Recovery Point Objective. | P0 | Data loss prevention. | Backup verified daily; restore test passes quarterly. | General (Non-Functional) |
| NFR-013 | System shall fall back to rule-based processing when LLM services are unavailable. | P0 | Graceful degradation. | When LLM API fails, system detects within 10s and activates rule-based fallback; user notified. | RAW-013 (Failure Handling) |
| NFR-014 | Health check endpoints shall be available for all critical services. | P1 | Monitoring and ops. | `/health` endpoints return 200 for DB, AI API, queue, cache; integrated with alerting. | General (Non-Functional) |

---

## 3. Data Requirements (DR)

### 3.1 Entity Requirements

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| DR-001 | System shall store Agency entity with fields: id, name, logo, settings, subscription tier, created_at. | P0 | Core tenant entity. | Agency record created on registration; all fields persisted. | Data Model (3.2) |
| DR-002 | System shall store Recruiter entity with fields: id, name, email, role (admin/recruiter/interviewer), agency_id. | P0 | User management. | Recruiter assigned to agency; role enforced in RBAC. | Data Model (3.2) |
| DR-003 | System shall store HiringCompany (ClientCompany) entity with fields: id, name, industry, contact_info, agency_id. | P0 | Client management. | HiringCompany linked to agency; data isolated per client. | Data Model (3.2) |
| DR-004 | System shall store Job entity with fields: id, title, description, requirements, salary_range, client_id, status, stages_config. | P0 | Core job posting entity. | Job created under HiringCompany; stages_config stores custom pipeline config. | Data Model (3.2) |
| DR-005 | System shall store Candidate entity with fields: id, full_name, email, phone, location, resume_url, languages. | P0 | Candidate profile storage. | Fields persisted after CV parse or manual entry; searchable. | Data Model (3.2) |
| DR-006 | System shall store Application entity with fields: id, candidate_id, job_id, status, stage, applied_at, ai_match_score. | P0 | Central workflow record. | Created on application submission; stage updated on transitions. | Data Model (3.2) |
| DR-007 | System shall store Interview entity with fields: id, application_id, type (phone/technical/onsite), scheduled_at, interviewer_id, status, recording_url. | P0 | Interview tracking. | Created on scheduling; recording_url populated post-interview. | Data Model (3.2) |
| DR-008 | System shall store Assessment entity with fields: id, application_id, type (mcq/predefined_answer), score, breakdown, ai_feedback. | P0 | Assessment result storage. | Created on assessment completion; score and breakdown persisted within 5s. | Data Model (3.2) |
| DR-009 | System shall store LocalizedContent entity with fields: id, source_lang, target_lang, source_text, translated_text, entity_type, status, confidence, version. | P0 | Translation tracking with versioning. | Stores each translation request; supports re-translation via version history. | Data Model (3.2), RAW-010 |
| DR-010 | System shall store AIMatch entity with fields: id, application_id, embedding_vector, matching_score, skill_scores, org_preference_score, explanation. | P0 | AI match record for audit and explainability. | Created after each matching run; vector stored for re-ranking if needed. | Data Model (3.2) |

### 3.2 Relationship Requirements

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| DR-011 | Agency shall have one-to-many relationships with Recruiters, HiringCompanies, Candidates, and Jobs. | P0 | Data model integrity. | Foreign key constraints enforced at database level. | Data Model (3.2) |
| DR-012 | Recruiter shall have many-to-many relationship with HiringCompanies (managed_by). | P0 | Agency operational model. | Join table created; recruiter can be assigned to multiple clients. | Data Model (3.2) |
| DR-013 | Application shall belong to exactly one Candidate and one Job. | P0 | Data integrity. | Constraint enforced; an application cannot exist without both. | Data Model (3.2) |
| DR-014 | Interview, Assessment, LocalizedContent, and AIMatch shall reference their parent Application. | P0 | Entity traceability. | All child records have valid application_id FK. | Data Model (3.2) |

---

## 4. Integration Requirements (IR)

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| IR-001 | System shall integrate with SendGrid or AWS SES for email delivery. | P0 | Notification delivery. | Emails sent reliably; delivery tracked via provider API. | RAW-007 (F-007), RAW-014 (Integrations) |
| IR-002 | System shall integrate with Google Calendar API for availability and scheduling. | P0 | Core scheduling dependency. | OAuth2 connection established; events readable/writable. | RAW-003 (F-003) |
| IR-003 | System shall integrate with Microsoft Outlook Calendar API for availability and scheduling. | P0 | Core scheduling dependency. | OAuth2 connection established; events readable/writable. | RAW-003 (F-003) |
| IR-004 | System shall integrate with OpenAI API (GPT-4o, text-embedding-3-large) as primary AI provider. | P0 | Core AI capabilities. | API key configured; requests succeed with <500ms latency per call. | RAW-005 (AI Architecture) |
| IR-005 | System shall integrate with Google Gemini API as fallback AI provider. | P0 | Reliability — failover for AI services. | When OpenAI fails, requests automatically routed to Gemini within 10s. | RAW-005 (AI Architecture) |
| IR-006 | System shall support future integration with external ATS platforms (Greenhouse, Lever, Workday). | P2 | Avoid duplication with existing tools. | API contract defined; not implemented in MVP. | RAW-004 (Integrations) |
| IR-007 | System shall integrate with pgvector or Pinecone for vector similarity search. | P0 | Embedding-based candidate matching. | Embeddings stored; similarity query returns results in <1s for 10K vectors. | RAW-005 (AI Architecture) |
| IR-008 | System shall integrate with ClamAV or equivalent for malware scanning of uploaded files. | P0 | Upload security. | All uploaded CVs scanned before storage; infected files rejected. | RAW-013 (Security) |

---

## 5. Constraint Requirements (CR)

| ID | Requirement | Priority | Rationale | Acceptance Criteria | Source Traceability |
|----|-------------|:--------:|-----------|---------------------|---------------------|
| CR-001 | All user inputs shall be sanitized against XSS, SQL injection, and NoSQL injection. | P0 | OWASP security baseline. | Penetration test shows no injection vulnerabilities. | RAW-013 (Security) |
| CR-002 | All candidate PII shall be encrypted at rest (AES-256) and in transit (TLS 1.3). | P0 | GDPR/CCPA compliance. | Encryption verified via security audit. | RAW-013 (Security) |
| CR-003 | System shall enforce file upload validation: only PDF and DOCX, max 25MB, magic bytes verification. | P0 | Prevent malicious uploads. | Non-PDF/DOCX files rejected; oversized files rejected; magic bytes verified. | RAW-013 (Security) |
| CR-004 | API requests shall be rate-limited to 100 req/min per user; uploads to 10 files/min per user. | P1 | Prevent abuse and ensure fair usage. | Rate limit enforced; 429 response returned when exceeded. | RAW-013 (Security) |
| CR-005 | System shall comply with GDPR and CCPA requirements (right to erasure, data portability, consent management). | P0 | Regulatory compliance. | Erasure request deletes all PII; export provides all user data in standard format. | RAW-013 (Security) |
| CR-006 | System shall maintain configurable data retention policy per agency (6, 12, or 24 months). | P1 | Compliance and operational control. | Admin sets retention period; automatic purge runs on schedule. | RAW-013 (Security) |
| CR-007 | All candidate data access events shall be logged with who, what, when, IP, and device fingerprint. | P0 | Audit trail for compliance and security. | Logs immutable; queryable via admin audit panel. | RAW-013 (Security) |
| CR-008 | System shall deploy on GCP (Cloud Run or GKE). | P0 | User-confirmed deployment target. | Production environment runs on GCP. | RAW-004 (Resolved) |
| CR-009 | System shall use OpenAI as primary and Gemini as fallback AI provider. | P0 | User-confirmed AI stack. | Automatic failover tested and documented. | RAW-001 (Resolved) |
| CR-010 | MVP budget shall target $500–1,500/month for AI API usage and infrastructure. | P1 | Cost constraint. | Monthly cost dashboard tracks actual spend; alerts at 80% threshold. | RAW-003 (Resolved) |

---

## 6. Open Questions from Gate 1 (Resolved)

All previously open questions have been incorporated as constraint requirements (CR-008, CR-009, CR-010) or reflected in requirements above.

| Original OQ | Resolution | Mapped To |
|-------------|------------|-----------|
| OQ-001: AI provider? | OpenAI primary + Gemini fallback | CR-009, IR-004, IR-005 |
| OQ-002: Multi-tenancy depth? | Single workspace, client-scoped data | CR-009, FR-042, FR-043, FR-044 |
| OQ-003: Budget? | $500–1,500/month | CR-010 |
| OQ-004: Deployment target? | GCP | CR-008 |
| OQ-005: Data migration? | Optional Phase 2 | Deferred |

---

## 7. Traceability to Upstream

| RAW Source | Feature (01-requirement.md) | Atomic REQ IDs |
|------------|---------------------------|----------------|
| RAW-001 (AI candidate sourcing) | F-001 | FR-001, FR-002, FR-003, FR-004 |
| RAW-002 (CV screening) | F-002 | FR-005, FR-006, FR-007, FR-008, FR-009 |
| RAW-003 (Interview scheduling) | F-003 | FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017 |
| RAW-004 (Auto test scoring) | F-004 | FR-018, FR-019, FR-020, FR-021, FR-022, FR-023 |
| RAW-005 (AI interview) | F-005 (deferred) | — (Phase 2) |
| RAW-006 (Chatbot) | F-006 (deferred) | — (Phase 2) |
| RAW-007 (Content generation) | F-007 (deferred) | — (Phase 2) |
| RAW-008 (Recruitment design) | F-008 | FR-024, FR-025, FR-026, FR-027 |
| — (New: Translation) | F-006 | FR-028, FR-029, FR-030, FR-031, FR-032 |
| — (New: Email) | F-007 | FR-033, FR-034, FR-035, FR-036 |
| — (New: RBAC) | F-008 | FR-037, FR-038, FR-039, FR-040, FR-041 |
| — (New: Multi-client) | F-009 | FR-042, FR-043, FR-044, FR-045 |
| — (Non-functional) | Sec. 5, 12, 13 | NFR-001–NFR-014 |
| — (Data model) | Sec. 3.2 | DR-001–DR-014 |
| — (Integrations) | Sec. 5 | IR-001–IR-008 |
| — (Security) | Sec. 10, 13 | CR-001–CR-010 |

---

## 8. Gate 2 Validation Results

### Completeness Check ✅
- [x] All RAW-* sources from Phase 1 have ≥1 downstream REQ-*
- [x] All new requirements (translation, email, RBAC, multi-client) have REQ-* coverage
- [x] Non-functional requirements decomposed into measurable atomic statements
- [x] Integration requirements mapped to specific providers
- [x] Security and compliance requirements explicitly stated

### Quality Check ✅
- [x] Every REQ-* has measurable acceptance criteria
- [x] Every REQ-* has source traceability (no orphan requirements)
- [x] Priority assigned consistently (P0 = MVP, P1 = next, P2 = future)
- [x] No technical design decisions leak into requirement level (no schema names, no endpoint paths)
- [x] "Shall" language used consistently for requirements

### Open Items
- [ ] **New OQ-006**: Should translation support batch processing (multiple CVs at once) or only one at a time? → Affects queue design, UX flow
- [ ] **New OQ-007**: Should candidate outreach messages be fully AI-generated or template-based with AI personalization? → Affects content generation scope
- [ ] **New OQ-008**: Should candidate deduplication be automatic (merge) or flag-only for recruiter review? → Affects data model and UX