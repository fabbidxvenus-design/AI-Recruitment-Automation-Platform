# Requirement Capture: RecruitAI — He thong Recruitment AI Automation (v2.0)

Generated: 2026-05-12T11:05:00Z
Language: bilingual (vi/en)
Project type: data-ai
Version: 2.0 (updated from review comments)

## 1. Context

| Field | Value |
|---|---|
| Product/System | RecruitAI — He thong Recruitment AI Automation |
| Business Domain | Human Resources / Recruitment |
| Target Users | Phong HR noi bo doanh nghiep (internal HR team) |
| Stakeholders | HR Manager, Hiring Manager, Interviewer, IT Admin |
| Input Sources | User input, system diagram image, review comments |
| Scope Boundary Known? | yes |

## 2. Raw Requirement Inventory

### 2.1 Module: Candidate Sourcing (Tao nguon)

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-001 | Import batch CV/candidate tu Excel | User input | need | high | [CLARIFIED via Q&A] |
| RAW-002 | Tao job/candidate thu cong trong he thong | User input | need | high | |
| RAW-003 | Trigger import tu Google Drive khi co file moi | User input | need | high | [CLARIFIED via Q&A] Google Drive watch folder |
| RAW-004 | Import JD dang text input truc tiep hoac PDF/DOCX file | Q&A | need | high | [CLARIFIED via Q&A] |

### 2.2 Module: CV Screening (Sang loc)

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-005 | AI phan tich CV so voi JD de chon ung vien phu hop (LLM) | User input | need | high | |
| RAW-006 | Output: Matching score (0-100) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-007 | Output: Summary diem manh/yeu cua ung vien | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-008 | Output: Risk flags (diem khong phu hop nghiem trong) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-009 | Output: Missing skills list | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-010 | HR Manager approve ket qua sang loc truoc khi chuyen buoc | User input + Q&A | need | high | [CLARIFIED via Q&A] Single approve, ho tro bulk |
| RAW-011 | CV format: PDF + DOCX only (khong can OCR anh) | Q&A | constraint | high | [CLARIFIED via Q&A] |

### 2.3 Module: Interview Scheduling (Set lich)

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-012 | Tu dong thu thap availability ung vien + nguoi phong van | User input | need | high | |
| RAW-013 | He thong suggest lich, HR Manager approve truoc khi confirm | User input | need | high | [CLARIFIED via Q&A] |
| RAW-014 | Len lich tu dong qua Google Calendar | User input | need | high | [CLARIFIED via Q&A] |
| RAW-015 | Gui email tu dong qua shared HR mailbox (Gmail API) | User input + Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-016 | Nhac lich phong van qua email | User input | need | medium | |
| RAW-017 | Timezone support cho ung vien/interviewer o nuoc ngoai | Review | need | medium | |

### 2.4 Module: AI Interview (Phong van so bo)

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-018 | Phong van async qua text message (ung vien nhan link, tra loi khi nao tien) | User input + Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-019 | Hybrid: cau hoi co dinh + AI tao follow-up dua tren cau tra loi | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-020 | AI danh gia nang luc ung vien va tao report | User input | need | high | |
| RAW-021 | Ho tro da ngon ngu: Viet, Nhat, Anh | Q&A | need | high | [CLARIFIED via Q&A] |

### 2.5 Module: Test Grading (Cham bai)

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-022 | Import bai test + dap an de cham diem (LLM) | User input | need | high | |
| RAW-023 | Ho tro multiple choice (cham tu dong theo dap an) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-024 | Ho tro essay (AI danh gia theo rubric) | Q&A | need | high | [CLARIFIED via Q&A] |
| RAW-025 | Ho tro coding challenge (test cases + code quality) | Q&A | need | high | [CLARIFIED via Q&A] |

### 2.6 Module: Content & Design (Standalone)

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-026 | Tao content tuyen dung dang goi y (LLM) | User input | need | medium | Standalone, khong trong pipeline |
| RAW-027 | Thiet ke anh tuyen dung don gian (LLM) dang goi y | User input | idea | medium | |

### 2.7 Module: Translation (Standalone)

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-028 | Dich CV tieng Nhat (LLM) | User input | need | high | Viet/Nhat/Anh |
| RAW-029 | Nhan xet phong van tieng Nhat (LLM) | User input | need | high | |

### 2.8 Pipeline & Workflow

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-030 | Pipeline auto: Tao nguon -> Sang loc -> Set lich -> Phong van -> Cham bai | User input | goal | high | |
| RAW-031 | Human approve bat buoc o buoc sang loc va set lich | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-032 | Content/Design/Dich CV la module rieng, khong trong pipeline | User input | constraint | high | |
| RAW-033 | Approval timeout: chi reminder, khong auto cancel/skip | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-034 | MVP = full pipeline chinh, Content/Design/Translation sau | Q&A | constraint | high | [CLARIFIED via Q&A] |

### 2.9 Non-functional & Platform

| ID | Raw Requirement | Source | Type | Confidence | Notes |
|---|---|---|---|---|---|
| RAW-035 | Quy mo lon: > 200 job/thang | Q&A | constraint | high | [CLARIFIED via Q&A] |
| RAW-036 | Ho tro da ngon ngu: Viet, Nhat, Anh | Q&A | need | high | |
| RAW-037 | Khong rang buoc tech stack | Q&A | constraint | high | |
| RAW-038 | Bao mat du lieu ung vien muc co ban | Q&A | constraint | medium | |
| RAW-039 | Tich hop Google Workspace: Calendar, Gmail, Drive | Q&A | need | high | |
| RAW-040 | He thong chi phuc vu HR noi bo, khong multi-tenant | Q&A | constraint | high | |

## 3. Use-Case Details (per Module)

### UC-SRC: Candidate Sourcing

| Field | Value |
|---|---|
| Actor | HR Recruiter, System |
| Trigger | HR upload file / HR tao thu cong / File moi tren Google Drive |
| Input | Excel file (batch), manual form data, Google Drive files |
| Process | 1. Validate file format 2. Parse data (job/candidate) 3. Create records in system 4. Set candidate state = CV_IMPORTED |
| Output | Job records, Candidate records with status |
| Exception | File format invalid, duplicate candidate, missing required fields |

### UC-SCR: CV Screening

| Field | Value |
|---|---|
| Actor | HR Recruiter (trigger), System (process), HR Manager (approve) |
| Trigger | HR trigger screening / Auto after CV_IMPORTED |
| Input | JD (text or PDF/DOCX), CV file (PDF/DOCX) |
| Process | 1. Extract text from CV 2. Parse JD requirements 3. Extract skills/experience/education/language from CV 4. Match CV vs JD criteria 5. Generate score + summary + flags |
| Output | Matching score (0-100), Summary (strengths/weaknesses), Risk flags, Missing skills list, Recommendation (pass/fail/review) |
| Exception | File corrupted, cannot parse CV, JD missing criteria |
| Approval | HR Manager single approve (bulk supported). Reminder only if not approved, no timeout. |

### UC-SCH: Interview Scheduling

| Field | Value |
|---|---|
| Actor | System (suggest), HR Manager (approve), Candidate, Interviewer |
| Trigger | Candidate state = SCREENING_APPROVED |
| Input | Candidate availability, Interviewer Google Calendar (free/busy), scheduling rules |
| Process | 1. Collect availability from candidate (form/email) 2. Read interviewer free/busy from GCal 3. Find optimal slots 4. Suggest to HR Manager 5. HR Manager approve 6. Create GCal event 7. Send confirmation email via shared HR mailbox |
| Output | Calendar event created, confirmation emails sent |
| Exception | No available slots, interviewer calendar not accessible, candidate not responding |
| Approval | HR Manager single approve. Reminder only, no auto cancel. |

### UC-INT: AI Interview (Async)

| Field | Value |
|---|---|
| Actor | System (AI), Candidate |
| Trigger | Candidate state = INTERVIEW_CONFIRMED |
| Input | JD, candidate profile, interview question template |
| Process | 1. Generate interview link 2. Send link to candidate via email 3. Candidate answers questions (text async) 4. Hybrid: fixed questions + AI follow-up based on answers 5. AI evaluates responses 6. Generate interview report |
| Output | Interview transcript, AI evaluation report, score, recommendation |
| Exception | Candidate not responding (reminder after 24h), link expired, AI evaluation uncertain |

### UC-TST: Test Grading

| Field | Value |
|---|---|
| Actor | HR Recruiter (setup), System (grade), Candidate |
| Trigger | Candidate state = INTERVIEW_COMPLETED (or configured step) |
| Input | Test definition + answer key/rubric, candidate submission |
| Process | 1. Send test to candidate 2. Candidate submits answers 3. Grade: multiple choice (auto match), essay (AI + rubric), coding (test cases + quality) 4. Generate score report |
| Output | Score per section, total score, detailed feedback, pass/fail recommendation |
| Exception | Submission timeout, plagiarism detected, coding environment error |

### UC-TRL: Translation (Standalone)

| Field | Value |
|---|---|
| Actor | HR Recruiter |
| Trigger | Manual request |
| Input | CV file, interview notes, target language |
| Process | 1. Extract text 2. Translate via LLM 3. Format output |
| Output | Translated document (Viet/Nhat/Anh) |
| Exception | Unsupported language, file parse error |

### UC-CNT: Content Generation (Standalone)

| Field | Value |
|---|---|
| Actor | HR Recruiter |
| Trigger | Manual request |
| Input | Job info, tone/style preferences |
| Process | 1. Generate recruitment content via LLM 2. Present as suggestions 3. HR edits and publishes |
| Output | Content suggestions (text), image suggestions |
| Exception | Content inappropriate, generation failed |

## 4. Candidate State Machine

```
NEW (manual create)
  |
  v
CV_IMPORTED (auto after import)
  |
  v
SCREENING_IN_PROGRESS (auto when screening starts)
  |
  v
SCREENING_COMPLETED (auto when AI finishes)
  |
  v  [HUMAN APPROVE REQUIRED - HR Manager]
SCREENING_APPROVED / SCREENING_REJECTED
  |
  v
INTERVIEW_SCHEDULING (auto)
  |
  v  [HUMAN APPROVE REQUIRED - HR Manager]
INTERVIEW_CONFIRMED
  |
  v
INTERVIEW_IN_PROGRESS (auto when candidate starts)
  |
  v
INTERVIEW_COMPLETED (auto when candidate finishes)
  |
  v
TEST_PENDING (auto)
  |
  v
TEST_IN_PROGRESS (auto when candidate starts)
  |
  v
TEST_COMPLETED (auto when graded)
  |
  v
PASSED / FAILED (based on combined scores)
```

State transition rules:
- Auto transitions: CV_IMPORTED, SCREENING_IN_PROGRESS, SCREENING_COMPLETED, INTERVIEW_SCHEDULING, INTERVIEW_IN_PROGRESS, INTERVIEW_COMPLETED, TEST_PENDING, TEST_IN_PROGRESS, TEST_COMPLETED
- Human approve required: SCREENING_APPROVED (HR Manager), INTERVIEW_CONFIRMED (HR Manager)
- Terminal states: PASSED, FAILED, SCREENING_REJECTED, WITHDRAWN (candidate withdraws)

## 5. Approval Workflow

### 5.1 Screening Approval

| Field | Value |
|---|---|
| Approver | HR Manager |
| Type | Single approve |
| Bulk support | Yes (approve multiple candidates at once) |
| Timeout | No timeout, reminder only |
| Reminder | Send reminder after 24h if not actioned |
| Escalation | None (no auto cancel, no escalate) |
| Actions | Approve / Reject / Request re-screen |

### 5.2 Schedule Approval

| Field | Value |
|---|---|
| Approver | HR Manager |
| Type | Single approve |
| Bulk support | Yes |
| Timeout | No timeout, reminder only |
| Reminder | Send reminder after 24h if not actioned |
| Escalation | None |
| Actions | Approve / Reject / Suggest alternative slot |

## 6. Business Rules

### 6.1 AI Matching Weights (Default, configurable per job)

| Criteria | Default Weight |
|---|---|
| Skills match | 40% |
| Experience (years + relevance) | 30% |
| Language proficiency | 20% |
| Education | 10% |

### 6.2 Scheduling Rules

| Rule | Value |
|---|---|
| Priority | Earliest available slot first |
| Buffer | Minimum 30 min between interviews |
| Working hours | 9:00-18:00 local timezone |
| Advance notice | Minimum 24h before interview |
| Timezone | Support multi-timezone (VN, JP, etc.) |

### 6.3 AI Interview Rules

| Rule | Value |
|---|---|
| Format | Async text message |
| Questions | Hybrid: 5-7 fixed + 2-3 AI follow-up |
| Time limit | 72h to complete from link sent |
| Reminder | 24h before deadline |
| Language | Match JD language (Viet/Nhat/Anh) |

### 6.4 Test Grading Rules

| Rule | Value |
|---|---|
| Multiple choice | Auto-grade against answer key |
| Essay | AI grade with rubric, score 0-100 |
| Coding | Run test cases + AI code quality review |
| Pass threshold | Configurable per job (default 60%) |

## 7. Non-functional Requirements

### 7.1 Performance

| Metric | Target |
|---|---|
| Jobs per month | > 200 |
| CV processing | ~10,000/month estimated |
| Single CV screening time | < 30 seconds |
| Concurrent users | 50+ |
| API response time | < 2s (p95) for non-AI calls |

### 7.2 Security

| Requirement | Detail |
|---|---|
| Data encryption | At rest + in transit (TLS 1.2+) |
| Access control | Role-based (HR Recruiter, HR Manager, Interviewer, Admin) |
| Audit log | All actions logged (who, what, when) |
| CV file storage | Encrypted, access-controlled |
| Session management | Token-based, auto-expire |

### 7.3 Availability & Monitoring

| Metric | Target |
|---|---|
| Uptime | 99% |
| AI error tracking | Log all LLM failures, fallback gracefully |
| API failure alerts | Alert on 5xx errors, timeout spikes |
| Cost monitoring | Track LLM token usage per job/month |

## 8. Integration Requirements

### 8.1 Gmail API

| Field | Value |
|---|---|
| Send from | Shared HR mailbox (e.g. hr@company.com) |
| Features | Send interview invitations, reminders, results |
| Templates | Email templates configurable in system |
| Auth | OAuth2 (Google Workspace) |

### 8.2 Google Calendar API

| Field | Value |
|---|---|
| Read | Free/busy status of interviewers |
| Write | Create interview events |
| Timezone | Multi-timezone support |
| Auth | OAuth2 (Google Workspace) |

### 8.3 Google Drive API

| Field | Value |
|---|---|
| Watch | Specific folder(s) configured by admin |
| Trigger | New file uploaded -> auto import |
| File types | Excel (.xlsx), PDF, DOCX |
| Auth | OAuth2 (Google Workspace) |

## 9. File Format Requirements

| Type | Supported Formats | Notes |
|---|---|---|
| CV | PDF, DOCX | No image/scan OCR required |
| JD | Text input (in-system), PDF, DOCX | Dual: direct text or file upload |
| Test (import) | Excel (.xlsx), JSON | Structured format with questions + answers |
| Batch import | Excel (.xlsx) | Candidate/Job batch data |

## 10. Success Metrics

| Module | Metric | Target |
|---|---|---|
| Screening | CV processing time | < 30s per CV |
| Screening | Matching accuracy (human agreement rate) | > 80% |
| Scheduling | Calendar conflict rate | < 1% |
| Scheduling | Time from approve to confirmed | < 1 hour |
| AI Interview | Candidate completion rate | > 70% |
| AI Interview | Evaluation consistency | > 85% agreement with human |
| Test Grading | Auto-grade accuracy (multiple choice) | 100% |
| Test Grading | AI grade correlation with human (essay) | > 75% |
| Pipeline | End-to-end time (source to decision) | < 7 days |

## 11. Scope & Phasing

### MVP (Phase 1) — Full Pipeline

| Module | Included |
|---|---|
| Candidate Sourcing | Yes |
| CV Screening | Yes |
| Interview Scheduling | Yes |
| AI Interview (async) | Yes |
| Test Grading | Yes |
| Approval Workflow | Yes |
| Google Integration | Yes |

### Phase 2 — Standalone Tools

| Module | Included |
|---|---|
| Content Generation | Yes |
| Design Generation | Yes |
| CV Translation | Yes |
| Interview Notes Translation | Yes |

### Out of Scope (all phases)

- Multi-tenant / agency mode
- Video/voice realtime interview
- ATS/CRM integration with third-party systems
- Mobile native app (web responsive is sufficient)
- Onboarding workflow (post-hire)

## 12. Problem Statements

| ID | Problem | Who | Impact | Source |
|---|---|---|---|---|
| PROB-001 | Quy trinh tuyen dung thu cong ton nhieu thoi gian o quy mo > 200 job/thang | HR Team | Cham tre, bo lo ung vien tot | RAW-030, RAW-035 |
| PROB-002 | Sang loc CV thu cong khong nhat quan | HR Recruiter | Danh gia chu quan | RAW-005 |
| PROB-003 | Len lich phong van phuc tap khi coordinate nhieu ben | HR Coordinator | Email qua lai, conflict lich | RAW-012, RAW-013 |
| PROB-004 | Danh gia so bo ung vien ton thoi gian interviewer | Interviewer | Phong van ung vien khong phu hop | RAW-018 |
| PROB-005 | Cham bai test thu cong cham va khong dong nhat | HR Team | Delay pipeline | RAW-022 |

## 13. Goals

| ID | Desired Outcome | Success Signal | Source |
|---|---|---|---|
| GOAL-001 | Tu dong hoa pipeline tuyen dung end-to-end voi human oversight | Giam 70%+ thoi gian xu ly thu cong | RAW-030 |
| GOAL-002 | AI sang loc CV chinh xac, nhat quan | > 80% agreement voi human | RAW-005 |
| GOAL-003 | Tu dong hoa scheduling qua Google Calendar/Gmail | Zero conflict lich | RAW-012-016 |
| GOAL-004 | Danh gia so bo ung vien qua AI chatbot async | Giam so luong phong van khong can thiet | RAW-018 |
| GOAL-005 | Ho tro tuyen dung da ngon ngu (Viet/Nhat/Anh) | Xu ly CV va phong van da ngon ngu seamless | RAW-021, RAW-028, RAW-029 |

## 14. Constraints

| ID | Constraint | Type | Source |
|---|---|---|---|
| CON-001 | Chi phuc vu HR noi bo, khong multi-tenant | business | RAW-040 |
| CON-002 | > 200 job/thang, can high throughput | technical | RAW-035 |
| CON-003 | Khong rang buoc tech stack | technical | RAW-037 |
| CON-004 | Phu thuoc Google Workspace | platform | RAW-039 |
| CON-005 | Content/Design/Translation la module rieng | business | RAW-032 |
| CON-006 | Human approve bat buoc o sang loc va set lich | business | RAW-031 |
| CON-007 | CV chi ho tro PDF/DOCX, khong can OCR anh | technical | RAW-011 |
| CON-008 | Approval khong co timeout, chi reminder | business | RAW-033 |

## 15. Assumptions

| ID | Assumption | Risk if Wrong | How to Verify |
|---|---|---|---|
| ASM-001 | Cong ty da dung Google Workspace | Phai redesign integration | Confirm voi IT Admin |
| ASM-002 | CV ung vien o dang PDF/DOCX co the extract text | Can them OCR | Khao sat format CV thuc te |
| ASM-003 | Interviewer share Google Calendar | Fallback manual | Confirm voi hiring managers |
| ASM-004 | Ung vien co the truy cap link chatbot | Can UX don gian | User testing |
| ASM-005 | LLM API cost acceptable cho quy mo > 200 job/thang | Cost overrun | Estimate token usage |
| ASM-006 | Shared HR mailbox da duoc setup | Can IT setup | Confirm voi IT |

## 16. Risks

| ID | Risk | Impact | Probability | Mitigation |
|---|---|---|---|---|
| RISK-001 | AI sang loc co bias | high | medium | Human review, feedback loop, evaluation metrics |
| RISK-002 | LLM hallucination trong danh gia | high | medium | Structured prompts, rubric-based, human override |
| RISK-003 | Google API rate limit | medium | medium | Queue system, batch processing, retry |
| RISK-004 | Ung vien khong phan hoi chatbot | medium | medium | Reminder, deadline, fallback manual |
| RISK-005 | Chi phi LLM cao khi scale | medium | medium | Cost monitoring, caching, model selection |
| RISK-006 | Du lieu ung vien bi leak | high | low | Encryption, access control, audit log |

## 17. Ambiguity Log

| Term | Why Ambiguous | Clarifying Question | Status |
|---|---|---|---|
| AI matching weights | Default weights provided, nhung chua confirm voi business | Weights nay co phu hop voi thuc te tuyen dung? | Open |
| Nhac lich timing | Chua ro nhac truoc bao lau | 24h? 1h? Ca hai? | Open |
| Coding test environment | Chua ro chay code o dau | Sandbox? Third-party? In-browser? | Open |
| Interview question count | Hybrid 5-7 fixed + 2-3 follow-up, chua confirm exact | Confirm so luong chinh xac? | Open |

## 18. Validation Gate 1

| Check | Status | Notes |
|---|---|---|
| Every raw requirement has ID | PASS | RAW-001 to RAW-040 |
| Source/stakeholder captured | PASS | All sourced |
| Classified by type | PASS | need/goal/constraint/idea |
| Ambiguity flagged | PASS | 4 ambiguities logged |
| Duplicates handled | PASS | No duplicates |
| Product/system context present | PASS | Complete |
| Use-case details per module | PASS | 7 use-cases defined |
| Candidate state machine | PASS | 13 states defined |
| Approval workflow | PASS | Detailed |
| Business rules | PASS | 4 rule sets |
| Non-functional requirements | PASS | Performance, Security, Availability |
| Integration requirements | PASS | Gmail, Calendar, Drive |
| File format requirements | PASS | CV, JD, Test, Batch |
| Success metrics | PASS | 9 metrics defined |
| Scope/phasing | PASS | MVP + Phase 2 + Out of scope |

**Gate 1 Status: PASS**

## 19. Open Questions

| ID | Question | Owner | Blocks? |
|---|---|---|---|
| Q-001 | AI matching weights (40/30/20/10) co phu hop? | HR Manager | no |
| Q-002 | Nhac lich: truoc 24h, 1h, hay ca hai? | HR Manager | no |
| Q-003 | Coding test: sandbox environment nao? | IT Admin | no |
| Q-004 | So luong cau hoi phong van chinh xac? | HR Manager | no |
| Q-005 | Google Drive: folder nao watch? Naming convention? | IT Admin | no |
| Q-006 | Email template: ai tao va quan ly? | HR Manager | no |
