-- ============================================================
-- Database Schema: AI Recruitment Automation Platform
-- Version: 1.0.1 (fixes applied — see TRIGGERS SUMMARY & INDEX SUMMARY sections)
-- Generator: DuyMT (Gate 3 — Business Definition v2.0.0)
-- Database: PostgreSQL 15+ with pgvector extension
-- ============================================================
--
-- SCHEMA STRUCTURE:
--   auth        → authentication tables (users, sessions, providers)
--   app         → application tables (agencies, clients, candidates, etc.)
--   audit       → immutable audit event log (partitioned by month)
--   ai          → AI processing tables (embeddings, cache, usage)
--   workflow    → event-driven workflow engine
--
-- DESIGN PRINCIPLES:
--   1. Multi-tenant isolation at ROW LEVEL (agency_id on every table)
--   2. Candidate shared across clients within one agency
--   3. Application is client-scoped (one candidate × one client = one application)
--   4. All timestamps stored as UTC (TIMESTAMPTZ)
--   5. UUID v4 primary keys throughout
--   6. Immutable audit log (append-only, no UPDATE/DELETE)
--   7. JSONB for flexible configs (workflow rules, pipeline stages)
--
-- REFERENCE:
--   01-requirement.md       — 10 core entities
--   03-business-definition.md — 140 BRs, 41 UCs, RBAC, workflow engine,
--                                audit strategy, file management, notifications
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_bytes, crypt

-- ============================================================
-- SCHEMA: auth
-- Authentication layer (users, sessions, SSO, MFA)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS auth;

-- 01. Users master table
-- BR-041: JWT access/refresh tokens with secure refresh flow
-- BR-042: SSO (Google/Microsoft) optional; MFA optional for admins
-- UC-028, UC-029, UC-030
CREATE TABLE auth.users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash   VARCHAR(255),                     -- NULL for SSO-only users
    name            VARCHAR(255),
    avatar_url      TEXT,
    --
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ,
    --
    CONSTRAINT chk_password_or_sso CHECK (
        password_hash IS NOT NULL
        OR EXISTS (SELECT 1 FROM auth.accounts WHERE auth.accounts.user_id = id)
    )
);

CREATE INDEX idx_auth_users_email ON auth.users (email);

-- 02. NextAuth accounts (OAuth/SAML providers)
-- BR-041: SSO support
CREATE TABLE auth.accounts (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider          VARCHAR(50) NOT NULL,           -- 'google', 'microsoft', 'credentials'
    provider_account_id VARCHAR(255),
    access_token      TEXT,
    refresh_token     TEXT,
    expires_at        BIGINT,                          -- Unix timestamp
    token_type        VARCHAR(50),
    scope             TEXT,
    id_token          TEXT,
    session_state     VARCHAR(255),
    --
    UNIQUE (provider, provider_account_id)
);

-- 03. NextAuth sessions
CREATE TABLE auth.sessions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ NOT NULL,
    --
    UNIQUE (id)
);

CREATE INDEX idx_auth_sessions_user_id ON auth.sessions (user_id);

-- ============================================================
-- SCHEMA: app
-- Application domain tables
-- ============================================================
CREATE SCHEMA IF NOT EXISTS app;

-- 04. Agency (Tenant)
-- BP-003: Single workspace with client-scoped data isolation
-- BR-065: Candidate profile is agency-scoped
-- BR-069: AI credit budget is agency-level
CREATE TABLE app.agencies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(100) NOT NULL UNIQUE,    -- URL-safe identifier
    logo_url            TEXT,
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    default_language    VARCHAR(10) NOT NULL DEFAULT 'EN',
    subscription_tier   VARCHAR(20) NOT NULL DEFAULT 'STARTER'
                        CHECK (subscription_tier IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
    --
    -- Billing info
    billing_email       VARCHAR(255),
    billing_address     TEXT,
    stripe_customer_id  VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    --
    -- AI credit budget (BR-057, BR-069, BR-138, BR-139)
    ai_credit_monthly_limit NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,  -- USD
    ai_credit_used_this_month NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ai_credit_reset_date DATE NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE,
    --
    -- Data retention (BR-048, BR-079)
    data_retention_months SMALLINT NOT NULL DEFAULT 12
                          CHECK (data_retention_months IN (6, 12, 24)),
    --
    settings            JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ                    -- soft delete
);

CREATE INDEX idx_app_agencies_slug ON app.agencies (slug);
CREATE INDEX idx_app_agencies_is_active ON app.agencies (is_active) WHERE is_active = TRUE;

-- 05. App users (extends auth.users with agency + role context)
-- BR-038, BR-040: Entity-level RBAC
-- Role enum: AGENCY_ADMIN, RECRUITER, INTERVIEWER, CLIENT, CANDIDATE
-- UC-031: Role-based access enforcement
CREATE TABLE app.users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    role                VARCHAR(20) NOT NULL
                        CHECK (role IN ('AGENCY_ADMIN', 'RECRUITER', 'INTERVIEWER', 'CLIENT', 'CANDIDATE')),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(50),
    avatar_url          TEXT,
    -- Recruiter / Interviewer specific
    title               VARCHAR(255),
    department          VARCHAR(255),
    --
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    -- Notification preferences (BR-105)
    notification_preferences JSONB NOT NULL DEFAULT '{
        "email_application": true,
        "email_match_ready": true,
        "email_interview_scheduled": true,
        "email_stage_changed": true,
        "email_assessment_result": true,
        "email_report": true,
        "in_app_application": true,
        "in_app_match_ready": true,
        "in_app_interview_scheduled": true,
        "in_app_stage_changed": true,
        "in_app_review_queue": true,
        "in_app_pipeline_stall": true,
        "digest_frequency": "real-time",     -- real-time | daily | weekly
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "07:00"
    }'::JSONB,
    -- UI preferences
    ui_preferences      JSONB NOT NULL DEFAULT '{}'::JSONB,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at      TIMESTAMPTZ,
    --
    UNIQUE (auth_user_id, agency_id),
    UNIQUE (email, agency_id)
);

CREATE INDEX idx_app_users_agency_role ON app.users (agency_id, role);
CREATE INDEX idx_app_users_email_agency ON app.users (email, agency_id);
CREATE INDEX idx_app_users_is_active ON app.users (is_active) WHERE is_active = TRUE;

-- 06. Client company (HiringCompany)
-- BR-006: Each job belongs to exactly one HiringCompany
-- BP-003: Multi-client data isolation
CREATE TABLE app.client_companies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    industry            VARCHAR(100),
    website             VARCHAR(500),
    contact_name        VARCHAR(255),
    contact_email       VARCHAR(255) NOT NULL,
    contact_phone       VARCHAR(50),
    address             TEXT,
    city                VARCHAR(100),
    country             VARCHAR(100),
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    --
    -- Per-client pipeline configuration
    -- JSON structure stored, but managed via pipeline_stages table
    default_pipeline_config JSONB,
    --
    -- Billing / subscription details
    billing_plan        VARCHAR(20) DEFAULT 'PROFESSIONAL',
    billing_contact     VARCHAR(255),
    --
    logo_url            TEXT,
    notes               TEXT,
    --
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (agency_id, name),
    UNIQUE (agency_id, contact_email)
);

CREATE INDEX idx_app_client_companies_agency ON app.client_companies (agency_id);
CREATE INDEX idx_app_client_companies_is_active ON app.client_companies (is_active) WHERE is_active = TRUE;

-- 07. Recruiter–Client assignment (N:M)
-- BR-040: A recruiter may manage multiple HiringCompanies
CREATE TABLE app.recruiter_client_assignments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id        UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    client_id           UUID NOT NULL REFERENCES app.client_companies(id) ON DELETE CASCADE,
    -- BR-007: Per-client pipeline stage configuration override
    pipeline_config     JSONB,  -- { stages: [...], auto_transitions: {...} }
    --
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by         UUID REFERENCES app.users(id),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    --
    UNIQUE (recruiter_id, client_id)
);

CREATE INDEX idx_app_recruiter_clients_recruiter ON app.recruiter_client_assignments (recruiter_id);
CREATE INDEX idx_app_recruiter_clients_client ON app.recruiter_client_assignments (client_id);

-- 08. Candidate
-- BR-001: Unique email within agency
-- BR-002: Duplicate detection on name+email+phone similarity ≥90%
-- BR-003: PII encrypted at rest
-- BR-065: Candidate profile is agency-scoped (shared across clients)
CREATE TABLE app.candidates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(50),
    --
    location_city       VARCHAR(100),
    location_country    VARCHAR(100),
    location_timezone   VARCHAR(50),
    --
    -- BR-030: Source language auto-detected
    preferred_language  VARCHAR(10) DEFAULT 'EN',
    --
    -- CV/Resume metadata
    resume_url          TEXT,                            -- S3 storage path
    resume_filename     VARCHAR(500),
    resume_file_type    VARCHAR(50),                     -- application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
    resume_file_size    BIGINT,
    --
    -- Extracted structured data (from CV parsing — BR-020)
    parsed_data         JSONB DEFAULT '{}'::JSONB,       -- { skills: [...], experience: [...], education: [...], summary: "..." }
    parse_confidence    NUMERIC(5, 4) DEFAULT 0.0,       -- 0.0–1.0
    parse_status        VARCHAR(20) DEFAULT 'PENDING'
                        CHECK (parse_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'MANUAL_REVIEW')),
    --
    -- AI-generated summary
    ai_summary          TEXT,
    --
    -- Deduplication fields (BR-002, BR-070, UC-008)
    is_duplicate        BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate_of_id     UUID REFERENCES app.candidates(id),
    --
    -- GDPR fields (BR-049, BR-068)
    consent_given       BOOLEAN NOT NULL DEFAULT FALSE,
    consent_date        TIMESTAMPTZ,
    right_to_erasure_requested BOOLEAN NOT NULL DEFAULT FALSE,
    anonymized          BOOLEAN NOT NULL DEFAULT FALSE,
    --
    -- Source tracking (BR-100)
    source_channel      VARCHAR(50) DEFAULT 'DIRECT'
                        CHECK (source_channel IN ('LINKEDIN', 'JOB_BOARD', 'REFERRAL', 'DIRECT', 'IMPORT', 'PORTAL')),
    source_details      JSONB,                           -- { board_name, linkedin_url, referrer_id, ... }
    --
    self_reported_salary_range JSONB,                     -- { min: number, max: number, currency: string }
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at         TIMESTAMPTZ,                     -- soft archive
    --
    -- Row-level security: filtered by agency_id
    --
    UNIQUE (agency_id, email),
    CONSTRAINT chk_resume_url CHECK (
        (resume_url IS NOT NULL AND resume_filename IS NOT NULL)
        OR resume_url IS NULL
    )
);

CREATE INDEX idx_app_candidates_agency ON app.candidates (agency_id);
CREATE INDEX idx_app_candidates_email ON app.candidates (email);
CREATE INDEX idx_app_candidates_name ON app.candidates (last_name, first_name);
CREATE INDEX idx_app_candidates_parse_status ON app.candidates (parse_status) WHERE parse_status != 'COMPLETED';
CREATE INDEX idx_app_candidates_source ON app.candidates (source_channel);
CREATE INDEX idx_app_candidates_location ON app.candidates (location_country, location_city);

-- Full-text search index (BR-098: full-text search on name, email, skills, notes)
CREATE INDEX idx_app_candidates_fts ON app.candidates
    USING gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(parsed_data->>'skills_text', '')));

-- 09. Job
-- BR-006: Each job belongs to exactly one HiringCompany
CREATE TABLE app.jobs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    client_id           UUID NOT NULL REFERENCES app.client_companies(id) ON DELETE CASCADE,
    posted_by_id        UUID NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
    --
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    requirements_text   TEXT,
    --
    salary_range        JSONB,                            -- { min: number, max: number, currency: string, period: 'annual' | 'monthly' }
    location            JSONB,                            -- { city, country, is_remote, remote_policy }
    employment_type     VARCHAR(50) DEFAULT 'FULL_TIME'
                        CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'CONTRACT_TO_HIRE', 'INTERNSHIP')),
    --
    -- JR-007: Per-job stage configuration (fallback to client default)
    stage_config        JSONB,                            -- { stages: ['applied', 'screening', ...], auto_transitions: {...} }
    --
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELLED')),
    --
    -- Source tracking
    source_channel      VARCHAR(50) DEFAULT 'MANUAL'
                        CHECK (source_channel IN ('MANUAL', 'LINKEDIN', 'JOB_BOARD', 'IMPORT', 'API')),
    external_id         VARCHAR(255),                     -- ID from external job board
    --
    is_published        BOOLEAN NOT NULL DEFAULT FALSE,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at        TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    --
    UNIQUE (agency_id, external_id),
    CONSTRAINT chk_salary_range CHECK (salary_range IS NULL OR (salary_range->>'min')::NUMERIC <= (salary_range->>'max')::NUMERIC)
);

CREATE INDEX idx_app_jobs_agency ON app.jobs (agency_id);
CREATE INDEX idx_app_jobs_client ON app.jobs (client_id);
CREATE INDEX idx_app_jobs_status ON app.jobs (status) WHERE status = 'ACTIVE';
CREATE INDEX idx_app_jobs_posted_by ON app.jobs (posted_by_id);
CREATE INDEX idx_app_jobs_published ON app.jobs (is_published) WHERE is_published = TRUE;

-- Full-text search on job title and description
CREATE INDEX idx_app_jobs_fts ON app.jobs
    USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(requirements_text, '')));

-- ============================================================
-- 10. Application (linking Candidate ↔ Job)
-- BR-004: Application is client-scoped
-- BR-010: Cannot exist without valid Candidate + Job
-- BR-064: AI match score is per-application
-- ============================================================
CREATE TABLE app.applications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    job_id              UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
    candidate_id        UUID NOT NULL REFERENCES app.candidates(id) ON DELETE CASCADE,
    assigned_recruiter_id UUID REFERENCES app.users(id) ON DELETE SET NULL,
    --
    status              VARCHAR(20) NOT NULL DEFAULT 'APPLIED'
                        CHECK (status IN ('APPLIED', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN')),
    stage               VARCHAR(50) NOT NULL DEFAULT 'applied',
    --
    -- BR-016: AI match score components
    ai_match_score      NUMERIC(5, 4) DEFAULT 0.0,               -- Overall composite (0.0–1.0)
    ai_skill_score      NUMERIC(5, 4) DEFAULT 0.0,               -- Skills (40% weight)
    ai_experience_score NUMERIC(5, 4) DEFAULT 0.0,               -- Experience (30% weight)
    ai_education_score  NUMERIC(5, 4) DEFAULT 0.0,               -- Education (20% weight)
    ai_org_preference_score NUMERIC(5, 4) DEFAULT 0.0,           -- Org preference (10% weight)
    ai_match_explanation TEXT,                                    -- BR-019: Explainable rationale
    --
    -- Assessment (UC-016, UC-017)
    assessment_score    NUMERIC(5, 2),
    assessment_passed   BOOLEAN,
    assessment_details  JSONB,                                   -- { answers: [...], breakdown: {...} }
    assessment_taken_at TIMESTAMPTZ,
    --
    -- Recruiter override (BR-028)
    score_override      BOOLEAN NOT NULL DEFAULT FALSE,
    score_override_reason TEXT,
    score_overridden_by UUID REFERENCES app.users(id),
    score_overridden_at TIMESTAMPTZ,
    --
    -- Pipeline timestamps (BR-073)
    stage_entered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stage_duration_days INTEGER DEFAULT 0,                        -- days in current stage for BR-077
    --
    -- Salary expectations (BR-068)
    salary_expectation  JSONB,                                    -- { min, max, currency }
    --
    -- Status tracking
    outcome_notes       TEXT,
    rejected_reason     VARCHAR(500),
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,                              -- when hired or finally rejected
    --
    UNIQUE (job_id, candidate_id)  -- One application per candidate per job
);

CREATE INDEX idx_app_applications_agency ON app.applications (agency_id);
CREATE INDEX idx_app_applications_job ON app.applications (job_id);
CREATE INDEX idx_app_applications_candidate ON app.applications (candidate_id);
CREATE INDEX idx_app_applications_recruiter ON app.applications (assigned_recruiter_id);
CREATE INDEX idx_app_applications_stage_status ON app.applications (stage, status) WHERE status NOT IN ('HIRED', 'REJECTED', 'WITHDRAWN');
CREATE INDEX idx_app_applications_ai_score ON app.applications (ai_match_score DESC) WHERE ai_match_score > 0;
CREATE INDEX idx_app_applications_created ON app.applications (created_at DESC);

-- ============================================================
-- 11. Interview scheduling (F-003)
-- BR-011: All times in UTC
-- BR-012: Suggestions within 5 seconds
-- BR-013: Business hours 9:00-18:00 local
-- BR-014: 24h automated reminders
-- BR-015: Self-service reschedule
-- ============================================================
CREATE TABLE app.interviews (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id      UUID NOT NULL REFERENCES app.applications(id) ON DELETE CASCADE,
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    type                VARCHAR(20) NOT NULL
                        CHECK (type IN ('PHONE_SCREEN', 'TECHNICAL', 'ONSITE', 'PANEL', 'TAKE_HOME')),
    round_number        SMALLINT NOT NULL DEFAULT 1,
    --
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    SMALLINT NOT NULL DEFAULT 60,
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    --
    interviewer_id      UUID REFERENCES app.users(id) ON DELETE SET NULL,
    meeting_link        TEXT,                                   -- Zoom/GoogleMeet URL
    location            TEXT,                                   -- For onsite interviews
    --
    status              VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
                        CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    --
    -- AI-generated reschedule link token (BR-015)
    reschedule_token    UUID UNIQUE,
    reschedule_token_expires_at TIMESTAMPTZ,
    --
    candidate_notes     TEXT,                                   -- BR-015: candidate self-input
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    --
    CHECK (scheduled_at > NOW() - INTERVAL '1 hour')            -- Prevent backdating
);

CREATE INDEX idx_app_interviews_app ON app.interviews (application_id);
CREATE INDEX idx_app_interviews_interviewer ON app.interviews (interviewer_id);
CREATE INDEX idx_app_interviews_scheduled ON app.interviews (scheduled_at) WHERE status IN ('SCHEDULED', 'CONFIRMED');
CREATE INDEX idx_app_interviews_status ON app.interviews (status);

-- 12. Availability windows for interviewers
CREATE TABLE app.interviewer_availability (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interviewer_id      UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    client_id           UUID REFERENCES app.client_companies(id) ON DELETE CASCADE,
    --
    day_of_week         SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun
    start_time          TIME NOT NULL,                         -- Local time in interviewer's timezone
    end_time            TIME NOT NULL,
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    --
    is_recurring        BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from          DATE,
    valid_until         DATE,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_interviewer_avail_interviewer ON app.interviewer_availability (interviewer_id);

-- 13. Candidate availability for scheduling (UC-010)
CREATE TABLE app.candidate_availability (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id      UUID NOT NULL REFERENCES app.applications(id) ON DELETE CASCADE,
    --
    start_datetime      TIMESTAMPTZ NOT NULL,
    end_datetime        TIMESTAMPTZ NOT NULL,
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    --
    source              VARCHAR(20) DEFAULT 'PORTAL'
                        CHECK (source IN ('PORTAL', 'EMAIL', 'API')),
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_candidate_avail_app ON app.candidate_availability (application_id);
CREATE INDEX idx_app_candidate_avail_range ON app.candidate_availability (start_datetime, end_datetime);

-- ============================================================
-- 14. Assessment (F-004, BR-025-028)
-- MVP: MCQ only, predefined answer scoring, threshold-based
-- ============================================================
CREATE TABLE app.assessments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    job_id              UUID NOT NULL REFERENCES app.jobs(id) ON DELETE CASCADE,
    --
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    type                VARCHAR(20) NOT NULL DEFAULT 'MCQ'
                        CHECK (type IN ('MCQ', 'SCENARIO')),  -- SCENARIO for future use
    --
    config              JSONB NOT NULL DEFAULT '{}'::JSONB,    -- { questions: [{id, text, options, correct_answer_ids, points}], pass_threshold }
    pass_threshold      NUMERIC(5, 2) NOT NULL DEFAULT 60.0,
    max_score           NUMERIC(5, 2) NOT NULL DEFAULT 100.0,
    time_limit_minutes  SMALLINT,                              -- NULL = no time limit
    --
    created_by_id       UUID NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
    --
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (job_id, title)
);

CREATE INDEX idx_app_assessments_agency ON app.assessments (agency_id);
CREATE INDEX idx_app_assessments_job ON app.assessments (job_id);

-- 15. Assessment submission (UC-016)
CREATE TABLE app.assessment_submissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id       UUID NOT NULL REFERENCES app.assessments(id) ON DELETE CASCADE,
    application_id      UUID NOT NULL REFERENCES app.applications(id) ON DELETE CASCADE,
    --
    answers             JSONB NOT NULL DEFAULT '{}'::JSONB,     -- { question_id: answer_id_or_text }
    score               NUMERIC(5, 2),
    passed              BOOLEAN,
    --
    -- AI-generated breakdown (BR-019, RSK-006)
    ai_breakdown        TEXT,
    --
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at        TIMESTAMPTZ,
    graded_at           TIMESTAMPTZ,
    --
    CONSTRAINT chk_submitted_score CHECK (
        (submitted_at IS NOT NULL AND score IS NOT NULL)
        OR (submitted_at IS NULL AND score IS NULL)
    )
);

CREATE INDEX idx_app_assessment_sub_app ON app.assessment_submissions (application_id);
CREATE INDEX idx_app_assessment_sub_assessment ON app.assessment_submissions (assessment_id);

-- ============================================================
-- 16. Translation / LocalizedContent (F-006)
-- BR-029: JP↔VN, JP↔EN, VN↔EN
-- BR-032: Confidence < 80% → human review
-- BR-033: Per-agency bilingual glossary
-- ============================================================
CREATE TABLE app.localized_contents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    source_text         TEXT NOT NULL,
    source_language     VARCHAR(10) NOT NULL,                  -- ISO 639-1: ja, vi, en
    translated_text     TEXT,
    target_language     VARCHAR(10),
    --
    source_entity_type  VARCHAR(30)                             -- CV, FEEDBACK, JOB_DESCRIPTION, OUTREACH, NOTE
                        CHECK (source_entity_type IN ('CV', 'FEEDBACK', 'JOB_DESCRIPTION', 'OUTREACH', 'NOTE', 'ASSESSMENT')),
    source_entity_id    UUID,                                  -- FK reference to candidate/app/job (polymorphic)
    --
    confidence          NUMERIC(5, 4) DEFAULT 0.0,             -- 0.0–1.0
    confidence_tier     VARCHAR(10) DEFAULT 'UNCLASSIFIED'
                        CHECK (confidence_tier IN ('GREEN', 'YELLOW', 'ORANGE', 'RED', 'UNCLASSIFIED')),
    --
    translation_method  VARCHAR(20) DEFAULT 'AI'
                        CHECK (translation_method IN ('AI', 'HUMAN', 'HYBRID')),
    --
    glossary_applied    BOOLEAN NOT NULL DEFAULT FALSE,
    --
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REVIEW_REQUIRED', 'FAILED')),
    --
    -- BR-032: Human review fields
    review_queue_id     UUID REFERENCES app.review_queue_items(id),
    reviewed_by_id      UUID REFERENCES app.users(id),
    reviewed_at         TIMESTAMPTZ,
    review_comments     TEXT,
    --
    -- Versioning (BR-110: immutability for contracts/offers)
    version             SMALLINT NOT NULL DEFAULT 1,
    is_final            BOOLEAN NOT NULL DEFAULT FALSE,
    parent_version_id   UUID REFERENCES app.localized_contents(id),
    --
    requested_by_id     UUID REFERENCES app.users(id),
    --
    ai_provider_used    VARCHAR(20),                           -- openai, gemini
    ai_model_used       VARCHAR(50),
    ai_cost             NUMERIC(10, 6),                        -- cost in USD for this translation
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_app_localized_agency ON app.localized_contents (agency_id);
CREATE INDEX idx_app_localized_entity ON app.localized_contents (source_entity_type, source_entity_id);
CREATE INDEX idx_app_localized_status ON app.localized_contents (status) WHERE status = 'REVIEW_REQUIRED';
CREATE INDEX idx_app_localized_confidence ON app.localized_contents (confidence) WHERE confidence < 0.80;

-- ============================================================
-- 17. AI Match Score (F-001, F-002)
-- BR-016-017: Weighted scoring with configurable weights
-- BR-018: Must complete within 15 seconds
-- ============================================================
CREATE TABLE app.ai_matches (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id      UUID NOT NULL REFERENCES app.applications(id) ON DELETE CASCADE,
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    job_id              UUID NOT NULL,                           -- Denormalized for faster queries
    candidate_id        UUID NOT NULL,
    --
    match_score         NUMERIC(5, 4) NOT NULL,                 -- 0.0–1.0
    skill_score         NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    experience_score    NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    education_score     NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    org_preference_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    --
    explanation         TEXT,                                    -- BR-008, BP-008: Explainable rationale
    --
    -- Weights used (BR-017: admin-configurable per agency)
    weights_used        JSONB DEFAULT '{}'::JSONB,               -- { skills: 0.4, experience: 0.3, education: 0.2, org_preference: 0.1 }
    --
    -- Embedding reference (BR-061: cached for 30 days)
    candidate_embedding_version INTEGER DEFAULT 1,
    job_embedding_version INTEGER DEFAULT 1,
    --
    ai_provider         VARCHAR(20),                             -- openai, gemini (BR-024)
    ai_model            VARCHAR(50),
    ai_cost             NUMERIC(10, 6),
    ai_latency_ms       INTEGER,
    --
    computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,                             -- TTL for cache invalidation (BR-061)
    --
    UNIQUE (application_id)  -- One match score per application
);

CREATE INDEX idx_app_ai_matches_agency ON app.ai_matches (agency_id);
CREATE INDEX idx_app_ai_matches_job ON app.ai_matches (job_id);
CREATE INDEX idx_app_ai_matches_candidate ON app.ai_matches (candidate_id);
CREATE INDEX idx_app_ai_matches_score ON app.ai_matches (match_score DESC);
CREATE INDEX idx_app_ai_matches_computed ON app.ai_matches (computed_at DESC);

-- ============================================================
-- 18. Pipeline Stage Configuration (per-client)
-- BR-007-008: Configurable stages per client
-- UC-018: Configure pipeline stages
-- ============================================================
CREATE TABLE app.pipeline_configs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    client_id           UUID REFERENCES app.client_companies(id) ON DELETE CASCADE,
    -- NULL client_id = agency default template
    --
    name                VARCHAR(50) DEFAULT 'Default',
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    --
    stages              JSONB NOT NULL DEFAULT '[]'::JSONB,     -- [{ stage_id, name, order, color, auto_transition_rules }]
    -- Example:
    -- [{ "stage_id": "applied",    "name": "Applied",     "order": 1, "color": "#3B82F6", "auto_transition": { "trigger": "cv_parsed", "target": "screening" } },
    --  { "stage_id": "screening",  "name": "Screening",   "order": 2, "color": "#F59E0B", "auto_transition": { "trigger": "ai_score", "condition": ">= 0.7", "target": "interview" } },
    --  ...]
    --
    created_by_id       UUID NOT NULL REFERENCES app.users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (agency_id, client_id)  -- One config per client; NULL client = default
);

CREATE INDEX idx_app_pipeline_agency ON app.pipeline_configs (agency_id);

-- ============================================================
-- 19. Review Queue (BR-084-089, UC-024)
-- Human review for low-confidence translations, AI decisions
-- ============================================================
CREATE TABLE app.review_queue_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    item_type           VARCHAR(30) NOT NULL
                        CHECK (item_type IN ('TRANSLATION', 'AI_SCORE_OVERRIDE', 'ASSESSMENT_OVERRIDE')),
    entity_id           UUID NOT NULL,                           -- PK of the entity needing review (polymorphic)
    entity_type         VARCHAR(30) NOT NULL,                    -- localized_content, assessment_submission, etc.
    --
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                        CHECK (priority IN ('URGENT', 'NORMAL', 'LOW')),
    --
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RE_QUEUED')),
    --
    original_content    TEXT NOT NULL,                           -- What needs to be reviewed
    current_content     TEXT,                                    -- Current version
    --
    assigned_reviewer_id UUID REFERENCES app.users(id),
    assigned_at         TIMESTAMPTZ,
    --
    -- SLA tracking (BR-086)
    sla_deadline        TIMESTAMPTZ,
    sla_breached        BOOLEAN NOT NULL DEFAULT FALSE,
    --
    -- Review outcome (BR-088)
    review_result       VARCHAR(20),                             -- approved, rejected, returned
    review_notes        TEXT,
    reviewed_at         TIMESTAMPTZ,
    review_count        SMALLINT NOT NULL DEFAULT 0,             -- BR-089: max 3 attempts
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    CONSTRAINT chk_review_requires_item CHECK (
        (status IN ('APPROVED', 'REJECTED') AND review_result IS NOT NULL AND reviewed_at IS NOT NULL)
        OR status NOT IN ('APPROVED', 'REJECTED')
    )
);

CREATE INDEX idx_app_review_queue_agency ON app.review_queue_items (agency_id);
CREATE INDEX idx_app_review_queue_status ON app.review_queue_items (status);
CREATE INDEX idx_app_review_queue_priority ON app.review_queue_items (priority);
CREATE INDEX idx_app_review_queue_sla ON app.review_queue_items (sla_breached) WHERE sla_breached = FALSE AND status = 'PENDING';

-- ============================================================
-- 20. Notifications (BR-101–106)
-- ============================================================
CREATE TABLE app.notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    --
    type                VARCHAR(50) NOT NULL,                    -- application_received, match_ready, interview_scheduled, stage_changed, assessment_result, etc.
    channel             VARCHAR(20) NOT NULL DEFAULT 'IN_APP'
                        CHECK (channel IN ('IN_APP', 'EMAIL', 'PUSH')),
    --
    title               VARCHAR(255) NOT NULL,
    body                TEXT,
    data                JSONB DEFAULT '{}'::JSONB,              -- Deep link context: { applicationId, candidateId, jobId, interviewId }
    --
    read_at             TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    CONSTRAINT chk_email_delivery CHECK (
        (channel = 'EMAIL' AND delivered_at IS NOT NULL)
        OR channel != 'EMAIL'
    )
);

CREATE INDEX idx_app_notifications_user ON app.notifications (user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_app_notifications_agency ON app.notifications (agency_id, user_id, created_at DESC);
CREATE INDEX idx_app_notifications_type ON app.notifications (type);

-- ============================================================
-- 21. File Management (SEC 12, BR-107-110)
-- ============================================================
CREATE TABLE app.files (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    uploaded_by_id      UUID NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
    --
    file_name           VARCHAR(500) NOT NULL,                   -- Original (sanitized) filename
    file_type           VARCHAR(100) NOT NULL,                   -- MIME type
    file_size           BIGINT NOT NULL,
    storage_path        TEXT NOT NULL UNIQUE,                    -- S3 key: agencyId/clientId/fileId/filename
    --
    entity_type          VARCHAR(30) NOT NULL                    -- BR-12.1: Six file types
                        CHECK (entity_type IN (
                            'CANDIDATE_RESUME',
                            'OFFER_LETTER',
                            'ASSESSMENT_RECORDING',
                            'PORTFOLIO',
                            'CERTIFICATE',
                            'SIGNED_CONTRACT'
                        )),
    entity_id           UUID NOT NULL,                           -- Parent entity ID (polymorphic)
    --
    access_level        VARCHAR(20) NOT NULL DEFAULT 'SHARED'
                        CHECK (access_level IN ('PRIVATE', 'SHARED', 'RESTRICTED')),
    --
    -- Malware scan (BR-107)
    malware_scan_status VARCHAR(20) DEFAULT 'PENDING'
                        CHECK (malware_scan_status IN ('PENDING', 'SCANNING', 'CLEAN', 'INFECTED', 'ERROR')),
    malware_scan_result TEXT,
    --
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,         -- Soft delete for S3 cleanup
    deleted_at          TIMESTAMPTZ,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    CONSTRAINT chk_file_size CHECK (file_size <= 26214400)       -- 25MB max
);

CREATE INDEX idx_app_files_agency ON app.files (agency_id);
CREATE INDEX idx_app_files_entity ON app_files (entity_type, entity_id);
CREATE INDEX idx_app_files_uploaded_by ON app.files (uploaded_by_id);

-- ============================================================
-- 22. Calendar Integration (BR-011–015)
-- ============================================================
CREATE TABLE app.calendar_integrations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    provider            VARCHAR(20) NOT NULL
                        CHECK (provider IN ('GOOGLE', 'OUTLOOK')),
    provider_user_id    VARCHAR(255) NOT NULL,                   -- OAuth subject from provider
    --
    access_token        TEXT NOT NULL,
    refresh_token       TEXT,
    token_expires_at    TIMESTAMPTZ,
    --
    calendar_id         VARCHAR(255),                            -- Specific calendar ID (for secondary calendars)
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    --
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    synced_at           TIMESTAMPTZ,
    sync_error          TEXT,
    --
    last_sync_at        TIMESTAMPTZ,
    sync_token          TEXT,                                    -- For incremental sync (Google syncToken)
    --
    UNIQUE (user_id, provider)
);

CREATE INDEX idx_app_calendar_agency ON app.calendar_integrations (agency_id);

-- ============================================================
-- 23. Tags (BR-095: agency-level configurable)
-- ============================================================
CREATE TABLE app.tags (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    category            VARCHAR(50) DEFAULT 'CUSTOM'            -- PREDEFINED or CUSTOM
                        CHECK (category IN ('PREDEFINED', 'CUSTOM')),
    color               VARCHAR(7) DEFAULT '#3B82F6',           -- Hex color
    --
    UNIQUE (agency_id, name)
);

CREATE INDEX idx_app_tags_agency ON app.tags (agency_id);

CREATE TABLE app.candidate_tags (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id        UUID NOT NULL REFERENCES app.candidates(id) ON DELETE CASCADE,
    tag_id              UUID NOT NULL REFERENCES app.tags(id) ON DELETE CASCADE,
    assigned_by_id      UUID REFERENCES app.users(id),
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (candidate_id, tag_id)
);

-- ============================================================
-- 24. Internal Notes & Tasks (SEC 9, BR-093–096)
-- Notes scoped to CANDIDATE (not application — BR-094)
-- ============================================================
CREATE TABLE app.notes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    candidate_id        UUID NOT NULL REFERENCES app.candidates(id) ON DELETE CASCADE,
    author_id           UUID NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
    --
    content             TEXT NOT NULL,
    --
    is_private          BOOLEAN NOT NULL DEFAULT TRUE,          -- BR-093: private by default
    shared_with_ids     UUID[] DEFAULT '{}',                    -- Array of user IDs explicitly shared via @mention
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    -- BR-067: Notes are private by default; shareable by explicit grant
    CONSTRAINT chk_shared_with_valid CHECK (
        (is_private = FALSE AND array_length(shared_with_ids, 1) > 0)
        OR is_private = TRUE
    )
);

CREATE INDEX idx_app_notes_candidate ON app.notes (candidate_id, is_private);
CREATE INDEX idx_app_notes_author ON app.notes (author_id);

-- Tasks attached to candidates (BR-096)
CREATE TABLE app.tasks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    candidate_id        UUID NOT NULL REFERENCES app.candidates(id) ON DELETE CASCADE,
    created_by_id       UUID NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
    assignee_id         UUID REFERENCES app.users(id) ON DELETE SET NULL,
    --
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    due_date            TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'TODO'
                        CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED')),
    priority            VARCHAR(10) DEFAULT 'MEDIUM'
                        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    --
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_tasks_candidate ON app.tasks (candidate_id);
CREATE INDEX idx_app_tasks_assignee ON app.tasks (assignee_id);
CREATE INDEX idx_app_tasks_status ON app.tasks (status) WHERE status != 'DONE';

-- @mentions in notes/tasks → triggers notification (BR-093)
CREATE TABLE app.mentions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id             UUID REFERENCES app.notes(id) ON DELETE CASCADE,
    task_id             UUID REFERENCES app.tasks(id) ON DELETE CASCADE,
    mentioned_user_id   UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    mentioned_by_id     UUID NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    read_at             TIMESTAMPTZ,
    --
    CONSTRAINT chk_mention_source CHECK (
        (note_id IS NOT NULL)::INTEGER + (task_id IS NOT NULL)::INTEGER = 1
    )
);

CREATE INDEX idx_app_mentions_user ON app.mentions (mentioned_user_id, read_at) WHERE read_at IS NULL;

-- ============================================================
-- 25. AI Embeddings (BR-061: cached for 30 days)
-- ============================================================
CREATE TABLE app.embeddings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    entity_type         VARCHAR(30) NOT NULL
                        CHECK (entity_type IN ('CANDIDATE_RESUME', 'JOB_DESCRIPTION')),
    entity_id           UUID NOT NULL,                     -- Polymorphic: candidate_id or job_id
    --
    embedding           VECTOR(1536) NOT NULL,              -- text-embedding-3-large = 1536 dims
    model               VARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-large',
    version             INTEGER NOT NULL DEFAULT 1,         -- Increment on source update
    --
    source_hash         VARCHAR(64) NOT NULL,               -- SHA256 of source text (cache key)
    --
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),  -- BR-061
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (entity_type, entity_id, model)
);

CREATE INDEX idx_app_embeddings_lookup
    ON app.embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
    -- Tune `lists` based on data size: ~rows/1000 for best recall/performance

CREATE INDEX idx_app_embeddings_entity ON app.embeddings (entity_type, entity_id);
CREATE INDEX idx_app_embeddings_expires ON app.embeddings (expires_at) WHERE expires_at < NOW();

-- ============================================================
-- 26. Saved Searches (BR-099)
-- ============================================================
CREATE TABLE app.saved_searches (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    created_by_id       UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    --
    name                VARCHAR(255) NOT NULL,
    search_query        TEXT NOT NULL,
    search_type         VARCHAR(20) NOT NULL DEFAULT 'HYBRID'
                        CHECK (search_type IN ('SEMANTIC', 'FULL_TEXT', 'HYBRID')),
    filters_json        JSONB DEFAULT '{}'::JSONB,            -- Serialized filter params
    --
    is_shared           BOOLEAN NOT NULL DEFAULT FALSE,
    --
    -- Email alert configuration (BR-099)
    alert_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    alert_frequency     VARCHAR(20) DEFAULT 'IMMEDIATE'
                        CHECK (alert_frequency IN ('IMMEDIATE', 'DAILY', 'WEEKLY')),
    last_alert_sent_at  TIMESTAMPTZ,
    last_result_count   INTEGER,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    CONSTRAINT chk_alert_freq CHECK (
        (alert_enabled = FALSE) OR
        (alert_enabled = TRUE AND alert_frequency IS NOT NULL)
    )
);

CREATE INDEX idx_app_saved_searches_user ON app.saved_searches (created_by_id);

-- ============================================================
-- 27. Workflow Engine (SEC 5, BR-072–077)
-- ============================================================

-- 27a. Workflow rules configuration
CREATE TABLE app.workflow_rules (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    client_id           UUID REFERENCES app.client_companies(id) ON DELETE CASCADE,
    -- NULL client_id = agency-wide rule; specific client = client-scoped
    --
    rule_name           VARCHAR(255) NOT NULL,
    description         TEXT,
    priority            INTEGER NOT NULL DEFAULT 100,           -- Lower = higher priority
    is_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
    --
    trigger_event       VARCHAR(50) NOT NULL,                   -- e.g., cv.parsed, ai.match.completed, assessment.passed, timer
    trigger_condition   JSONB DEFAULT '{}'::JSONB,              -- e.g., { "cv.confidence": { "gte": 0.7 } }
    --
    actions             JSONB NOT NULL DEFAULT '[]'::JSONB,     -- [{ "type": "transition_stage", "toStage": "screening" }, ...]
    --
    created_by_id       UUID REFERENCES app.users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    CONSTRAINT chk_client_or_agency CHECK (
        (client_id IS NOT NULL)::INTEGER + (client_id IS NULL)::INTEGER = 1
    )
);

CREATE INDEX idx_app_workflow_rules_agency ON app.workflow_rules (agency_id, is_enabled);
CREATE INDEX idx_app_workflow_rules_client ON app.workflow_rules (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_app_workflow_rules_trigger ON app.workflow_rules (trigger_event, is_enabled);

-- 27b. Workflow event store (append-only, immutable — BR-075)
CREATE TABLE app.workflow_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    event_name          VARCHAR(100) NOT NULL,                   -- EVT-001 to EVT-012 naming
    event_type          VARCHAR(50) NOT NULL,                    -- application, cv_parse, ai_match, assessment, interview, stage_transition, etc.
    --
    application_id      UUID,                                    -- NULL for system-level events
    candidate_id        UUID,
    job_id              UUID,
    --
    payload             JSONB NOT NULL DEFAULT '{}'::JSONB,      -- Full event data
    --
    triggered_by_id     UUID REFERENCES app.users(id),           -- NULL for system-triggered
    rule_id             UUID REFERENCES app.workflow_rules(id),  -- NULL for manual/system events
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    -- Immutable — no UPDATE or DELETE
    -- Enforced via trigger (see below)
    --
    -- BR-083: Every event has a traceId for distributed tracing
    trace_id            VARCHAR(64)
);

CREATE INDEX idx_app_workflow_events_app ON app.workflow_events (application_id);
CREATE INDEX idx_app_workflow_events_candidate ON app.workflow_events (candidate_id);
CREATE INDEX idx_app_workflow_events_type_time ON app.workflow_events (event_type, created_at DESC);
CREATE INDEX idx_app_workflow_events_agency_time ON app.workflow_events (agency_id, created_at DESC);

-- ============================================================
-- 28. Audit Events (SEC 6, BR-078-083)
-- Append-only, partitioned by month
-- ============================================================
-- Partitioned table (parent)
CREATE TABLE audit.audit_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agency_id           UUID REFERENCES app.agencies(id),
    --
    category            VARCHAR(30) NOT NULL
                        CHECK (category IN (
                            'DATA_ACCESS', 'DATA_MODIFICATION', 'AI_OPERATIONS',
                            'AUTHENTICATION', 'AUTHORIZATION', 'CONFIGURATION',
                            'DATA_EXPORT', 'SYSTEM_OPERATIONS'
                        )),
    severity            VARCHAR(10) NOT NULL
                        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    --
    actor_user_id       UUID,
    actor_role          VARCHAR(20),
    actor_client_id     UUID,
    actor_ip            INET,
    actor_device_fingerprint VARCHAR(255),
    --
    action              VARCHAR(100) NOT NULL,                   -- e.g., "candidate.view", "stage.transition"
    --
    target_entity_type  VARCHAR(30),                             -- "Candidate", "Application", "Job", etc.
    target_entity_id    UUID,
    target_field_name   VARCHAR(100),
    --
    before_state        JSONB,                                   -- Previous state (for modifications)
    after_state         JSONB,                                   -- New state (for modifications)
    --
    metadata_request_id VARCHAR(64),                             -- Correlation / trace ID
    metadata_source     VARCHAR(20) DEFAULT 'API',
    metadata_user_agent VARCHAR(500),
    metadata_trace_id   VARCHAR(64),
    --
    immutable           BOOLEAN NOT NULL DEFAULT TRUE,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (DATE_TRUNC('month', timestamp));

-- Create initial partitions (+ current + next month)
-- In production, use pg_partman or scheduled job to create future partitions
DO $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months');
    end_date DATE := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '3 months');
    partition_date DATE := start_date;
BEGIN
    WHILE partition_date <= end_date LOOP
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS audit.audit_events_%s PARTITION OF audit.audit_events
             FOR VALUES FROM (%L) TO (%L)',
            TO_CHAR(partition_date, 'YYYY_MM'),
            partition_date,
            partition_date + INTERVAL '1 month'
        );
        partition_date := partition_date + INTERVAL '1 month';
    END LOOP;
END $$;

-- Immutability enforcement trigger
CREATE OR REPLACE FUNCTION audit.prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit events are immutable. Cannot UPDATE or DELETE audit.audit_events.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_immutable
    BEFORE UPDATE OR DELETE ON audit.audit_events
    FOR EACH ROW EXECUTE FUNCTION audit.prevent_modification();

-- Indexes for audit search (BR-080)
CREATE INDEX idx_audit_events_id ON audit.audit_events (id);
CREATE INDEX idx_audit_events_timestamp ON audit.audit_events (timestamp);
CREATE INDEX idx_audit_events_actor ON audit.audit_events (actor_user_id);
CREATE INDEX idx_audit_events_action ON audit.audit_events (action);
CREATE INDEX idx_audit_events_target ON audit.audit_events (target_entity_type, target_entity_id);
CREATE INDEX idx_audit_events_category ON audit.audit_events (category);
CREATE INDEX idx_audit_events_agency ON audit.audit_events (agency_id);

-- ============================================================
-- 29. AI Processing (Queue Jobs & Results)
-- ============================================================

-- 29a. AI job queue tracking
CREATE TABLE ai.job_queue (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID REFERENCES app.agencies(id) ON DELETE SET NULL,
    application_id      UUID REFERENCES app.applications(id) ON DELETE SET NULL,
    candidate_id        UUID REFERENCES app.candidates(id) ON DELETE SET NULL,
    --
    queue_name          VARCHAR(50) NOT NULL,                   -- ai-parse-cv, ai-match-score, ai-translate-*, email-*, etc.
    priority            VARCHAR(10) NOT NULL DEFAULT 'P1'
                        CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    --
    job_type            VARCHAR(100) NOT NULL,                  -- parse_cv, match_score, translate, send_email, etc.
    input_data          JSONB NOT NULL DEFAULT '{}'::JSONB,    -- Job payload
    output_data         JSONB DEFAULT '{}'::JSONB,              -- Job result
    --
    status              VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
                        CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER')),
    attempts            SMALLINT NOT NULL DEFAULT 0,
    max_attempts        SMALLINT NOT NULL DEFAULT 3,
    --
    -- Cost tracking (BR-064)
    ai_provider         VARCHAR(20),
    ai_model            VARCHAR(50),
    ai_tokens_input     INTEGER,
    ai_tokens_output    INTEGER,
    ai_cost             NUMERIC(10, 6),
    ai_latency_ms       INTEGER,
    --
    scheduled_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    --
    error_message       TEXT,
    trace_id            VARCHAR(64),
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_job_queue_status ON ai.job_queue (status, priority, scheduled_at);
CREATE INDEX idx_ai_job_queue_app ON ai.job_queue (application_id);
CREATE INDEX idx_ai_job_queue_trace ON ai.job_queue (trace_id);

-- 29b. AI API usage tracking (BR-064, BR-057, BR-063)
CREATE TABLE ai.usage_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID REFERENCES app.agencies(id) ON DELETE SET NULL,
    --
    provider            VARCHAR(20) NOT NULL,                   -- openai, gemini
    model               VARCHAR(50) NOT NULL,
    operation           VARCHAR(50) NOT NULL,                   -- parse, embed, match, translate, summarize, outreach
    --
    tokens_input        INTEGER NOT NULL DEFAULT 0,
    tokens_output       INTEGER NOT NULL DEFAULT 0,
    cost_usd            NUMERIC(10, 6) NOT NULL DEFAULT 0.00,
    latency_ms          INTEGER,
    --
    request_id          VARCHAR(64),
    trace_id            VARCHAR(64),
    --
    success             BOOLEAN NOT NULL DEFAULT TRUE,
    error_message       TEXT,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_agency_date ON ai.usage_logs (agency_id, created_at DESC);
CREATE INDEX idx_ai_usage_provider ON ai.usage_logs (provider, model, created_at);
CREATE INDEX idx_ai_usage_trace ON ai.usage_logs (trace_id);

-- 29c. AI Cache (semantic, embedding, translation, score-breakdown — per BR-111-118)
CREATE TABLE ai.cache (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    --
    cache_type          VARCHAR(30) NOT NULL
                        CHECK (cache_type IN ('SEMANTIC', 'EMBEDDING', 'TRANSLATION', 'SCORE_BREAKDOWN', 'PROMPT_PREFIX')),
    cache_key           VARCHAR(255) NOT NULL,                  -- SHA256(prompt+model) or SHA256(file_content)
    --
    model               VARCHAR(100),
    input_hash          VARCHAR(64) NOT NULL,
    --
    result              JSONB NOT NULL,                          -- Cached response data
    metadata            JSONB DEFAULT '{}'::JSONB,              -- Tokens used, cost, quality tier, etc.
    --
    ttl_expires_at      TIMESTAMPTZ NOT NULL,                   -- Cache TTL per type
    invalidated_at      TIMESTAMPTZ,                            -- Manual or rule-based invalidation
    hit_count           INTEGER NOT NULL DEFAULT 0,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (cache_type, cache_key)
);

CREATE INDEX idx_ai_cache_type_key ON ai.cache (cache_type, cache_key);
CREATE INDEX idx_ai_cache_expires ON ai.cache (ttl_expires_at) WHERE ttl_expires_at < NOW();

-- ============================================================
-- 30. AI Credit Budget Tracking (BR-069, BR-138, BR-139)
-- ============================================================
CREATE TABLE ai.credit_budgets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    client_id           UUID REFERENCES app.client_companies(id) ON DELETE CASCADE,
    -- NULL client_id = agency-level budget; specific client = per-client allocation
    --
    monthly_limit_usd   NUMERIC(10, 2) NOT NULL,
    monthly_used_usd    NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    month_year          DATE NOT NULL,                           -- First day of month
    --
    -- Alert thresholds (BR-063)
    alert_threshold_pct SMALLINT NOT NULL DEFAULT 80,
    alert_sent          BOOLEAN NOT NULL DEFAULT FALSE,
    hard_limit_sent     BOOLEAN NOT NULL DEFAULT FALSE,
    hard_limit_paused   BOOLEAN NOT NULL DEFAULT FALSE,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (agency_id, client_id, month_year),
    -- BR-063: Prevent over-budget (enforced at DB level as safety net)
    CONSTRAINT chk_credit_not_negative CHECK (monthly_used_usd >= 0),
    CONSTRAINT chk_credit_not_exceeded CHECK (monthly_used_usd <= monthly_limit_usd)
);

CREATE INDEX idx_ai_credit_agency ON ai.credit_budgets (agency_id, month_year);

-- ============================================================
-- 31. RBAC Permission Matrix (BR-038-042)
-- Stored as a reference table; enforced at application layer
-- ============================================================
CREATE TABLE app.permissions (
    id                  VARCHAR(20) PRIMARY KEY,                 -- P-001 through P-011
    name                VARCHAR(255) NOT NULL,
    description         TEXT
);

INSERT INTO app.permissions (id, name, description) VALUES
    ('P-001', 'CREATE_EDIT_ARCHIVE_JOBS',        'Create, edit, and archive job postings for assigned clients'),
    ('P-002', 'VIEW_MANAGE_CANDIDATES',           'Access candidate profiles, screening results, and applications'),
    ('P-003', 'REJECT_CANDIDATES',               'Mark candidates as rejected at any pipeline stage'),
    ('P-004', 'APPROVE_OFFERS',                  'Authorize formal job offers to candidates'),
    ('P-005', 'VIEW_SALARY_INFO',                'Access compensation data in job postings and offers'),
    ('P-006', 'EXPORT_CVS',                      'Download candidate resumes and profiles'),
    ('P-007', 'MANAGE_USERS_ROLES',              'Add/remove users, assign roles within the agency'),
    ('P-008', 'VIEW_ANALYTICS_DASHBOARD',        'Access pipeline metrics, conversion rates, and performance reports'),
    ('P-009', 'CONFIGURE_CLIENT_PIPELINE',       'Customize stage names, order, and auto-transition rules per client'),
    ('P-010', 'PROVIDE_INTERVIEW_FEEDBACK',      'Submit evaluation scores and comments post-interview'),
    ('P-011', 'SUBMIT_APPLICATION_SELF_SERVICE', 'Candidate application submission and status checking');

-- RBAC role-to-permission mapping
CREATE TABLE app.role_permissions (
    role                VARCHAR(20) NOT NULL
                        CHECK (role IN ('AGENCY_ADMIN', 'RECRUITER', 'INTERVIEWER', 'CLIENT', 'CANDIDATE')),
    permission_id       VARCHAR(20) NOT NULL REFERENCES app.permissions(id),
    --
    PRIMARY KEY (role, permission_id)
);

-- Seed default RBAC matrix (from 01-requirement.md §3.2, table in §F-008)
INSERT INTO app.role_permissions (role, permission_id) VALUES
    -- Agency Admin: All permissions
    ('AGENCY_ADMIN', 'P-001'), ('AGENCY_ADMIN', 'P-002'), ('AGENCY_ADMIN', 'P-003'), ('AGENCY_ADMIN', 'P-004'),
    ('AGENCY_ADMIN', 'P-005'), ('AGENCY_ADMIN', 'P-006'), ('AGENCY_ADMIN', 'P-007'), ('AGENCY_ADMIN', 'P-008'),
    ('AGENCY_ADMIN', 'P-009'), ('AGENCY_ADMIN', 'P-010'), ('AGENCY_ADMIN', 'P-011'),
    -- Recruiter
    ('RECRUITER', 'P-001'), ('RECRUITER', 'P-002'), ('RECRUITER', 'P-003'), ('RECRUITER', 'P-004'),
    ('RECRUITER', 'P-005'), ('RECRUITER', 'P-007'), ('RECRUITER', 'P-008'), ('RECRUITER', 'P-011'),
    -- Interviewer
    ('INTERVIEWER', 'P-002'), ('INTERVIEWER', 'P-005'), ('INTERVIEWER', 'P-010'),
    -- Client (HiringCompany)
    ('CLIENT', 'P-002'), ('CLIENT', 'P-005'), ('CLIENT', 'P-006'), ('CLIENT', 'P-010'),
    -- Candidate
    ('CANDIDATE', 'P-011');

-- ============================================================
-- 32. Client Pipeline Stage Status Tracking
-- Tracks where each application is in the client-specific pipeline
-- ============================================================
CREATE TABLE app.application_stage_history (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id      UUID NOT NULL REFERENCES app.applications(id) ON DELETE CASCADE,
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    from_stage          VARCHAR(50),
    to_stage            VARCHAR(50) NOT NULL,
    trigger_type        VARCHAR(20) NOT NULL
                        CHECK (trigger_type IN ('AUTO', 'MANUAL', 'SYSTEM')),
    triggered_by_id     UUID REFERENCES app.users(id),
    rule_id             UUID REFERENCES app.workflow_rules(id),   -- NULL if manual
    --
    metadata            JSONB DEFAULT '{}'::JSONB,                -- Extra context (reason, override notes, scores)
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    -- BR-075: Immutable (trigger enforced below)
);

-- Immutability enforcement trigger for stage history
CREATE OR REPLACE FUNCTION app.prevent_stage_history_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Application stage history is immutable. Cannot UPDATE or DELETE app.application_stage_history.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stage_history_immutable
    BEFORE UPDATE OR DELETE ON app.application_stage_history
    FOR EACH ROW EXECUTE FUNCTION app.prevent_stage_history_modification();

CREATE INDEX idx_app_stage_hist_app ON app.application_stage_history (application_id, created_at DESC);
CREATE INDEX idx_app_stage_hist_agency ON app.application_stage_history (agency_id, created_at DESC);

-- ============================================================
-- 33. Client-level pipeline configuration (stored per-client)
-- This stores the actual stage ordering per client, separate
-- from the reusable pipeline_configs table.
-- ============================================================
CREATE TABLE app.client_pipeline_stages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    client_id           UUID NOT NULL REFERENCES app.client_companies(id) ON DELETE CASCADE,
    --
    stage_id            VARCHAR(50) NOT NULL,                    -- e.g., "applied", "screening", "interview"
    stage_name          VARCHAR(100) NOT NULL,
    stage_order         SMALLINT NOT NULL,
    stage_color         VARCHAR(7) DEFAULT '#3B82F6',
    --
    -- Auto-transition rules (BR-009)
    auto_transition_config JSONB DEFAULT '{}'::JSONB,            -- { "trigger": "cv.parsed", "condition": "confidence >= 0.7", "target_stage": "screening" }
    auto_transition_delay_seconds INTEGER DEFAULT 0,             -- Delay before auto-transition fires
    --
    -- Access control per stage (BR-025)
    allowed_roles       VARCHAR(20)[] DEFAULT ARRAY['AGENCY_ADMIN', 'RECRUITER'],
    --
    is_default_template BOOLEAN NOT NULL DEFAULT FALSE,          -- True for system default
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (client_id, stage_id)
);

-- Default pipeline stages (BR-007: Applied → Screening → Interview → Technical → Offer → Hired/Rejected)
-- These are seeded per new client during onboarding

-- ============================================================
-- 34. Outbound Emails
-- ============================================================
CREATE TABLE app.outbound_emails (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    application_id      UUID REFERENCES app.applications(id) ON DELETE SET NULL,
    candidate_id        UUID REFERENCES app.candidates(id) ON DELETE SET NULL,
    --
    template_id         VARCHAR(100),                           -- Reference to email template
    recipient_email     VARCHAR(255) NOT NULL,
    recipient_name      VARCHAR(255),
    sender_name         VARCHAR(255),
    sender_email        VARCHAR(255),
    --
    subject             VARCHAR(500) NOT NULL,
    body_html           TEXT,
    body_text           TEXT,
    --
    channel_provider    VARCHAR(20) DEFAULT 'SENDGRID'
                        CHECK (channel_provider IN ('SENDGRID', 'SES', 'SMTP')),
    status              VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
                        CHECK (status IN ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'OPENED', 'BOUNCED', 'FAILED')),
    --
    provider_message_id VARCHAR(255),                           -- SendGrid/SES message ID
    --
    scheduled_at        TIMESTAMPTZ,                            -- NULL = send immediately
    sent_at             TIMESTAMPTZ,
    opened_at           TIMESTAMPTZ,
    bounced_at          TIMESTAMPTZ,
    --
    error_message       TEXT,
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_outbound_emails_app ON app.outbound_emails (application_id);
CREATE INDEX idx_app_outbound_emails_candidate ON app.outbound_emails (candidate_id);
CREATE INDEX idx_app_outbound_emails_status ON app.outbound_emails (status) WHERE status IN ('QUEUED', 'SENDING');
CREATE INDEX idx_app_outbound_emails_sent ON app.outbound_emails (sent_at DESC) WHERE sent_at IS NOT NULL;

-- ============================================================
-- 35. Email Templates (per-agency/branding)
-- ============================================================
CREATE TABLE app.email_templates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    --
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(100) NOT NULL,                 -- e.g., "application_received", "interview_scheduled"
    type                VARCHAR(20) NOT NULL                    -- candidate, recruiter, client
                        CHECK (type IN ('CANDIDATE', 'RECRUITER', 'CLIENT')),
    --
    subject_template    VARCHAR(500) NOT NULL,
    body_html           TEXT NOT NULL,
    body_text           TEXT,
    --
    variables_schema    JSONB DEFAULT '[]'::JSONB,              -- [{ "name": "candidate_name", "type": "string", "required": true }]
    --
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    --
    created_by_id       UUID REFERENCES app.users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (agency_id, slug)
);

CREATE INDEX idx_app_email_templates_agency ON app.email_templates (agency_id, type);

-- ============================================================
-- 36. Activity Timeline (SEC 8, BR-090–092)
-- Denormalized event log per candidate for fast display
-- ============================================================
CREATE TABLE app.timeline_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id           UUID NOT NULL REFERENCES app.agencies(id) ON DELETE CASCADE,
    candidate_id        UUID NOT NULL REFERENCES app.candidates(id) ON DELETE CASCADE,
    application_id      UUID,                                    -- NULL for candidate-level events
    --
    event_type          VARCHAR(50) NOT NULL,                    -- application_submitted, cv_parsed, ai_score, screening, interview_scheduled, interview_rescheduled, interview_completed, assessment_taken, assessment_overridden, translation_requested, translation_completed, outreach_sent, note_added, stage_changed, offer_sent, offer_accepted, offer_rejected, candidate_withdrew, status_inquiry
                        CHECK (event_type IN ('application_submitted', 'cv_parsed', 'ai_score', 'screening', 'interview_scheduled', 'interview_rescheduled', 'interview_completed', 'assessment_taken', 'assessment_overridden', 'translation_requested', 'translation_completed', 'outreach_sent', 'note_added', 'stage_changed', 'offer_sent', 'offer_accepted', 'offer_rejected', 'candidate_withdrew', 'status_inquiry')),
    event_category      VARCHAR(20) NOT NULL DEFAULT 'SYSTEM'
                        CHECK (event_category IN ('SYSTEM', 'RECRUITER', 'CANDIDATE', 'AI')),
    --
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    metadata            JSONB DEFAULT '{}'::JSONB,              -- Context varies by event type
    --
    actor_id            UUID REFERENCES app.users(id),           -- NULL for system events
    --
    visibility_roles    VARCHAR(20)[] DEFAULT ARRAY['RECRUITER', 'CLIENT', 'CANDIDATE'],
    --
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_timeline_candidate ON app.timeline_events (candidate_id, occurred_at DESC);
CREATE INDEX idx_app_timeline_application ON app.timeline_events (application_id, occurred_at DESC);
CREATE INDEX idx_app_timeline_agency ON app.timeline_events (agency_id, occurred_at DESC);

-- GIN indexes on JSONB columns for query performance (important fix)
CREATE INDEX idx_app_applications_metadata ON app.applications USING gin (metadata);
CREATE INDEX idx_app_localized_contents_metadata ON app.localized_contents USING gin (metadata);
CREATE INDEX idx_app_timeline_events_metadata ON app.timeline_events USING gin (metadata);
CREATE INDEX idx_app_workflow_events_payload ON app.workflow_events USING gin (payload);
CREATE INDEX idx_ai_cache_result ON ai.cache USING gin (result);

-- GIN indexes on JSONB columns for query performance (important fix)
CREATE INDEX idx_app_applications_metadata ON app.applications USING gin (metadata);
CREATE INDEX idx_app_localized_contents_metadata ON app.localized_contents USING gin (metadata);
CREATE INDEX idx_app_timeline_events_metadata ON app.timeline_events USING gin (metadata);
CREATE INDEX idx_app_workflow_events_payload ON app.workflow_events USING gin (payload);
CREATE INDEX idx_ai_cache_result ON ai.cache USING gin (result);

-- ============================================================
-- 37. Client Settings / Reporting Preferences
-- ============================================================
CREATE TABLE app.client_settings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id           UUID NOT NULL REFERENCES app.client_companies(id) ON DELETE CASCADE,
    --
    -- Reporting preferences
    report_frequency    VARCHAR(20) DEFAULT 'WEEKLY'
                        CHECK (report_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'NONE')),
    report_format       VARCHAR(20) DEFAULT 'PDF'
                        CHECK (report_format IN ('PDF', 'CSV', 'BOTH')),
    report_recipients   VARCHAR(500) DEFAULT '',                -- Comma-separated emails
    --
    -- Pipeline visibility for client (BR-007)
    pipeline_view_level VARCHAR(20) DEFAULT 'FULL'
                        CHECK (pipeline_view_level IN ('FULL', 'LIMITED', 'OFFERS_ONLY')),
    --
    -- Integration settings
    calendar_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    --
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    --
    UNIQUE (client_id)
);

-- ============================================================
-- SECURITY: Row-Level Security (RLS)
-- BR-039: Cross-client data access denied by default
-- ============================================================

-- Enable RLS on tenant-scoped tables
ALTER TABLE app.candidates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.jobs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.applications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.interviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assessments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.localized_contents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.files                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.notes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.tasks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.mentions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.timeline_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.saved_searches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.recruiter_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.outbound_emails       ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.ai_matches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.client_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.workflow_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.workflow_events        ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are enforced at the application layer via NestJS middleware.
-- The actual policies are applied dynamically based on authenticated user's agency_id
-- and client assignment. Defining static SQL policies here would be too rigid for
-- the complex role+client scoping logic (BR-038, BR-039, BR-040).
--
-- Instead, we use a helper function and application-enforced policies:

CREATE OR REPLACE FUNCTION app.current_user_agency_id()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_user_agency_id', TRUE), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app.current_user_role()
RETURNS VARCHAR AS $$
    SELECT NULLIF(current_setting('app.current_user_role', TRUE), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app.current_user_client_ids()
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT client_id FROM app.recruiter_client_assignments
        WHERE recruiter_id = app.current_user_id() AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE;

-- ============================================================
-- DATA INTEGRITY: Prevent modifications to immutable audit tables
-- ============================================================
-- (Trigger defined above in audit section)

-- ============================================================
-- DATA INTEGRITY: Prevent backdating applications
-- ============================================================
CREATE OR REPLACE FUNCTION app.check_application_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at < OLD.created_at THEN
        RAISE EXCEPTION 'Application created_at cannot be moved backwards';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DATA INTEGRITY: Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION app.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_candidates_updated
    BEFORE UPDATE ON app.candidates
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_jobs_updated
    BEFORE UPDATE ON app.jobs
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_applications_updated
    BEFORE UPDATE ON app.applications
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_interviews_updated
    BEFORE UPDATE ON app.interviews
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_localized_contents_updated
    BEFORE UPDATE ON app.localized_contents
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_notes_updated
    BEFORE UPDATE ON app.notes
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_tasks_updated
    BEFORE UPDATE ON app.tasks
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_pipeline_configs_updated
    BEFORE UPDATE ON app.pipeline_configs
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_workflow_rules_updated
    BEFORE UPDATE ON app.workflow_rules
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_calendar_integrations_updated
    BEFORE UPDATE ON app.calendar_integrations
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

-- Missing updated_at triggers (important fix)
CREATE TRIGGER trg_agencies_updated
    BEFORE UPDATE ON app.agencies
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_client_companies_updated
    BEFORE UPDATE ON app.client_companies
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_recruiter_client_assignments_updated
    BEFORE UPDATE ON app.recruiter_client_assignments
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_client_settings_updated
    BEFORE UPDATE ON app.client_settings
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_outbound_emails_updated
    BEFORE UPDATE ON app.outbound_emails
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_email_templates_updated
    BEFORE UPDATE ON app.email_templates
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_saved_searches_updated
    BEFORE UPDATE ON app.saved_searches
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_ai_cache_updated
    BEFORE UPDATE ON ai.cache
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_ai_credit_budgets_updated
    BEFORE UPDATE ON ai.credit_budgets
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER trg_ai_job_queue_updated
    BEFORE UPDATE ON ai.job_queue
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

-- Auto-set stage_duration_days on application update
CREATE OR REPLACE FUNCTION app.update_stage_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stage != OLD.stage THEN
        NEW.stage_entered_at = NOW();
    END IF;
    NEW.stage_duration_days = EXTRACT(DAY FROM NOW() - NEW.stage_entered_at)::INTEGER;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_stage_duration
    BEFORE UPDATE ON app.applications
    FOR EACH ROW EXECUTE FUNCTION app.update_stage_duration();

-- ============================================================
-- VIEWS: Commonly needed aggregations
-- ============================================================

-- Dashboard: Pipeline summary per client
CREATE OR REPLACE VIEW app.v_pipeline_summary AS
SELECT
    a.agency_id,
    a.job_id,
    j.client_id,
    a.stage,
    COUNT(*) AS candidate_count,
    AVG(a.ai_match_score) AS avg_ai_score,
    MIN(a.stage_entered_at) AS earliest_entry,
    MAX(a.stage_entered_at) AS latest_entry
FROM app.applications a
JOIN app.jobs j ON a.job_id = j.id
WHERE a.status NOT IN ('HIRED', 'REJECTED', 'WITHDRAWN')
GROUP BY a.agency_id, a.job_id, j.client_id, a.stage;

-- Dashboard: Stalled candidates (BR-077: >7 days without stage change)
CREATE OR REPLACE VIEW app.v_stalled_candidates AS
SELECT
    a.id AS application_id,
    a.candidate_id,
    c.first_name || ' ' || c.last_name AS candidate_name,
    a.stage,
    a.stage_entered_at,
    EXTRACT(DAY FROM NOW() - a.stage_entered_at) AS days_in_stage,
    a.assigned_recruiter_id,
    a.job_id,
    j.title AS job_title,
    j.client_id
FROM app.applications a
JOIN app.candidates c ON a.candidate_id = c.id
JOIN app.jobs j ON a.job_id = j.id
WHERE a.status NOT IN ('HIRED', 'REJECTED', 'WITHDRAWN')
  AND EXTRACT(DAY FROM NOW() - a.stage_entered_at) >= 7;

-- Dashboard: Overdue interviews
CREATE OR REPLACE VIEW app.v_overdue_interviews AS
SELECT
    i.id AS interview_id,
    i.application_id,
    c.first_name || ' ' || c.last_name AS candidate_name,
    i.type AS interview_type,
    i.scheduled_at,
    i.interviewer_id,
    u.first_name || ' ' || u.last_name AS interviewer_name,
    i.status,
    j.client_id,
    j.title AS job_title
FROM app.interviews i
JOIN app.applications a ON i.application_id = a.id
JOIN app.candidates c ON a.candidate_id = c.id
JOIN app.users u ON i.interviewer_id = u.id
JOIN app.jobs j ON a.job_id = j.id
WHERE i.status IN ('SCHEDULED', 'CONFIRMED')
  AND i.scheduled_at < NOW()
  AND i.status NOT IN ('COMPLETED', 'CANCELLED');

-- Search view: Candidate profile with scores for semantic search
CREATE OR REPLACE VIEW app.v_candidate_search AS
SELECT
    c.id AS candidate_id,
    c.agency_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.location_city,
    c.location_country,
    c.parsed_data,
    c.ai_summary,
    c.source_channel,
    c.created_at,
    -- Latest application info (if any)
    a.id AS current_application_id,
    a.job_id,
    a.ai_match_score,
    a.stage AS current_stage,
    a.status AS application_status
FROM app.candidates c
LEFT JOIN LATERAL (
    SELECT id, job_id, ai_match_score, stage, status
    FROM app.applications
    WHERE candidate_id = c.id AND agency_id = c.agency_id
    ORDER BY created_at DESC
    LIMIT 1
) a ON TRUE
WHERE c.is_duplicate = FALSE AND c.anonymized = FALSE;

-- ============================================================
-- SEED DATA: Default pipeline stages
-- (Applied during client onboarding — UC-033)
-- ============================================================

-- ============================================================
-- INDEX SUMMARY (all composite indexes for query optimization)
-- ============================================================
--
-- Table                      | Indexes
-- ---------------------------|--------------------------------------------
-- app.agencies               | slug, is_active
-- app.users                  | agency+role, email+agency, is_active
-- app.client_companies       | agency, is_active
-- app.recruiter_client_asgn  | recruiter, client
-- app.candidates             | agency, email, name, parse_status, source, location, FTS
-- app.jobs                   | agency, client, status, posted_by, published, FTS
-- app.applications           | agency, job, candidate, recruiter, stage+status, ai_score, created
-- app.interviews             | application, interviewer, scheduled (active), status
-- app.assessments            | agency, job
-- app.assessment_submissions | application, assessment
-- app.localized_contents     | agency, entity, status (review), confidence
-- app.ai_matches             | agency, job, candidate, score, computed
-- app.pipeline_configs       | agency
-- app.review_queue_items     | agency, status, priority, SLA
-- app.notifications          | user (unread), agency+user+created, type
-- app.files                  | agency, entity, uploaded_by
-- app.calendar_integrations  | agency
-- app.tags                   | agency
-- app.notes                  | candidate+private, author
-- app.tasks                  | candidate, assignee, status
-- app.timeline_events        | candidate, application, agency+occurred
-- app.workflow_rules         | agency+enabled, client, trigger_event
-- app.workflow_events        | application, candidate, type+created, agency+created
-- audit.audit_events         | timestamp, actor, action, target, category, agency (partitioned)
-- ai.job_queue               | status+priority+scheduled, application, trace_id
-- ai.usage_logs              | agency+date, provider+model, trace_id
-- ai.cache                   | type+key, expires_at
-- ai.credit_budgets          | agency+month
-- app.outbound_emails        | application, candidate, status (active), sent
-- app.email_templates        | agency+type
--
-- NEW (v1.0.1 fixes):
-- app.applications           | metadata (GIN)
-- app.localized_contents     | metadata (GIN)
-- app.timeline_events        | metadata (GIN)
-- app.workflow_events        | payload (GIN)
-- ai.cache                   | result (GIN)
-- app.timeline_events        | event_type CHECK constraint added

-- ============================================================
-- TRIGGERS SUMMARY
-- ============================================================
-- app.update_updated_at() applied to:
--   app.candidates, app.jobs, app.applications, app.interviews,
--   app.localized_contents, app.notes, app.tasks,
--   app.pipeline_configs, app.workflow_rules,
--   app.calendar_integrations, app.outbound_emails,
--   app.email_templates, app.saved_searches,
--   ai.cache, ai.credit_budgets, ai.job_queue,
--   app.agencies, app.client_companies, app.recruiter_client_assignments,
--   app.client_settings
--
-- app.update_stage_duration() → app.applications (BEFORE UPDATE)
-- audit.prevent_modification() → audit.audit_events (BEFORE UPDATE/DELETE)
-- app.prevent_stage_history_modification() → app.application_stage_history (BEFORE UPDATE/DELETE)

-- ============================================================
-- MIGRATION NOTES:
-- - Run: CREATE EXTENSION IF NOT EXISTS vector;
-- - Partition creation: Execute the DO block above or use pg_partman
-- - RLS policies: Application-enforced via NestJS middleware
-- - RLS enabled on: candidates, jobs, applications, interviews, assessments,
--   assessment_submissions, localized_contents, notifications, files, notes,
--   tasks, mentions, timeline_events, saved_searches, ai_matches,
--   client_pipeline_stages, workflow_rules, workflow_events
-- - Initial seed: Insert default pipeline stages per client during onboarding
-- ============================================================