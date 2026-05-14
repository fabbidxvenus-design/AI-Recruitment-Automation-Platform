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
| RAW-008 | Output: Risk flags (Ä‘iá»ƒm khÃ´ng phÃ¹ há»£p nghiÃªm trá»ng) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-009 | Output: Missing skills list | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-010 | HR Manager approve káº¿t quï¿½ï¿½ï¿½ sÃ ng lá»c trÆ°á»›c khi chuyá»ƒn bÆ°á»›c | User input + Q&A | need | high | [CLARIFIED via Q&A] Single approve, há»— trá»£ bulk |
| RAW-011 | CV format: PDF + DOCX only (khÃ´ng cáº§n OCR áº£nh) | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-041 | CV Evidence Viewer: Cho phÃ©p HR xem CV gá»‘c, text trÃ­ch xuáº¥t, vÃ  cÃ¡c evidence spans Ä‘Æ°á»£c link vá»›i tiÃªu chÃ­ JD/screening (tÃ­ch há»£p vá»›i mÃ n hÃ¬nh sÃ ng lá»c/final review â€” evidence detail lÃ  Phase 2 prototype utility) | Scope decision | need | high | Phase 2 prototype utility module |
| RAW-012 | Tá»± Ä‘á»™ng thu tháº­p availability á»©ng viÃªn + ngÆ°á»i phá»ng váº¥n | User input | need | high |  |
| RAW-013 | Há»‡ thá»‘ng suggest lá»‹ch, HR Manager approve trÆ°á»›c khi confirm | User input | need | high | [CLARIFIED via Q&A] |
| RAW-014 | LÃªn lá»‹ch tá»± Ä‘á»™ng qua Google Calendar | User input | need | high | [CLARIFIED via Q&A] |
| RAW-015 | Gá»­i email tá»± Ä‘á»™ng qua shared HR mailbox (Gmail API) | User input + Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-016 | Nháº¯c lá»‹ch phá»ng váº¥n qua email | User input | need | medium |  |
| RAW-017 | Timezone support cho á»©ng viÃªn/interviewer á»Ÿ nÆ°á»›c ngoÃ i | Review | need | medium |  |
| RAW-018 | Phá»ng váº¥n async qua text message | User input + Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-019 | Hybrid: cÃ¢u há»i cá»‘ Ä‘á»‹nh + AI táº¡o follow-up dá»±a trÃªn cÃ¢u tráº£ lá»i | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-020 | AI Ä‘Ã¡nh giÃ¡ nÄƒng lá»±c á»©ng viÃªn vÃ  táº¡o report | User input | need | high |  |
| RAW-021 | Há»— trá»£ Ä‘a ngÃ´n ngá»¯: Viá»‡t, Nháº­t, Anh | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-022 | Import bÃ i test + Ä‘Ã¡p Ã¡n Ä‘á»ƒ cháº¥m Ä‘iá»ƒm (LLM) | User input | need | high |  |
| RAW-023 | Há»— trá»£ multiple choice (cháº¥m tá»± Ä‘á»™ng theo Ä‘Ã¡p Ã¡n) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-024 | Há»— trá»£ essay (AI Ä‘Ã¡nh giÃ¡ theo rubric) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-025 | Há»— trá»£ coding challenge (test cases + code quality) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-026 | Táº¡o content tuyá»ƒn dá»¥ng dáº¡ng gá»£i Ã½ (LLM): plain text, copyable, ho trá»£ export file, ho trá»£ channel integration | User input + scope decision | need | high | Phase 2 prototype standalone |
| RAW-026a | Content publishing: Há»— trá»£ thá»§ cÃ´ng copy, export file, vÃ  tÃ­ch há»£p channel (LinkedIn, Facebook, job boards...) | Scope decision | need | high | [CLARIFIED via Q&A] All 3 supported |
| RAW-026b | Generated content pháº£i Ä‘Æ°á»£c HR review/approve trÆ°á»›c khi publish/export/use | Scope decision | constraint | high | [CLARIFIED via Q&A] |
| RAW-027 | Thiáº¿t káº¿ áº£nh tuyá»ƒn dá»¥ng Ä‘Æ¡n giáº£n (LLM) dáº¡ng gá»£i Ã½: mock image prototype â€” khÃ´ng báº¯t buá»™c tÃ­ch há»£p image provider tháº­t | User input + scope decision | idea | high | Phase 2 prototype standalone |
| RAW-027a | Design scope: mock/preview, creative suggestions, banner, poster, social asset â€” khÃ´ng cáº§n integration tháº­t | Scope decision | need | high | [CLARIFIED via Q&A] Not real image generation |
| RAW-027b | Generated design pháº£i Ä‘Æ°á»£c HR review/approve trÆ°á»›c khi sá»­ dá»¥ng | Scope decision | constraint | high | [CLARIFIED via Q&A] |
| RAW-028 | Dá»‹ch CV tiáº¿ng Viá»‡t / Nháº­t / Anh (LLM) | User input + scope decision | need | high | vi/en/ja |
| RAW-028a | CV translation: Há»— trá»£ HR review vÃ  related workflows, nhÆ°ng CV gá»‘c lÃ  nguá»“n chuáº©n duy nháº¥t | Scope decision | constraint | high | [CLARIFIED via Q&A] Original CV is source of truth |
| RAW-028b | Screening decisions pháº£i cÃ³ traceback to original CV | Scope decision | constraint | high | [CLARIFIED via Q&A] |
| RAW-029 | Nháº­n xÃ©t phá»ng váº¥n tiáº¿ng Nháº­t (LLM) | User input | need | high | Phase 2 prototype standalone |
| RAW-029a | Translated notes: Há»— trá»£ HR review vÃ  related workflows | Scope decision | need | high | [CLARIFIED via Q&A] |
| RAW-030 | Pipeline auto: Táº¡o nguá»“n â†’ SÃ ng lá»c â†’ Set lá»‹ch â†’ Phá»ng váº¥n â†’ Cháº¥m bÃ i | User input | goal | high |  |
| RAW-031 | Human approve báº¯t buá»™c á»Ÿ bÆ°á»›c sÃ ng lá»c vÃ  set lá»‹ch | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-032 | Content/Design/Translation lÃ  cÃ¡c Phase 2 prototype standalone module, KHÃ”NG náº±m trong core pipeline | Scope decision | constraint | high | [CLARIFIED via Q&A] Updated wording |
| RAW-033 | Approval timeout: chá»‰ reminder, khÃ´ng auto cancel/skip | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-034 | MVP = full pipeline chÃ­nh (Phase 1); Content/Design/Translation lÃ  Phase 2 prototype standalone | Scope decision | constraint | high | [CLARIFIED via Q&A] Updated wording |
| RAW-035 | Quy mÃ´ lá»›n: > 200 job/thÃ¡ng | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-036 | Há»— trá»£ Ä‘a ngÃ´n ngá»¯: Viá»‡t, Nháº­t, Anh | Q&A | need | high |  |
| RAW-037 | KhÃ´ng rÃ ng buá»™c tech stack | Q&A | constraint | high |  |
| RAW-038 | Báº£o máº­t dá»¯ liá»‡u á»©ng viÃªn má»©c cÆ¡ báº£n | Q&A | constraint | medium |  |
| RAW-039 | TÃ­ch há»£p Google Workspace: Calendar, Gmail, Drive | Q&A | need | high |  |
| RAW-040 | Há»‡ thá»‘ng chá»‰ phá»¥c vá»¥ HR ná»™i bá»™, khÃ´ng multi-tenant | Q&A | constraint | high |  |
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
