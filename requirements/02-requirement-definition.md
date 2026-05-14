# Requirement Definition: RecruitAI — System Recruitment AI Automation

Generated: 2026-05-14T00:00:00Z
Language: bilingual
Project type: data-ai
Upstream: $(@{metadata=; summary=; scope=; functionalRequirements=System.Object[]; nonFunctionalRequirements=System.Object[]; dataRequirements=System.Object[]; integrationRequirements=System.Object[]; constraints=System.Object[]; conflicts=System.Object[]; validation=; openQuestions=System.Object[]; p0ContractClosure=}.metadata.upstream)"
# Requirement Definition: RecruitAI — System Recruitment AI Automation  Generated: 2026-05-14T00:00:00Z Language: bilingual Project type: data-ai += "
# Requirement Definition: RecruitAI — System Recruitment AI Automation  Generated: 2026-05-14T00:00:00Z Language: bilingual Project type: data-ai += 

- **Product goal**: Automate end-to-end recruitment pipeline with AI-powered screening, scheduling, interview, and grading under HR Manager oversight
- **Primary users**: HR Recruiter, HR Manager, Interviewer
- **Core problem**: Manual recruitment process does not scale at >200 jobs/month
- **Must-have scope (MVP)**: Candidate/CV Intake, Job/JD Intake, CV Screening, Interview Scheduling, AI Interview, Test Grading, Approval Workflow, Google Workspace Integration
- **Phase 2 Prototype Scope**: Recruitment content generation (copy/export/file/channel integration with HR approval); AI design/mock generation (no real image provider required, HR approval required before use); CV translation (vi/en/ja, original CV is source of truth, screening decisions trace to original); Interview transcript/notes translation (vi/en/ja, confidential storage); CV Evidence Viewer utility (integrated on screening/final review screens, not MVP depth)
- **Explicitly out of scope**: Multi-tenant; Realtime voice/video; Third-party ATS/CRM; Mobile native; Post-hire onboarding; CV/Interview translation integrated into Phase 1 core pipeline; CV Evidence Viewer deep-link detail in Phase 1/MVP

## 2. Scope

### In Scope

| ID | Scope Item | Source |
|---|---|---|
| SCOPE-IN-001 | Candidate/CV Intake (Drive folder trigger/scan, multi-file PDF upload, manual single CV PDF + optional metadata; Excel metadata support only) | RAW-001, RAW-002, RAW-003, RAW-042, RAW-043 |
| SCOPE-IN-002 | Job/JD Intake (manual job creation, JD text input, JD PDF/DOCX upload, Drive JD import, Sheet/Excel job requisition import, parsed JD approval) | RAW-004, RAW-044, RAW-045, RAW-047 |
| SCOPE-IN-003 | AI-powered CV screening with scoring and explainability | RAW-005 to RAW-009 |
| SCOPE-IN-004 | Human approval workflow (screening + scheduling) | RAW-010, RAW-013, RAW-031, RAW-033 |
| SCOPE-IN-005 | Automated interview scheduling via Google Calendar | RAW-012 to RAW-017 |
| SCOPE-IN-006 | AI async interview (text chat, hybrid questions) | RAW-018 to RAW-021 |
| SCOPE-IN-007 | Automated test grading (MCQ, essay, coding) | RAW-022 to RAW-025 |
| SCOPE-IN-008 | Google Workspace integration (Gmail, Calendar, Drive) | RAW-039 |
| SCOPE-IN-009 | Candidate state machine and pipeline automation | RAW-030, RAW-031 |
| SCOPE-IN-010 | Multi-language support (Vi, Ja, En) | RAW-021, RAW-036 |
| SCOPE-IN-011 | Role-based access control | RAW-038 |
| SCOPE-IN-012 | External job source connector mock previews (ATS, job board, career site status only; no real integration) | RAW-046 |

### Out of Scope

| ID | Item | Reason | Source |
|---|---|---|---|
| SCOPE-OUT-001 | Multi-tenant / agency mode | Internal HR only | RAW-040 |
| SCOPE-OUT-002 | Realtime voice/video interview | Async text only for MVP | RAW-018 |
| SCOPE-OUT-003 | Third-party ATS/CRM integration | No constraint | RAW-037 |
| SCOPE-OUT-004 | Mobile native app | Web responsive sufficient |  |
| SCOPE-OUT-005 | Post-hire onboarding | Beyond scope |  |
| SCOPE-OUT-006 | CV/Interview translation integrated into Phase 1 core pipeline | Utility modules are Phase 2 prototype standalone outside Phase 1/MVP core pipeline | RAW-028, RAW-029, RAW-032 |
| SCOPE-OUT-007 | CV Evidence Viewer deep-link detail in Phase 1/MVP | Evidence viewer is Phase 2 prototype utility; screening/final review screens show summary only in MVP | RAW-041 |

## 3. Functional Requirements

| ID | Requirement Statement | Priority | Rationale | Acceptance Criteria | Source RAW |
|---|---|---|---|---|---|
| REQ-F-001 | The system shall import candidate CVs in batch from text-native PDF files using Google Drive folder trigger/scan as the primary path and multi-file PDF upload as the secondary path | P0 | Candidate intake is CV-driven and Excel is no longer the primary candidate source | Given PDF CVs are available in the configured Drive folder, When scan runs or trigger fires, Then valid PDF CVs are imported and invalid items are reported<br>Given HR uploads multiple PDF CVs, When import completes, Then each valid CV creates or updates a candidate CV version | RAW-001, RAW-003, RAW-042 |
| REQ-F-002 | The system shall allow HR Recruiter to manually create a candidate from a single CV PDF upload with optional metadata | P0 | Manual candidate creation still starts from the candidate CV | Given HR uploads one valid PDF CV and optional metadata, When submitted, Then candidate record and initial CV version are created | RAW-002, RAW-043 |
| REQ-F-003 | The system shall scan configured Google Drive CV folders and flag non-PDF files or nested subfolders as import errors visible to HR | P0 | Drive is the primary CV source and invalid items must not be silent | Given Drive folder contains invalid items, When scan completes, Then each invalid item appears in the import error report | RAW-003 |
| REQ-F-004 | The system shall support Job/JD Intake through manual job creation, JD text input, JD PDF/DOCX upload, Google Drive JD import, and Sheet/Excel job requisition import | P0 | Job/JD source is a separate intake domain from Candidate/CV Intake | Given HR provides job/JD through any supported MVP source, When submitted, Then a job draft and original JD evidence/reference are created | RAW-004, RAW-044, RAW-045 |
| REQ-F-005 | The system shall use LLM extraction on text-native PDF CV content to create a CandidateProfile linked to the original CV and CV version | P1 | Structured candidate profile is derived from original CV source of truth | Given valid text-native PDF CV, When extraction runs, Then CandidateProfile is created with extraction metadata and linked CV version | RAW-005, RAW-043 |
| REQ-F-006 | The system shall maintain Job/JD profiles separately from CandidateProfiles and use the HR-approved ParsedJDProfile as the operational source of truth for matching | P1 | Job source of truth differs from CV source of truth | Given parsed JD profile is approved, When screening runs, Then matching uses the approved ParsedJDProfile, not raw JD text alone | RAW-004, RAW-044 |
| REQ-F-010 | The system shall extract text content only from text-native PDF CV files for MVP processing | P0 | Prerequisite for AI analysis | Given valid CV, When processing, Then full text extracted within 5s | RAW-005, RAW-011, RAW-043 |
| REQ-F-011 | The system shall use AI to match CandidateProfile/CVVersion against approved ParsedJDProfile/ParsedCriteriaVersion and produce a matching score (0-100) | P0 | Core screening automation | Given CV and JD, When screening, Then score 0-100 within 30s | RAW-005, RAW-006, RAW-044, RAW-045 |
| REQ-F-012 | The system shall generate summary of candidate strengths and weaknesses relative to JD | P0 | Explainability | Given screening done, Then 3-5 strengths and 3-5 weaknesses listed | RAW-007 |
| REQ-F-013 | The system shall identify and flag critical risk factors in candidate profile | P0 | Risk awareness | Given screening done, Then risk flags listed | RAW-008 |
| REQ-F-014 | The system shall list JD-required skills missing from CV | P0 | Gap analysis | Given screening done, Then missing skills enumerated with importance | RAW-009 |
| REQ-F-015 | The system shall apply configurable matching weights (default: Skills 40%, Experience 30%, Language 20%, Education 10%) | P1 | Different jobs have different priorities | Given custom weights, When screening, Then scoring uses those weights | RAW-005 |
| REQ-F-016 | The system shall support bulk screening of multiple CVs against one JD | P0 | Scale | Given 50 CVs, When bulk screen, Then all processed | RAW-005, RAW-035 |
| REQ-F-017 | The system shall present screening results to HR Manager for approval | P0 | Human-in-the-loop | Given results ready, When HR Manager views, Then can approve/reject individually or bulk | RAW-010 |
| REQ-F-018 | The system shall handle unreadable/corrupted CV files gracefully | P1 | Error resilience | Given corrupted file, Then mark ERROR, do not block others | RAW-005 |
| REQ-F-020 | The system shall collect candidate availability via email form/link | P0 | Need candidate input | Given approved candidate, When request sent, Then candidate can select slots | RAW-012 |
| REQ-F-021 | The system shall read interviewer free/busy from Google Calendar | P0 | Avoid conflicts | Given GCal connected, When checking, Then free/busy read accurately | RAW-012, RAW-014 |
| REQ-F-022 | The system shall suggest optimal interview slots based on availability | P0 | Core scheduling | Given availability data, Then suggest top 3 slots (earliest first, 30min buffer, within working hours 9-18 local timezone) | RAW-012, RAW-013 |
| REQ-F-023 | The system shall require HR Manager approval before confirming schedule | P0 | Human oversight | Given suggested slots, When approved, Then proceed; if rejected, re-suggest | RAW-013, RAW-031 |
| REQ-F-024 | The system shall create Google Calendar events upon schedule approval | P0 | Calendar integration | Given approved slot, Then GCal event created with all participants | RAW-014 |
| REQ-F-025 | The system shall send confirmation emails via shared HR mailbox | P0 | Communication | Given confirmed, Then emails sent from hr@company.com | RAW-015 |
| REQ-F-026 | The system shall send interview reminder emails | P1 | Reduce no-shows | Given confirmed interview, When reminder time, Then email sent | RAW-016 |
| REQ-F-027 | The system shall support multi-timezone scheduling | P1 | International candidates | Given different TZs, Then correct local time shown | RAW-017 |
| REQ-F-030 | The system shall generate unique interview link per candidate | P0 | Async delivery | Given candidate ready, Then unique URL generated | RAW-018 |
| REQ-F-031 | The system shall send interview invitation with link and 72h deadline | P0 | Delivery | Given link generated, Then email sent with instructions | RAW-018, RAW-015 |
| REQ-F-032 | The system shall present 5-7 fixed interview questions per job | P0 | Structured assessment | Given interview started, Then fixed questions shown sequentially | RAW-019 |
| REQ-F-033 | The system shall generate 2-3 AI follow-up questions based on answers | P0 | Deeper assessment | Given answer submitted, Then contextual follow-up generated | RAW-019 |
| REQ-F-034 | The system shall support interview in Vietnamese, Japanese, and English | P0 | Multi-language | Given JD language, Then interview in matching language | RAW-021 |
| REQ-F-035 | The system shall allow async text answers within 72h deadline | P0 | Async nature | Given link, Then progress saved across sessions, deadline enforced | RAW-018 |
| REQ-F-036 | The system shall use AI to evaluate responses and generate assessment report | P0 | Automated evaluation | Given all answers, Then report with score, strengths, concerns, recommendation | RAW-020 |
| REQ-F-037 | The system shall send reminder if interview not completed within 48h | P1 | Completion rate | Given 48h passed, Then reminder email sent | RAW-018 |
| REQ-F-040 | The system shall allow test import from Excel/JSON with questions and answer keys | P0 | Test setup | Given valid file, Then test available for assignment | RAW-022 |
| REQ-F-041 | The system shall send test assignment to candidate via email with link | P0 | Test delivery | Given TEST_PENDING, Then email sent with link and deadline | RAW-022 |
| REQ-F-042 | The system shall auto-grade MCQ against answer key with 100% accuracy | P0 | Deterministic grading | Given MCQ submission, Then score matches key exactly | RAW-023 |
| REQ-F-043 | The system shall use AI to grade essays based on rubric (0-100) | P0 | AI grading | Given essay + rubric, Then score 0-100 with justification | RAW-024 |
| REQ-F-044 | The system shall grade coding challenges via test cases and AI code quality review | P0 | Technical assessment | Given code submission, Then test pass rate + quality score + feedback | RAW-025 |
| REQ-F-045 | The system shall generate consolidated test report with scores and pass/fail | P0 | Decision support | Given all graded, Then report with section scores, total, pass/fail | RAW-022 |
| REQ-F-046 | The system shall support configurable pass threshold per job (default 60%) | P1 | Flexibility | Given threshold set, Then pass/fail determined accordingly | RAW-022 |
| REQ-F-050 | The system shall auto-transition candidate state except at approval points | P0 | Automation core | Given auto-transition state, When condition met, Then advances automatically | RAW-030 |
| REQ-F-051 | The system shall require HR Manager approval at screening and scheduling stages | P0 | Human oversight | Given approval point reached, Then pipeline pauses, notification sent | RAW-031 |
| REQ-F-052 | The system shall support bulk approval | P0 | Efficiency at scale | Given multiple pending, Then batch approve/reject in one action | RAW-010, RAW-013 |
| REQ-F-053 | The system shall send reminder after 24h if approval pending | P1 | Prevent stalling | Given >24h pending, Then reminder sent | RAW-033 |
| REQ-F-054 | The system shall never auto-cancel or auto-skip pending approvals | P0 | Business rule | Given indefinite pending, Then only reminders, no auto-action | RAW-033 |
| REQ-F-055 | The system shall track and display candidate state throughout pipeline | P0 | Visibility | Given any candidate, Then current state and history visible on dashboard | RAW-030 |
| REQ-F-056 | The system shall support candidate withdrawal at any stage | P1 | Real-world scenario | Given withdrawal, Then state=WITHDRAWN, pipeline stops, stakeholders notified | RAW-030 |
| REQ-F-060 | The system shall send all candidate emails from shared HR mailbox | P0 | Professional communication | Given any candidate email, Then from=shared HR mailbox | RAW-015 |
| REQ-F-061 | The system shall support configurable email templates | P1 | Customization | Given template configured, Then used with dynamic fields | RAW-015 |
| REQ-F-062 | The system shall notify HR Manager of pending actions | P0 | Workflow awareness | Given action required, Then notification within 1 min | RAW-010, RAW-013, RAW-031, RAW-033 |
| REQ-F-070 | The system shall allow HR to request AI-generated recruitment content based on job info and tone/style preferences | P2 | Reduce HR time drafting job ads | Given job info and tone setting, When HR requests content, Then 2-3 suggestions generated within 60s | RAW-026 |
| REQ-F-071 | The system shall present generated content as editable suggestions for HR review | P2 | Human editing before publishing | Given content generated, When HR views, Then can edit inline and see changes | RAW-026 |
| REQ-F-072 | The system shall support manual copy and export of approved content to file formats (TXT, DOCX) | P2 | HR needs portable output | Given content approved and export requested, Then copy to clipboard or download as file | RAW-026a |
| REQ-F-073 | The system shall support channel integration for content publishing via connector interfaces | P2 | Publish content directly to channels | Given channel connectors configured, When HR publishes approved content, Then sent via connector API with status tracked | RAW-026a |
| REQ-F-074 | The system shall require HR Manager approval before any content is exported, published, or shared | P2 | Content governance | Given content generated, When export/publish attempted, Then approval required; unauthorized distribution blocked | RAW-026, RAW-026a |
| REQ-F-075 | The system shall track content version history including HR editor changes and approval decisions | P2 | Audit and compliance | Given content modified, When viewed later, Then version history shows all changes and approvers | RAW-026 |
| REQ-F-080 | The system shall generate mock/preview visual assets (banners, posters, social images) based on job content and design brief | P2 | Visual content for job postings | Given job info and design parameters, When HR requests design, Then mock/preview image generated | RAW-027 |
| REQ-F-081 | The system shall generate design as mock/preview without requiring real external image generation API | P2 | No external design API dependency in Phase 2 | Given design request, When processed, Then preview asset produced internally; no third-party design API required | RAW-027, RAW-027b |
| REQ-F-082 | The system shall allow HR to review, select, and approve generated designs | P2 | Human selection before use | Given multiple design options, When HR reviews, Then can select best match and approve | RAW-027, RAW-027a |
| REQ-F-083 | The system shall require HR Manager approval before any design asset is exported or used | P2 | Design governance | Given design selected, When export/use requested, Then approval required; unapproved designs cannot be exported | RAW-027, RAW-027a |
| REQ-F-090 | The system shall translate CV text between Vietnamese, Japanese, and English | P2 | Multi-language recruitment support | Given CV in source language (vi/en/ja), When translation requested, Then full CV translated to target language | RAW-028 |
| REQ-F-091 | The system shall preserve CV structure and formatting during translation | P2 | Readability of translated CV | Given CV with sections/formatting, When translated, Then section structure and basic formatting preserved | RAW-028 |
| REQ-F-092 | The system shall mark translated CV as derived work and link to original CV | P2 | Source-of-truth traceability | Given translation generated, Then record shows original CV reference and translation metadata | RAW-028, RAW-028a |
| REQ-F-093 | The system shall store translated CV with same access controls as original CV | P2 | Privacy for candidate data | Given translated CV created, When stored, Then access restricted to authorized roles; not shared externally | RAW-028, RAW-028a |
| REQ-F-094 | The system shall support translated CV in screening and final review for HR review; screening decisions must trace to original CV | P2 | Translation is review aid, not decision basis | Given screening/review with translated CV, When decision made, Then decision record references original CV | RAW-028, RAW-028a, RAW-041 |
| REQ-F-095 | The system shall display a visible notice that translated content is a translation and not the official record | P2 | Transparency for HR users | Given translated CV displayed, When viewed, Then clear notice: Translation only -- refer to original CV | RAW-028, RAW-028a |
| REQ-F-100 | The system shall translate interview notes and transcripts between Vietnamese, Japanese, and English | P2 | Multi-language interview support | Given interview notes in source language, When translation requested, Then notes/transcript translated to target language | RAW-029 |
| REQ-F-101 | The system shall store translated interview content with access controls restricted to HR roles | P2 | Interview confidentiality | Given translated notes stored, When accessed, Then only authorized HR roles can view; not shared externally | RAW-029, RAW-029a |
| REQ-F-102 | The system shall link translated interview content back to original document | P2 | Audit trail | Given translation generated, Then record shows original interview reference and translator model version | RAW-029, RAW-029a |
| REQ-F-110 | The system shall display screening and final review screens with evidence summary (scores, flags, missing skills) | P2 | HR decision support | Given screening or review screen, When HR views candidate, Then evidence summary visible with key signals | RAW-041 |
| REQ-F-111 | The system shall support navigation to CV evidence detail view (Phase 2) as integrated utility on screening/final review screens | P2 | Evidence depth on demand | Given summary on screening/review screen, When HR clicks to drill down, Then CV evidence detail opened as integrated view | RAW-041, UC-CVIEW |
| REQ-F-112 | The system shall display CV evidence detail as standalone viewer integrated into existing screens, without blocking primary review workflow | P2 | Non-disruptive evidence access | Given HR in review workflow, When opening evidence detail, Then workflow state preserved; detail shown as panel/modal | RAW-041, UC-CVIEW |
| REQ-F-068 | The system shall parse JD text or documents with LLM into a structured ParsedJDProfile for HR review | P0 | JD must be normalized before it becomes matching criteria | Given JD source is submitted, When parsing completes, Then required criteria fields and parse confidence are available for HR review | RAW-004, RAW-047 |
| REQ-F-069 | The system shall require HR approval of ParsedJDProfile before the JD can be used for screening or matching | P0 | Prevent unreviewed AI-parsed criteria from driving screening decisions | Given parsed JD is pending review, When screening is requested, Then screening is blocked until approval<br>Given HR rejects parsed JD, Then HR can edit/resubmit or re-upload/re-parse | RAW-044, RAW-047 |
| REQ-F-076 | The system shall support Job/JD versioning and ParsedCriteriaVersion history for screening reproducibility | P0 | Screening results must be reproducible across JD and criteria changes | Given JD is updated, Then a new JD version is created<br>Given weights or criteria are tuned without changing original JD, Then a new parsedCriteriaVersion is created | RAW-045 |
| REQ-F-077 | The system shall display prototype-only mock connector status and import previews for ATS, job board, and career site job sources without real external API integration | P0 | External sources are useful for prototype demonstration but not real MVP integration | Given HR opens external source connectors, Then mock status and requisition preview fields are visible and clearly marked as mock | RAW-046 |
| REQ-F-078 | The system shall store screening trace references to candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion | P0 | Cross-domain traceability connects CV source and JD source for every screening result | Given screening result is generated, Then all CV/JD version reference fields are stored with the result | RAW-006, RAW-007, RAW-045 |

## 4. Non-Functional Requirements

| ID | Requirement Statement | Priority | Rationale | Acceptance Criteria | Source RAW |
|---|---|---|---|---|---|
| REQ-NF-001 |  | P0 |  |  | RAW-035 |
| REQ-NF-002 |  | P0 |  |  | RAW-035 |
| REQ-NF-003 |  | P1 |  |  | RAW-035 |
| REQ-NF-004 |  | P1 |  |  | RAW-035 |
| REQ-NF-005 |  | P0 |  |  | RAW-038 |
| REQ-NF-006 |  | P0 |  |  | RAW-038 |
| REQ-NF-007 |  | P0 |  |  | RAW-038 |
| REQ-NF-008 |  | P0 |  |  | RAW-038 |
| REQ-NF-009 |  | P1 |  |  | RAW-035 |
| REQ-NF-010 |  | P1 |  |  | RAW-035 |
| REQ-NF-011 |  | P1 |  |  | RAW-035 |
| REQ-NF-012 |  | P2 |  |  | RAW-035 |

## 5. Data Requirements

| ID | Data Need | Business Meaning | Owner | Sensitivity | Source RAW |
|---|---|---|---|---|---|
| REQ-D-001 | CandidateProfile extracted from CV | Structured candidate profile derived from original CV | System | confidential | RAW-005, RAW-043 |
| REQ-D-002 | CandidateCV original PDF file and Drive source link | Candidate source of truth and provenance | HR Recruiter | confidential | RAW-001, RAW-003, RAW-043 |
| REQ-D-003 | Job, OriginalJDDocument, JDVersion, ParsedJDProfile, and ParsedCriteriaVersion | Job/JD source records and approved matching criteria | HR Recruiter, HR Manager | internal | RAW-004, RAW-044, RAW-045 |
| REQ-D-004 | Screening results with candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion | Reproducible CV/JD matching output | System | internal | RAW-006, RAW-007, RAW-045 |
| REQ-D-005 | Interview transcript and evaluation | Async interview records | System | confidential | RAW-018, RAW-020 |
| REQ-D-006 | Test submissions and grades | Test performance | System | confidential | RAW-022, RAW-023, RAW-024, RAW-025 |
| REQ-D-007 | Candidate state history | Pipeline audit trail | System | internal | RAW-030 |
| REQ-D-008 | Approval decisions | Compliance record | HR Manager | internal | RAW-031 |
| REQ-D-009 | Email communication log | Sent emails record | System | internal | RAW-015 |
| REQ-D-010 | Generated recruitment content (draft, approved, rejected) | Content drafts and approval records | HR Recruiter, HR Manager | internal | RAW-026 |
| REQ-D-011 | Generated design/mock assets (draft, approved) | Design asset versions and approval records | HR Recruiter, HR Manager | internal | RAW-027 |
| REQ-D-012 | Translated CV (source-linked, metadata) | Translated candidate documents | HR Recruiter, HR Manager | confidential | RAW-028, RAW-028a |
| REQ-D-013 | Translated interview notes/transcripts | Translated interview records | HR Recruiter, HR Manager | confidential | RAW-029, RAW-029a |
| REQ-D-014 | CV evidence viewer summary data | Screening/final review evidence display | HR Manager | internal | RAW-041 |
| REQ-D-015 | CVExtractionResult | LLM extraction output, confidence, errors, and metadata for CV processing | System | confidential | RAW-005 |
| REQ-D-016 | CVVersion | Version history for candidate CV updates | System | confidential | RAW-042 |
| REQ-D-017 | JobRequisitionImport | Sheet/Excel requisition import records for Job/JD Intake | HR Recruiter | internal | RAW-004 |
| REQ-D-018 | ExternalJobSourceConnectorMock | Prototype-only ATS/job board/career site connector status and preview data | System | internal | RAW-046 |
| REQ-D-019 | CandidateApplication | Canonical relationship between candidate and job for screening/application tracking | System | internal | RAW-006, RAW-007 |

## 6. Integration Requirements

| ID | System | Purpose | Data Exchanged | Failure Expectation | Source RAW |
|---|---|---|---|---|---|
| REQ-I-001 | Google Drive API | Drive folder trigger/scan for CV PDF intake and Drive JD import | File metadata, Drive links, text-native PDF CV content, JD document references | Retry with backoff; flag invalid files/subfolders; alert HR after repeated failures | RAW-003, RAW-004, RAW-039 |
| REQ-I-002 | Google Calendar API | Read free/busy, create events | Slots, event details | Fallback to manual scheduling | RAW-014, RAW-039 |
| REQ-I-003 | Gmail API | Send emails from shared mailbox | Email content | Queue and retry; alert on failure | RAW-015, RAW-039 |
| REQ-I-004 | LLM API | CV screening, interview evaluation, test grading | Prompts + text -> AI responses | Retry with backoff; queue if rate limited; route sustained failures to manual review | RAW-005, RAW-020, RAW-022 |
| REQ-I-005 | LLM API (Phase 2) | Recruitment content generation, CV translation, interview transcript/notes translation | Prompts + job/CV/interview content -> AI responses | Retry with backoff; queue if rate limited; content gated by HR approval before export/publish | RAW-026, RAW-028, RAW-029 |
| REQ-I-006 | AI Design Mock Generator (Phase 2) | Generate preview/mock design assets (banners, posters, social images) | Design brief + job content -> mock/preview image asset | Fail gracefully; no external design API required; output is mock asset for HR approval | RAW-027, RAW-027b |
| REQ-I-007 | Content Channel Connectors (Phase 2) | Publish approved content to external channels | Approved content + channel config -> connector API call | Queue if connector unavailable; track publish status; require HR approval before dispatch | RAW-026a |
| REQ-I-008 | Sheet/Excel Import | Import job requisitions as Job/JD Intake source and optional CV metadata support | Spreadsheet rows, requisition metadata, optional candidate metadata | Validate required columns; import valid rows and report invalid rows | RAW-001, RAW-004 |
| REQ-I-009 | External Job Source Connector Mock | Display prototype-only ATS/job board/career site connector status and import previews | Mock requisition ID, job title, department, location, work mode, employment type, seniority, language, compensation, hiring manager, headcount, source, last sync status, JD summary | No real API call; clearly mark mock state and unavailable integrations | RAW-046 |

## 7. Constraints

| ID | Constraint | Type | Impact | Source RAW |
|---|---|---|---|---|
| REQ-C-001 | Internal HR only, no multi-tenant | business | Single-org data model | RAW-040 |
| REQ-C-002 | MVP CV intake accepts text-native PDF CV files only; OCR is excluded | technical | Scanned/image-only CV files are rejected or flagged for HR | RAW-005, RAW-011, RAW-043 |
| REQ-C-003 | Depends on Google Workspace | platform | All scheduling/email requires Google APIs | RAW-039 |
| REQ-C-004 | Approval no timeout, only reminders | business | Pipeline can stall at approval points | RAW-033 |
| REQ-C-005 | MVP = full pipeline | business | All 5 stages must work at launch | RAW-034 |
| REQ-C-006 | Content/Design/Translation/CV evidence viewer are Phase 2 prototype standalone; excluded from Phase 1/MVP core pipeline | business | Do not implement Phase 2 standalone tools in first release | RAW-026, RAW-026a, RAW-027, RAW-027a, RAW-028, RAW-029, RAW-032, RAW-034, RAW-041 |
| REQ-C-007 | Generated recruitment content requires HR review and approval before copy/export, file export, or channel publishing | business | Prevent unvetted AI content from being published or distributed | RAW-026, RAW-026a |
| REQ-C-008 | Generated design/mock assets require HR review and approval before use | business | AI-generated designs are mock/preview; HR approval required before use | RAW-027, RAW-027a |
| REQ-C-009 | Original CV PDF is the source of truth for candidate information; extracted profiles/translations are derived artifacts | business | Screening and evidence must trace to original CV/CVVersion | RAW-043 |
| REQ-C-010 | CV translation and interview transcript/notes translation are Phase 2 prototype; original documents stored securely | business | Privacy and security for translated candidate documents | RAW-028, RAW-028a, RAW-029, RAW-029a |
| REQ-C-011 | Content publishing supports manual copy/export, file export, and channel integration -- all require HR approval | business | Three content export paths; all gated behind HR review | RAW-026, RAW-026a |
| REQ-C-012 | AI design generation is mock image prototype; does not require real image provider or third-party AI design service | technical | Standalone mock/generation; no external design API dependency in Phase 2 | RAW-027, RAW-027b |
| REQ-C-013 | OCR is excluded unless explicitly in scope; all MVP file processing uses text-native PDF/DOCX only | technical | OCR boundary; Phase 2 may expand file handling scope | RAW-011 |
| REQ-C-014 | Excel is optional metadata/support for CV intake and not the primary candidate source | business | Batch candidate import centers on PDF CV files | RAW-001 |
| REQ-C-015 | CV versioning is required; new CV versions flag HR for manual re-screen decision and do not auto re-screen later-stage candidates | business | Prevents unintended pipeline disruption from updated CVs | RAW-042 |
| REQ-C-016 | HR-approved ParsedJDProfile is the operational source of truth for matching; original JD text/file is evidence/reference | business | Matching cannot rely on unapproved parsed JD or raw JD alone | RAW-044, RAW-047 |
| REQ-C-017 | Job/JD versioning and ParsedCriteriaVersion history are required | business | Screening must remain reproducible across JD updates and criteria tuning | RAW-045 |
| REQ-C-018 | Screening results must store candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion | data | Cross-domain traceability requirement | RAW-006, RAW-007, RAW-045 |
| REQ-C-019 | ATS, job board, and career site connectors are prototype-only mock UI/status previews with no real external API integration in MVP | scope | Avoids implying production external integrations | RAW-046 |
| REQ-C-020 | A ParsedJDProfile must be HR-approved before the JD can be used for screening/matching | business | Human oversight for AI-parsed job criteria | RAW-044, RAW-047 |

## 8. Open Questions

| ID | Question | Impact | Owner |
|---|---|---|---|
| Q-001 | AI matching weights confirmed by business? |  | HR Manager |
| Q-002 | Interview reminder timing: 24h? 1h? Both? |  | HR Manager |
| Q-003 | Coding test sandbox: in-browser or external? |  | IT Admin |
| Q-004 | Exact fixed interview question count (5 or 7)? |  | HR Manager |
| Q-005 | Google Drive watch folder path and naming convention? |  | IT Admin |
| Q-006 | Email templates: who creates/manages? |  | HR Manager |
| Q-007 | Pass threshold: combined or per-stage? |  | HR Manager |
| Q-008 | Content generation: which specific channels (social media, job boards) will be integrated in Phase 2? Channel list and provider details needed for connector design. |  | HR Manager |
| Q-009 | Design generation: what asset types and size formats will Phase 2 mock generator support (banner, poster, social image dimensions)? |  | HR Manager |
| Q-010 | CV evidence viewer: what level of detail is needed beyond summary in Phase 2 (full CV text, evidence spans, AI reasoning trace)? |  | HR Manager |
| DQ-001 | What exact confidence threshold routes AI results to manual review? |  | HR Manager |
| DQ-002 | Who is backup approver for escalation? |  | HR Manager |
| DQ-003 | What is the Google Drive folder ownership and webhook renewal responsibility? |  | IT Admin |
| DQ-004 | What is the Calendar reschedule/cancel policy after event creation? |  | HR Manager |
| DQ-005 | What coding sandbox/runtime is approved for code execution? |  | IT Admin |
| DQ-006 | What retention/deletion period applies to CVs, transcripts, and test submissions? |  | HR Manager/IT Admin |

## 9. Validation

- Review status: CONDITIONAL_PASS
- Candidate/CV Intake and Job/JD Intake are separated at Gate 2.
- Screening/matching remains the cross-domain link through candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion.
