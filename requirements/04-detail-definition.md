# Detail Definition: RecruitAI â€” Há»‡ thá»‘ng Recruitment AI Automation

Generated: 2026-05-14T00:00:00Z
Language: bilingual (vi/en)
Project type: data-ai / internal HR web tool
Upstream: `03-business-definition.md/json`

**Gate 4 Status: CONDITIONAL PASS** â€” detail contracts are implementation-ready where policy is known; seven blocking questions must be resolved before full build sign-off.

## 1. Detail Summary

| Field | Value |
| --- | --- |
| Implementation surface | Internal HR web/admin application; Candidate-facing async interview web link; Backend APIs/RPC services; Google Workspace integrations; AI evaluation interfaces; Operational monitoring and audit trail; Phase 2 standalone utility AI modules for content/design generation, CV evidence, CV translation, and interview translation |
| Primary workflows covered | Candidate sourcing/import; CV screening approval; Interview scheduling approval; Async AI interview; Test grading; Final candidate decision; Notifications/reminders; Withdrawal; Error remediation; Monitoring/governance; Phase 2 utility AI content generation, mock design generation, CV evidence viewing, CV translation, and interview notes/transcript translation |
| Critical business rules implemented | BR-001; BR-002; BR-004; BR-005; BR-006; BR-007; BR-011; BR-012; BR-014; BR-015; BR-017; BR-020; BR-021; BR-022; BR-023; BR-024 |
| Major assumptions | System is an internal single-organization web application plus candidate interview link.; No external ATS/CRM or native mobile app in MVP.; OCR, final scoring policy, retention, backup approver, Drive folder policy, coding sandbox, and Calendar reschedule/cancel remain unresolved and are not assumed.; Phase 2 utility AI modules are standalone prototype scope, require HR approval before external use, use original CV/interview records as source of truth, and mock design generation has no real provider integration. |

## 2. Screen / UX Definitions

### SCREEN-001: Recruitment Pipeline Dashboard

| Field | Value |
| --- | --- |
| Purpose | Give HR users a consolidated view of jobs, candidate pipeline states, pending approvals, errors, and operational KPIs. |
| Primary User | HR Recruiter / HR Manager |
| Entry Point | Authenticated internal HR workspace |
| Primary Action | Open candidate/job work queue by status or required action |
| Secondary Actions | Filter by job, candidate state, owner, error status, pending approval; Open candidate detail; Export or review audit trail summary |
| Empty State | Show no active candidates/jobs and CTA to import/create source. |
| Loading State | Show skeleton table and preserve filters. |
| Error State | Show recoverable dashboard loading error and retry action. |
| Success State | Show queues, KPI cards, and pending action counts. |
| Accessibility Requirements | Keyboard accessible filters, tables, row actions, and skip navigation to main content; visible focus states; status changes announced via polite aria-live region; status badges exposed as text, not color-only; data tables use caption, th, and scope; interactive targets are at least 44x44px; page landmarks and heading hierarchy. |
| Source UC/BP/BR IDs | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-008; BP-010; BR-001; BR-015; BR-020 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-001 | Pipeline state summary cards | card | yes | Counts candidates by canonical business state. | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006 |
| UI-002 | Pending approvals queue | table | yes | Shows screening, scheduling, and final review actions requiring explicit HR Manager decision. | BR-001; UC-003; UC-004; UC-007 |
| UI-003 | Error remediation queue | table | yes | Shows ERROR items with owner, reason, previous valid state, and retry/manual review actions. | BP-010; UC-010 |
| UI-004 | KPI and monitoring panel | card | yes | Shows processing, scheduling, AI quality, integration failure, and cost indicators. | BP-008; BR-015; BR-020 |

### SCREEN-002: Candidate Sourcing and Import

| Field | Value |
| --- | --- |
| Purpose | Allow HR Recruiter to create candidates/jobs manually, import Excel batches, and review Google Drive import results. |
| Primary User | HR Recruiter |
| Entry Point | Dashboard import CTA or Drive import notification |
| Primary Action | Submit candidate/job data or upload Excel import file |
| Secondary Actions | Download import template; Review duplicate candidates; Correct invalid rows; Retry failed Drive import |
| Empty State | Show import options and accepted formats. |
| Loading State | Show upload/import progress. |
| Error State | Show row-level validation/import failures. |
| Success State | Show imported records and duplicate/exception summary. |
| Accessibility Requirements | File input has explicit label and accepted formats; row errors are announced and linked to fields with aria-describedby and aria-invalid; duplicate resolution modal is keyboard accessible; redundant manual entry remains available when upload is blocked; interactive targets are at least 44x44px. |
| Source UC/BP/BR IDs | BP-001; BP-010; BR-003; BR-004; UC-001; UC-002 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-005 | Manual candidate/job form | input | yes | Required fields must pass validation before creating NEW/IMPORTED record. | UC-001; BP-001 |
| UI-006 | Excel upload control | input | yes | Accept .xlsx only; reject unsupported formats before import. | UC-001; BR-004 |
| UI-007 | Duplicate review table | table | yes | Requires HR decision to merge, skip, or create new candidate. | BR-003 |
| UI-008 | Drive import exception list | table | yes | Displays folder/file/import error and retry/assign actions. | UC-002; BP-010 |

### SCREEN-003: Screening Review and Approval

| Field | Value |
| --- | --- |
| Purpose | Let HR Manager review AI CV screening outputs and approve, reject, or request re-screening. |
| Primary User | HR Manager |
| Entry Point | Pending screening approval queue |
| Primary Action | Approve, reject, or request re-screening for one or many candidates |
| Secondary Actions | Review score explanation; Review missing skills and risk flags; Open CV/JD evidence; Route low-confidence items to manual review |
| Empty State | Show no pending screening approvals. |
| Loading State | Show screening result skeleton. |
| Error State | Show screening output unavailable or low-confidence warning. |
| Success State | Show explainable score, recommendation, and approval actions. |
| Accessibility Requirements | Approval buttons have clear labels and confirmations; risk flags are text-based and screen-reader readable; bulk selection supports keyboard range/toggle interaction, visible selected count, and polite aria-live updates; tables use caption, th, and scope; interactive targets are at least 44x44px. |
| Source UC/BP/BR IDs | BP-002; BR-001; BR-002; BR-005; BR-006; UC-003 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-009 | Screening score panel | card | yes | Displays score 0-100, sub-scores, confidence, recommendation, and prompt/model/rubric version. | BR-006; UC-003 |
| UI-010 | Evidence and explainability section | card | yes | Shows strengths, weaknesses, missing skills, risk flags, and evidence spans. | BR-006; BR-005 |
| UI-011 | Screening approval actions | button | yes | Requires explicit HR Manager action; no timeout auto-action. | BR-001; BR-002; UC-003 |
| UI-012 | Bulk screening approval controls | table | yes | Bulk action available only for selected candidates with complete review data. | UC-003; BR-001 |

### SCREEN-004: Interview Scheduling Approval

| Field | Value |
| --- | --- |
| Purpose | Let HR Manager review suggested interview slots before calendar event creation and confirmation email. |
| Primary User | HR Manager |
| Entry Point | Candidate state SCREENED_IN / scheduling queue |
| Primary Action | Approve suggested slot or request alternatives |
| Secondary Actions | Review candidate availability; Review interviewer free/busy; Check timezone and working hours; Send availability reminder |
| Empty State | Show no candidates awaiting scheduling. |
| Loading State | Show slot calculation progress. |
| Error State | Show no slot, Calendar unavailable, or availability missing. |
| Success State | Show ranked suggested slots and approval actions. |
| Accessibility Requirements | Timezones displayed with labels; Slot options selectable by keyboard; Conflict warnings not color-only |
| Source UC/BP/BR IDs | BP-003; BR-001; BR-007; BR-008; BR-024; UC-004 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-013 | Availability and free/busy summary | card | yes | Displays candidate availability and interviewer free/busy source status. | BP-003; UC-004 |
| UI-014 | Suggested slot list | table | yes | Ranks earliest valid slots within working hours/timezone policy. | BR-008; UC-004 |
| UI-015 | Schedule approval actions | button | yes | Creates calendar event only after explicit approval. | BR-001; BR-007 |
| UI-016 | Reschedule/cancel placeholder notice | card | yes | Indicates post-creation policy is unresolved and must not assume automated behavior. | BR-024; BQ-007 |

### SCREEN-005: Async AI Interview Workspace

| Field | Value |
| --- | --- |
| Purpose | Allow candidates to complete text-based asynchronous interview with fixed and follow-up questions. |
| Primary User | Candidate |
| Entry Point | Secure interview link sent by email |
| Primary Action | Answer interview questions before deadline |
| Secondary Actions | Save progress; Change supported language if permitted; Submit final answers |
| Empty State | Show interview instructions before start. |
| Loading State | Show question loading state. |
| Error State | Show expired link, unavailable interview, or submission failure. |
| Success State | Show submission confirmation and next-step message. |
| Accessibility Requirements | Questions and inputs are keyboard accessible; focus moves to each new fixed/follow-up question heading; errors tied to fields with aria-describedby and aria-invalid; language is declared for screen readers; timeout/deadline info available in text and assertive aria-live only when urgent; progress uses role=progressbar with aria-valuenow/min/max; prefers-reduced-motion respected; redundant save/submit paths available; interactive targets are at least 44x44px. |
| Source UC/BP/BR IDs | BP-004; BP-009; BP-010; UC-005 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-017 | Interview instruction panel | card | yes | Shows async text format, deadline, reminder behavior, and privacy notice. | BP-004; UC-005 |
| UI-018 | Question and answer thread | input | yes | Shows fixed questions and AI follow-ups based on prior answers. | UC-005 |
| UI-019 | Submit interview button | button | yes | Requires all required answers; creates transcript and evaluation trigger. | UC-005; BR-012 |
| UI-020 | Expired/incomplete interview state | card | yes | Routes to reopen/manual review/withdraw/error according to business policy. | BP-004; BP-009; BP-010 |

### SCREEN-006: Test Setup, Submission, and Grading Review

| Field | Value |
| --- | --- |
| Purpose | Support assignment and grading review for MCQ, essay, and coding tests. |
| Primary User | HR Recruiter / Candidate / HR Manager |
| Entry Point | Candidate reaches AI_INTERVIEW_COMPLETED or test stage |
| Primary Action | Assign, submit, grade, and review candidate test result |
| Secondary Actions | Import test definition; Review section scores; Handle grading failure; Record manual override reason |
| Empty State | Show no assigned test or test setup CTA. |
| Loading State | Show grading in progress. |
| Error State | Show timeout, grading failure, sandbox error, or plagiarism flag. |
| Success State | Show score report and readiness for final review. |
| Accessibility Requirements | Form controls labelled; code/test feedback readable as text; score tables use caption, th, and scope; grading progress uses role=progressbar with aria-valuenow/min/max; errors include recovery instructions; interactive targets are at least 44x44px. |
| Source UC/BP/BR IDs | BP-005; BR-009; BR-010; BR-012; UC-006 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-021 | Test definition import | input | yes | Accept configured Excel/JSON test definition with answer key/rubric/test cases. | BP-005; UC-006 |
| UI-022 | Candidate submission form | input | yes | Captures MCQ/essay/coding submission and deadline status. | UC-006 |
| UI-023 | Grading report | card | yes | MCQ deterministic; essay/coding rubric-backed with score and feedback. | BR-009; BR-010; UC-006 |
| UI-024 | Manual review/override action | button | yes | Requires HR Manager reason and audit record for override. | BR-012; UC-006 |

### SCREEN-007: Final Review and Decision

| Field | Value |
| --- | --- |
| Purpose | Let HR Manager review complete evidence package and record final pass/fail outcome. |
| Primary User | HR Manager |
| Entry Point | Candidate state FINAL_REVIEW |
| Primary Action | Record PASS or FAIL decision |
| Secondary Actions | Review screening/interview/test evidence; Defer pending missing evidence; Withdraw candidate; Record override reason |
| Empty State | Show no candidates in final review. |
| Loading State | Show evidence package loading. |
| Error State | Show incomplete or conflicting evidence warning. |
| Success State | Show final decision confirmation and audit event. |
| Accessibility Requirements | Decision controls require clear confirmation; Evidence sections have headings; Conflict warnings are text-based |
| Source UC/BP/BR IDs | BP-006; BP-009; BR-001; BR-012; BR-022; UC-007; UC-009 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-025 | Evidence package summary | card | yes | Aggregates screening, interview, and test reports. | BP-006; UC-007 |
| UI-026 | Final decision actions | button | yes | Requires explicit HR Manager pass/fail decision; combined policy unresolved until BQ-006. | BR-001; BR-022; UC-007 |
| UI-027 | Decision audit reason input | input | yes | Required for override/defer/exception decisions. | BR-012; UC-007 |
| UI-028 | Withdrawal action | button | yes | Moves candidate to WITHDRAWN and closes pending actions. | BP-009; UC-009 |

### SCREEN-008: Admin Configuration and Monitoring

| Field | Value |
| --- | --- |
| Purpose | Let Admin/IT configure Google integrations, templates, operational thresholds, and monitor failures/costs. |
| Primary User | Admin / IT Admin |
| Entry Point | Admin navigation |
| Primary Action | Configure integration and operational governance settings |
| Secondary Actions | Manage Drive watch configuration; Manage Gmail templates; View Calendar integration health; View AI errors and token cost; Assign error remediation owner |
| Empty State | Show missing configuration checklist. |
| Loading State | Show configuration loading. |
| Error State | Show integration config validation errors. |
| Success State | Show active configuration and health status. |
| Accessibility Requirements | Settings forms have labels and inline errors linked by aria-describedby and aria-invalid; health charts include complete tabular fallback with same metrics and status text; admin actions have confirmations; interactive targets are at least 44x44px. |
| Source UC/BP/BR IDs | BP-008; BP-010; BR-002; BR-015; BR-017; BR-020; BR-021; BR-023; BQ-002; BQ-003; BQ-005 |

#### UI Elements

| Element ID | Element | Type | Required? | Validation / Behavior | Source IDs |
| --- | --- | --- | --- | --- | --- |
| UI-029 | Google Workspace configuration | input | yes | Captures OAuth status, Drive folder, Gmail mailbox/templates, Calendar access. | BR-017; BQ-005 |
| UI-030 | Reminder and escalation policy settings | input | yes | Reminder-only behavior enforced; escalation cannot approve automatically. | BR-002; BR-021; BQ-002 |
| UI-031 | Retention policy settings placeholder | input | yes | Blocks implementation sign-off until retention/deletion periods are defined. | BR-023; BQ-003 |
| UI-032 | Monitoring dashboard | card | yes | Shows uptime, AI errors, API failures, token cost, queue stalls. | BP-008; BR-015; BR-020 |


## 3. API / Interface Definitions

### API-001: Candidate and Job Import Interface

| Field | Value |
| --- | --- |
| Interface Type | File/REST |
| Method / Event | POST import or Drive file-created event |
| Path / Topic / Command | /imports/candidates or google.drive.file.created |
| Purpose | Create candidate/job records from manual, Excel, or Drive input and return row-level outcomes. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source UC/BP/BR IDs | BP-001; BP-010; BR-003; BR-004; BR-011; UC-001; UC-002 |

#### Request
```json
{
 "source": "manual|excel|google_drive",
 "job": {
 "title": "string",
 "jdTextOrFileRef": "string"
 },
 "candidates": [
 {
 "name": "string",
 "email": "string",
 "phone": "string (optional, E.164 format recommended)",
 "cvFileRef": "string"
 }
 ]
}
```

#### Response / Output
```json
{
 "importId": "string",
 "createdCount": "number",
 "duplicateCount": "number",
 "errorRows": [
 {
 "row": "number",
 "code": "string",
 "message": "string"
 }
 ]
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_IMPORT_FORMAT | Unsupported file type or invalid template | Only configured MVP formats are accepted. | Use template or supported file format. |
| ERR_DUPLICATE_CANDIDATE | Possible duplicate candidate detected | Duplicate review is required. | HR chooses merge, skip, or create new. |
| ERR_DRIVE_CONFIG | Drive folder/webhook unavailable | Drive import is not configured or unavailable. | Admin remediates configuration or retries. |

### API-002: CV/JD Text Extraction Interface

| Field | Value |
| --- | --- |
| Interface Type | RPC |
| Method / Event | extract_text |
| Path / Topic / Command | document.extract_text |
| Purpose | Extract text from supported CV/JD files and return parse confidence. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source UC/BP/BR IDs | BP-002; BR-004; BR-005 |

#### Request
```json
{
 "documentRef": "string",
 "documentType": "cv|jd",
 "fileType": "pdf|docx"
}
```

#### Response / Output
```json
{
 "text": "string",
 "parseConfidence": "number",
 "unsupportedOcrRequired": "boolean",
 "evidenceMetadata": {}
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_UNSUPPORTED_OCR | Scanned/image-only file | OCR is outside MVP scope. | Ask HR to upload text-native PDF/DOCX or route to Phase 2. |
| ERR_PARSE_LOW_CONFIDENCE | Extraction confidence below threshold | Manual review required. | Route to manual review. |

### API-003: AI Screening Evaluation Interface

| Field | Value |
| --- | --- |
| Interface Type | RPC |
| Method / Event | evaluate_screening |
| Path / Topic / Command | ai.screening.evaluate |
| Purpose | Generate explainable CV-to-JD screening result for HR Manager review. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source UC/BP/BR IDs | BP-002; BR-005; BR-006; UC-003 |

#### Request
```json
{
 "candidateId": "string",
 "jobId": "string",
 "cvText": "string",
 "jdText": "string",
 "weights": {
 "skills": "number (optional, 0-1, default 0.4)",
 "experience": "number (optional, 0-1, default 0.3)",
 "language": "number (optional, 0-1, default 0.2)",
 "education": "number (optional, 0-1, default 0.1)"
 }
}
```

#### Response / Output
```json
{
 "score": "number 0-100",
 "recommendation": "screen_in|screen_out|manual_review",
 "summary": {
 "strengths": [
 "string"
 ],
 "weaknesses": [
 "string"
 ]
 },
 "riskFlags": [
 "string"
 ],
 "missingSkills": [
 "string"
 ],
 "subScores": {
 "skills": "number 0-100",
 "experience": "number 0-100",
 "language": "number 0-100",
 "education": "number 0-100"
 },
 "confidence": "number",
 "evidenceSpans": [
 {
 "source": "cv|jd",
 "text": "string"
 }
 ],
 "modelVersion": "string",
 "promptVersion": "string"
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_AI_UNAVAILABLE | LLM request fails | Screening could not be completed. | Retry or route to ERROR remediation. |
| ERR_LOW_CONFIDENCE | AI confidence below threshold | Manual review required. | HR Manager reviews manually. |

### API-004: Approval Decision Interface

| Field | Value |
| --- | --- |
| Interface Type | REST/Event |
| Method / Event | POST decision / approval.recorded |
| Path / Topic / Command | /approvals/{approvalId}/decision |
| Purpose | Record explicit human approval/rejection/request rework for screening, scheduling, or final review. |
| Auth Required | yes |
| Permission Rule | BR-001 |
| Source UC/BP/BR IDs | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |

#### Request
```json
{
 "approvalId": "string",
 "decision": "approve|reject|request_rework|defer",
 "reason": "string",
 "bulkCandidateIds": [
 "string"
 ]
}
```

#### Response / Output
```json
{
 "decisionId": "string",
 "newCandidateStates": [
 "string"
 ],
 "auditEventId": "string"
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_APPROVER_REQUIRED | Actor lacks approval permission | Only authorized approver can decide. | Route to HR Manager or backup approver. |
| ERR_DECISION_INCOMPLETE | Required reason/evidence missing | Decision requires complete evidence or reason. | Provide missing information. |

### API-005: Scheduling Suggestion and Calendar Interface

| Field | Value |
| --- | --- |
| Interface Type | REST/RPC |
| Method / Event | suggest_slots / create_event |
| Path / Topic / Command | calendar.freebusy + calendar.events.create |
| Purpose | Read availability/free-busy, suggest valid slots, and create event only after approval. |
| Auth Required | yes |
| Permission Rule | BR-017 |
| Source UC/BP/BR IDs | BP-003; BR-007; BR-008; BR-017; BR-024; UC-004 |

#### Request
```json
{
 "candidateId": "string",
 "interviewerIds": [
 "string"
 ],
 "candidateAvailability": [
 "datetime range"
 ],
 "timezone": "IANA timezone",
 "approvedSlot": "datetime range optional"
}
```

#### Response / Output
```json
{
 "suggestedSlots": [
 {
 "start": "datetime",
 "end": "datetime",
 "timezone": "string",
 "rank": "number"
 }
 ],
 "calendarEventId": "string optional"
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_NO_VALID_SLOT | No slot satisfies rules | No valid interview slots found. | Request alternative availability. |
| ERR_CALENDAR_UNAVAILABLE | Google Calendar unavailable | Calendar integration unavailable. | Retry or manual scheduling fallback. |
| ERR_EVENT_REQUIRES_APPROVAL | Create event before approval | Calendar event requires HR Manager approval. | Record approval first. |

### API-006: Notification and Gmail Interface

| Field | Value |
| --- | --- |
| Interface Type | REST/Event |
| Method / Event | send_email / reminder.due |
| Path / Topic / Command | gmail.messages.send + notification events |
| Purpose | Send approved templates from shared HR mailbox for invitations, confirmations, reminders, and results. |
| Auth Required | yes |
| Permission Rule | BR-014 |
| Source UC/BP/BR IDs | BP-007; BR-014; BR-017; UC-008 |

#### Request
```json
{
 "templateId": "string",
 "recipient": "email",
 "candidateId": "string",
 "context": {},
 "sendFrom": "shared_hr_mailbox"
}
```

#### Response / Output
```json
{
 "messageId": "string",
 "sentAt": "datetime",
 "auditEventId": "string"
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_TEMPLATE_MISSING | Template unavailable | Email template is missing. | Admin/HR configures template. |
| ERR_GMAIL_UNAVAILABLE | Gmail API failure | Email could not be sent. | Retry or remediate integration. |

### API-007: Async Interview Interface

| Field | Value |
| --- | --- |
| Interface Type | REST/RPC |
| Method / Event | GET/POST interview session |
| Path / Topic / Command | /candidate-interviews/{token} |
| Purpose | Deliver fixed and follow-up text interview questions and capture candidate answers. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source UC/BP/BR IDs | BP-004; UC-005 |

#### Request
```json
{
 "sessionToken": "string (required, cryptographically opaque token)",
 "answer": "string (optional, required when submitting answer)",
 "questionId": "string (optional, required when submitting answer)"
}
```

#### Response / Output
```json
{
 "nextQuestion": {
 "id": "string",
 "text": "string",
 "type": "fixed|follow_up"
 },
 "isComplete": "boolean",
 "transcriptId": "string (optional, provided upon completion)",
 "evaluationId": "string (optional, generated async after completion; see evaluation SLA)"
}
```

#### Token Security Contract

| Property | Requirement |
| --- | --- |
| Generation | Cryptographically random opaque token (min 256 bits / 43 base64 chars), using CSPRNG. Never sequential or guessable. |
| Candidate Binding | Token is bound to candidateId and scheduleId at creation time; binding is immutable; token cannot be reassigned to another candidate. |
| Expiry | Token expires at interviewDeadline (configurable per job, default 7 days from send) or 24h after first access, whichever is earlier. Expired token returns ERR_LINK_EXPIRED. |
| Revocation | Token is revoked when: candidate submits final interview, HR marks candidate WITHDRAWN, HR Manager reopens interview, or retry count exceeded. Revocation is logged in audit trail. |
| Rate Limit | 60 requests per minute per token. Exceeding returns 429 Too Many Requests with Retry-After header. |
| Multi-Session Persistence | Candidate can resume same session across multiple browser sessions using the same token. Server-side session state; each unique sessionId stored with token for audit. |
| Partial Answer Behavior | Partial answers auto-saved server-side every 30s during active session. On reconnect, candidate sees last saved state. Incomplete submission before deadline marked incomplete; HR can reopen or mark error. |
| Language Context | Accept-Language header required; interview language set at token creation time from job.language; follow-up questions generated in same language. |
| Safe Expiration | Expired before completion: candidate sees expired state with HR contact; system transitions candidate to ERROR with owner assignment and audit event; no auto-advance without human action. |

#### Candidate Role Security

| Property | Requirement |
| --- | --- |
| Auth | Candidate authenticates via token only (no internal HR credentials). Token is the candidate's authentication credential for the interview session. |
| Data Scope | Candidate can access only their own interview session, questions, and submission history. No access to other candidates, internal HR data, or admin functions. |
| Audit Capture | Session captures IP address and user agent at each token use; stored in audit trail with actorType=candidate. |

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_LINK_EXPIRED | Interview token expired | Interview link has expired. | HR may reopen or mark withdrawn/error. |
| ERR_INCOMPLETE_SUBMISSION | Required answers missing | Please complete required answers. | Candidate completes missing answers. |
| ERR_TOKEN_INVALID | Token format invalid or not found | Interview session not found. | Contact HR recruiter for correct link. |
| ERR_ANSWER_TOO_LONG | Answer exceeds 4000 characters | Answer exceeds maximum length. | Shorten answer and resubmit. |
| ERR_RATE_LIMIT_EXCEEDED | Exceeding 60 req/min | Too many requests. Please wait. | Retry after rate limit window. |

### API-008: Test Grading Interface

| Field | Value |
| --- | --- |
| Interface Type | RPC |
| Method / Event | grade_test |
| Path / Topic / Command | test.grade |
| Purpose | Grade MCQ deterministically and essay/coding with rubric/test-case supported evaluation. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source UC/BP/BR IDs | BP-005; BR-009; BR-010; UC-006; BQ-004 |

#### Request
```json
{
 "candidateId": "string",
 "testDefinitionId": "string",
 "submission": {
 "mcq": {},
 "essay": {},
 "coding": {}
 }
}
```

#### Response / Output
```json
{
 "sectionScores": {},
 "totalScore": "number",
 "passFailRecommendation": "pass|fail|manual_review",
 "feedback": "string",
 "gradingConfidence": "number",
 "rubricVersion": "string"
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_GRADING_FAILURE | AI or deterministic grader fails | Test grading failed. | Retry or manual review. |
| ERR_SANDBOX_UNDEFINED | Coding runtime policy missing | Coding sandbox/runtime must be defined. | Resolve BQ-004 before coding grading implementation. |

### API-009: Withdrawal Interface

| Field | Value |
| --- | --- |
| Interface Type | REST/Event |
| Method / Event | POST withdraw / candidate.withdrawn |
| Path / Topic / Command | /candidates/{candidateId}/withdraw |
| Purpose | Move candidate to WITHDRAWN and close pending workflow actions. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source UC/BP/BR IDs | BP-009; UC-009 |

#### Request
```json
{
 "candidateId": "string",
 "reason": "string optional",
 "source": "candidate|hr_recruiter|hr_manager"
}
```

#### Response / Output
```json
{
 "candidateId": "string",
 "state": "WITHDRAWN",
 "closedActionIds": [
 "string"
 ],
 "auditEventId": "string"
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_WITHDRAWAL_AMBIGUOUS | Withdrawal source unclear | Withdrawal request must be confirmed. | HR confirms source before state change. |

### API-010: Error Remediation Interface

| Field | Value |
| --- | --- |
| Interface Type | REST/Event |
| Method / Event | POST remediate / error.assigned |
| Path / Topic / Command | /errors/{errorId}/remediation |
| Purpose | Assign owner, classify, retry, route to manual review, or return candidate to previous valid state. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source UC/BP/BR IDs | BP-010; UC-010; BR-012 |

#### Request
```json
{
 "errorId": "string",
 "classification": "import|parse|ai|google|grading|unknown",
 "ownerId": "string",
 "action": "retry|manual_review|return_previous_state|withdraw"
}
```

#### Response / Output
```json
{
 "errorId": "string",
 "status": "assigned|resolved|escalated",
 "candidateState": "string",
 "auditEventId": "string"
}
```

#### Errors

| Code | Condition | User/System Message | Recovery |
| --- | --- | --- | --- |
| ERR_OWNER_REQUIRED | No remediation owner assigned | Error remediation requires an owner. | Assign HR Recruiter or IT Admin. |
| ERR_RETRY_FAILED | Retry failed repeatedly | Retry failed; escalation/manual fallback required. | Escalate or use manual process. |


## 4. Data Detail Definitions

### DATA-001: Candidate

| Field | Value |
| --- | --- |
| Business Meaning | Person moving through recruitment pipeline. |
| Lifecycle | NEW through terminal PASSED/FAILED/SCREENED_OUT/WITHDRAWN or remediation ERROR. |
| Sensitivity | sensitive |
| Retention | BLOCKED: define in BQ-003 before implementation sign-off. |
| Source Business IDs | BP-001; BP-009; BR-011; BR-019 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| candidateId | uuid | yes | unique | generated | Primary candidate identifier | BP-001; BP-009; BR-011; BR-019 |
| fullName | string | yes | non-empty | | Candidate legal/display name | BP-001; BP-009; BR-011; BR-019 |
| email | email | yes | valid email | | Candidate contact | BP-001; BP-009; BR-011; BR-019 |
| phone | string | no | E.164 format recommended | null | Optional; used for duplicate detection alongside email per BR-003. Upstream BR-003 specifies email/phone. | BP-001; BR-003 |
| currentState | enum | yes | one canonical candidate state | NEW | Business state machine state | BP-001; BP-009; BR-011; BR-019 |
| jobId | uuid | yes | existing job | | Applied job | BP-001; BP-009; BR-011; BR-019 |
| source | enum | yes | manual|excel|google_drive | | Sourcing origin | BP-001; BP-009; BR-011; BR-019 |
| withdrawalReason | string | no | required when state WITHDRAWN if available | | Audit context | BP-001; BP-009; BR-011; BR-019 |

### DATA-002: Job and JD

| Field | Value |
| --- | --- |
| Business Meaning | Recruitment opening and job description used for screening/interview/test context. |
| Lifecycle | Created/imported before screening; referenced throughout candidate evaluation. |
| Sensitivity | internal |
| Retention | BLOCKED: align with BQ-003 if JD contains confidential data. |
| Source Business IDs | BP-001; BP-002; BR-019 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| jobId | uuid | yes | unique | generated | Job identifier | BP-001; BP-002; BR-019 |
| title | string | yes | non-empty | | Job title | BP-001; BP-002; BR-019 |
| jdText | string | yes | non-empty or extracted text | | JD criteria | BP-001; BP-002; BR-019 |
| language | enum | yes | vi|ja|en | | Primary JD/interview language | BP-001; BP-002; BR-019 |
| status | enum | yes | open|closed|paused | open | Recruitment status | BP-001; BP-002; BR-019 |

### DATA-003: Document File

| Field | Value |
| --- | --- |
| Business Meaning | CV/JD/test import file metadata and extracted text. |
| Lifecycle | Uploaded/imported, parsed, retained per policy. |
| Sensitivity | sensitive |
| Retention | BLOCKED: BQ-003. |
| Source Business IDs | BR-004; BR-005; BP-002 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| documentId | uuid | yes | unique | generated | Document identifier | BR-004; BR-005; BP-002 |
| ownerEntityId | uuid | yes | existing candidate/job/test | | Owning entity | BR-004; BR-005; BP-002 |
| fileType | enum | yes | pdf|docx|xlsx|json | | Supported MVP formats by context | BR-004; BR-005; BP-002 |
| extractedText | string | no | required after successful parse | | Text used by AI | BR-004; BR-005; BP-002 |
| parseConfidence | number | no | 0-1 | | Manual review threshold governed by BQ-001 | BR-004; BR-005; BP-002 |
| isScannedOrImageOnly | boolean | yes | true|false | false | Rejected in MVP if true | BR-004; BR-005; BP-002 |

### DATA-004: Screening Result

| Field | Value |
| --- | --- |
| Business Meaning | Explainable AI assessment of candidate CV against JD. |
| Lifecycle | Generated in SCREENING_RUNNING, reviewed in SCREENING_PENDING_APPROVAL, retained for final review/audit. |
| Sensitivity | sensitive |
| Retention | BLOCKED: BQ-003. |
| Source Business IDs | BP-002; BR-005; BR-006; UC-003 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| screeningResultId | uuid | yes | unique | generated | Result identifier | BP-002; BR-005; BR-006; UC-003 |
| candidateId | uuid | yes | existing candidate | | Candidate reference | BP-002; BR-005; BR-006; UC-003 |
| score | number | yes | 0-100 | | Overall matching score | BP-002; BR-005; BR-006; UC-003 |
| recommendation | enum | yes | screen_in|screen_out|manual_review | | AI recommendation only | BP-002; BR-005; BR-006; UC-003 |
| confidence | number | yes | 0-1 | | Low confidence routes to manual review | BP-002; BR-005; BR-006; UC-003 |
| summary | object | yes | strengths and weaknesses | | Explainability summary | BP-002; BR-005; BR-006; UC-003 |
| riskFlags | array | yes | strings | [] | Critical mismatch flags | BP-002; BR-005; BR-006; UC-003 |
| missingSkills | array | yes | strings | [] | Skill gaps | BP-002; BR-005; BR-006; UC-003 |
| evidenceSpans | array | yes | source/text entries | [] | Evidence for review | BP-002; BR-005; BR-006; UC-003 |
| modelVersion | string | yes | non-empty | | AI governance | BP-002; BR-005; BR-006; UC-003 |
| promptVersion | string | yes | non-empty | | Screening prompt version for governance and reproducibility. | BP-002; BR-005; BR-006; UC-003 |

### DATA-005: Approval Decision

| Field | Value |
| --- | --- |
| Business Meaning | Explicit human business decision at screening, scheduling, or final review gate. |
| Lifecycle | Created only by authorized human action; immutable audit event. |
| Sensitivity | confidential |
| Retention | Audit retention BLOCKED by BQ-003. |
| Source Business IDs | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| decisionId | uuid | yes | unique | generated | Decision identifier | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |
| approvalType | enum | yes | screening|scheduling|final_review | | Gate type | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |
| decision | enum | yes | approve|reject|request_rework|defer|pass|fail | | Human decision | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |
| actorId | uuid | yes | authorized approver | | Decision maker | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |
| reason | string | conditional | required for reject/rework/defer/override | | Decision rationale | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |
| createdAt | datetime | yes | ISO-8601 | now | Decision timestamp | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 |

### DATA-006: Interview Schedule

| Field | Value |
| --- | --- |
| Business Meaning | Approved interview slot and associated Calendar event/communication. |
| Lifecycle | Suggested, approved, event created, then proceeds to interview stage. |
| Sensitivity | confidential |
| Retention | BLOCKED: BQ-003. |
| Source Business IDs | BP-003; BR-007; BR-008; BR-024; UC-004 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| scheduleId | uuid | yes | unique | generated | Schedule identifier | BP-003; BR-007; BR-008; BR-024; UC-004 |
| candidateId | uuid | yes | existing candidate | | Candidate reference | BP-003; BR-007; BR-008; BR-024; UC-004 |
| interviewerIds | array | yes | non-empty | | Interviewers | BP-003; BR-007; BR-008; BR-024; UC-004 |
| startAt | datetime | yes | future with advance notice | | Approved start | BP-003; BR-007; BR-008; BR-024; UC-004 |
| endAt | datetime | yes | after start | | Approved end | BP-003; BR-007; BR-008; BR-024; UC-004 |
| timezone | string | yes | IANA timezone | | Timezone | BP-003; BR-007; BR-008; BR-024; UC-004 |
| calendarEventId | string | conditional | required after approval | | Google event | BP-003; BR-007; BR-008; BR-024; UC-004 |
| status | enum | yes | suggested|approved|created|cancelled|reschedule_pending | suggested | Reschedule/cancel governed by BQ-007 | BP-003; BR-007; BR-008; BR-024; UC-004 |
| calendarEventCleanup | enum | no | delete|retain|blocked_by_q7 | blocked_by_q7 | Upon withdrawal or cancellation, calendar event cleanup policy. BLOCKED until Q4-007 resolves reschedule/cancel policy. Do not auto-delete or auto-retain without resolution. | BP-003; BR-024; BQ-007 |

### DATA-007: Async Interview Transcript and Evaluation

| Field | Value |
| --- | --- |
| Business Meaning | Candidate interview answers and AI evaluation report. |
| Lifecycle | Created during interview, evaluated, then used for final review/test handoff. |
| Sensitivity | sensitive |
| Retention | BLOCKED: BQ-003. |
| Source Business IDs | BP-004; UC-005 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| transcriptId | uuid | yes | unique | generated | Transcript identifier | BP-004; UC-005 |
| candidateId | uuid | yes | existing candidate | | Candidate reference | BP-004; UC-005 |
| answers | array | yes | question/answer pairs | [] | Submitted text answers | BP-004; UC-005 |
| followUpQuestions | array | no | generated question entries | [] | Dynamic follow-ups | BP-004; UC-005 |
| evaluationReport | object | yes | required after completion and within SLA | | AI evaluation required after interview completion and within configured SLA. Transcript is complete at submission. Evaluation is generated asynchronously; if evaluation SLA is missed, candidate transitions to ERROR with owner assignment and audit event. Missing evaluation after SLA expiry is treated as ERROR. | BP-004; UC-005 |
| completionStatus | enum | yes | pending|completed|expired|incomplete|in_progress | pending | Interview completion state. `in_progress` used during active session. | BP-004; UC-005 |
| evaluationSlaDeadline | datetime | no | ISO-8601 | submittedAt + 30 minutes | Default evaluation SLA deadline. If missed, mark evaluation stale, alert owner, and route to ERROR/manual review without advancing candidate. | BP-004; UC-005; BP-008; BP-010; BR-015 |

### DATA-008: Test Definition and Submission

| Field | Value |
| --- | --- |
| Business Meaning | Assessment content, answer/rubric/test cases, candidate submission, and grading report. |
| Lifecycle | Imported/assigned/submitted/graded/final review. |
| Sensitivity | sensitive |
| Retention | BLOCKED: BQ-003. |
| Source Business IDs | BP-005; BR-009; BR-010; UC-006; BQ-004 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| testRequired | boolean | yes | boolean | true | Determines whether test is part of the job evaluation flow. When false, candidate transitions directly from AI_INTERVIEW_COMPLETED to FINAL_REVIEW without entering TEST_PENDING or TEST_GRADED (BR-012 / TEST-011 and TEST-012 conditional on testRequired=true). Set at job level or overridden per candidate. | BP-005; BR-009; BR-010; UC-006 |
| testDefinitionId | uuid | yes | unique | generated | Test definition | BP-005; BR-009; BR-010; UC-006; BQ-004 |
| testType | enum | yes | mcq|essay|coding|mixed | | Supported test type | BP-005; BR-009; BR-010; UC-006; BQ-004 |
| answerKeyOrRubric | object | yes | required by type | | Grading source | BP-005; BR-009; BR-010; UC-006; BQ-004 |
| submissionId | uuid | yes | unique | generated | Candidate submission | BP-005; BR-009; BR-010; UC-006; BQ-004 |
| sectionScores | object | conditional | required after grading | | Score breakdown by section (e.g. mcq, essay, coding). Only populated when testRequired=true; coding section remains blocked until BQ-004 is resolved. | BP-005; BR-009; BR-010; UC-006 |
| totalScore | number | conditional | 0-100 after grading | | Total score | BP-005; BR-009; BR-010; UC-006; BQ-004 |
| gradingConfidence | number | conditional | 0-1 | | Manual review trigger | BP-005; BR-009; BR-010; UC-006; BQ-004 |

### DATA-009: Audit Event

| Field | Value |
| --- | --- |
| Business Meaning | Immutable record of business, security, and workflow actions. |
| Lifecycle | Created for all significant actions and retained by policy. |
| Sensitivity | confidential |
| Retention | BLOCKED: BQ-003. |
| Source Business IDs | BR-012; BAC-002; BAC-004 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| auditEventId | uuid | yes | unique | generated | Audit identifier | BR-012; BAC-002; BAC-004 |
| actorId | uuid | conditional | required for user action | | Actor | BR-012; BAC-002; BAC-004 |
| actorType | enum | yes | human|system|candidate | | Distinguishes human HR actors, system automation, and candidate self-actions. | BR-012; BAC-002 |
| systemActor | string | no | non-empty when actorType=system | null | When actorType=system, name/ID of the automation (e.g. ai-screening, reminder-job, gmail-notification). | BR-012; BAC-002 |
| ipAddress | string | no | IPv4 or IPv6 | null | IP address of actor at time of action. Used for security audit and fraud detection. | BR-012; BAC-004 |
| userAgent | string | no | non-empty | null | User agent string for browser/API client identification. | BR-012; BAC-004 |
| correlationId | string | no | UUID | null | Cross-request correlation ID for tracing related events across distributed components. | BR-012; BP-008 |
| action | string | yes | controlled vocabulary | | Action name. Controlled vocabulary: candidate.created, candidate.imported, candidate.state_changed, candidate.withdrew, candidate.approved, candidate.rejected, candidate.deferred, approval.recorded, screening.started, screening.completed, interview.sent, interview.submitted, interview.evaluated, interview.expired, test.assigned, test.submitted, test.graded, test.overridden, error.created, error.remediated, notification.sent, config.updated, oauth.authorized. System-authored events must have actorType=system; human approval actions must have actorType=human. | BR-012; BAC-002; BAC-004 |
| entityType | string | yes | non-empty | | Entity type | BR-012; BAC-002; BAC-004 |
| entityId | uuid | yes | non-empty | | Entity id | BR-012; BAC-002; BAC-004 |
| beforeState | string | no | valid state | | Before state | BR-012; BAC-002; BAC-004 |
| afterState | string | no | valid state | | After state | BR-012; BAC-002; BAC-004 |
| changedFields | array | no | array of field names | [] | List of entity field names that changed in this event. Used for targeted audit queries. | BR-012; BAC-002 |
| integrity | enum | yes | append_only|immutable | append_only | Audit events are append-only; once written they cannot be modified or deleted. Enforced at storage layer. | BR-012; BAC-004 |
| createdAt | datetime | yes | ISO-8601 | now | Timestamp | BR-012; BAC-002; BAC-004 |

### DATA-010: Integration Configuration and Health

| Field | Value |
| --- | --- |
| Business Meaning | Google Workspace, AI service, notification, and monitoring configuration/status. |
| Lifecycle | Configured by Admin, monitored continuously, used for remediation. |
| Sensitivity | confidential |
| Retention | Operational retention BLOCKED by BQ-003 where logs contain personal data. |
| Source Business IDs | BP-008; BP-010; BR-015; BR-017; BR-020 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| configId | uuid | yes | unique | generated | Config identifier | BP-008; BP-010; BR-015; BR-017; BR-020 |
| integrationType | enum | yes | google_drive|google_calendar|gmail|ai|monitoring | | Integration type | BP-008; BP-010; BR-015; BR-017; BR-020 |
| status | enum | yes | configured|missing|degraded|failed | missing | Health status | BP-008; BP-010; BR-015; BR-017; BR-020 |
| ownerId | uuid | yes | admin/it admin | | Owner | BP-008; BP-010; BR-015; BR-017; BR-020 |
| lastCheckedAt | datetime | no | ISO-8601 | | Health check time | BP-008; BP-010; BR-015; BR-017; BR-020 |
| failureReason | string | no | required when failed | | Failure context | BP-008; BP-010; BR-015; BR-017; BR-020 |
| maxRetries | integer | yes | positive integer | 3 | Maximum retry attempts before failure transition. | BP-008; BP-010 |
| retryCount | integer | yes | 0 to maxRetries | 0 | Current retry attempt count. Incremented on each retry. | BP-008; BP-010 |
| lastError | string | no | non-empty | null | Last error message (safe, no sensitive details exposed to user). | BP-008; BP-010 |
| lastRetryAt | datetime | no | ISO-8601 | null | Timestamp of last retry attempt. | BP-008; BP-010 |


### DATA-011: Integration Health and Retry State

| Field | Value |
| --- | --- |
| Business Meaning | Tracks staleness thresholds, retry state, and failure patterns for integration health monitoring and SLA management. |
| Lifecycle | Updated on every integration check, retry attempt, and failure event. |
| Sensitivity | confidential |
| Retention | BLOCKED: align with BQ-003 for any logs containing personal data. |
| Source Business IDs | BP-008; BP-010; BR-015 |

#### Fields

| Field | Type | Required | Validation | Default | Notes | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| stalenessThresholdSeconds | integer | yes | positive | 60 | Max age of last successful operation before flagging stale. | BP-008 |
| lastSuccessAt | datetime | no | ISO-8601 | null | Timestamp of last successful operation. | BP-008 |
| retryBackoffSeconds | array | yes | [60, 300, 900, 3600] pattern | [60, 300, 900, 3600] | Exponential backoff sequence: 1min, 5min, 15min, 1hr before escalating to owner. | BP-008; BP-010 |
| failureStalenessMap | object | yes | keyed by integrationType | {} | Per-integration staleness thresholds (seconds): AI screening 300, Gmail delivery 120, Interview evaluation 600, Test grading 300, Calendar availability 60. Exceeding threshold without success routes to ERROR with owner. | BP-008; BP-010; BP-004; BP-005 |
| escalationThreshold | integer | yes | positive | 3600 | Seconds after which unresolved failure escalates (owner notified, alert raised). Default 1h. | BP-008; BP-010; BR-015 |


## 5. State and Workflow Detail

| State ID | Object / Workflow | State | Entry Condition | Exit Condition | Allowed Actions | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| STATE-001 | Candidate Pipeline | NEW | Candidate creation started | Allowed next states: IMPORTED, WITHDRAWN | IMPORTED; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-002 | Candidate Pipeline | IMPORTED | Valid candidate/job input imported | Allowed next states: SCREENING_RUNNING, ERROR, WITHDRAWN | SCREENING_RUNNING; ERROR; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-003 | Candidate Pipeline | SCREENING_RUNNING | JD and CV available | Allowed next states: SCREENING_PENDING_APPROVAL, ERROR, WITHDRAWN | SCREENING_PENDING_APPROVAL; ERROR; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-004 | Candidate Pipeline | SCREENING_PENDING_APPROVAL | Screening result generated | Allowed next states: SCREENED_IN, SCREENED_OUT, SCREENING_RUNNING, WITHDRAWN | SCREENED_IN; SCREENED_OUT; SCREENING_RUNNING; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-005 | Candidate Pipeline | SCREENED_IN | HR Manager approves screening | Allowed next states: AVAILABILITY_PENDING, WITHDRAWN | AVAILABILITY_PENDING; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-006 | Candidate Pipeline | SCREENED_OUT | HR Manager rejects screening | Terminal state | STATE-001 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-007 | Candidate Pipeline | AVAILABILITY_PENDING | Candidate screened in | Allowed next states: SCHEDULING_PENDING_APPROVAL, ERROR, WITHDRAWN | SCHEDULING_PENDING_APPROVAL; ERROR; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-008 | Candidate Pipeline | SCHEDULING_PENDING_APPROVAL | Valid interview slots generated | Allowed next states: INTERVIEW_SCHEDULED, AVAILABILITY_PENDING, WITHDRAWN | INTERVIEW_SCHEDULED; AVAILABILITY_PENDING; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-009 | Candidate Pipeline | INTERVIEW_SCHEDULED | HR Manager approves slot | Allowed next states: AI_INTERVIEW_PENDING, WITHDRAWN, ERROR | AI_INTERVIEW_PENDING; WITHDRAWN; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-010 | Candidate Pipeline | AI_INTERVIEW_PENDING | Interview link sent | Allowed next states: AI_INTERVIEW_COMPLETED, WITHDRAWN, ERROR | AI_INTERVIEW_COMPLETED; WITHDRAWN; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-011 | Candidate Pipeline | AI_INTERVIEW_COMPLETED | Candidate submits async interview | Allowed next states: TEST_PENDING, FINAL_REVIEW, ERROR | TEST_PENDING; FINAL_REVIEW; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | Note: If testRequired=false (per job config), candidate transitions directly to FINAL_REVIEW without entering TEST_PENDING or TEST_GRADED. TEST-011 and TEST-012 are conditional on testRequired=true. |
| STATE-012 | Candidate Pipeline | TEST_PENDING | Test assigned | Allowed next states: TEST_GRADED, WITHDRAWN, ERROR | TEST_GRADED; WITHDRAWN; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-013 | Candidate Pipeline | TEST_GRADED | Test sections graded | Allowed next states: FINAL_REVIEW, ERROR | FINAL_REVIEW; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-014 | Candidate Pipeline | FINAL_REVIEW | Evidence package ready | Allowed next states: PASSED, FAILED, WITHDRAWN | PASSED; FAILED; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-015 | Candidate Pipeline | PASSED | Final pass decision recorded | Terminal state | STATE-002 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-016 | Candidate Pipeline | FAILED | Final fail decision recorded | Terminal state | STATE-003 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-017 | Candidate Pipeline | WITHDRAWN | Candidate withdraws or HR marks withdrawn | Terminal state | STATE-004 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| STATE-018 | Candidate Pipeline | ERROR | Blocking technical or data issue | Allowed next states: previous_valid_state, WITHDRAWN | previous_valid_state; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | Note: ERROR captures blocking technical or data issues at any pipeline stage. The `previousValidState` field (required in error remediation) must capture the exact state before error occurred, disambiguated from itself. ERROR state disambiguates from all other states via errorId and remediation record. |

## 6. Validation Rules

| Rule ID | Input / Object | Validation | Error Message | Source BR/UC IDs |
| --- | --- | --- | --- | --- |
| VAL-001 | Candidate/job import | Manual and Excel inputs require required candidate, job, and supported file fields before import. | Missing or invalid import data. | BP-001; UC-001 |
| VAL-002 | File upload | CV and JD files must be text-native PDF/DOCX; Excel import must be .xlsx; test import must be Excel/JSON. | Unsupported file format for MVP. | BR-004; UC-001 |
| VAL-003 | Duplicate candidate | Potential duplicate requires HR Recruiter merge/skip/create-new decision before pipeline proceeds. | Duplicate candidate requires review. | BR-003 |
| VAL-004 | Screening score | AI screening score must be numeric 0-100 with summary, flags, missing skills, confidence, and evidence spans. | Screening result is incomplete. | BR-006; UC-003 |
| VAL-005 | Low confidence | Low parse/AI confidence must route to manual review and cannot silently advance. | Manual review required due to low confidence. | BR-005 |
| VAL-006 | Approval decision | Screening, scheduling, and final decisions require authorized human actor and explicit action. | Human approval is required. | BR-001; BR-021 |
| VAL-007 | Approval timeout | Elapsed approval time may trigger reminders/escalation but cannot auto-approve/reject/skip. | Approval timeout cannot create a decision. | BR-002; BR-021 |
| VAL-008 | Calendar event creation | Calendar event creation requires approved slot, valid timezone, and valid participants. | Approved slot required before event creation. | BR-007; BR-008 |
| VAL-009 | Notification sending | Workflow emails must use shared HR mailbox and configured templates. | Configured HR mailbox/template required. | BR-014 |
| VAL-010 | MCQ grading | MCQ score must be computed against answer key deterministically. | MCQ answer key required. | BR-009 |
| VAL-011 | Essay/coding grading | Essay/coding grading requires rubric/test cases and records AI confidence/version. | Rubric/test cases required. | BR-010 |
| VAL-012 | Final decision | Final pass/fail must be explicit HR Manager decision; combined policy remains blocked by BQ-006. | Final HR decision required. | BR-022; UC-007 |
| VAL-013 | Withdrawal | Withdrawal closes pending actions and moves candidate to terminal WITHDRAWN. | Withdrawal must close pending actions. | BP-009; UC-009 |
| VAL-014 | Error remediation | ERROR state requires owner, reason, prior state, and resolution action. | Error remediation owner and reason required. | BP-010; UC-010 |
| VAL-015 | Audit trail | All approvals, state changes, AI evaluations, imports, notifications, and remediation actions create audit events. | Audit event required. | BR-012 |

## 6A. Retry, Timeout, and Escalation Detail

| ID | Area | Contract | Failure Behavior | Source IDs |
| --- | --- | --- | --- | --- |
| RETRY-001 | AI screening timeout | Screening request timeout = 30 seconds. | On timeout, move candidate to ERROR with reason SCREENING_TIMEOUT, assign owner, alert configured channel, and do not advance automatically. | BP-002; BP-010; BR-015 |
| RETRY-002 | Gmail delivery | Per-message maxEmailDeliveryRetries = 3 with backoff [60, 300, 900] seconds. | After exhaustion, route notification to ERROR, assign owner, alert configured channel, and keep candidate state unchanged. | BP-010; BR-015; BR-017 |
| RETRY-003 | Calendar availability/free-busy | maxRetries = 3 with backoff [60, 180, 300] seconds. | After exhaustion, route scheduling item to ERROR and require HR/Admin remediation; no Calendar event is created. | BP-003; BP-010; BR-007; BR-015 |
| RETRY-004 | Test grading | maxGradingRetries = 2 with backoff [120, 600] seconds. | After exhaustion, route to ERROR with manual grading/remediation owner and audit event. | BP-005; BP-010; BR-009; BR-010; BR-015 |
| RETRY-005 | Error remediation loop | remediationAttemptCount tracked; maxRemediationAttempts = 3. | After exhaustion, escalate to backup owner/Admin alert channel and keep item in ERROR; escalation never approves/rejects/skips. | BP-010; BR-021; BQ-002 |
| RETRY-006 | Owner fallback | If owner inactive/unavailable, reassign to backup owner from Q4-002; if unset, alert Admin and HR Manager after 4 business hours unassigned. | Alert and audit only; no automatic decision action. | BP-010; BR-021; BQ-002 |
| RETRY-007 | Interview evaluation SLA | Default evaluationSlaDeadline = submittedAt + 30 minutes. | If missed, mark evaluation stale, alert owner, and route to ERROR/manual review without advancing candidate. | BP-004; BP-010; BR-015 |

## 7. Security, Privacy, Compliance, Accessibility Detail

| ID | Concern | Requirement | Implementation Expectation | Verification | Source IDs |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | authentication | All internal HR/Admin screens and APIs require authenticated user identity. | Enforce login/session validation before access. | Access unauthenticated request is rejected. | BR-011 |
| SEC-002 | authorization | Candidate data and decision actions are role-bound to HR Recruiter, HR Manager, Interviewer, and Admin/IT permissions. | Role checks on screens/API actions. | Unauthorized role cannot access/action candidate data. | BR-011; ROLE-001; ROLE-002; ROLE-003; ROLE-004 |
| SEC-003 | privacy | CVs, transcripts, test submissions, and evaluations are sensitive candidate data. | Encrypt in transit/at rest; restrict access; avoid unnecessary exposure. | Security review plus access-control tests. | BR-011; BR-023; BAC-004 |
| SEC-004 | audit | All business decisions and sensitive workflow actions require immutable audit event. | Write Audit Event for state/approval/import/AI/notification/error actions. | Audit coverage tests for each core workflow. | BR-012 |
| SEC-005 | external integration secrets | Google OAuth tokens and AI provider credentials must not be hardcoded. | Use environment variables or secret manager; validate presence at startup. | Secret scan and config validation. | BR-017 |
| SEC-006 | input validation | Uploaded files, forms, Drive events, and candidate answers are untrusted input. | Validate format, size, schema, and expected enum values. | Boundary validation tests. | BR-004; BR-011 |
| SEC-007 | error disclosure | Errors must not leak OAuth tokens, prompts, model internals, or private candidate data. | Map internal errors to safe user messages. | Error response tests. | BP-010 |
| SEC-008 | accessibility | Internal and candidate-facing screens must be keyboard accessible and not rely on color alone. | Semantic controls, focus states, labels, text alternatives. | Automated and manual accessibility checks. | UC-005; |
| SEC-009 | RBAC permission matrix | All screens and API actions enforce role-based access for HR Recruiter, HR Manager, Interviewer, Admin/IT, and Candidate. | Role-based checks on every screen navigation and API action. HR Recruiter: import, view pipeline, retry errors. HR Manager: approve, reject, defer, final decision, configure. Interviewer: view schedule and feedback. Admin/IT: configure integrations, monitor, manage users. Candidate: access own interview link, submit answers, withdraw. | Unauthorized role attempt returns 403/redirect; authorized role can perform action. | BR-011; ROLE-001; ROLE-002; ROLE-003; ROLE-004; BP-008; BAC-004 |
| SEC-010 | API rate limiting | All public-facing and internal APIs enforce rate limits to prevent abuse. | Rate limit headers (X-RateLimit-Limit/Remaining/Reset). Default internal API: 1000 req/min per user. Candidate interview API: 60 req/min per token. AI screening/grading: 30 req/min per job. Exceeding returns 429. | Load test exceeding limit returns 429; headers present. | BR-011; REQ-NF-006 |
| SEC-011 | File upload size limits and malware scanning | Uploaded files are size-limited and scanned for malware before storage. | Max 10 MB per CV/JD, 5 MB per test definition. Rejected files return 413 Payload Too Large. Malware scan before durable storage using approved scanning service; infected files quarantined outside normal processing path, inaccessible to HR users, logged, and routed to ERROR owner. | Upload >10 MB returns 413; scan of infected file is quarantined and not processed. | BR-004; BR-011; BP-010 |
| SEC-012 | Drive webhook and channel token verification | Google Drive push notifications and webhook events must be verified before processing. | Drive webhook signature verified using channel token from admin configuration (BQ-005). Channel token stored in secret manager. Invalid signature or missing token returns 401 Unauthorized. | Invalid signature webhook returns 401; event not processed. | BR-017; BQ-005 |
| SEC-013 | Idempotency keys for state-changing operations | All state-changing API calls accept optional idempotency key to prevent duplicate execution. | Header: Idempotency-Key (UUID). Server stores key + result for 24h; replays result for duplicate key. Applies to: approval decisions, withdrawal, error remediation, email send. | Duplicate request with same idempotency key returns same response without re-execution. | BR-012; REQ-NF-007 |
| SEC-014 | OAuth minimum scopes | Google OAuth integration uses minimum required scopes per integration type. | Drive: readonly folder access + watch scope only. Calendar: read free/busy and create events scope only. Gmail: compose and send from specific alias only. No broad or unrestricted scopes. | OAuth token inspection shows only required scopes; excessive scope request rejected. | BR-017 |
| SEC-015 | CSRF protection for browser state-changing APIs | All browser-initiated state-changing API requests require CSRF token validation. | SameSite=Strict/Lax cookie + X-CSRF-Token header double-submit. All POST/PUT/DELETE/PATCH endpoints protected. Invalid/missing token returns 403. | Request without CSRF token from browser context returns 403. | BR-011 |
| SEC-016 | Security headers (CSP, HSTS, etc.) | All HTTP responses include recommended security headers. | Strict-Transport-Security, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, Content-Security-Policy (per domain), Permissions-Policy: camera=(), microphone=(), geolocation=(). | Security scan of all responses includes required headers. | BR-011; REQ-NF-006 |
| SEC-017 | Prompt injection and content-length controls for candidate answers | Candidate answers are validated and content-length limited to prevent prompt injection and abuse. | Max answer length: 4000 characters per answer. Candidate content is stored separately from system/developer prompts, passed to LLM as quoted untrusted data, and never allowed to override rubric/system instructions. Oversized answers are rejected with recoverable validation message; suspicious prompt-injection patterns route to manual review/ERROR and are audit logged. | Prompt injection fixture cannot alter rubric/system instructions; >4000 character answer is rejected and audited. | BP-004; UC-005; BR-011 |
| SEC-018 | Privacy notice requirements | Candidate-facing interview and test screens display required privacy notice. | Privacy notice shown before interview start and test submission. Notice includes: data controller identity, purpose of processing, retention period (BQ-003), data subject rights, contact for complaints. Must be acknowledged before proceeding; acknowledgement logged. | Privacy notice displayed and acknowledged before first answer submission; acknowledgement logged. | BAC-004; BR-023; BQ-003 |
| SEC-019 | MFA requirement for HR Manager and Admin roles | HR Manager and Admin/IT roles must authenticate with MFA for sensitive actions. | MFA enforced for exact sensitive actions: final pass/fail decision, integration configuration create/update/delete, audit log export, and bulk screening/scheduling approval actions. TOTP or hardware token accepted. Session invalidation after 30 minutes inactivity. | Sensitive action without MFA rejected with MFA required prompt. | BR-011; BR-012; BR-017; BR-022; ROLE-002; ROLE-004; UC-007; BP-008 |
| SEC-A11Y | Accessibility baseline (WCAG 2.2 AA) | All candidate-facing and internal HR screens meet WCAG 2.2 Level AA. | WCAG 2.2 AA: 1.4.3 Contrast (4.5:1 text, 3:1 UI); 2.1.1 Keyboard; 2.4.7 Focus visible (2px outline min); 2.4.11 Focus not obscured; 2.5.3 Label in name; 4.1.2 Name/role/value. Candidate-facing: ARIA live regions (polite for queues, assertive for timer); focus management on question transitions; 44x44px min touch target; prefers-reduced-motion respected; table semantics (th/caption/scope); progress bars role=progressbar with aria-valuenow/min/max; field errors via aria-describedby; health charts tabular fallback; skip navigation link on all pages. | Automated WCAG 2.2 scan passes; manual keyboard/screen reader testing passes for key workflows. | UC-005; BP-004; SCREEN-001; SCREEN-003; SCREEN-005; SCREEN-006; SCREEN-008 |

## 8. Non-Functional Detail\n\n| ID | Category | Target | Measurement | Verification Method | Source IDs |\n| --- | --- | --- | --- | --- | --- |\n| NFD-001 | performance | Single CV screening completes under 30 seconds where AI provider is available. | Measure p95 screening duration by candidate. | Performance test and production monitoring | REQ-NF-001; BP-002; BP-008 |\n| NFD-002 | performance | Non-AI API responses meet p95 <2s. | Measure API p95 by route excluding AI calls. | Load test/API telemetry | REQ-NF-004; BP-008 |\n| NFD-003 | scalability | Support >200 jobs/month and ~10,000 CV/month planning volume. | Monthly throughput and queue capacity metrics. | Capacity test and monitoring | REQ-NF-002; REQ-NF-003; BP-001; BP-008 |\n| NFD-004 | concurrency | Support 50+ concurrent internal users. | Concurrent authenticated session/API test. | Load test | REQ-NF-005; BP-008 |\n| NFD-005 | availability | Target 99% uptime for core internal workflow. Excludes planned maintenance windows and external Google Workspace outages beyond system control. Uptime measured excluding maintenance exclusion periods. | Monthly uptime. | Monitoring report | REQ-NF-009; BP-008 |\n| NFD-006 | observability | Track AI errors, API failures, queue stalls, and Google integration failures. | Dashboard/alert coverage. | Alert simulation tests | REQ-NF-010; REQ-NF-011; BP-008; BP-010; BR-015 |\n| NFD-007 | cost monitoring | Track LLM token usage/cost by module. | Cost per candidate/job/module. | Cost report validation | REQ-NF-012; BP-008; BR-015 |\n| NFD-008 | AI quality | Track reviewer agreement, precision@shortlist, false reject review, prompt/rubric drift. | AI governance metrics. | Evaluation dataset/review workflow | REQ-NF-AI-002; REQ-NF-AI-004; BP-002; BP-008; BR-020 |\n| NFD-009 | security | Candidate data encrypted at rest and in transit. | TLS and storage encryption verification. | Security review/config check | REQ-NF-005; BR-011; BR-023 |\n| NFD-010 | auditability | All decisions and state transitions are auditable. | Audit event completeness. | Workflow audit tests | REQ-NF-007; BR-012; BP-008 |\n\n## 9. Test Matrix

| Test ID | Type | Scenario | Steps | Expected Result | Source IDs |
| --- | --- | --- | --- | --- | --- |
| TEST-001 | e2e | Excel candidate import with valid and invalid rows | Upload .xlsx template with mixed rows; Submit import; Review result summary | Valid rows imported; invalid rows shown with row-level errors; audit event created. | UC-001; BP-001; |
| TEST-002 | integration | Google Drive file-created import event | Simulate Drive event for configured folder; Process supported file | Candidate/job import created or error assigned to remediation with safe message. | UC-002; BP-010; |
| TEST-003 | contract | Unsupported OCR file rejection | Submit scanned/image-only CV; Run extraction | File rejected or routed to manual review; no OCR assumed in MVP. | BR-004; |
| TEST-004 | integration | AI screening result schema | Run screening with valid CV/JD; Inspect response | Response includes score, summary, risk flags, missing skills, confidence, evidence, version fields. | BR-006; |
| TEST-005 | e2e | HR Manager approves screening | Open pending screening; Approve candidate | Candidate moves to SCREENED_IN/next workflow; approval audit event created. | UC-003; BR-001 |
| TEST-006 | e2e | Approval reminder does not auto-decide | Create pending approval older than reminder SLA; Trigger reminder job | Reminder sent; candidate remains pending approval until human action. | BR-002; BR-021 |
| TEST-007 | integration | Scheduling approval creates Calendar event | Generate valid slots; Approve slot; Create event | Google Calendar event created only after approval and confirmation email queued. | UC-004; BR-007; |
| TEST-008 | e2e | No valid schedule slots | Provide unavailable candidate/interviewer calendars; Request suggestions | No event created; alternative availability/manual fallback path shown. | BP-003; |
| TEST-009 | e2e | Candidate completes async interview | Open secure link; Answer fixed and follow-up questions; Submit | Transcript and evaluation generated; candidate advances according to state rules. | UC-005; |
| TEST-010 | e2e | Expired interview link | Open expired token | Candidate sees expired state; HR can reopen/withdraw/remediate. | UC-005; |
| TEST-011 | unit | MCQ deterministic grading | Grade known answer key/submission | Score exactly matches answer key. | BR-009; UC-006 |
| TEST-012 | integration | Essay/coding rubric-backed grading | Submit essay/coding test with rubric/test cases; Run grading | Scores, feedback, confidence, and rubric version are recorded. | BR-010; UC-006 |
| TEST-013 | e2e | Final HR decision | Open final review evidence package; Record pass/fail with reason when needed | Candidate reaches PASSED or FAILED; audit event created. | UC-007; BR-022 |
| TEST-014 | e2e | Candidate withdrawal closes pending actions | Withdraw candidate with pending approval; Confirm withdrawal | Candidate moves to WITHDRAWN and pending actions close/cancel. | UC-009; BP-009 |
| TEST-015 | e2e | Error remediation returns to previous state | Create ERROR with prior state; Assign owner; Retry successfully | Candidate returns to previous valid state; error audit trail complete. | UC-010; BP-010 |
| TEST-016 | security | Unauthorized user cannot approve | Login as HR Recruiter; Attempt HR Manager approval API | Request denied; no state change. | BR-011; BR-001; |
| TEST-017 | accessibility | Core screens keyboard navigation | Navigate dashboard, approvals, candidate interview with keyboard only | All actionable controls reachable and operable with visible focus; skip navigation, ARIA live regions, field error association, progressbar semantics, and keyboard bulk selection pass checks. | SCREEN-001; SCREEN-003; SCREEN-005; SCREEN-006; SCREEN-008; SEC-A11Y; UC-005; BR-011 |
| TEST-018 | performance | CV screening latency target | Run representative screening batch; Measure p95/single request latency | Single screening target under 30s where provider available; failures observable. | NFD-001; BP-002; BP-008 |
| TEST-019 | observability | AI/API failure alerting | Inject AI and Google API failures; Observe monitoring outputs | Failures tracked and remediation items created/alerted. | BP-008; BP-010; |
| TEST-020 | contract | Safe error messages | Trigger integration failure with sensitive internal details; Inspect UI/API message | User message is safe and tokens/private details are not exposed. | SEC-007; BP-010; BR-011 |

## 10. Edge Cases

| ID | Edge Case | Expected Behavior | Source IDs |
| --- | --- | --- | --- |
| EDGE-001 | Excel import contains valid rows plus invalid rows | Valid rows can proceed; invalid rows reported and assigned for correction without blocking whole batch unless policy requires. | BP-001; UC-001 |
| EDGE-002 | Duplicate candidate detected across jobs | HR reviews duplicate and chooses merge/skip/create-new. | BR-003 |
| EDGE-003 | Low AI confidence in screening | Candidate routes to manual review and cannot silently advance. | BR-005 |
| EDGE-004 | No interview slot satisfies timezone/working-hour policy | No event created; HR requests alternatives or manual scheduling fallback. | BP-003; BR-008 |
| EDGE-005 | Candidate interview link expires or submission incomplete | HR may reopen, manual review, withdraw, or route ERROR according to policy. | BP-004; UC-005 |
| EDGE-006 | Coding sandbox/runtime not defined | Coding grading implementation blocked until BQ-004 is resolved. | BQ-004; UC-006 |
| EDGE-007 | Final evidence package incomplete or conflicting | Final decision is deferred/manual reviewed with reason; no automatic pass/fail. | BP-006; BR-022 |
| EDGE-008 | Candidate withdraws after scheduled interview | Close pending actions, notify stakeholders, move to WITHDRAWN, and require manual HR Calendar cleanup until Q4-007 is resolved. | BP-009; UC-009; BR-024; BQ-007 |
| EDGE-009 | Repeated integration retry failure | Assign/remediate/escalate and keep ERROR owner/reason visible. | BP-010; UC-010 |
| EDGE-010 | Post-approval reschedule/cancel requested | Implementation remains blocked by BQ-007; do not assume automated Calendar update behavior. | BR-024; BQ-007 |

## 11. Traceability Summary\n\n| Detail ID | Upstream Business IDs | Requirement IDs | Raw IDs |\n| --- | --- | --- | --- |\n| SCREEN-001 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-008; BP-010; BR-001; BR-015; BR-020 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-054; REQ-F-055; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| SCREEN-002 | BP-001; BP-010; BR-003; BR-004; UC-001; UC-002 | REQ-C-002; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| SCREEN-003 | BP-002; BR-001; BR-002; BR-005; BR-006; UC-003 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-023; REQ-F-051; REQ-F-052; REQ-F-053; REQ-F-054; REQ-NF-AI-005 | |\n| SCREEN-004 | BP-003; BR-001; BR-007; BR-008; BR-024; UC-004 | REQ-F-017; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-051; REQ-F-054; REQ-I-002; REQ-I-003 | |\n| SCREEN-005 | BP-004; BP-009; BP-010; UC-005 | REQ-D-007; REQ-F-018; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| SCREEN-006 | BP-005; BR-009; BR-010; BR-012; UC-006 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-NF-007 | |\n| SCREEN-007 | BP-006; BP-009; BR-001; BR-012; BR-022; UC-007; UC-009 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-017; REQ-F-023; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-054; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| SCREEN-008 | BP-008; BP-010; BR-002; BR-015; BR-017; BR-020; BR-021; BR-023; BQ-002; BQ-003; BQ-005 | REQ-C-003; REQ-D-001; REQ-D-002; REQ-D-005; REQ-D-006; REQ-F-018; REQ-F-053; REQ-F-054; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-005; REQ-NF-007; REQ-NF-008; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| API-001 | BP-001; BP-010; BR-003; BR-004; BR-011; UC-001; UC-002 | REQ-C-002; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-006; REQ-NF-007; REQ-NF-008; REQ-NF-010 | |\n| API-002 | BP-002; BR-004; BR-005 | REQ-C-002; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-AI-005 | |\n| API-003 | BP-002; BR-005; BR-006; UC-003 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-F-052; REQ-F-054; REQ-NF-AI-005 | |\n| API-004 | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-017; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-045; REQ-F-050; REQ-F-051; REQ-F-052; REQ-F-053; REQ-F-054; REQ-F-055; REQ-NF-007 | |\n| API-005 | BP-003; BR-007; BR-008; BR-017; BR-024; UC-004 | REQ-C-003; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003; REQ-I-004 | |\n| API-006 | BP-007; BR-014; BR-017; UC-008 | REQ-C-003; REQ-F-026; REQ-F-060; REQ-F-061; REQ-F-062; REQ-I-003; REQ-I-004 | |\n| API-007 | BP-004; UC-005 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| API-008 | BP-005; BR-009; BR-010; UC-006; BQ-004 | REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| API-009 | BP-009; UC-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| API-010 | BP-010; UC-010; BR-012 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| DATA-001 | BP-001; BP-009; BR-011; BR-019 | REQ-D-001; REQ-D-002; REQ-D-003; REQ-D-004; REQ-D-005; REQ-D-006; REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-055; REQ-F-056; REQ-I-001; REQ-NF-006; REQ-NF-007; REQ-NF-008 | |\n| DATA-002 | BP-001; BP-002; BR-019 | REQ-D-001; REQ-D-002; REQ-D-003; REQ-D-004; REQ-D-005; REQ-D-006; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-I-001 | |\n| DATA-003 | BR-004; BR-005; BP-002 | REQ-C-002; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-AI-005 | |\n| DATA-004 | BP-002; BR-005; BR-006; UC-003 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-F-052; REQ-F-054; REQ-NF-AI-005 | |\n| DATA-005 | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-017; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-045; REQ-F-050; REQ-F-051; REQ-F-052; REQ-F-053; REQ-F-054; REQ-F-055; REQ-NF-007 | |\n| DATA-006 | BP-003; BR-007; BR-008; BR-024; UC-004 | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003 | |\n| DATA-007 | BP-004; UC-005 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| DATA-008 | BP-005; BR-009; BR-010; UC-006; BQ-004 | REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| DATA-009 | BR-012; BAC-002; BAC-004 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-007 | |\n| DATA-010 | BP-008; BP-010; BR-015; BR-017; BR-020 | REQ-C-003; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| STATE-005 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-006 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-007 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-008 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-009 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-010 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-011 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-012 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-013 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-014 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-015 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-016 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-017 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| STATE-018 | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| VAL-001 | BP-001; UC-001 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001 | |\n| VAL-002 | BR-004; UC-001 | REQ-C-002; REQ-F-001; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-018 | |\n| VAL-003 | BR-003 | REQ-F-006 | |\n| VAL-004 | BR-006; UC-003 | REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-017; REQ-F-052; REQ-F-054 | |\n| VAL-005 | BR-005 | REQ-F-018; REQ-NF-AI-005 | |\n| VAL-006 | BR-001; BR-021 | REQ-F-017; REQ-F-023; REQ-F-051; REQ-F-053; REQ-F-054 | |\n| VAL-007 | BR-002; BR-021 | REQ-F-053; REQ-F-054 | |\n| VAL-008 | BR-007; BR-008 | REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027 | |\n| VAL-009 | BR-014 | REQ-F-026; REQ-F-060; REQ-F-061; REQ-F-062 | |\n| VAL-010 | BR-009 | REQ-F-042 | |\n| VAL-011 | BR-010 | REQ-F-043; REQ-F-044; REQ-F-045 | |\n| VAL-012 | BR-022; UC-007 | REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-055; REQ-NF-007 | |\n| VAL-013 | BP-009; UC-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| VAL-014 | BP-010; UC-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| VAL-015 | BR-012 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-007 | |\n| SEC-001 | BR-011 | REQ-NF-006; REQ-NF-008 | |\n| SEC-002 | BR-011; ROLE-001; ROLE-002; ROLE-003; ROLE-004 | REQ-NF-006; REQ-NF-008 | |\n| SEC-003 | BR-011; BR-023; BAC-004 | REQ-D-001; REQ-D-002; REQ-D-005; REQ-D-006; REQ-NF-005; REQ-NF-006; REQ-NF-008 | |\n| SEC-004 | BR-012 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-007 | |\n| SEC-005 | BR-017 | REQ-C-003; REQ-I-004 | |\n| | BR-004; BR-011 | REQ-C-002; REQ-F-010; REQ-F-018 | |\n| SEC-007 | BP-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | UC-005; | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| NFD-001 | BP-002; BP-008 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| NFD-002 | BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| NFD-003 | BP-001; BP-008 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| NFD-004 | BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-005; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| NFD-005 | BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| NFD-006 | BP-008; BP-010; BR-015 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| NFD-007 | BP-008; BR-015 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| NFD-008 | BP-002; BP-008; BR-020 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| NFD-009 | BR-011; BR-023 | REQ-D-001; REQ-D-002; REQ-D-005; REQ-D-006; REQ-NF-005; REQ-NF-006; REQ-NF-008 | |\n| NFD-010 | BR-012; BP-008 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| TEST-001 | UC-001; BP-001; | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001 | |\n| TEST-002 | UC-002; BP-010; | REQ-F-003; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| TEST-003 | BR-004; | REQ-C-002; REQ-F-010; REQ-F-018 | |\n| TEST-004 | BR-006; | REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015 | |\n| TEST-005 | UC-003; BR-001 | REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-017; REQ-F-023; REQ-F-051; REQ-F-052; REQ-F-054 | |\n| TEST-006 | BR-002; BR-021 | REQ-F-053; REQ-F-054 | |\n| TEST-007 | UC-004; BR-007; | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025 | |\n| TEST-008 | BP-003; | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003 | |\n| TEST-009 | UC-005; | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| TEST-010 | UC-005; | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| TEST-011 | BR-009; UC-006 | REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| TEST-012 | BR-010; UC-006 | REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| TEST-013 | UC-007; BR-022 | REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-055; REQ-NF-007 | |\n| TEST-014 | UC-009; BP-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| TEST-015 | UC-010; BP-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| TEST-016 | BR-011; BR-001; | REQ-F-017; REQ-F-023; REQ-F-051; REQ-F-054; REQ-NF-006; REQ-NF-008 | |\n| TEST-017 | SCREEN-001; SCREEN-003; SCREEN-005; SCREEN-006; SCREEN-008; SEC-A11Y; UC-005; BR-011 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-NF-006; REQ-NF-008 | |\n| TEST-018 | NFD-001; BP-002; BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| TEST-019 | BP-008; BP-010; | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| TEST-020 | SEC-007; BP-010; BR-011 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| EDGE-001 | BP-001; UC-001 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001 | |\n| EDGE-002 | BR-003 | REQ-F-006 | |\n| EDGE-003 | BR-005 | REQ-F-018; REQ-NF-AI-005 | |\n| EDGE-004 | BP-003; BR-008 | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003 | |\n| EDGE-005 | BP-004; UC-005 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| EDGE-006 | BQ-004; UC-006 | REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| EDGE-007 | BP-006; BR-022 | REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-055; REQ-NF-007 | |\n| EDGE-008 | BP-009; UC-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| EDGE-009 | BP-010; UC-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| EDGE-010 | BR-024; BQ-007 | REQ-F-023; REQ-F-024; REQ-F-025; REQ-I-002 | |\n\n
## 11A. Phase 2 Utility AI Module Detail Addendum

Scope constraints: standalone Phase 2 prototype utility modules, not MVP core pipeline; mock design generation uses prototype mock image output only; original CV/interview records remain source of truth; HR approval is required before external use; no OCR is included unless explicitly scoped later; content publishing supports manual copy, file export, and channel integration fallback.

### Phase 2 Screens

| ID | Screen | Purpose | Primary Action | Key Behaviors | Source IDs | Requirement IDs |
| --- | --- | --- | --- | --- | --- | --- |
| SCREEN-009 | Content Generation Workspace | Template selection, AI generation, HR review/approval, publish/export. | Select template and generate recruitment content draft. | Shows AI-generated flag; requires HR approval before external use; supports manual copy, file export, and channel integration fallback. | BP-011; BP-016; BR-025; BR-026; UC-011 | REQ-F-070; REQ-F-071; REQ-F-072; REQ-F-073; REQ-F-074; REQ-F-075; REQ-D-010; REQ-I-005; REQ-C-007; REQ-C-012; REQ-C-013 |
| SCREEN-010 | Design Generation Workspace | Design brief input, mock generation, HR review/approval, export. | Submit design brief and generate mock image prototype. | Brief must be non-empty; mockImageUrl is prototype output; approval required before export. | BP-012; BP-016; BR-027; BR-028; UC-012 | REQ-F-080; REQ-F-081; REQ-F-082; REQ-F-083; REQ-D-011; REQ-I-006; REQ-C-008; REQ-C-012 |
| SCREEN-011 | CV Evidence Viewer | Structured CV detail display, section navigation, original CV reference. | Navigate structured CV evidence and open original CV. | Missing sections visible; original CV remains source of truth; access same as CV access. | BP-013; BR-029; UC-013 | REQ-F-110; REQ-F-111; REQ-F-112; REQ-D-012; REQ-C-009; REQ-C-010 |
| SCREEN-012 | CV Translation Workspace | Language selection, translation display, original CV side-by-side, approval. | Generate CV translation draft for vi/en/ja. | Translation references original cvId; side-by-side review; HR approval before external use. | BP-014; BP-016; BR-030; BR-031; UC-014 | REQ-F-090; REQ-F-091; REQ-F-092; REQ-F-093; REQ-F-094; REQ-F-095; REQ-D-013; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |
| SCREEN-013 | Interview Translation Workspace | Notes/transcript input, language selection, translation display, approval. | Translate interview notes/transcript to vi/en/ja. | Translation references original interviewId; HR approval before external use. | BP-015; BP-016; BR-032; BR-033; UC-015 | REQ-F-100; REQ-F-101; REQ-F-102; REQ-D-014; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |

### Phase 2 Data Entities

| ID | Entity | Required Fields | Validation / Behavior | Source IDs | Requirement IDs |
| --- | --- | --- | --- | --- | --- |
| DATA-011 | GeneratedContent | id, type, template, prompt, content, status, approver, timestamp, isAiGenerated | Template valid; status in pending/approved/rejected; AI flag required; external use requires approved status. | BP-011; BP-016; BR-025; BR-026; UC-011 | REQ-F-070; REQ-F-071; REQ-F-072; REQ-F-073; REQ-F-074; REQ-F-075; REQ-D-010; REQ-I-005; REQ-C-007; REQ-C-012; REQ-C-013 |
| DATA-012 | GeneratedDesign | id, brief, mockImageUrl, status, approver, timestamp, isAiGenerated | Brief non-empty; prototype mock image only; AI flag required; approval required before export. | BP-012; BP-016; BR-027; BR-028; UC-012 | REQ-F-080; REQ-F-081; REQ-F-082; REQ-F-083; REQ-D-011; REQ-I-006; REQ-C-008; REQ-C-012 |
| DATA-013 | CVEvidence | id, candidateId, cvId, structuredData, extractedSections | CV must exist; evidence references original cvId; incomplete extraction visible and does not replace original CV. | BP-013; BR-029; UC-013 | REQ-F-110; REQ-F-111; REQ-F-112; REQ-D-012; REQ-C-009; REQ-C-010 |
| DATA-014 | CVTranslation | id, cvId, sourceLang, targetLang, translatedText, status, approver, isAiGenerated | Target language in vi/en/ja; references original cvId; approval required before external use. | BP-014; BP-016; BR-030; BR-031; UC-014 | REQ-F-090; REQ-F-091; REQ-F-092; REQ-F-093; REQ-F-094; REQ-F-095; REQ-D-013; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |
| DATA-015 | InterviewTranslation | id, interviewId, sourceLang, targetLang, translatedText, status, approver, isAiGenerated | Target language in vi/en/ja; references original interviewId; approval required before external use. | BP-015; BP-016; BR-032; BR-033; UC-015 | REQ-F-100; REQ-F-101; REQ-F-102; REQ-D-014; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |

### Phase 2 API Contracts

| ID | Method | Path | Request | Response | Source IDs | Requirement IDs |
| --- | --- | --- | --- | --- | --- | --- |
| API-011 | POST | /api/content/generate | template, prompt | contentId, content draft, status=pending, isAiGenerated=true | BP-011; BR-025; BR-026; UC-011 | REQ-F-070..075; REQ-D-010; REQ-I-005; REQ-C-007; REQ-C-012; REQ-C-013 |
| API-012 | POST | /api/content/approve | contentId, approval | contentId, status, published content when approved | BP-016; BR-026; UC-011 | REQ-F-070..075; REQ-D-010; REQ-I-005; REQ-C-012 |
| API-013 | POST | /api/design/generate | brief | designId, mockImageUrl, status=pending, isAiGenerated=true | BP-012; BR-027; BR-028; UC-012 | REQ-F-080..083; REQ-D-011; REQ-I-006; REQ-C-008; REQ-C-012 |
| API-014 | POST | /api/design/approve | designId, approval | designId, status, approvedDesign when approved | BP-016; BR-028; UC-012 | REQ-F-080..083; REQ-D-011; REQ-I-006; REQ-C-012 |
| API-015 | GET | /api/cv/{cvId}/evidence | cvId | cvId, structuredData, extractedSections, originalCvUrl | BP-013; BR-029; UC-013 | REQ-F-110..112; REQ-D-012; REQ-C-009; REQ-C-010 |
| API-016 | POST | /api/cv/translate | cvId, targetLang | translationId, translatedText, status=pending, isAiGenerated=true | BP-014; BR-030; BR-031; UC-014 | REQ-F-090..095; REQ-D-013; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |
| API-017 | POST | /api/cv/translation/approve | translationId, approval | translationId, status | BP-016; BR-031; UC-014 | REQ-F-090..095; REQ-D-013; REQ-I-007; REQ-C-012 |
| API-018 | POST | /api/interview/translate | interviewId, targetLang | translationId, translatedText, status=pending, isAiGenerated=true | BP-015; BR-032; BR-033; UC-015 | REQ-F-100..102; REQ-D-014; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |
| API-019 | POST | /api/interview/translation/approve | translationId, approval | translationId, status | BP-016; BR-033; UC-015 | REQ-F-100..102; REQ-D-014; REQ-I-007; REQ-C-012 |

### Phase 2 Validation, Security, Edge, and Test Details

| ID | Type | Detail | Expected Behavior | Source IDs | Requirement IDs |
| --- | --- | --- | --- | --- | --- |
| VAL-016 | validation | Content template must be valid. | Invalid template rejects generation. | BP-011; BR-025; UC-011 | REQ-F-070..075; REQ-C-007 |
| VAL-017 | validation | Design brief must not be empty. | Empty brief rejects mock generation. | BP-012; BR-027; UC-012 | REQ-F-080..083; REQ-C-008 |
| VAL-018 | validation | CV must exist before translation. | Missing cvId returns 404 and no translation is created. | BP-014; BR-030; UC-014 | REQ-F-090..095; REQ-D-013 |
| VAL-019 | validation | Interview record must exist before translation. | Missing interviewId returns 404 and no translation is created. | BP-015; BR-032; UC-015 | REQ-F-100..102; REQ-D-014 |
| VAL-020 | validation | Target language must be one of vi, en, ja. | Unsupported language returns validation error. | BP-014; BP-015; BR-030; BR-032; UC-014; UC-015 | REQ-F-090..095; REQ-F-100..102; REQ-C-011 |
| VAL-021 | validation | Approval status must be pending, approved, or rejected. | Invalid status is rejected and not persisted. | BP-016 | REQ-C-012 |
| VAL-022 | validation | Generated artifacts must have AI-generated flag. | Content/design/translations persist and display isAiGenerated=true. | BP-011; BP-012; BP-014; BP-015 | REQ-C-012 |
| VAL-023 | validation | Translations must reference original document ID. | CVTranslation references cvId; InterviewTranslation references interviewId. | BP-013; BP-014; BP-015 | REQ-C-009; REQ-C-010 |
| SEC-020 | security | Generated content/design approval authorization. | HR role required; unauthorized approval returns 403. | BP-016; BR-026; BR-028 | REQ-C-012 |
| SEC-021 | security | Translation approval authorization. | HR role required; unauthorized approval returns 403. | BP-016; BR-031; BR-033 | REQ-C-012 |
| SEC-022 | security | CV evidence viewer access control. | Access control same as CV access. | BP-013; BR-029; UC-013 | REQ-F-110..112; REQ-C-009 |
| SEC-023 | security | AI-generated status visibility. | Generated artifacts are visibly marked in UI/API. | BP-011; BP-012; BP-014; BP-015 | REQ-C-012 |
| SEC-024 | security | Original document reference integrity. | Evidence/translations link to original records and never overwrite them. | BP-013; BP-014; BP-015 | REQ-C-009; REQ-C-010 |
| EDGE-011 | edge | Content generation fails. | Timeout/invalid template shows safe error and no approved content. | BP-011; UC-011 | REQ-F-070..075 |
| EDGE-012 | edge | Design generation fails. | Mock service unavailable shows retry path and no exportable design. | BP-012; UC-012 | REQ-F-080..083 |
| EDGE-013 | edge | CV evidence extraction incomplete. | Missing sections are visible; original CV fallback remains available. | BP-013; UC-013 | REQ-F-110..112 |
| EDGE-014 | edge | Translation fails. | Unsupported language/LLM error shows safe retry and preserves source record. | BP-014; BP-015; UC-014; UC-015 | REQ-F-090..095; REQ-F-100..102 |
| EDGE-015 | edge | Approval workflow interrupted. | Artifact stays pending/rejected and never auto-approves. | BP-016 | REQ-C-012 |
| EDGE-016 | edge | Channel integration unavailable. | Export fallback via manual copy or file export is available and audited. | BP-011; BP-012 | REQ-I-005; REQ-I-006; REQ-C-013 |
| TEST-021 | test | Content generation workflow. | Template â†’ generate â†’ approve â†’ publish/export succeeds with audit and AI flag. | BP-011; BP-016; UC-011 | REQ-F-070..075 |
| TEST-022 | test | Design generation workflow. | Brief â†’ generate â†’ approve â†’ export succeeds with mock image and AI flag. | BP-012; BP-016; UC-012 | REQ-F-080..083 |
| TEST-023 | test | CV evidence viewer. | Structured data displays, sections navigate, and original CV reference opens. | BP-013; UC-013 | REQ-F-110..112 |
| TEST-024 | test | CV translation workflow. | Language selection â†’ translate â†’ side-by-side review â†’ approve succeeds. | BP-014; BP-016; UC-014 | REQ-F-090..095 |
| TEST-025 | test | Interview translation workflow. | Input/select notes â†’ translate â†’ approve succeeds. | BP-015; BP-016; UC-015 | REQ-F-100..102 |
| TEST-026 | test | Approval rejection flow. | Reject â†’ edit â†’ resubmit returns to pending and audits decisions. | BP-016; UC-011; UC-012; UC-014; UC-015 | REQ-C-012 |
| TEST-027 | test | Source of truth validation. | Screening decisions trace to original CV/interview records, not translations. | BP-013; BP-014; BP-015 | REQ-C-009; REQ-C-010 |

### Phase 2 Traceability Matrix Addendum

| Detail ID Range | Upstream Business IDs | Requirement IDs |
| --- | --- | --- |
| SCREEN-009; DATA-011; API-011; API-012; TEST-021; EDGE-011; VAL-016 | BP-011; BP-016; BR-025; BR-026; UC-011 | REQ-F-070..075; REQ-D-010; REQ-I-005; REQ-C-007; REQ-C-012; REQ-C-013 |
| SCREEN-010; DATA-012; API-013; API-014; TEST-022; EDGE-012; VAL-017 | BP-012; BP-016; BR-027; BR-028; UC-012 | REQ-F-080..083; REQ-D-011; REQ-I-006; REQ-C-008; REQ-C-012 |
| SCREEN-011; DATA-013; API-015; TEST-023; EDGE-013; SEC-022; SEC-024; VAL-023 | BP-013; BR-029; UC-013 | REQ-F-110..112; REQ-D-012; REQ-C-009; REQ-C-010 |
| SCREEN-012; DATA-014; API-016; API-017; TEST-024; EDGE-014; VAL-018; VAL-020; VAL-023 | BP-014; BP-016; BR-030; BR-031; UC-014 | REQ-F-090..095; REQ-D-013; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |
| SCREEN-013; DATA-015; API-018; API-019; TEST-025; EDGE-014; VAL-019; VAL-020; VAL-023 | BP-015; BP-016; BR-032; BR-033; UC-015 | REQ-F-100..102; REQ-D-014; REQ-I-007; REQ-C-009; REQ-C-010; REQ-C-011; REQ-C-012 |
| TEST-026; EDGE-015; VAL-021; SEC-020; SEC-021 | BP-016; BR-026; BR-028; BR-031; BR-033; UC-011; UC-012; UC-014; UC-015 | REQ-C-012 |
| EDGE-016 | BP-011; BP-012 | REQ-I-005; REQ-I-006; REQ-C-013 |

## 12. Validation Gate 4

| Check | Status | Notes |
| --- | --- | --- |
| UI/screen details defined where applicable | PASS | Internal HR/admin and candidate-facing screens defined. |
| API/interface details defined where applicable | PASS | File, REST/RPC, event, and Google/AI interfaces specified at contract level. |
| Data details defined where applicable | PASS | Schema-like data objects and field validations defined. |
| Validation, state, errors covered | PASS | Canonical state machine, validations, interface errors, edge cases covered. |
| Non-functional targets measurable | PASS | Performance, availability, observability, AI quality, cost, and audit targets included. |
| Security/privacy/accessibility included where relevant | PASS | RBAC, audit, privacy, secrets, input validation, accessibility covered. |
| Test cases map to requirements/use cases | PASS | 27 tests map to UC/BP/BR/detail items, including Phase 2 utility AI module workflows. |
| Traceability to business definition exists | PASS | Every detail item has BP/BR/UC/BQ/ROLE/BAC source IDs. |
| No contradiction with business rules | PASS | Unresolved policies are marked as blocking instead of assumed. |
| Blocking Gate 4 questions resolved | CONDITIONAL | Seven business policy/configuration questions remain open and block implementation sign-off for affected details. |

## 13. Open Questions

| ID | Question | Affected Detail IDs | Owner | Blocks Implementation? | Source IDs |
| --- | --- | --- | --- | --- | --- |
| Q4-001 | What exact AI confidence threshold requires manual review? | API-003; DATA-004; SCREEN-003; TEST-004 | HR Manager / AI Owner | yes | BQ-001 |
| Q4-002 | Who is backup approver and what escalation timing applies? | API-010; RETRY-005; RETRY-006 | HR Manager | yes | BQ-002 |
| Q4-003 | What retention/deletion policy applies to CVs, transcripts, test submissions, audit logs, and integration logs? | DATA-001; DATA-003; DATA-007; DATA-008; DATA-009; SEC-018 | HR Manager / IT Admin / Legal | yes | BQ-003 |
| Q4-004 | What coding sandbox/runtime is approved for coding challenge grading? | API-008; DATA-008; TEST-012; EDGE-006 | IT Admin | yes | BQ-004 |
| Q4-005 | What exact Drive folder, ownership, webhook renewal, and naming convention should be used for MVP? | API-001; DATA-010; SEC-012 | IT Admin | yes | BQ-005 |
| Q4-006 | What final combined pass/fail policy should be applied across screening, interview, and test evidence? | SCREEN-007; DATA-008; STATE-014; TEST-013 | HR Manager | yes | BQ-006 |
| Q4-007 | What is the Calendar reschedule/cancel policy after event creation? | API-005; API-009; EDGE-010 | HR Manager / IT Admin | yes | BQ-007 |

## 14. CV Intake and Job/JD Intake Detail

### SCREEN-JOB-001: Job/JD Intake

| Field | Value |
|---|---|
| Purpose | Create or import Job/JD from supported MVP sources and route parsed JD profiles for HR approval. |
| Primary User | HR Recruiter |
| Entry Point | Dashboard create job CTA or Job Source workspace |
| Primary Action | Create/import Job/JD from manual form, JD text, file upload, Drive, or Sheet/Excel |
| Secondary Actions | View original JD evidence; Run or retry JD parse; Open parsed JD review; Preview mock external connector status |
| Source IDs | BP-JOB-001; BP-JOB-002; BR-JOB-001; BR-JOB-004; UC-JOB-001; UC-JOB-004 |

### SCREEN-JOB-002: Parsed JD Review and Approval

| Field | Value |
|---|---|
| Purpose | Allow HR to review, edit, re-parse, reject, or approve ParsedJDProfile before matching. |
| Primary User | HR Manager |
| Entry Point | Job/JD Intake parse completion or pending approval queue |
| Primary Action | Approve ParsedJDProfile |
| Secondary Actions | Edit parsed fields; Request re-parse; Reject import; Save draft; View original JD evidence |
| Source IDs | BP-JOB-001; BR-JOB-001; BR-JOB-002; BR-JOB-003; UC-JOB-002; UC-JOB-003 |

### SCREEN-JOB-003: JD Version History

| Field | Value |
|---|---|
| Purpose | View JD versions, parsed criteria versions, and linked screening batches. |
| Primary User | HR Manager |
| Entry Point | Parsed JD review or job detail |
| Primary Action | Compare versions |
| Secondary Actions | View original JD evidence; View linked screening results; Set latest approved version |
| Source IDs | BR-JOB-003; BR-SCR-001; UC-JOB-003; UC-SCR-TRACE |

### DATA-CV-001: CandidateCV

| Field | Value |
|---|---|
| Business Meaning | Original CV PDF file and provenance for candidate source of truth. |
| Lifecycle | Created on CV import/upload; versioned; retained per policy. |
| Sensitivity | confidential |
| Retention | BLOCKED: BQ-003. |
| Source IDs | BP-CV-001; BR-CV-001; BR-CV-002; UC-CV-001 |

| Field | Type | Required | Notes |
|---|---|---|---|
| cvFileId | uuid | yes | CV file identifier |
| candidateId | uuid | yes | Owning candidate |
| originalFileName | string | yes | Original upload name |
| driveFileId | string | no | Google Drive file ID if imported |
| uploadedAt | datetime | yes | Upload timestamp |

### DATA-CV-002: CVVersion

| Field | Value |
|---|---|
| Business Meaning | Candidate CV version record. |
| Lifecycle | Created whenever a new CV PDF is imported for a candidate. |
| Sensitivity | confidential |
| Retention | BLOCKED: BQ-003. |
| Source IDs | BR-CV-003; UC-CV-002 |

| Field | Type | Required | Notes |
|---|---|---|---|
| cvVersionId | uuid | yes | CV version identifier |
| candidateId | uuid | yes | Owning candidate |
| cvFileId | uuid | yes | Associated CV file |
| versionNumber | integer | yes | Sequential version |
| createdAt | datetime | yes | Version creation time |

### DATA-CV-003: CVExtractionResult

| Field | Value |
|---|---|
| Business Meaning | LLM extraction result from text-native PDF CV. |
| Lifecycle | Created after extraction, linked to CVVersion. |
| Sensitivity | confidential |
| Retention | BLOCKED: BQ-003. |
| Source IDs | BP-CV-001; BR-CV-001; RISK-013 |

| Field | Type | Required | Notes |
|---|---|---|---|
| extractionId | uuid | yes | Extraction identifier |
| cvVersionId | uuid | yes | Source CV version |
| extractedProfile | object | yes | Structured candidate profile |
| confidence | number | yes | Extraction confidence 0-1 |
| extractedAt | datetime | yes | Extraction timestamp |

### DATA-JOB-001: Job

| Field | Value |
|---|---|
| Business Meaning | Recruitment opening independent from candidate source. |
| Lifecycle | Created/imported, receives JD versions, referenced by CandidateApplication. |
| Sensitivity | internal |
| Retention | BLOCKED: BQ-003 if confidential. |
| Source IDs | BP-JOB-001; UC-JOB-001 |

| Field | Type | Required | Notes |
|---|---|---|---|
| jobId | uuid | yes | Job identifier |
| title | string | yes | Job title |
| department | string | no | Department |
| status | enum | yes | open/closed/paused |
| createdAt | datetime | yes | Creation time |

### DATA-JOB-002: OriginalJDDocument

| Field | Value |
|---|---|
| Business Meaning | Original JD text/file/import evidence. |
| Lifecycle | Created on JD source submission; retained as evidence/reference. |
| Sensitivity | internal |
| Retention | BLOCKED: BQ-003. |
| Source IDs | BR-JOB-001; UC-JOB-001 |

| Field | Type | Required | Notes |
|---|---|---|---|
| jdDocumentId | uuid | yes | JD evidence ID |
| jobId | uuid | yes | Owning job |
| sourceType | enum | yes | text/pdf/docx/drive/sheet |
| content | text | yes | Original JD content or file ref |
| uploadedAt | datetime | yes | Submission time |

### DATA-JOB-003: JDVersion

| Field | Value |
|---|---|
| Business Meaning | Versioned JD profile approval record. |
| Lifecycle | Created for JD document update or approval cycle. |
| Sensitivity | internal |
| Retention | BLOCKED: BQ-003. |
| Source IDs | BR-JOB-002; BR-JOB-003; UC-JOB-003 |

| Field | Type | Required | Notes |
|---|---|---|---|
| jdVersionId | uuid | yes | JD version ID |
| jobId | uuid | yes | Owning job |
| versionNumber | integer | yes | Sequential version |
| status | enum | yes | draft/pending/approved/rejected |
| approvedAt | datetime | no | Approval timestamp |

### DATA-JOB-004: ParsedJDProfile

| Field | Value |
|---|---|
| Business Meaning | HR-reviewed parsed JD criteria used as matching source of truth. |
| Lifecycle | Created by LLM parse, edited/re-parsed, approved by HR. |
| Sensitivity | internal |
| Retention | BLOCKED: BQ-003. |
| Source IDs | BR-JOB-001; BR-JOB-002; BR-JOB-003; UC-JOB-002 |

| Field | Type | Required | Notes |
|---|---|---|---|
| parsedProfileId | uuid | yes | Parsed profile ID |
| jdVersionId | uuid | yes | Source JD version |
| parsedCriteriaVersion | integer | yes | Criteria version number |
| skills | array | yes | Required/preferred skills |
| status | enum | yes | draft/pending/approved/rejected |

### DATA-APP-001: CandidateApplication

| Field | Value |
|---|---|
| Business Meaning | Canonical candidate-job relationship for application and screening traceability. |
| Lifecycle | Created when candidate is applied/matched to job; links CV/JD versions for screening. |
| Sensitivity | internal |
| Retention | BLOCKED: BQ-003. |
| Source IDs | BP-001; BR-SCR-001; UC-SCR-TRACE |

| Field | Type | Required | Notes |
|---|---|---|---|
| applicationId | uuid | yes | Application ID |
| candidateId | uuid | yes | Candidate reference |
| jobId | uuid | yes | Job reference |
| cvVersionId | uuid | yes | CV version used |
| jdVersionId | uuid | yes | JD version used |
| parsedCriteriaVersion | integer | yes | Criteria version used |

### API-JOB-001: Job/JD Intake Interface

| Field | Value |
|---|---|
| Interface Type | REST/File |
| Method / Event | POST |
| Path / Topic / Command | /imports/jobs |
| Purpose | Create/import Job/JD separately from Candidate/CV Intake. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source IDs | BP-JOB-001; UC-JOB-001 |

### API-JOB-002: JD Parse and Approval Interface

| Field | Value |
|---|---|
| Interface Type | RPC/REST |
| Method / Event | parse_jd / approve_parsed_jd |
| Path / Topic / Command | jd.parse / /jobs/{jobId}/parsed-jd/approve |
| Purpose | Parse JD into ParsedJDProfile and approve it before matching. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source IDs | BR-JOB-001; BR-JOB-002; BR-JOB-003; UC-JOB-002; UC-JOB-003 |

### API-JOB-003: External Job Source Connector Mock Interface

| Field | Value |
|---|---|
| Interface Type | REST |
| Method / Event | GET |
| Path / Topic / Command | /job-source-connectors/mock-status |
| Purpose | Return prototype-only mock status and requisition previews for external job sources. |
| Auth Required | yes |
| Permission Rule | BR-011 |
| Source IDs | BP-JOB-002; BR-JOB-004; UC-JOB-004 |

### VAL-CV-001: CV must be PDF and text-native

| Field | Value |
|---|---|
| Applies To | CandidateCV.fileType |
| Rule | Only text-native PDF CV files are accepted; OCR is out of scope. |
| Failure Message | Only text-native PDF CV files are accepted; OCR is out of scope. |
| Source IDs | BR-CV-002 |

### VAL-CV-002: Drive CV scan flags invalid items

| Field | Value |
|---|---|
| Applies To | Drive CV import |
| Rule | Drive CV scan must flag non-PDF files and nested folders. |
| Failure Message | Invalid Drive items must be reported to HR. |
| Source IDs | UC-CV-001 |

### VAL-CV-003: New CV version no auto re-screen

| Field | Value |
|---|---|
| Applies To | CVVersion |
| Rule | New CV version must not auto re-screen later-stage candidates. |
| Failure Message | HR must manually decide whether to re-screen. |
| Source IDs | BR-CV-003 |

### VAL-JOB-001: ParsedJDProfile approval required

| Field | Value |
|---|---|
| Applies To | ParsedJDProfile.status |
| Rule | ParsedJDProfile must be approved before screening. |
| Failure Message | Approve parsed JD profile before matching. |
| Source IDs | BR-JOB-002 |

### VAL-JOB-002: ParsedJDProfile minimum criteria

| Field | Value |
|---|---|
| Applies To | ParsedJDProfile |
| Rule | ParsedJDProfile must contain minimum criteria before approval. |
| Failure Message | Required skills, responsibilities, and language/seniority fields must be present before approval. |
| Source IDs | UC-JOB-002 |

### VAL-SCR-001: Screening trace fields required

| Field | Value |
|---|---|
| Applies To | ScreeningResult |
| Rule | Screening result must include CV and JD version references. |
| Failure Message | candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion are required. |
| Source IDs | BR-SCR-001 |

### TEST-JOB-001: JD text parse and HR approval

| Field | Value |
|---|---|
| Type | integration |
| Scenario | JD text input parses and requires HR approval |
| Steps | Submit JD text; Run parse; Attempt screening before approval; Approve parsed JD |
| Expected Result | Screening is blocked before approval and allowed after approval. |
| Source IDs | UC-JOB-002; API-JOB-002; VAL-JOB-001 |

### TEST-JOB-002: Drive JD and Sheet requisition import

| Field | Value |
|---|---|
| Type | integration |
| Scenario | Drive JD and Sheet requisition import create job drafts |
| Steps | Import JD from Drive; Import requisition from Sheet/Excel |
| Expected Result | Job/JD drafts and original evidence records are created with validation results. |
| Source IDs | UC-JOB-001; API-JOB-001 |

### TEST-JOB-003: JD version traceability

| Field | Value |
|---|---|
| Type | e2e |
| Scenario | JD version update preserves screening traceability |
| Steps | Approve JD v1; Run screening; Create JD v2; Run screening again |
| Expected Result | Each result stores correct jobId, jdVersionId, and parsedCriteriaVersion. |
| Source IDs | UC-JOB-003; UC-SCR-TRACE; VAL-SCR-001 |

### TEST-JOB-004: External connector mock marking

| Field | Value |
|---|---|
| Type | ui |
| Scenario | External connector mock is clearly marked |
| Steps | Open connector mock section; Inspect preview |
| Expected Result | Mock status and full requisition preview are visible and marked not real integration. |
| Source IDs | UC-JOB-004; API-JOB-003 |

### TEST-SCR-TRACE: Screening CV/JD trace fields

| Field | Value |
|---|---|
| Type | contract |
| Scenario | Screening request and response include all CV/JD trace fields |
| Steps | Call screening interface with version IDs; Validate response |
| Expected Result | candidateId, cvVersionId, jobId, jdVersionId, and parsedCriteriaVersion are present. |
| Source IDs | API-003; BR-SCR-001 |
