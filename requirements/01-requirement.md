# Requirement Capture: RecruitAI — System Recruitment AI Automation

Generated: 2026-05-14T00:00:00Z
Version: 2.2
Language: bilingual (vi/en)
Project type: data-ai

## 1. Context

- Product: RecruitAI
- Source model: Gate 1 captures raw stakeholder needs, Q&A clarifications, and explicit scope decisions.
- Current clarification: Candidate Source / CV Intake and Job Source / JD Intake are separate domains connected through screening/matching traceability.

## 2. Raw Requirements

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-001 | Batch import CV PDF files as candidate source; primary path is Google Drive folder trigger/scan and secondary path is multi-file PDF upload; Excel is optional metadata support only | Scope decision | need | high | [CLARIFIED] Candidate = CV; CV PDF is primary source |
| RAW-002 | Manual candidate creation uses single CV PDF upload with optional metadata; manual job creation belongs to the separate Job/JD Intake domain | Scope decision | need | high | [CLARIFIED] Split Candidate/CV Intake from Job/JD Intake |
| RAW-003 | Google Drive CV intake watches or scans configured Drive folders for new PDF CV files and flags invalid files/subfolders as import errors for HR review | Scope decision | need | high | [CLARIFIED] Drive folder trigger/scan is primary CV import path |
| RAW-004 | Job/JD Intake supports manual job creation, JD text input, JD PDF/DOCX upload, Google Drive JD import, and Sheet/Excel job requisition import | Scope decision | need | high | [CLARIFIED] Job/JD Intake is separate from Candidate/CV Intake |
| RAW-005 | The system uses LLM extraction on text-native PDF CV content to create candidate profiles; OCR is excluded from MVP | Scope decision | need | high | [CLARIFIED] LLM extract, no OCR |
| RAW-006 | AI matching compares the extracted CandidateProfile and CV version against the HR-approved ParsedJDProfile and parsed criteria version | Scope decision | need | high | [CLARIFIED] Screening links CV and JD versions |
| RAW-007 | Screening score and summary must trace to candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion | Scope decision | need | high | [CLARIFIED] Cross-domain screening traceability |
| RAW-008 | Output: Risk flags (?i?m kh?ng ph? h?p nghi?m tr?ng) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-009 | Output: Missing skills list | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-010 | HR Manager approve k?t qu? s?ng l?c tr??c khi chuy?n b??c | User input + Q&A | need | high | [CLARIFIED via Q&A] Single approve, h? tr? bulk |
| RAW-011 | CV format: PDF + DOCX only (kh?ng c?n OCR ?nh) | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-041 | CV Evidence Viewer: Cho ph?p HR xem CV g?c, text tr?ch xu?t, v? c?c evidence spans ???c link v?i ti?u ch? JD/screening (t?ch h?p v?i m?n h?nh s?ng l?c/final review ? evidence detail l? Phase 2 prototype utility) | Scope decision | need | high | Phase 2 prototype utility module |
| RAW-012 | T? ??ng thu th?p availability ?ng vi?n + ng??i ph?ng v?n | User input | need | high |  |
| RAW-013 | H? th?ng suggest l?ch, HR Manager approve tr??c khi confirm | User input | need | high | [CLARIFIED via Q&A] |
| RAW-014 | L?n l?ch t? ??ng qua Google Calendar | User input | need | high | [CLARIFIED via Q&A] |
| RAW-015 | G?i email t? ??ng qua shared HR mailbox (Gmail API) | User input + Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-016 | Nh?c l?ch ph?ng v?n qua email | User input | need | medium |  |
| RAW-017 | Timezone support cho ?ng vi?n/interviewer ? n??c ngo?i | Review | need | medium |  |
| RAW-018 | Ph?ng v?n async qua text message | User input + Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-019 | Hybrid: c?u h?i c? ??nh + AI t?o follow-up d?a tr?n c?u tr? l?i | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-020 | AI ??nh gi? n?ng l?c ?ng vi?n v? t?o report | User input | need | high |  |
| RAW-021 | H? tr? ?a ng?n ng?: Vi?t, Nh?t, Anh | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-022 | Import b?i test + ??p ?n ?? ch?m ?i?m (LLM) | User input | need | high |  |
| RAW-023 | H? tr? multiple choice (ch?m t? ??ng theo ??p ?n) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-024 | H? tr? essay (AI ??nh gi? theo rubric) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-025 | H? tr? coding challenge (test cases + code quality) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-026 | T?o content tuy?n d?ng d?ng g?i ? (LLM): plain text, copyable, h? tr? export file, h? tr? channel integration | User input + scope decision | need | high | Phase 2 prototype standalone |
| RAW-026a | Content publishing: H? tr? th? c?ng copy, export file, v? t?ch h?p channel (LinkedIn, Facebook, job boards...) | Scope decision | need | high | [CLARIFIED via Q&A] All 3 supported |
| RAW-026b | Generated content ph?i ???c HR review/approve tr??c khi publish/export/use | Scope decision | constraint | high | [CLARIFIED via Q&A] |
| RAW-027 | Thi?t k? ?nh tuy?n d?ng ??n gi?n (LLM) d?ng g?i ?: mock image prototype ? kh?ng b?t bu?c t?ch h?p image provider th?t | User input + scope decision | idea | high | Phase 2 prototype standalone |
| RAW-027a | Design scope: mock/preview, creative suggestions, banner, poster, social asset ? kh?ng c?n integration th?t | Scope decision | need | high | [CLARIFIED via Q&A] Not real image generation |
| RAW-027b | Generated design ph?i ???c HR review/approve tr??c khi s? d?ng | Scope decision | constraint | high | [CLARIFIED via Q&A] |
| RAW-028 | D?ch CV ti?ng Vi?t / Nh?t / Anh (LLM) | User input + scope decision | need | high | vi/en/ja |
| RAW-028a | CV translation: H? tr? HR review v? related workflows, nh?ng CV g?c l? ngu?n chu?n duy nh?t | Scope decision | constraint | high | [CLARIFIED via Q&A] Original CV is source of truth |
| RAW-028b | Screening decisions ph?i c? traceback to original CV | Scope decision | constraint | high | [CLARIFIED via Q&A] |
| RAW-029 | Nh?n x?t ph?ng v?n ti?ng Nh?t (LLM) | User input | need | high | Phase 2 prototype standalone |
| RAW-029a | Translated notes: H? tr? HR review v? related workflows | Scope decision | need | high | [CLARIFIED via Q&A] |
| RAW-030 | Pipeline auto: T?o ngu?n ? S?ng l?c ? Set l?ch ? Ph?ng v?n ? Ch?m b?i | User input | goal | high |  |
| RAW-031 | Human approve b?t bu?c ? b??c s?ng l?c v? set l?ch | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-032 | Content/Design/Translation l? c?c Phase 2 prototype standalone module, KH?NG n?m trong core pipeline | Scope decision | constraint | high | [CLARIFIED via Q&A] Updated wording |
| RAW-033 | Approval timeout: ch? reminder, kh?ng auto cancel/skip | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-034 | MVP = full pipeline ch?nh (Phase 1); Content/Design/Translation l? Phase 2 prototype standalone | Scope decision | constraint | high | [CLARIFIED via Q&A] Updated wording |
| RAW-035 | Quy m? l?n: > 200 job/th?ng | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-036 | H? tr? ?a ng?n ng?: Vi?t, Nh?t, Anh | Q&A | need | high |  |
| RAW-037 | Kh?ng r?ng bu?c tech stack | Q&A | constraint | high |  |
| RAW-038 | B?o m?t d? li?u ?ng vi?n m?c c? b?n | Q&A | constraint | medium |  |
| RAW-039 | T?ch h?p Google Workspace: Calendar, Gmail, Drive | Q&A | need | high |  |
| RAW-040 | H? th?ng ch? ph?c v? HR n?i b?, kh?ng multi-tenant | Q&A | constraint | high |  |
| RAW-042 | CV versioning is required; new CV files create a new CV version and flag HR for manual re-screen decision without automatic re-screening | Scope decision | constraint | high | [CLARIFIED] Manual re-screen trigger only |
| RAW-043 | The original CV PDF is the source of truth for candidate information; extracted profiles and translations are derived artifacts | Scope decision | constraint | high | [CLARIFIED] CV source of truth |
| RAW-044 | HR-approved parsed JD profile is the operational source of truth for matching; original JD text/file is retained as evidence/reference | Scope decision | constraint | high | [CLARIFIED] JD source of truth |
| RAW-045 | Job/JD versioning is required; JD document updates create JD versions and criteria tuning may create a new parsedCriteriaVersion without changing the original JD document | Scope decision | constraint | high | [CLARIFIED] Hybrid criteria versioning |
| RAW-046 | External ATS, job board, and career site job source connectors are prototype-only mock UI/status previews with no real external API integration in MVP | Scope decision | constraint | high | [CLARIFIED] Prototype-only external connectors |
| RAW-047 | If HR rejects an AI-parsed JD profile, HR can either edit parsed fields and resubmit for approval or re-upload/re-parse corrected JD source | Scope decision | need | high | [CLARIFIED] JD rejection recovery |
| RAW-048 | Unified Assessment Plan Setup groups AI Interview Setup, Test/Assignment Setup, and Shared Evaluation Criteria/Rubric/Weights under one parent module per Job/JD criteria version | Scope decision | need | high | Prototype-only setup with mock data/local state; no real AI/API integration |
| RAW-049 | Assessment Plan outputs must trace jobId, jdVersionId, parsedCriteriaVersion, assessmentPlanId, assessmentPlanVersionId, rubricVersionId, interviewQuestionSetVersionId, and testDefinitionVersionId | Scope decision | constraint | high | [CLARIFIED] Interview and test execution share the same approved evaluation setup |
| RAW-050 | Shared rubric and weights are versioned at Assessment Plan level and inherited by AI Interview and Test/Assignment grading unless a visible override is configured | Scope decision | need | high | [CLARIFIED] Unified assessment source of truth for interview/test evaluation |

## 3. Constraints

| ID | Constraint | Source |
|---|---|---|
| CON-013 | CV original PDF is source of truth for candidate information | RAW-043 |
| CON-014 | CV intake accepts text-native PDF only in MVP; OCR is excluded | RAW-005, RAW-043 |
| CON-015 | CV versioning is required and new versions trigger HR manual re-screen decision only | RAW-042 |
| CON-016 | Excel is optional metadata support for CV intake, not the primary candidate source | RAW-001 |
| CON-017 | HR-approved parsed JD profile is source of truth for matching; original JD is evidence/reference | RAW-044 |
| CON-018 | Job/JD versioning and parsed criteria versioning are required for screening reproducibility | RAW-045 |
| CON-019 | External job source connectors are prototype-only mock UI/status and not real integrations in MVP | RAW-046 |
| CON-020 | Assessment Plan Setup is prototype-only mock/local state for UAT and must not imply real AI/API persistence. | RAW-048 |
| CON-021 | Interview and test outputs must retain shared assessment plan traceability IDs for reproducibility. | RAW-049, RAW-050 |

## 4. Use Cases

| ID | Name | Actor | Goal | Phase/Notes |
|---|---|---|---|---|
| UC-SRC | Candidate Sourcing | HR Recruiter System |  |  |
| UC-SCR | CV Screening | HR Recruiter (trigger) System (process) HR Manager (approve) |  |  |
| UC-CVIEW | CV Evidence Viewer | HR Recruiter HR Manager |  |  |
| UC-SCH | Interview Scheduling | System (suggest) HR Manager (approve) Candidate Interviewer |  |  |
| UC-INT | AI Interview (Async) | System (AI) Candidate |  |  |
| UC-TST | Test Grading | HR Recruiter (setup) System (grade) Candidate |  |  |
| UC-TRL | CV Translation (Phase 2 Prototype) | HR Recruiter |  |  |
| UC-INTL | Interview Notes Translation (Phase 2 Prototype) | HR Recruiter |  |  |
| UC-CNT | Content Generation (Phase 2 Prototype) | HR Recruiter |  |  |
| UC-DSG | Design Generation (Phase 2 Prototype) | HR Recruiter |  |  |
| UC-CVINTAKE | Candidate/CV Intake | HR Recruiter, HR Manager, System | HR imports candidate CV PDFs through Drive folder trigger/scan, multi-file upload, or single CV upload with optional metadata. | MVP/Prototype as specified |
| UC-JDINTAKE | Job/JD Intake | HR Recruiter, HR Manager, System | HR creates/imports Job/JD from manual form, text, PDF/DOCX, Drive, or Sheet/Excel requisition. | MVP/Prototype as specified |
| UC-JDAPPROVAL | Parsed JD Review and Approval | HR Recruiter, HR Manager, System | HR reviews, edits/re-parses, and approves ParsedJDProfile before it becomes matching source of truth. | MVP/Prototype as specified |
| UC-JOBCONNMOCK | External Job Source Connector Mock | HR Recruiter, HR Manager, System | HR previews prototype-only ATS/job board/career site connector status and mock requisition data. | MVP/Prototype as specified |
| UC-ASSESSSETUP | Assessment Plan Setup | HR Recruiter, HR Manager | HR configures a unified assessment plan for an approved Job/JD criteria version, including shared rubric/weights, interview question set, and test definition versions. | MVP/Prototype as specified |

## 5. CV Intake and Job/JD Intake Clarifications

### Candidate Source / CV Intake
- Candidate is CV-driven.
- CV PDF is the primary candidate source.
- Primary import path: Google Drive folder trigger/scan.
- Secondary import path: multi-file PDF upload.
- Manual candidate creation uses single CV PDF upload with optional metadata.
- Excel is optional metadata/support only, not primary candidate source.
- LLM extraction creates CandidateProfile from text-native PDF CV.
- OCR is excluded from MVP.
- Original CV PDF is source of truth.
- CV versioning is required; new versions flag HR for manual re-screen decision.

### Job Source / JD Intake
- Job/JD Intake is a separate domain from Candidate/CV Intake.
- MVP supports manual job creation, JD text input, JD PDF/DOCX upload, Google Drive JD import, and Sheet/Excel job requisition import.
- HR-approved ParsedJDProfile is the operational source of truth for matching.
- Original JD text/file is retained as evidence/reference.
- Job/JD versioning is required.
- parsedCriteriaVersion is hybrid: tied to JD version by default, but tuning can create a new criteria version without changing original JD document/version.
- ATS/job board/career site connectors are prototype-only mock UI/status previews with no real external integration in MVP.

### Screening Traceability
- Screening result must trace candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion.

### Assessment Plan Setup Traceability
- Assessment Plan Setup is configured per approved Job/JD criteria version.
- The shared assessment plan groups AI Interview Setup, Test/Assignment Setup, and Shared Evaluation Criteria/Rubric/Weights.
- Interview and test outputs must trace jobId, jdVersionId, parsedCriteriaVersion, assessmentPlanId, assessmentPlanVersionId, rubricVersionId, interviewQuestionSetVersionId, and testDefinitionVersionId.
