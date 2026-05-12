# 01-requirement — AI Recruitment Automation Platform

## Project Overview

**Name:** AI Recruitment Automation Platform  
**Type:** Web application (multi-tenant SaaS for recruitment agencies)  
**Status:** Requirements — Updated (Gate 2: System Design & LLM Architecture — Complete)  
**Date:** 2026-05-12  
**Author:** DuyMT (with user input)  
**Last Updated:** 2026-05-12  
**Architecture Spec:** [04-llm-architecture-spec.md](04-llm-architecture-spec.md)

---

## 1. Problem Statement

Recruitment agencies manually handle candidate sourcing, CV screening, interview scheduling, test scoring, and content generation — all time-consuming, error-prone, and inconsistent across clients. An automated recruitment platform is needed to streamline the end-to-end recruitment lifecycle, reduce time-to-hire, and improve candidate quality across multiple agency clients.

---

## 2. Target Users & Stakeholders

| Role | Description | Persona |
|------|-------------|---------|
| **Agency Admin** | Manages agency settings, clients, billing, and user permissions | Administrative decision-maker |
| **Recruiter** | Day-to-day operator: posts jobs, screens candidates, schedules interviews | Core workflow user |
| **Interviewer** | Conducts interviews (live or AI-assisted), reviews automated scores | Evaluation specialist |
| **Candidate (External)** | Job seeker interacting via portal and chatbot | End-user / applicant |
| **HiringCompany (Employer)** | Views pipeline dashboards, provides feedback, approves hires | Customer stakeholder |
| **Translator / Localizer** | Reviews AI-generated translations (JP/VN/EN) when needed | Content specialist |

---

## 3. Agency Data Model (NEW)

### 3.1 Entity Relationships

```
Agency
 ├── Recruiters (1:N)
 ├── ClientCompanies (1:N)
 ├── CandidatePools (1:N)
 └── Jobs (1:N)

ClientCompany
 ├── Jobs (1:N)
 ├── Candidates (1:N, via Application)
 └── AssignedRecruiters (N:M)

Recruiter ──┐
             ├── ClientCompany (N:M — recruiter manages multiple clients)
Candidate ───┘
     │
     ▼
  Application
     │
     ▼
  Interview → Assessment → Translation
     │
     ▼
  AI Match Score
```

### 3.2 Core Entities (Data Model)

| Entity | Key Fields |
|--------|------------|
| **Agency** | name, logo, settings, subscription tier, created_at |
| **Recruiter** | name, email, role (admin/recruiter/interviewer), agency_id |
| **ClientCompany** | name, industry, contact info, agency_id (foreign key) |
| **Job** | title, description, requirements, salary_range, client_id, status, stages_config |
| **Candidate** | full_name, email, phone, location, resume_url, languages |
| **Application** | candidate_id, job_id, status, stage, applied_at, ai_match_score |
| **Interview** | application_id, type (phone/technical/onsite), scheduled_at, interviewer_id, status, recording_url |
| **Assessment** | application_id, type (MCQ/coding/scenario), score, breakdown, ai_feedback |
| **LocalizedContent** | source_lang, target_lang, source_text, translated_text, entity_type (CV/feedback/JD), status, version |
| **AIMatch** | application_id, embedding_vector, matching_score, skill_scores, org_preference_score, explanation |

---

## 4. Core Features

### 4.1 MVP — P0 (Must Have)

#### F-001: AI Candidate Sourcing
- Multi-channel candidate search (job boards, LinkedIn, internal databases)
- Candidate matching using semantic search against job descriptions
- Ranking candidates based on weighted matching criteria (skills, experience, organizational preference signals)
- Automated outreach messaging to top candidates
- **AI Stack:** CV Parse → Embedding → Vector Search → Weighted Scoring → Match Score

#### F-002: CV Parsing & Screening
- Resume/CV parsing (PDF, DOCX)
- Structured data extraction (name, skills, experience, education)
- Screening using weighted scoring and vector similarity against job requirements
- Scoring and ranking with explainable rationale
- Duplicate detection across candidate pools
- **AI Stack:** Document parsing → Entity extraction → Semantic matching → Scoring

#### F-003: Interview Scheduling
- Calendar integration (Google Calendar, Outlook)
- Collect candidate and interviewer availability
- Suggest optimal interview slots with timezone support
- Multi-round scheduling (phone screen → technical → onsite)
- Automated reminders and rescheduling links
- Timezone-aware scheduling (JP/VN/EN timezones priority)

#### F-004: Assessment Scoring (Objective Only)
- **In MVP:** MCQ tests, predefined answer scoring, threshold-based pass/fail
- Instant results with score breakdown
- Configurable passing thresholds per job
- Recruiter override capability for edge cases
- **Not in MVP:** Coding judge, AI essay scoring, behavioral analysis

#### F-005: Pipeline Management
- Visual pipeline/kanban board with configurable stages
- **Default stages:** Applied → Screening → Interview → Technical → Offer → Hired / Rejected
- Customizable workflows per client
- Drag-and-drop stage configuration
- Automated stage transitions (pass/fail/timeout triggers)
- Dashboard with real-time pipeline metrics

#### F-006: Translation (JP/VN/EN)
- LLM-based translation for:
  - CVs and resumes
  - Interview feedback
  - Job descriptions
- Supported language pairs: Japanese ↔ Vietnamese ↔ English
- Human review queue for low-confidence translations
- Source language auto-detection

#### F-007: Email & Notifications
- Email system integration (SendGrid / AWS SES)
- Automated notifications:
  - Candidate: application received, interview scheduled, stage updates, rejection/offer
  - Recruiter: new application, AI match ready, scheduling conflicts
  - Client: pipeline progress reports
- Template-based email system with agency branding

#### F-008: RBAC & Authentication
- **Role-based access control (RBAC) matrix:**

| Permission | Agency Admin | Recruiter | Interviewer | Client |
|-----------|:---:|:---:|:---:|:---:|
| Create/edit/archive jobs | ✅ | ✅ (own clients) | ❌ | ❌ |
| View & manage candidates | ✅ | ✅ (assigned) | ✅ (assigned) | ✅ (own jobs) |
| Reject candidates | ✅ | ✅ | ❌ | ❌ |
| Approve offers | ✅ | ✅ | ❌ | ✅ |
| View salary info | ✅ | ✅ | ❌ | ✅ |
| Export CV | ✅ | ✅ | ❌ | ❌ |
| Manage users & roles | ✅ | ❌ | ❌ | ❌ |
| View analytics/dashboard | ✅ | ✅ | ❌ | ✅ |

- Email/password authentication with optional SSO (Google, Microsoft)
- Multi-factor authentication (optional)
- Session management with configurable timeouts

#### F-009: Data Isolation (Multi-Client)
- Recruiter manages multiple client companies
- Data isolation per client: jobs, candidates, applications are client-scoped
- Shared candidate pool across clients (with deduplication)
- Per-client pipeline stage configuration

---

### 4.2 Phase 1 — P1 (Next Iteration)

| Feature | Key Requirements |
|---------|-----------------|
| **Chatbot** | Candidate-facing for FAQ, application status, interview prep; internal recruiter chatbot; 24/7 with human handoff; multi-language (JP/VN/EN) |
| **AI Summaries** | Auto-generated candidate summaries, interview summaries, screening reports |
| **Advanced Analytics** | Recruitment metrics dashboard, time-to-hire tracking, source effectiveness, funnel conversion rates |
| **Reranking** | LLM-based reranking of candidates using full profile context (not MVP's weighted scoring) |

### 4.3 Phase 2 — P2 (Future)

| Feature | Key Requirements |
|---------|-----------------|
| **AI Interviewer** | Real-time AI-powered video/text interviews, question generation, sentiment analysis, scoring |
| **Content Generation** | AI-generated job descriptions, offer/rejection letters, social media posts |
| **Image Generation** | Branded recruitment graphics, social media visuals |
| **White-label SaaS** | Custom branding per agency, white-label portal for clients |
| **Event Sourcing** | Full audit trail with event sourcing architecture |

---

## 5. Integrations

| Integration | Provider | Priority | Purpose |
|-------------|----------|----------|---------|
| **Email System** | SendGrid or AWS SES | P0 | Candidate/recruiter/client notifications |
| **Calendar** | Google Calendar / Outlook | P0 | Interview scheduling & availability sync |
| **AI Provider** | **OpenAI (primary) + Gemini (fallback)** | P0 | CV parsing, matching, scoring, translation |
| **External ATS** | Greenhouse, Lever, Workday | P2 | Import/export candidate data |

---

## 6. AI Architecture (Clarified)

### 6.1 MVP AI Pipeline

```
Input: CV (PDF/DOCX) or Job Description
  │
  ├── 1. CV Parse ──→ Structured fields (skills, exp, education)
  │
  ├── 2. Embedding ──→ Vector representation of candidate/job
  │
  ├── 3. Vector Search ──→ Similarity matching
  │
  ├── 4. Weighted Scoring ──→ Composite score (skills: 40%, exp: 30%, edu: 20%, culture: 10%)
  │
  ├── 5. Optional Translation ──→ JP/VN/EN output
  └── 6. Optional Summarization ──→ Candidate profile summary
```

### 6.2 What is NOT in MVP
- ❌ Real-time AI interviewer
- ❌ Agentic AI workflows
- ❌ Advanced reranking orchestration
- ❌ AI essay scoring
- ❌ Behavioral analysis via video
- ❌ Coding judge (sandbox execution)

---

## 7. Auto Scheduling Logic

### 7.1 Availability Collection
- Candidate provides preferred time slots via portal/email link
- Interviewer sets availability windows in calendar
- System reads calendar events via OAuth API to detect conflicts

### 7.2 Slot Suggestion Algorithm
- Find overlapping availability across all participants
- Prioritize slots within 48h of request (fast scheduling)
- Respect timezone differences (JP = UTC+9, VN = UTC+7, EN = various)
- Avoid scheduling outside business hours (9:00–18:00 local per participant)
- Suggest top 3 options ranked by: urgency, participant preferences, travel time buffer

### 7.3 Timezone Support
- Store all times in UTC
- Display in participant-local timezone
- Auto-detect timezone from candidate location/IP
- Support JP (JST/UTC+9), VN (ICT/UTC+7), EN (US/EU timezones)

---

## 8. Assessment Scoring (Clarified)

### 8.1 MVP Scoping

| Test Type | In MVP? | Details |
|-----------|:-------:|---------|
| MCQ (single/multiple correct) | ✅ | Automated grading, 100% accuracy |
| Predefined answer matching | ✅ | Exact/regex match for short answers |
| Threshold pass/fail | ✅ | Configurable per job |
| Coding challenges | ❌ | Phase 2 — requires sandbox |
| AI essay scoring | ❌ | Phase 2 |
| Behavioral analysis | ❌ | Phase 2 |

### 8.2 Scoring Flow
1. Candidate completes assessment → Submission stored
2. Auto-grading engine evaluates MCQ/short answers → Instant score
3. Score vs threshold comparison → Pass/fail determination
4. AI-generated score breakdown (strengths/weaknesses) → Attached to application
5. Recruiter can override pass/fail decision

---

## 9. Pipeline Design Specification

### 9.1 Configurable Stages

| Stage ID | Default Name | Auto-Transition Rules |
|----------|-------------|----------------------|
| `applied` | Applied | On application submission |
| `screening` | Screening | Auto-move after CV parse + AI score |
| `interview` | Interview | If AI score ≥ threshold OR recruiter override |
| `technical` | Technical | If interview passed |
| `offer` | Offer | If technical assessment passed |
| `hired` | Hired | If offer accepted |
| `rejected` | Rejected | At any stage by recruiter decision or auto-fail |

### 9.2 Stage Configuration Per Client
- Clients can customize stage names, order, and auto-transition rules
- Default template provided for quick start
- Drag-and-drop reordering in UI
- Stage-level access control (who can move candidates between stages)

---

## 10. Security Requirements

### 10.1 Application Security

| Requirement | Detail |
|-------------|--------|
| **Upload validation** | File type whitelist (PDF, DOCX only for CVs), max size 25MB, magic bytes verification |
| **Malware scanning** | All uploaded files scanned with ClamAV or equivalent before storage |
| **Input sanitization** | All user inputs sanitized against XSS, SQL injection, NoSQL injection |
| **Rate limiting** | API: 100 req/min per user; Upload: 10 files/min per user |
| **Authentication** | JWT-based with refresh tokens, bcrypt password hashing |
| **Authorization** | RBAC per entity level, not just route level |

### 10.2 Data Security

| Requirement | Detail |
|-------------|--------|
| **Encryption at rest** | AES-256 for all candidate PII, resumes, and AI outputs |
| **Encryption in transit** | TLS 1.3 mandatory, HSTS enabled |
| **Audit logging** | All data access events logged: who, what, when, IP, device |
| **IP/device logging** | Track login IP, device fingerprint per session |
| **GDPR/CCPA compliance** | Right to erasure, data portability, consent management |
| **Data retention policy** | Configurable per agency: 6/12/24 months |

### 10.3 Infrastructure Security
- VPC isolation per environment (dev/staging/prod)
- Secrets managed via environment variables or secret manager (no hardcoded credentials)
- Regular dependency vulnerability scanning
- DDoS protection at edge (CloudFlare/AWS Shield)

---

## 11. User-facing Failure Handling

### 11.1 Failure Scenarios & UX

| Scenario | User Message | System Action |
|----------|-------------|---------------|
| **CV parse fails** | "We couldn't fully parse your resume. Please review the extracted fields below and correct any errors." | Show editable extracted fields, allow manual override, queue for retry |
| **AI service unavailable** | "Our AI service is temporarily busy. Your request has been queued and will be processed within 2 minutes." | Show estimated wait time, graceful degradation to rule-based processing |
| **Calendar sync fails** | "We couldn't connect to your calendar. Please check your connection and try again." | Retry with exponential backoff (3 attempts), manual schedule entry fallback |
| **Translation fails** | "Translation service is temporarily unavailable. Original text is displayed." | Fallback to source language, queue for retry, manual translation option |

### 11.2 General Failure Principles
- Always show the original data when AI services fail
- Never block the user — provide manual fallback for every automated step
- Log all failures with full context for debugging
- Retry with exponential backoff (max 3 attempts)
- Toast/notification for transient errors; inline error for persistent issues

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Metric | Target | Scope |
|--------|--------|-------|
| Page load | < 2 seconds | Dashboard views |
| CV parsing | < 10 seconds | Including AI analysis |
| AI matching score | < 15 seconds | Per candidate-job pair |
| Scheduling suggestions | < 5 seconds | Availability computation |
| Translation | < 30 seconds | Per document |
| Concurrent users | 500+ | All tenants combined |

### 12.2 Scalability
- Multi-tenant architecture with data isolation per agency
- Horizontal scaling for AI processing workloads via message queue
- CDN for static assets
- Database read replicas for analytics queries

### 12.3 Reliability
- 99.5% uptime SLA
- Automated backups with 24h RPO
- Fallback to rule-based processing when LLM services are unavailable
- Health check endpoints for all critical services

---

## 13. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS | SSR, API routes, strong typing, rapid styling |
| **Backend** | NestJS (Node.js) | Modular architecture, built-in validation, TypeScript |
| **Database** | PostgreSQL (primary), Redis (cache/sessions) | Relational integrity, caching layer |
| **AI Provider** | OpenAI (primary) + Gemini (fallback) | Balance of capability, cost, and reliability |
| **Vector DB** | pgvector or Pinecone | Embedding storage and similarity search |
| **File Storage** | S3-compatible (MinIO or AWS S3) | CV storage, recordings, media |
| **Auth** | NextAuth.js / Auth.js + RBAC | Multi-provider support, role management |
| **Queue** | BullMQ (Redis) | Async AI processing, email delivery |
| **Translation** | OpenAI GPT-4o / Gemini | High-quality JP/VN/EN translation |
| **Deployment** | **GCP** (Cloud Run / GKE) | User-confirmed preference |
| **Monitoring** | Sentry + custom logging | Error tracking, performance monitoring |

---

## 14. Open Questions — RESOLVED ✅

Previous open questions have been resolved based on user decisions:

| # | Question | Resolution | Date |
|---|----------|------------|------|
| OQ-001 | AI cloud provider? | **OpenAI (primary) + Gemini (fallback)** | 2026-05-12 |
| OQ-002 | Multi-tenancy depth? | **Single workspace with client-scoped data isolation** | 2026-05-12 |
| OQ-003 | Budget? | **~$500–1,500/month** (determines model selection, caching strategy) | 2026-05-12 |
| OQ-004 | Deployment target? | **GCP** (Cloud Run or GKE) | 2026-05-12 |
| OQ-005 | Existing data migration? | **Optional — Phase 2** | 2026-05-12 |

---

## 15. Success Criteria

- [ ] All P0 features functional in MVP (AI sourcing, CV parsing, scheduling, test scoring, pipeline, translation, email, RBAC)
- [ ] AI screening accuracy > 85% match rate vs manual recruiter assessment
- [ ] CV parsing accuracy > 90% for structured fields
- [ ] Interview scheduling time reduced by 60% vs manual process
- [ ] Translation quality: human review needed for < 10% of outputs
- [ ] End-to-end candidate pipeline visible within 5-minute onboarding
- [ ] Zero data breaches; GDPR compliance verified
- [ ] Support 3+ simultaneous agency tenants at launch
- [ ] Fallback to rule-based processing confirmed for all failure scenarios

---

## 16. Timeline

| Phase | Duration | Features | Milestone |
|-------|----------|----------|-----------|
| **Foundation** | 2–4 weeks | Auth, RBAC, data model, project setup, CI/CD | Working scaffold with database and auth |
| **MVP ATS + AI** | 2–4 months | AI sourcing, CV parsing, scheduling, auto test scoring (MCQ only), pipeline management, translation, email notifications | Core ATS with AI matching in production |
| **AI Automation** | Later phase | Chatbot, AI summaries, reranking, advanced analytics | Full AI automation layer |
| **P2 Features** | Post-MVP | AI interviewer, content/image generation, white-label SaaS, event sourcing | Full product suite |

### Recommended MVP Priority Order
1. **Week 1-2:** Foundation — Auth, RBAC, data model, project scaffolding
2. **Week 3-4:** Pipeline management + basic job/candidate CRUD
3. **Month 2:** CV parsing + AI matching (embedding + vector search + scoring)
4. **Month 3:** Auto scheduling + email notifications + translation
5. **Month 4:** Auto test scoring (MCQ) + dashboard + Polish

---

## 17. Next Steps

1. **Confirm resolved decisions** — Review and approve the 5 resolved open questions
2. **Create system design document** — Architecture diagram reflecting agency model, data model, and AI pipeline
3. **Define API contracts** — REST endpoints, WebSocket for real-time updates, AI service interfaces
4. **Database schema** — ERD for all entities with indexes and constraints
5. **UI/UX wireframes** — Aligned with reference image and updated MVP scope
6. **Sprint 1 planning** — Foundation: Auth + RBAC + Data model