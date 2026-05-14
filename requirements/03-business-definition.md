# Business Definition: RecruitAI

Generated: 2026-05-14T00:00:00Z
Upstream: 02-requirement-definition.md/json v2.2
Review status: 

## 1. Business Objectives

| ID | Objective | KPI | Traces To |
|---|---|---|---|
| BO-001 | Scale recruitment operations without proportional HR headcount growth | >200 jobs/month<br>~10,000 CV/month<br>non-AI API p95 <2s | REQ-NF-002, REQ-NF-003, REQ-F-016 |
| BO-002 | Reduce manual screening effort while preserving HR Manager decision ownership | Single CV screening <30s<br>HR reviewer agreement >=80%<br>100% shortlist decisions approved by HR Manager | REQ-F-011, REQ-F-017, REQ-F-051, REQ-NF-AI-001 |
| BO-003 | Shorten time from screening approval to confirmed interview | At least 3 valid slots suggested when availability exists<br>Conflict rate <1%<br>Schedule approval SLA monitored | REQ-F-020, REQ-F-022, REQ-F-023, REQ-F-024 |
| BO-004 | Standardize interview and test evaluation | AI interview completion >70%<br>MCQ accuracy 100%<br>Essay/coding feedback includes justification | REQ-F-036, REQ-F-042, REQ-F-043, REQ-F-044, REQ-F-045 |
| BO-005 | Maintain auditable and secure candidate data handling | 100% user actions audit logged<br>RBAC enforced<br>CV data encrypted at rest and in transit | REQ-NF-005, REQ-NF-006, REQ-NF-007, REQ-NF-008, REQ-D-012, REQ-D-013, REQ-D-014 |

## 2. Stakeholders

| ID | Name | Responsibilities | Success Criteria | Traces To |
|---|---|---|---|---|
| STK-001 | HR Manager | Approve screening Approve scheduling Finalize pass/fail Override AI/test output with reason | Decisions are explainable Decisions are auditable Decisions are human-owned | REQ-F-017, REQ-F-023, REQ-F-051, REQ-F-052 |
| STK-002 | HR Recruiter | Import/create jobs and candidates Prepare JD/test inputs Monitor pipeline Handle candidate exceptions | Batch import works Candidate state visible Templates reduce manual communication | REQ-F-001, REQ-F-002, REQ-F-004, REQ-F-055, REQ-F-061 |
| STK-003 | Interviewer | Provide calendar availability Join interviews Review relevant candidate context | Calendar conflicts avoided Correct local time shown Reminders received | REQ-F-021, REQ-F-024, REQ-F-025, REQ-F-026, REQ-F-027 |
| STK-004 | Candidate | Provide CV/availability Complete async interview Complete assigned tests | Instructions clear Progress saved Deadlines/reminders communicated | REQ-F-020, REQ-F-031, REQ-F-035, REQ-F-037, REQ-F-041 |
| STK-005 | IT Admin | Configure integrations Manage access Monitor failures/cost Remediate technical exceptions | Integrations observable RBAC works Failures alerted | REQ-I-001, REQ-I-002, REQ-I-003, REQ-I-004, REQ-NF-010, REQ-NF-011 |

## 3. Roles and Permissions

| ID | Role | Permissions | Restrictions | Traces To |
|---|---|---|---|---|
| ROLE-001 | HR Recruiter | create_candidate, import_candidates, create_job, upload_jd, assign_test, view_pipeline | cannot approve screening cannot approve schedule cannot finalize pass/fail unless also HR Manager | REQ-F-001, REQ-F-002, REQ-F-004, REQ-F-040, REQ-NF-006 |
| ROLE-002 | HR Manager | approve_screening, reject_screening, request_rescreen, approve_schedule, bulk_approve, override_test_grade, finalize_outcome | overrides require reason all decisions audited | REQ-F-017, REQ-F-023, REQ-F-052, REQ-F-054, REQ-NF-007 |
| ROLE-003 | Interviewer | connect_calendar, view_assigned_interviews, view_relevant_candidate_context | cannot access unrelated CVs cannot approve pipeline gates | REQ-F-021, REQ-F-024, REQ-NF-006, REQ-NF-008 |
| ROLE-004 | Admin | configure_google_workspace, configure_drive, manage_roles, view_audit_logs, monitor_failures, manage_retries | does not own business hiring decisions | REQ-I-001, REQ-I-002, REQ-I-003, REQ-NF-006, REQ-NF-007, REQ-NF-010 |

## 4. Business Processes

| ID | Name | Owner | Goal | Traces To |
|---|---|---|---|---|
| BP-001 | Separated Intake Coordination | HR Recruiter | Coordinate separate Candidate/CV Intake and Job/JD Intake domains before cross-domain screening | REQ-F-001, REQ-F-004, REQ-F-078, REQ-D-019 |
| BP-002 | CV Screening Approval | HR Manager | Produce explainable shortlist recommendations with human approval | REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-015, REQ-F-017, REQ-F-018, REQ-F-051, REQ-F-016, REQ-F-078, REQ-D-004, REQ-D-019 |
| BP-003 | Interview Scheduling Approval | HR Manager | Confirm conflict-free interview time only after HR approval | REQ-F-020, REQ-F-021, REQ-F-022, REQ-F-023, REQ-F-024, REQ-F-025, REQ-F-027, REQ-I-002, REQ-I-003 |
| BP-004 | Async AI Interview | HR Recruiter | Collect preliminary interview answers asynchronously | REQ-F-030, REQ-F-031, REQ-F-032, REQ-F-033, REQ-F-034, REQ-F-035, REQ-F-036, REQ-F-037 |
| BP-005 | Test Assignment and Grading | HR Recruiter | Evaluate candidate submissions consistently | REQ-F-040, REQ-F-041, REQ-F-042, REQ-F-043, REQ-F-044, REQ-F-045, REQ-F-046 |
| BP-006 | Final Candidate Decision | HR Manager | Convert evidence into human-owned pass/fail decision | REQ-F-045, REQ-F-050, REQ-F-055, REQ-NF-007 |
| BP-007 | Notification and Reminder Management | HR Recruiter | Ensure candidates, interviewers, and HR Managers receive required workflow communications | REQ-F-026, REQ-F-060, REQ-F-061, REQ-F-062, REQ-I-003 |
| BP-008 | Operational Performance and Monitoring | IT Admin | Monitor throughput, response time, uptime, AI errors, LLM cost, and scalability targets | REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-009, REQ-NF-010, REQ-NF-011, REQ-NF-012 |
| BP-009 | Candidate Withdrawal | HR Recruiter | Stop pipeline cleanly when candidate withdraws or HR records withdrawal | REQ-F-056, REQ-F-055, REQ-NF-007, REQ-D-007 |
| BP-010 | Error Remediation | IT Admin | Resolve blocking import, parsing, AI, Google integration, or grading errors without silent pipeline stalls | REQ-F-018, REQ-I-001, REQ-I-002, REQ-I-003, REQ-I-004, REQ-NF-010, REQ-NF-007 |
| BP-011 | Phase 2 Utility AI Governance | HR Manager | Operate standalone utility AI modules without changing Phase 1/MVP core pipeline decisions. | REQ-C-006, REQ-C-007, REQ-C-008, REQ-C-009, REQ-C-010, REQ-C-011, REQ-C-012, REQ-C-013 |
| BP-012 | Recruitment Content Generation and Approval | HR Recruiter / HR Manager | Generate, edit, approve, export, and publish recruitment content suggestions. | REQ-F-070, REQ-F-071, REQ-F-072, REQ-F-073, REQ-F-074, REQ-F-075, REQ-D-010, REQ-I-005, REQ-I-007, REQ-C-007, REQ-C-011 |
| BP-013 | Mock Recruitment Design Generation and Approval | HR Recruiter / HR Manager | Generate mock recruitment creative previews and approve them before export or use. | REQ-F-080, REQ-F-081, REQ-F-082, REQ-F-083, REQ-D-011, REQ-I-006, REQ-C-008, REQ-C-012 |
| BP-014 | CV Evidence Review | HR Manager | Review original CV, extracted text, and evidence detail linked to screening/JD criteria without making it part of Phase 1/MVP core scope. | REQ-F-110, REQ-F-111, REQ-F-112, REQ-D-014, REQ-C-013 |
| BP-015 | CV Translation for Review | HR Recruiter / HR Manager | Translate CV content across vi/en/ja for review while preserving original CV as source of truth. | REQ-F-090, REQ-F-091, REQ-F-092, REQ-F-093, REQ-F-094, REQ-F-095, REQ-D-012, REQ-C-009, REQ-C-010 |
| BP-016 | Interview Notes and Transcript Translation | HR Recruiter / HR Manager | Translate interview notes/transcripts across vi/en/ja while preserving original interview record. | REQ-F-100, REQ-F-101, REQ-F-102, REQ-D-013, REQ-C-010 |
| BP-CV-001 | Candidate/CV Intake | HR Recruiter, System | Import candidate CV PDFs through Drive folder trigger/scan, multi-file upload, or single CV upload, then create CV versions and extracted candidate profiles | REQ-F-001, REQ-F-002, REQ-F-003, REQ-F-005, REQ-F-010, REQ-D-001, REQ-D-002, REQ-D-015, REQ-D-016, REQ-I-001, REQ-C-002, REQ-C-009, REQ-C-014, REQ-C-015 |
| BP-JOB-001 | Job/JD Intake | HR Recruiter, HR Manager, System | Create/import Job/JD from manual entry, JD text/file, Drive, or Sheet/Excel requisition, parse JD, and approve ParsedJDProfile before matching | REQ-F-004, REQ-F-006, REQ-F-068, REQ-F-069, REQ-F-076, REQ-D-003, REQ-D-017, REQ-I-001, REQ-I-008, REQ-C-016, REQ-C-017, REQ-C-020 |
| BP-JOB-002 | External Job Source Mock Preview | HR Recruiter, System | Show prototype-only ATS/job board/career site connector status and mock requisition previews without real external integration | REQ-F-077, REQ-D-018, REQ-I-009, REQ-C-019 |

## 5. Business Rules

| ID | Name | Type | Rule | Traces To |
|---|---|---|---|---|
| BR-001 | Human approval is mandatory at business decision gates | governance | Screening shortlist, schedule confirmation, and final pass/fail decisions must be approved by HR Manager or designated backup. | REQ-F-017, REQ-F-023, REQ-F-051, REQ-F-054 |
| BR-002 | Approval reminders do not imply auto-action | governance | Pending approvals may trigger reminders and escalation, but must not auto-approve, auto-reject, auto-cancel, or auto-skip. | REQ-F-053, REQ-F-054 |
| BR-003 | Duplicate candidates require HR review | data-quality | Candidate records with matching email or phone must be flagged for merge/skip/create-new decision. | REQ-F-006 |
| BR-004 | MVP file boundary excludes OCR | scope | MVP accepts only text-native PDF/DOCX CV/JD files and rejects scanned/image-only files. | REQ-F-010, REQ-F-018, REQ-C-002 |
| BR-005 | Low-confidence AI or parsing requires manual review | risk-control | AI outputs or extraction results below configured confidence threshold must route to manual review. | REQ-F-018, REQ-NF-AI-005 |
| BR-006 | Screening score must remain explainable | ai-governance | Screening results must include total score, sub-scores, missing skills, red flags, confidence, and evidence spans. | REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-015 |
| BR-007 | Calendar events require approved slot | process-control | No interview event or confirmation email may be sent until HR Manager approves a suggested slot. | REQ-F-023, REQ-F-024, REQ-F-025 |
| BR-008 | Scheduling respects timezone and working-hour policy | scheduling | Suggested slots must respect participant timezones, configured working hours, 30-minute buffer, and minimum advance notice. | REQ-F-022, REQ-F-027 |
| BR-009 | MCQ grading is deterministic | assessment | Multiple-choice answers are graded only against approved answer key, not by LLM judgment. | REQ-F-042 |
| BR-010 | Essay and coding AI grading must be rubric-backed | assessment | Essay and coding AI scores must include criterion-level justification and preserve rubric/test-case versioning for audit. | REQ-F-043, REQ-F-044, REQ-F-045 |
| BR-011 | Candidate data access is role-bound | security | Confidential candidate documents, transcripts, and submissions are accessible only to roles with business need. | REQ-NF-006, REQ-NF-008 |
| BR-012 | Audit trail is mandatory for accountability | compliance | Imports, approvals, overrides, notifications, state changes, and final decisions must be auditable. | REQ-NF-007, REQ-D-007, REQ-D-008, REQ-D-009 |
| BR-013 | Phase 2 utility AI is in prototype scope but outside MVP acceptance | scope | Content generation, mock design generation, CV evidence viewer detail, CV translation, and interview translation are standalone Phase 2 prototype capabilities. They must not block Phase 1/MVP acceptance and must not mutate core candidate pipeline state without explicit approved workflow. | REQ-C-006, REQ-F-070, REQ-F-080, REQ-F-090, REQ-F-100, REQ-F-110 |
| BR-014 | Workflow communications use approved HR identity and templates | communication | Candidate-facing emails and workflow reminders must use the shared HR mailbox, approved templates, and logged delivery status. | REQ-F-026, REQ-F-060, REQ-F-061, REQ-F-062 |
| BR-015 | Operational KPIs must be monitored | operations | Recruitment operations must monitor screening time, throughput, response time, concurrency, uptime, AI failure, LLM cost, and scalability targets. | REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-009, REQ-NF-010, REQ-NF-011, REQ-NF-012 |
| BR-016 | Single-organization operating model | scope | RecruitAI serves internal HR only and does not support multi-tenant agency operation in MVP. | REQ-C-001 |
| BR-017 | Google Workspace is the business integration standard | platform | MVP recruitment communications, scheduling, and Drive ingestion depend on approved Google Workspace accounts and availability. | REQ-C-003, REQ-I-004 |
| BR-018 | Approval stall is accepted business risk | governance | Approval queues may remain pending indefinitely; the business accepts reminder/escalation rather than automatic cancellation or skipping. | REQ-C-004, REQ-F-056 |
| BR-019 | Recruitment master data must be business-owned | data-governance | Candidate profile, CV, JD, screening result, interview transcript, test submission, and grade records must have clear HR/System ownership and confidentiality classification. | REQ-D-001, REQ-D-002, REQ-D-003, REQ-D-004, REQ-D-005, REQ-D-006 |
| BR-020 | AI quality monitoring is ongoing business governance | ai-governance | Shortlist precision and prompt/rubric drift must be monitored after launch and reviewed by HR/IT owners. | REQ-NF-AI-002, REQ-NF-AI-004 |
| BR-021 | Escalation does not create business approval | governance | Escalation transfers review responsibility or sends notifications, but it never creates an approve/reject/pass/fail decision without explicit human action. Backup approver identity and timing remain blocking Gate 4 policy decisions. | REQ-F-053, REQ-F-054 |
| BR-022 | Final decision policy placeholder | governance | Final pass/fail remains a human-owned HR Manager decision based on screening, interview, and test evidence. The exact combined threshold or weighting model is unresolved and blocks Gate 4. | REQ-F-045, REQ-F-046, REQ-F-050 |
| BR-023 | Retention policy placeholder | compliance | Candidate CVs, transcripts, test submissions, and audit records require explicit retention/deletion periods before Gate 4 detail sign-off. Until defined, no destructive deletion behavior may be assumed. | REQ-NF-005, REQ-NF-008, REQ-D-001, REQ-D-002, REQ-D-005, REQ-D-006 |
| BR-024 | Calendar reschedule and cancellation policy placeholder | scheduling | Post-approval interview reschedule/cancel behavior is unresolved and must be defined before Gate 4; no Calendar update flow may be assumed beyond initial approved event creation. | REQ-F-023, REQ-F-024, REQ-F-025, REQ-I-002 |
| BR-025 | Generated content requires HR approval | governance | AI-generated recruitment content must be reviewed and approved by HR before copy, export, file generation, or channel publishing. | REQ-F-071, REQ-F-072, REQ-F-073, REQ-F-074, REQ-C-007, REQ-C-011 |
| BR-026 | Generated design requires HR approval | governance | Mock generated design assets must be reviewed and approved by HR before export, publishing, or operational use. | REQ-F-080, REQ-F-082, REQ-F-083, REQ-C-008, REQ-C-012 |
| BR-027 | AI-generated status must be visible | ai-governance | Generated content and mock design assets must be clearly marked as AI-generated or AI-assisted until HR approval is recorded. | REQ-F-071, REQ-F-082, REQ-D-010, REQ-D-011 |
| BR-028 | Generated content and design require moderation | risk-control | Recruitment content and mock creative outputs must be reviewed for safety, appropriateness, and policy fit before approval or channel use. | REQ-F-074, REQ-F-083, REQ-C-007, REQ-C-008 |
| BR-029 | Original CV is source of truth | data-integrity | Translated CVs support review and related workflows, but original CV remains the authoritative record and screening decisions must trace to original CV evidence. | REQ-F-092, REQ-F-094, REQ-F-095, REQ-C-009 |
| BR-030 | Original interview record is source of truth | data-integrity | Translated interview notes/transcripts support review, but original notes/transcripts remain the authoritative record for audit and final decision evidence. | REQ-F-100, REQ-F-101, REQ-F-102, REQ-D-013, REQ-C-010 |
| BR-031 | CV evidence detail is review support | ai-governance | CV evidence viewer detail may support HR review, but it must not create a new automated decision gate or replace existing screening approval authority. | REQ-F-110, REQ-F-111, REQ-F-112, REQ-D-014 |
| BR-032 | No OCR without explicit scope decision | scope | Scanned/image-only CV support and OCR remain out of scope unless explicitly added; unsupported documents must not be silently inferred. | REQ-C-013 |
| BR-033 | Utility AI artifacts follow candidate data privacy rules | security | Translated CVs, translated transcripts, evidence details, generated artifacts, prompts, and approvals must follow role-based access, audit, and retention controls appropriate to their source data. | REQ-F-093, REQ-F-101, REQ-D-010, REQ-D-011, REQ-D-012, REQ-D-013, REQ-D-014, REQ-C-010 |
| BR-CV-001 | Original CV is candidate source of truth | data-governance | Original CV PDF is the authoritative candidate source; CandidateProfile, extraction results, and translations are derived artifacts. | REQ-C-009, REQ-D-002, REQ-D-015 |
| BR-CV-002 | CV intake is PDF-first without OCR | scope | MVP CV intake accepts text-native PDF CV files; scanned/image-only CVs are rejected or flagged because OCR is out of scope. | REQ-C-002, REQ-F-003, REQ-F-010 |
| BR-CV-003 | CV version changes require HR re-screen decision | workflow | New CV versions flag HR for manual re-screen decision and must not automatically re-screen later-stage candidates. | REQ-C-015, REQ-D-016 |
| BR-CV-004 | Excel is not primary CV source | scope | Excel may supplement CV metadata but must not replace PDF CV as the candidate source. | REQ-C-014, REQ-F-001 |
| BR-JOB-001 | Approved parsed JD is matching source of truth | data-governance | HR-approved ParsedJDProfile is the operational source of truth for matching; original JD text/file is retained as evidence/reference. | REQ-C-016, REQ-F-006, REQ-F-069, REQ-D-003 |
| BR-JOB-002 | JD approval required before screening | governance | A ParsedJDProfile must be approved by authorized HR before the JD can be used for screening or matching. | REQ-F-069, REQ-C-020 |
| BR-JOB-003 | JD and criteria versioning preserves reproducibility | audit | JD updates create JD versions; criteria tuning may create new ParsedCriteriaVersion without changing the original JD document version, and screening remains tied to the versions used. | REQ-F-076, REQ-C-017, REQ-C-018 |
| BR-JOB-004 | External job connectors are mock-only | scope | ATS, job board, and career site connectors are prototype-only mock UI/status previews and must not imply real external integration in MVP. | REQ-F-077, REQ-C-019, REQ-I-009 |
| BR-SCR-001 | Screening must trace CV and JD versions | audit | Every screening result must store candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion. | REQ-F-078, REQ-D-004, REQ-D-019, REQ-C-018 |

## 6. Use Cases

| ID | Name | Primary Actor | Business Acceptance Criteria | Traces To |
|---|---|---|---|---|
| UC-001 | Import candidate CV PDFs | HR Recruiter | Valid PDF CVs import successfully<br>Invalid files are reported<br>Duplicate candidates are flagged<br>Import result is auditable | REQ-F-001, REQ-F-003, REQ-F-006, REQ-F-010 |
| UC-002 | Auto-import candidate CVs from Google Drive | System | Drive scan/trigger imports valid PDF CVs<br>Same file does not create duplicates<br>Invalid files/subfolders alert owner | REQ-F-003, REQ-I-001 |
| UC-003 | Approve AI screening result | HR Manager | Decision actor/timestamp recorded<br>Bulk approval supported<br>No auto-action on timeout | REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-017, REQ-F-052, REQ-F-054 |
| UC-004 | Approve interview schedule | HR Manager | At least 3 valid slots shown when available<br>Calendar event created only after approval<br>Emails sent from shared mailbox | REQ-F-020, REQ-F-021, REQ-F-022, REQ-F-023, REQ-F-024, REQ-F-025 |
| UC-005 | Complete async AI interview | Candidate | Progress survives multiple sessions<br>Deadline/reminders are enforced<br>Report includes recommendation and evidence | REQ-F-030, REQ-F-031, REQ-F-032, REQ-F-033, REQ-F-034, REQ-F-035, REQ-F-036, REQ-F-037 |
| UC-006 | Grade candidate test | System | MCQ is exact<br>Essay/coding scores include justification<br>Override requires reason | REQ-F-042, REQ-F-043, REQ-F-044, REQ-F-045, REQ-F-046 |
| UC-007 | Finalize candidate outcome | HR Manager | Final decision is human-owned<br>Override reason is stored<br>State history is visible | REQ-F-045, REQ-F-050, REQ-F-055, REQ-NF-007 |
| UC-008 | Send workflow notifications and reminders | System | Candidate-facing emails use shared HR mailbox<br>Templates are configurable<br>HR Manager receives pending-action notifications<br>Interview reminders are sent as configured | REQ-F-026, REQ-F-060, REQ-F-061, REQ-F-062, REQ-I-003 |
| UC-009 | Withdraw candidate from pipeline | HR Recruiter | Withdrawal can be recorded from any non-terminal stage<br>Pending actions are closed or cancelled<br>Withdrawal is audited and visible in state history | REQ-F-056, REQ-F-055, REQ-NF-007 |
| UC-010 | Remediate pipeline error | IT Admin | Every ERROR has reason and owner<br>Owner receives notification<br>Resolution returns candidate to prior state or WITHDRAWN | REQ-F-018, REQ-NF-010, REQ-NF-007 |
| UC-011 | Generate and approve recruitment content | HR Recruiter / HR Manager | HR can generate editable content suggestions from job context<br>HR approval is recorded before copy/export/file/channel publish<br>Approved content can be manually copied, exported to file, or sent through configured channel connector | REQ-F-070, REQ-F-071, REQ-F-072, REQ-F-073, REQ-F-074, REQ-F-075, REQ-C-007, REQ-C-011 |
| UC-012 | Generate and approve mock recruitment design | HR Recruiter / HR Manager | HR can generate mock creative previews without real image provider integration<br>HR can select/review generated mock assets<br>HR approval is required before export or use | REQ-F-080, REQ-F-081, REQ-F-082, REQ-F-083, REQ-C-008, REQ-C-012 |
| UC-013 | Review CV evidence detail | HR Manager | HR can view original CV, extracted text, and screening/JD-linked evidence detail<br>Evidence detail is review support and does not change pipeline state<br>Unsupported scanned/OCR-needed documents remain clearly out of scope | REQ-F-110, REQ-F-111, REQ-F-112, REQ-D-014, REQ-C-013 |
| UC-014 | Translate CV for HR review | HR Recruiter / HR Manager | HR can translate CV content across vi/en/ja<br>Translated CV is linked to original CV<br>Screening decisions remain traceable to original CV | REQ-F-090, REQ-F-091, REQ-F-092, REQ-F-093, REQ-F-094, REQ-F-095, REQ-C-009, REQ-C-010 |
| UC-015 | Translate interview notes or transcript | HR Recruiter / HR Manager | HR can translate interview notes/transcripts across vi/en/ja<br>Translated interview content remains access-controlled<br>Original interview record remains authoritative for audit | REQ-F-100, REQ-F-101, REQ-F-102, REQ-D-013, REQ-C-010 |
| UC-CV-001 | Import candidate CV PDFs | HR Recruiter, System | Drive folder trigger/scan imports valid PDF CVs<br>Multi-file upload imports valid PDF CVs<br>Invalid Drive items are reported to HR<br>CandidateProfile is linked to original CV and CVVersion | REQ-F-001, REQ-F-002, REQ-F-003, REQ-F-005, REQ-D-001, REQ-D-002, REQ-D-015, REQ-D-016 |
| UC-CV-002 | Handle updated CV version | HR Recruiter | New CV file creates a new CVVersion<br>System flags candidate as CV updated<br>HR manually decides whether to re-screen<br>Existing later-stage workflow is not auto-reset | REQ-F-001, REQ-C-015, REQ-D-016 |
| UC-JOB-001 | Create or import Job/JD | HR Recruiter | Manual job creation is supported<br>JD text/file/Drive/Sheet sources create job drafts<br>Original JD is retained as evidence/reference | REQ-F-004, REQ-D-003, REQ-D-017, REQ-I-001, REQ-I-008 |
| UC-JOB-002 | Review and approve ParsedJDProfile | HR Manager | LLM parsed JD profile is reviewable<br>HR can edit/resubmit or re-upload/re-parse after rejection<br>Approved profile becomes matching source of truth<br>Unapproved parsed JD cannot be used for screening | REQ-F-068, REQ-F-069, REQ-C-016, REQ-C-020 |
| UC-JOB-003 | Manage JD and criteria versions | HR Manager | JD updates create JDVersion<br>Criteria tuning creates ParsedCriteriaVersion when needed<br>Prior screening remains tied to prior versions | REQ-F-076, REQ-C-017, REQ-C-018 |
| UC-JOB-004 | Preview external job source mock connectors | HR Recruiter | Connector cards show mock status<br>Preview includes full mock requisition fields<br>UI clearly marks no real integration | REQ-F-077, REQ-I-009, REQ-C-019 |
| UC-SCR-TRACE | Run traceable CV/JD screening | System, HR Manager | Screening uses CandidateProfile/CVVersion and approved ParsedJDProfile/ParsedCriteriaVersion<br>Result stores candidateId, cvVersionId, jobId, jdVersionId, parsedCriteriaVersion<br>HR can audit CV and JD source references | REQ-F-011, REQ-F-078, REQ-D-004, REQ-D-019 |

## 7. Business Acceptance Criteria

| ID | Criterion | Traces To |
|---|---|---|
| BAC-001 | MVP supports full pipeline from import to final decision without requiring Phase 2 utility AI modules. | REQ-C-005, REQ-C-006 |
| BAC-002 | Every business decision gate has an accountable HR Manager decision recorded. | REQ-F-017, REQ-F-023, REQ-F-050, REQ-NF-007 |
| BAC-003 | Every AI recommendation used by HR includes explainability and confidence information. | REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-NF-AI-005 |
| BAC-004 | Candidate confidential data is protected by RBAC, encryption, and audit logs. | REQ-NF-005, REQ-NF-006, REQ-NF-007, REQ-NF-008 |
| BAC-005 | Phase 2 utility AI modules are explicitly in prototype scope but do not block Phase 1/MVP pipeline acceptance. | REQ-C-006 |
| BAC-006 | Generated recruitment content and mock design assets require recorded HR approval before export, publishing, or use. | REQ-F-074, REQ-F-083, REQ-C-007, REQ-C-008, REQ-C-011 |
| BAC-007 | CV and interview translations preserve source linkage, access control, and source-of-truth warnings. | REQ-F-092, REQ-F-093, REQ-F-094, REQ-F-095, REQ-F-101, REQ-F-102, REQ-C-009, REQ-C-010 |
| BAC-008 | CV evidence detail supports HR review with original/extracted/evidence context and does not introduce OCR or a new automated decision gate. | REQ-F-110, REQ-F-111, REQ-F-112, REQ-C-013 |

## 8. Risks

| ID | Risk | Impact | Likelihood | Mitigation | Traces To |
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
| RISK-012 | Drive CV trigger or scan may miss files or surface invalid folder contents | Medium | Medium | Import error report, retry/backoff, HR notification, manual multi-file upload fallback | REQ-F-001, REQ-F-003, REQ-I-001 |
| RISK-013 | LLM CV extraction may produce low-confidence CandidateProfile | High | Medium | Store extraction confidence/errors, require HR review on low confidence, preserve original CV source of truth | REQ-F-005, REQ-D-015, REQ-C-009 |
| RISK-014 | Unapproved or poorly parsed JD could distort screening | High | Medium | Require HR approval of ParsedJDProfile before screening and retain original JD evidence | REQ-F-068, REQ-F-069, REQ-C-016, REQ-C-020 |
| RISK-015 | Weak JD/CV version traceability can make screening decisions non-reproducible | High | Medium | Store candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion on each screening result | REQ-F-078, REQ-C-018, REQ-D-004 |
| RISK-016 | Prototype mock external connectors may be mistaken for real integrations | Medium | Medium | Mark connector status as mock/prototype-only and exclude real API expectations from MVP | REQ-F-077, REQ-C-019 |

## 9. Open Questions

| ID | Question | Owner | Impact |
|---|---|---|---|
| BQ-001 | What exact AI confidence threshold requires manual review? | HR Manager |  |
| BQ-002 | Who is the backup approver for screening/scheduling escalation? | HR Manager |  |
| BQ-003 | What retention/deletion policy applies to CVs, transcripts, and test submissions? | HR Manager / IT Admin |  |
| BQ-004 | What coding sandbox/runtime is approved? | IT Admin |  |
| BQ-005 | What exact Drive folder, ownership, webhook renewal, and naming convention should be used for MVP? | IT Admin |  |
| BQ-006 | What is the final combined pass/fail policy across screening, interview, and test? | HR Manager |  |
| BQ-007 | What is the Calendar reschedule/cancel policy after event creation? | HR Manager / IT Admin |  |
| BQ-008 | Which specific recruitment publishing channels are included in the Phase 2 prototype connector set? | HR Manager / IT Admin |  |
| BQ-009 | Which export file formats are required for generated recruitment content beyond TXT/DOCX? | HR Manager |  |
| BQ-010 | What mock design asset sizes/templates are required for banners, posters, and social assets? | HR Manager |  |
| BQ-011 | What level of CV evidence detail is required: extracted text only, evidence spans, or reasoning trace? | HR Manager |  |

## 10. CV Intake and Job/JD Intake Business Separation

- Candidate/CV Intake and Job/JD Intake are separate business domains.
- CV source of truth: original CV PDF.
- JD source of truth: HR-approved ParsedJDProfile.
- Original JD text/file is evidence/reference.
- Screening is the cross-domain process and must trace candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion.
