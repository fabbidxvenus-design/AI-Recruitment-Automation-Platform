# Business Definition: RecruitAI — Hệ thống Recruitment AI Automation

Generated: 2026-05-13T00:00:00Z
Language: bilingual (vi/en)
Project type: data-ai
Upstream: `02-requirement-definition.md/json`

**Gate 3 Status: CONDITIONAL PASS** — Gate 4 must resolve the blocking questions in Section 13 before detail-definition sign-off.

## 1. Business Context

RecruitAI automates the internal HR recruitment pipeline from sourcing to final candidate decision while preserving HR Manager authority at business decision gates. The business goal is to scale recruitment above 200 jobs/month, improve consistency of screening/interview/test evaluation, reduce scheduling friction, and keep candidate data auditable and secure.

MVP business scope is the full recruitment pipeline: Candidate Sourcing → CV Screening → Interview Scheduling → Async AI Interview → Test Grading → Final Review. Phase 2 prototype scope additionally includes standalone utility AI modules: recruitment content generation, mock design generation, CV evidence viewer detail, CV translation, and interview notes/transcript translation. These utility modules are in scope for the next prototype but remain outside Phase 1/MVP core pipeline acceptance.

## 2. Business Objectives and KPIs

| ID | Objective | KPIs | Trace to REQ |
|---|---|---|---|
| BO-001 | Scale recruitment operations without proportional HR headcount growth | >200 jobs/month; ~10,000 CV/month; non-AI API p95 <2s | REQ-NF-002, REQ-NF-003, REQ-F-016 |
| BO-002 | Reduce manual screening effort while preserving HR Manager decision ownership | Single CV screening <30s; HR reviewer agreement >=80%; 100% shortlist decisions approved by HR Manager | REQ-F-011, REQ-F-017, REQ-F-051, REQ-NF-AI-001 |
| BO-003 | Shorten time from screening approval to confirmed interview | At least 3 valid slots suggested when availability exists; Conflict rate <1%; Schedule approval SLA monitored | REQ-F-020, REQ-F-022, REQ-F-023, REQ-F-024 |
| BO-004 | Standardize interview and test evaluation | AI interview completion >70%; MCQ accuracy 100%; Essay/coding feedback includes justification | REQ-F-036, REQ-F-042, REQ-F-043, REQ-F-044, REQ-F-045 |
| BO-005 | Maintain auditable and secure candidate data handling | 100% user actions audit logged; RBAC enforced; CV data encrypted at rest and in transit | REQ-NF-005, REQ-NF-006, REQ-NF-007, REQ-NF-008 |

## 3. Stakeholders

| ID | Stakeholder | Responsibilities | Success Criteria | Trace to REQ |
|---|---|---|---|---|
| STK-001 | HR Manager | Approve screening; Approve scheduling; Finalize pass/fail; Override AI/test output with reason | Decisions are explainable; Decisions are auditable; Decisions are human-owned | REQ-F-017, REQ-F-023, REQ-F-051, REQ-F-052 |
| STK-002 | HR Recruiter | Import/create jobs and candidates; Prepare JD/test inputs; Monitor pipeline; Handle candidate exceptions | Batch import works; Candidate state visible; Templates reduce manual communication | REQ-F-001, REQ-F-002, REQ-F-004, REQ-F-055, REQ-F-061 |
| STK-003 | Interviewer | Provide calendar availability; Join interviews; Review relevant candidate context | Calendar conflicts avoided; Correct local time shown; Reminders received | REQ-F-021, REQ-F-024, REQ-F-025, REQ-F-026, REQ-F-027 |
| STK-004 | Candidate | Provide CV/availability; Complete async interview; Complete assigned tests | Instructions clear; Progress saved; Deadlines/reminders communicated | REQ-F-020, REQ-F-031, REQ-F-035, REQ-F-037, REQ-F-041 |
| STK-005 | IT Admin | Configure integrations; Manage access; Monitor failures/cost; Remediate technical exceptions | Integrations observable; RBAC works; Failures alerted | REQ-I-001, REQ-I-002, REQ-I-003, REQ-I-004, REQ-NF-010, REQ-NF-011 |

## 4. Roles and Permissions

| ID | Role | Permissions | Restrictions | Trace to REQ |
|---|---|---|---|---|
| ROLE-001 | HR Recruiter | create_candidate; import_candidates; create_job; upload_jd; assign_test; view_pipeline | cannot approve screening; cannot approve schedule; cannot finalize pass/fail unless also HR Manager | REQ-F-001, REQ-F-002, REQ-F-004, REQ-F-040, REQ-NF-006 |
| ROLE-002 | HR Manager | approve_screening; reject_screening; request_rescreen; approve_schedule; bulk_approve; override_test_grade; finalize_outcome | overrides require reason; all decisions audited | REQ-F-017, REQ-F-023, REQ-F-052, REQ-F-054, REQ-NF-007 |
| ROLE-003 | Interviewer | connect_calendar; view_assigned_interviews; view_relevant_candidate_context | cannot access unrelated CVs; cannot approve pipeline gates | REQ-F-021, REQ-F-024, REQ-NF-006, REQ-NF-008 |
| ROLE-004 | Admin | configure_google_workspace; configure_drive; manage_roles; view_audit_logs; monitor_failures; manage_retries | does not own business hiring decisions | REQ-I-001, REQ-I-002, REQ-I-003, REQ-NF-006, REQ-NF-007, REQ-NF-010 |

## 5. Business Processes

| ID | Process | Goal | Owner | Trace to REQ |
|---|---|---|---|---|
| BP-001 | Candidate Sourcing and Import | Convert job/candidate inputs into clean pipeline records | HR Recruiter | REQ-F-001, REQ-F-002, REQ-F-003, REQ-F-005, REQ-F-006, REQ-I-001, REQ-F-004 |
| BP-002 | CV Screening Approval | Produce explainable shortlist recommendations with human approval | HR Manager | REQ-F-010, REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-015, REQ-F-017, REQ-F-018, REQ-F-051, REQ-F-016 |
| BP-003 | Interview Scheduling Approval | Confirm conflict-free interview time only after HR approval | HR Manager | REQ-F-020, REQ-F-021, REQ-F-022, REQ-F-023, REQ-F-024, REQ-F-025, REQ-F-027, REQ-I-002, REQ-I-003 |
| BP-004 | Async AI Interview | Collect preliminary interview answers asynchronously | HR Recruiter | REQ-F-030, REQ-F-031, REQ-F-032, REQ-F-033, REQ-F-034, REQ-F-035, REQ-F-036, REQ-F-037 |
| BP-005 | Test Assignment and Grading | Evaluate candidate submissions consistently | HR Recruiter | REQ-F-040, REQ-F-041, REQ-F-042, REQ-F-043, REQ-F-044, REQ-F-045, REQ-F-046 |
| BP-006 | Final Candidate Decision | Convert evidence into human-owned pass/fail decision | HR Manager | REQ-F-045, REQ-F-050, REQ-F-055, REQ-NF-007 |
| BP-007 | Notification and Reminder Management | Ensure candidates, interviewers, and HR Managers receive required workflow communications | HR Recruiter | REQ-F-026, REQ-F-060, REQ-F-061, REQ-F-062, REQ-I-003 |
| BP-008 | Operational Performance and Monitoring | Monitor throughput, response time, uptime, AI errors, LLM cost, and scalability targets | IT Admin | REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-009, REQ-NF-010, REQ-NF-011, REQ-NF-012 |
| BP-009 | Candidate Withdrawal | Stop pipeline cleanly when candidate withdraws or HR records withdrawal | HR Recruiter | REQ-F-056, REQ-F-055, REQ-NF-007, REQ-D-007 |
| BP-010 | Error Remediation | Resolve blocking import, parsing, AI, Google integration, or grading errors without silent pipeline stalls | IT Admin | REQ-F-018, REQ-I-001, REQ-I-002, REQ-I-003, REQ-I-004, REQ-NF-010, REQ-NF-007 |
| BP-011 | Phase 2 Utility AI Governance | Operate standalone utility AI modules without changing Phase 1/MVP core pipeline decisions | HR Manager | REQ-C-006, REQ-C-007, REQ-C-008, REQ-C-009, REQ-C-010, REQ-C-011, REQ-C-012, REQ-C-013 |
| BP-012 | Recruitment Content Generation and Approval | Generate, edit, approve, export, and publish recruitment content suggestions | HR Recruiter / HR Manager | REQ-F-070, REQ-F-071, REQ-F-072, REQ-F-073, REQ-F-074, REQ-F-075, REQ-D-010, REQ-I-005, REQ-I-007, REQ-C-007, REQ-C-011 |
| BP-013 | Mock Recruitment Design Generation and Approval | Generate mock recruitment creative previews and approve them before export or use | HR Recruiter / HR Manager | REQ-F-080, REQ-F-081, REQ-F-082, REQ-F-083, REQ-D-011, REQ-I-006, REQ-C-008, REQ-C-012 |
| BP-014 | CV Evidence Review | Review original CV, extracted text, and evidence detail linked to screening/JD criteria | HR Manager | REQ-F-110, REQ-F-111, REQ-F-112, REQ-D-014, REQ-C-013 |
| BP-015 | CV Translation for Review | Translate CV content across vi/en/ja for review while preserving original CV as source of truth | HR Recruiter / HR Manager | REQ-F-090, REQ-F-091, REQ-F-092, REQ-F-093, REQ-F-094, REQ-F-095, REQ-D-012, REQ-C-009, REQ-C-010 |
| BP-016 | Interview Notes and Transcript Translation | Translate interview notes/transcripts across vi/en/ja while preserving original interview record | HR Recruiter / HR Manager | REQ-F-100, REQ-F-101, REQ-F-102, REQ-D-013, REQ-C-010 |

## 6. Business State Machine

| State | Owner | Type | Entry | Allowed Next States |
|---|---|---|---|---|
| NEW | HR Recruiter | draft | Candidate creation started | IMPORTED, WITHDRAWN |
| IMPORTED | System | active | Valid candidate/job input imported | SCREENING_RUNNING, ERROR, WITHDRAWN |
| SCREENING_RUNNING | System | active | JD and CV available | SCREENING_PENDING_APPROVAL, ERROR, WITHDRAWN |
| SCREENING_PENDING_APPROVAL | HR Manager | approval | Screening result generated | SCREENED_IN, SCREENED_OUT, SCREENING_RUNNING, WITHDRAWN |
| SCREENED_IN | System | active | HR Manager approves screening | AVAILABILITY_PENDING, WITHDRAWN |
| SCREENED_OUT | HR Manager | terminal | HR Manager rejects screening | ? |
| AVAILABILITY_PENDING | Candidate / Interviewer | active | Candidate screened in | SCHEDULING_PENDING_APPROVAL, ERROR, WITHDRAWN |
| SCHEDULING_PENDING_APPROVAL | HR Manager | approval | Valid interview slots generated | INTERVIEW_SCHEDULED, AVAILABILITY_PENDING, WITHDRAWN |
| INTERVIEW_SCHEDULED | System | active | HR Manager approves slot | AI_INTERVIEW_PENDING, WITHDRAWN, ERROR |
| AI_INTERVIEW_PENDING | Candidate | active | Interview link sent | AI_INTERVIEW_COMPLETED, WITHDRAWN, ERROR |
| AI_INTERVIEW_COMPLETED | System | active | Candidate submits async interview | TEST_PENDING, FINAL_REVIEW, ERROR |
| TEST_PENDING | Candidate | active | Test assigned | TEST_GRADED, WITHDRAWN, ERROR |
| TEST_GRADED | System | active | Test sections graded | FINAL_REVIEW, ERROR |
| FINAL_REVIEW | HR Manager | approval | Evidence package ready | PASSED, FAILED, WITHDRAWN |
| PASSED | HR Manager | terminal | Final pass decision recorded | ? |
| FAILED | HR Manager | terminal | Final fail decision recorded | ? |
| WITHDRAWN | Candidate / HR Recruiter / HR Manager | terminal | Candidate withdraws or HR marks withdrawn | ? |
| ERROR | IT Admin / HR Recruiter | remediation | Blocking technical or data issue | previous_valid_state, WITHDRAWN |

## 7. Business Rules

Business rules define policy and decision constraints only. They avoid UI, API, database, and code-level design.

| ID | Rule Name | Rule | Type | Trace to REQ |
|---|---|---|---|---|
| BR-001 | Human approval is mandatory at business decision gates | Screening shortlist, schedule confirmation, and final pass/fail decisions must be approved by HR Manager or designated backup. | governance | REQ-F-017, REQ-F-023, REQ-F-051, REQ-F-054 |
| BR-002 | Approval reminders do not imply auto-action | Pending approvals may trigger reminders and escalation, but must not auto-approve, auto-reject, auto-cancel, or auto-skip. | governance | REQ-F-053, REQ-F-054 |
| BR-003 | Duplicate candidates require HR review | Candidate records with matching email or phone must be flagged for merge/skip/create-new decision. | data-quality | REQ-F-006 |
| BR-004 | MVP file boundary excludes OCR | MVP accepts only text-native PDF/DOCX CV/JD files and rejects scanned/image-only files. | scope | REQ-F-010, REQ-F-018, REQ-C-002 |
| BR-005 | Low-confidence AI or parsing requires manual review | AI outputs or extraction results below configured confidence threshold must route to manual review. | risk-control | REQ-F-018, REQ-NF-AI-005 |
| BR-006 | Screening score must remain explainable | Screening results must include total score, sub-scores, missing skills, red flags, confidence, and evidence spans. | ai-governance | REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-015 |
| BR-007 | Calendar events require approved slot | No interview event or confirmation email may be sent until HR Manager approves a suggested slot. | process-control | REQ-F-023, REQ-F-024, REQ-F-025 |
| BR-008 | Scheduling respects timezone and working-hour policy | Suggested slots must respect participant timezones, configured working hours, 30-minute buffer, and minimum advance notice. | scheduling | REQ-F-022, REQ-F-027 |
| BR-009 | MCQ grading is deterministic | Multiple-choice answers are graded only against approved answer key, not by LLM judgment. | assessment | REQ-F-042 |
| BR-010 | Essay and coding AI grading must be rubric-backed | Essay and coding AI scores must include criterion-level justification and preserve rubric/test-case versioning for audit. | assessment | REQ-F-043, REQ-F-044, REQ-F-045 |
| BR-011 | Candidate data access is role-bound | Confidential candidate documents, transcripts, and submissions are accessible only to roles with business need. | security | REQ-NF-006, REQ-NF-008 |
| BR-012 | Audit trail is mandatory for accountability | Imports, approvals, overrides, notifications, state changes, and final decisions must be auditable. | compliance | REQ-NF-007, REQ-D-007, REQ-D-008, REQ-D-009 |
| BR-013 | Phase 2 utility AI is in prototype scope but outside MVP acceptance | Content generation, mock design generation, CV evidence viewer detail, CV translation, and interview translation are standalone Phase 2 prototype capabilities. They must not block Phase 1/MVP acceptance and must not mutate core candidate pipeline state without explicit approved workflow. | scope | REQ-C-006, REQ-F-070, REQ-F-080, REQ-F-090, REQ-F-100, REQ-F-110 |
| BR-014 | Workflow communications use approved HR identity and templates | Candidate-facing emails and workflow reminders must use the shared HR mailbox, approved templates, and logged delivery status. | communication | REQ-F-026, REQ-F-060, REQ-F-061, REQ-F-062 |
| BR-015 | Operational KPIs must be monitored | Recruitment operations must monitor screening time, throughput, response time, concurrency, uptime, AI failure, LLM cost, and scalability targets. | operations | REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-009, REQ-NF-010, REQ-NF-011, REQ-NF-012 |
| BR-016 | Single-organization operating model | RecruitAI serves internal HR only and does not support multi-tenant agency operation in MVP. | scope | REQ-C-001 |
| BR-017 | Google Workspace is the business integration standard | MVP recruitment communications, scheduling, and Drive ingestion depend on approved Google Workspace accounts and availability. | platform | REQ-C-003, REQ-I-004 |
| BR-018 | Approval stall is accepted business risk | Approval queues may remain pending indefinitely; the business accepts reminder/escalation rather than automatic cancellation or skipping. | governance | REQ-C-004, REQ-F-056 |
| BR-019 | Recruitment master data must be business-owned | Candidate profile, CV, JD, screening result, interview transcript, test submission, and grade records must have clear HR/System ownership and confidentiality classification. | data-governance | REQ-D-001, REQ-D-002, REQ-D-003, REQ-D-004, REQ-D-005, REQ-D-006 |
| BR-020 | AI quality monitoring is ongoing business governance | Shortlist precision and prompt/rubric drift must be monitored after launch and reviewed by HR/IT owners. | ai-governance | REQ-NF-AI-002, REQ-NF-AI-004 |
| BR-021 | Escalation does not create business approval | Escalation transfers review responsibility or sends notifications, but it never creates an approve/reject/pass/fail decision without explicit human action. Backup approver identity and timing remain blocking Gate 4 policy decisions. | governance | REQ-F-053, REQ-F-054 |
| BR-022 | Final decision policy placeholder | Final pass/fail remains a human-owned HR Manager decision based on screening, interview, and test evidence. The exact combined threshold or weighting model is unresolved and blocks Gate 4. | governance | REQ-F-045, REQ-F-046, REQ-F-050 |
| BR-023 | Retention policy placeholder | Candidate CVs, transcripts, test submissions, and audit records require explicit retention/deletion periods before Gate 4 detail sign-off. Until defined, no destructive deletion behavior may be assumed. | compliance | REQ-NF-005, REQ-NF-008, REQ-D-001, REQ-D-002, REQ-D-005, REQ-D-006 |
| BR-024 | Calendar reschedule and cancellation policy placeholder | Post-approval interview reschedule/cancel behavior is unresolved and must be defined before Gate 4; no Calendar update flow may be assumed beyond initial approved event creation. | scheduling | REQ-F-023, REQ-F-024, REQ-F-025, REQ-I-002 |
| BR-025 | Generated content requires HR approval | AI-generated recruitment content must be reviewed and approved by HR before copy, export, file generation, or channel publishing. | governance | REQ-F-071, REQ-F-072, REQ-F-073, REQ-F-074, REQ-C-007, REQ-C-011 |
| BR-026 | Generated design requires HR approval | Mock generated design assets must be reviewed and approved by HR before export, publishing, or operational use. | governance | REQ-F-080, REQ-F-082, REQ-F-083, REQ-C-008, REQ-C-012 |
| BR-027 | AI-generated status must be visible | Generated content and mock design assets must be clearly marked as AI-generated or AI-assisted until HR approval is recorded. | ai-governance | REQ-F-071, REQ-F-082, REQ-D-010, REQ-D-011 |
| BR-028 | Generated content and design require moderation | Recruitment content and mock creative outputs must be reviewed for safety, appropriateness, and policy fit before approval or channel use. | risk-control | REQ-F-074, REQ-F-083, REQ-C-007, REQ-C-008 |
| BR-029 | Original CV is source of truth | Translated CVs support review and related workflows, but original CV remains the authoritative record and screening decisions must trace to original CV evidence. | data-integrity | REQ-F-092, REQ-F-094, REQ-F-095, REQ-C-009 |
| BR-030 | Original interview record is source of truth | Translated interview notes/transcripts support review, but original notes/transcripts remain the authoritative record for audit and final decision evidence. | data-integrity | REQ-F-100, REQ-F-101, REQ-F-102, REQ-D-013, REQ-C-010 |
| BR-031 | CV evidence detail is review support | CV evidence viewer detail may support HR review, but it must not create a new automated decision gate or replace existing screening approval authority. | ai-governance | REQ-F-110, REQ-F-111, REQ-F-112, REQ-D-014 |
| BR-032 | No OCR without explicit scope decision | Scanned/image-only CV support and OCR remain out of scope unless explicitly added; unsupported documents must not be silently inferred. | scope | REQ-C-013 |
| BR-033 | Utility AI artifacts follow candidate data privacy rules | Translated CVs, translated transcripts, evidence details, generated artifacts, prompts, and approvals must follow role-based access, audit, and retention controls appropriate to their source data. | security | REQ-F-093, REQ-F-101, REQ-D-010, REQ-D-011, REQ-D-012, REQ-D-013, REQ-D-014, REQ-C-010 |

## 8. Exception Paths

| BP | Exceptions | Owner | Resolution |
|---|---|---|---|
| BP-001 | invalid file; invalid row; duplicate candidate; Drive import failure | HR Recruiter / IT Admin | valid rows proceed; exceptions assigned for correction, merge/skip/create-new, or retry |
| BP-002 | unreadable CV; scanned file; low AI confidence; LLM failure | HR Manager / IT Admin | manual review, re-screen, reject unsupported file, or technical retry |
| BP-003 | no valid slots; candidate no response; Calendar unavailable; post-approval reschedule needed | HR Manager | request alternative availability, manual scheduling fallback, or reschedule policy once defined |
| BP-004 | expired link; incomplete submission; AI evaluation uncertain | HR Recruiter / HR Manager | reopen link, manual review, or mark withdrawn/error |
| BP-005 | test timeout; grading failure; coding sandbox error; plagiarism flag | HR Manager / IT Admin | re-grade, manual override, technical remediation, or final review exception |
| BP-006 | incomplete evidence package; conflicting scores; override needed | HR Manager | request missing evidence, record override reason, or defer final decision |
| BP-009 | ambiguous withdrawal request; withdrawal after scheduled interview | HR Recruiter | confirm request, notify stakeholders, close pending actions |
| BP-010 | unassigned error; repeated retry failure; integration outage | IT Admin | assign owner, escalate, fallback to manual process |

## 9. Inter-Process Handoff Matrix

| From | To | Signal | Payload |
|---|---|---|---|
| BP-001 | BP-002 | Candidate IMPORTED and JD available | candidate profile, CV text/file, JD |
| BP-002 | BP-003 | Candidate SCREENED_IN | approved screening result and candidate context |
| BP-003 | BP-004 | Candidate INTERVIEW_SCHEDULED or interview stage reached | candidate profile, JD, interview template, language |
| BP-004 | BP-005 | Candidate AI_INTERVIEW_COMPLETED and test required | interview transcript, AI evaluation, assigned test |
| BP-005 | BP-006 | Candidate TEST_GRADED | test report, interview report, screening result |
| any active BP | BP-009 | Candidate withdrawal request or HR withdrawal action | candidate, current state, reason if available |
| any active BP | BP-010 | Blocking ERROR state | candidate/job, prior state, error reason, owning integration/process |

## 10. Business Use Cases

### UC-001 ? Import candidates from Excel

- **Primary actor:** HR Recruiter
- **Business acceptance criteria:** Valid rows succeed even when invalid rows exist; Duplicate candidates are flagged; Import result is auditable
- **Trace to REQ:** REQ-F-001, REQ-F-005, REQ-F-006

### UC-002 ? Auto-import candidates from Google Drive

- **Primary actor:** System
- **Business acceptance criteria:** Import starts within 5 minutes; Same file does not create duplicates; Failures alert owner
- **Trace to REQ:** REQ-F-003, REQ-I-001

### UC-003 ? Approve AI screening result

- **Primary actor:** HR Manager
- **Business acceptance criteria:** Decision actor/timestamp recorded; Bulk approval supported; No auto-action on timeout
- **Trace to REQ:** REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-017, REQ-F-052, REQ-F-054

### UC-004 ? Approve interview schedule

- **Primary actor:** HR Manager
- **Business acceptance criteria:** At least 3 valid slots shown when available; Calendar event created only after approval; Emails sent from shared mailbox
- **Trace to REQ:** REQ-F-020, REQ-F-021, REQ-F-022, REQ-F-023, REQ-F-024, REQ-F-025

### UC-005 ? Complete async AI interview

- **Primary actor:** Candidate
- **Business acceptance criteria:** Progress survives multiple sessions; Deadline/reminders are enforced; Report includes recommendation and evidence
- **Trace to REQ:** REQ-F-030, REQ-F-031, REQ-F-032, REQ-F-033, REQ-F-034, REQ-F-035, REQ-F-036, REQ-F-037

### UC-006 ? Grade candidate test

- **Primary actor:** System
- **Business acceptance criteria:** MCQ is exact; Essay/coding scores include justification; Override requires reason
- **Trace to REQ:** REQ-F-042, REQ-F-043, REQ-F-044, REQ-F-045, REQ-F-046

### UC-007 ? Finalize candidate outcome

- **Primary actor:** HR Manager
- **Business acceptance criteria:** Final decision is human-owned; Override reason is stored; State history is visible
- **Trace to REQ:** REQ-F-045, REQ-F-050, REQ-F-055, REQ-NF-007

### UC-008 ? Send workflow notifications and reminders

- **Primary actor:** System
- **Business acceptance criteria:** Candidate-facing emails use shared HR mailbox; Templates are configurable; HR Manager receives pending-action notifications; Interview reminders are sent as configured
- **Trace to REQ:** REQ-F-026, REQ-F-060, REQ-F-061, REQ-F-062, REQ-I-003

### UC-009 ? Withdraw candidate from pipeline

- **Primary actor:** HR Recruiter
- **Business acceptance criteria:** Withdrawal can be recorded from any non-terminal stage; Pending actions are closed or cancelled; Withdrawal is audited and visible in state history
- **Trace to REQ:** REQ-F-056, REQ-F-055, REQ-NF-007

### UC-010 ? Remediate pipeline error

- **Primary actor:** IT Admin
- **Business acceptance criteria:** Every ERROR has reason and owner; Owner receives notification; Resolution returns candidate to prior state or WITHDRAWN
- **Trace to REQ:** REQ-F-018, REQ-NF-010, REQ-NF-007


### UC-011 ? Generate and approve recruitment content

- **Primary actor:** HR Recruiter / HR Manager
- **Business acceptance criteria:** HR can generate editable content suggestions from job context; HR approval is recorded before copy/export/file/channel publish; Approved content can be manually copied, exported to file, or sent through configured channel connector
- **Trace to REQ:** REQ-F-070, REQ-F-071, REQ-F-072, REQ-F-073, REQ-F-074, REQ-F-075, REQ-C-007, REQ-C-011

### UC-012 ? Generate and approve mock recruitment design

- **Primary actor:** HR Recruiter / HR Manager
- **Business acceptance criteria:** HR can generate mock creative previews without real image provider integration; HR can select/review generated mock assets; HR approval is required before export or use
- **Trace to REQ:** REQ-F-080, REQ-F-081, REQ-F-082, REQ-F-083, REQ-C-008, REQ-C-012

### UC-013 ? Review CV evidence detail

- **Primary actor:** HR Manager
- **Business acceptance criteria:** HR can view original CV, extracted text, and screening/JD-linked evidence detail; Evidence detail is review support and does not change pipeline state; Unsupported scanned/OCR-needed documents remain clearly out of scope
- **Trace to REQ:** REQ-F-110, REQ-F-111, REQ-F-112, REQ-D-014, REQ-C-013

### UC-014 ? Translate CV for HR review

- **Primary actor:** HR Recruiter / HR Manager
- **Business acceptance criteria:** HR can translate CV content across vi/en/ja; Translated CV is linked to original CV; Screening decisions remain traceable to original CV
- **Trace to REQ:** REQ-F-090, REQ-F-091, REQ-F-092, REQ-F-093, REQ-F-094, REQ-F-095, REQ-C-009, REQ-C-010

### UC-015 ? Translate interview notes or transcript

- **Primary actor:** HR Recruiter / HR Manager
- **Business acceptance criteria:** HR can translate interview notes/transcripts across vi/en/ja; Translated interview content remains access-controlled; Original interview record remains authoritative for audit
- **Trace to REQ:** REQ-F-100, REQ-F-101, REQ-F-102, REQ-D-013, REQ-C-010

## 11. Business Acceptance Criteria

| ID | Criterion | Trace to REQ |
|---|---|---|
| BAC-001 | MVP supports full pipeline from import to final decision without requiring Phase 2 utility AI modules. | REQ-C-005, REQ-C-006 |
| BAC-002 | Every business decision gate has an accountable HR Manager decision recorded. | REQ-F-017, REQ-F-023, REQ-F-050, REQ-NF-007 |
| BAC-003 | Every AI recommendation used by HR includes explainability and confidence information. | REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-NF-AI-005 |
| BAC-004 | Candidate confidential data is protected by RBAC, encryption, and audit logs. | REQ-NF-005, REQ-NF-006, REQ-NF-007, REQ-NF-008 |
| BAC-005 | Phase 2 utility AI modules are explicitly in prototype scope but do not block Phase 1/MVP pipeline acceptance. | REQ-C-006 |
| BAC-006 | Generated recruitment content and mock design assets require recorded HR approval before export, publishing, or use. | REQ-F-074, REQ-F-083, REQ-C-007, REQ-C-008, REQ-C-011 |
| BAC-007 | CV and interview translations preserve source linkage, access control, and source-of-truth warnings. | REQ-F-092, REQ-F-093, REQ-F-094, REQ-F-095, REQ-F-101, REQ-F-102, REQ-C-009, REQ-C-010 |
| BAC-008 | CV evidence detail supports HR review with original/extracted/evidence context and does not introduce OCR or a new automated decision gate. | REQ-F-110, REQ-F-111, REQ-F-112, REQ-C-013 |

## 12. Business Risks

| ID | Risk | Impact | Likelihood | Mitigation | Trace to REQ |
|---|---|---|---|---|---|
| RISK-001 | No approval timeout can stall pipeline at scale | High | Medium | Reminder, SLA visibility, escalation to backup approver, queue monitoring | REQ-F-053, REQ-F-054, REQ-NF-002 |
| RISK-002 | AI false rejection may remove qualified candidates | High | Medium | Human approval, confidence threshold, validation dataset, false reject review | REQ-F-017, REQ-NF-AI-001, REQ-NF-AI-003, REQ-NF-AI-005 |
| RISK-003 | Google Workspace outage blocks scheduling/email/import | High | Medium | Retry/backoff, alerting, manual fallback process | REQ-I-001, REQ-I-002, REQ-I-003, REQ-NF-010 |
| RISK-004 | Candidate PII exposure | High | Low | RBAC, encryption, audit logs, access-controlled CV storage | REQ-NF-005, REQ-NF-006, REQ-NF-007, REQ-NF-008 |
| RISK-005 | Coding challenge execution introduces security risk | High | Medium | Gate implementation on approved sandbox/runtime decision | REQ-F-044 |
| RISK-006 | Scanned PDFs/images are expected by users despite MVP boundary | Medium | Medium | Clear rejection reason and Phase 2 OCR backlog | REQ-C-002, REQ-F-018 |
| RISK-007 | Unapproved AI-generated recruitment content may be published externally | High | Medium | Require HR approval, visible AI-generated status, moderation review, and audit trail before copy/export/channel publishing | REQ-F-073, REQ-F-074, REQ-C-007, REQ-C-011 |
| RISK-008 | Mock generated design may be mistaken for approved brand asset | Medium | Medium | Mark mock assets as AI-assisted draft until HR approval; keep real provider integration out of scope | REQ-F-080, REQ-F-081, REQ-F-083, REQ-C-008, REQ-C-012 |
| RISK-009 | Translated CV may be misused as source of truth for screening | High | Medium | Show source-of-truth warning and require screening decisions to trace to original CV | REQ-F-092, REQ-F-094, REQ-F-095, REQ-C-009 |
| RISK-010 | Translated CV or interview transcript may expose confidential candidate data | High | Medium | Apply RBAC, audit, retention, and source-linked access controls to translated artifacts | REQ-F-093, REQ-F-101, REQ-D-012, REQ-D-013, REQ-C-010 |
| RISK-011 | Channel integration scope may expand beyond prototype readiness | Medium | Medium | Treat channel integrations as Phase 2 prototype connectors with explicit channel decision question | REQ-F-073, REQ-I-007, REQ-C-011 |

## 13. Open Questions

| ID | Question | Owner | Blocks Gate 4? | Trace to REQ |
|---|---|---|---|---|
| BQ-001 | What exact AI confidence threshold requires manual review? | HR Manager | yes | REQ-NF-AI-005 |
| BQ-002 | Who is the backup approver for screening/scheduling escalation? | HR Manager | yes | REQ-F-053 |
| BQ-003 | What retention/deletion policy applies to CVs, transcripts, and test submissions? | HR Manager / IT Admin | yes | REQ-NF-005, REQ-NF-008 |
| BQ-004 | What coding sandbox/runtime is approved? | IT Admin | yes | REQ-F-044 |
| BQ-005 | What exact Drive folder, ownership, webhook renewal, and naming convention should be used for MVP? | IT Admin | yes | REQ-F-003, REQ-I-001 |
| BQ-006 | What is the final combined pass/fail policy across screening, interview, and test? | HR Manager | yes | REQ-F-046, REQ-F-050 |
| BQ-007 | What is the Calendar reschedule/cancel policy after event creation? | HR Manager / IT Admin | yes | REQ-F-023, REQ-F-024, REQ-F-025, REQ-I-002 |
| BQ-008 | Which specific recruitment publishing channels are included in the Phase 2 prototype connector set? | HR Manager / IT Admin | no | REQ-F-073, REQ-I-007, REQ-C-011 |
| BQ-009 | Which export file formats are required for generated recruitment content beyond TXT/DOCX? | HR Manager | no | REQ-F-072 |
| BQ-010 | What mock design asset sizes/templates are required for banners, posters, and social assets? | HR Manager | no | REQ-F-080, REQ-I-006 |
| BQ-011 | What level of CV evidence detail is required: extracted text only, evidence spans, or reasoning trace? | HR Manager | no | REQ-F-110, REQ-F-111, REQ-D-014 |

## 14. Gate 3 Validation

| Check | Status |
|---|---|
| Business objectives defined | PASS |
| KPIs are measurable | PASS |
| Stakeholders and roles defined | PASS |
| Permissions separated from UI/API detail | PASS |
| Business processes defined | PASS |
| Business rules separated from system behavior | PASS |
| Use cases include business acceptance criteria | PASS |
| BP/BR/UC trace to REQ IDs | PASS |
| Risks and mitigations documented | PASS |
| Blocking questions identified for Gate 4 | CONDITIONAL |

**Gate 3 Status: CONDITIONAL PASS**
