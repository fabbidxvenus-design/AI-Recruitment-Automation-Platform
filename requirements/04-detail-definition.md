# Detail Definition: RecruitAI — Hệ thống Recruitment AI Automation

Generated: 2026-05-12T00:00:00Z
Language: bilingual (vi/en)
Project type: data-ai / internal HR web tool
Upstream: `03-business-definition.md/json`

**Gate 4 Status: CONDITIONAL PASS** — detail contracts are implementation-ready where policy is known; seven blocking questions must be resolved before full build sign-off.

## 1. Detail Summary

| Field | Value |
| --- | --- |
| Implementation surface | Internal HR web/admin application; Candidate-facing async interview web link; Backend APIs/RPC services; Google Workspace integrations; AI evaluation interfaces; Operational monitoring and audit trail |
| Primary workflows covered | Candidate sourcing/import; CV screening approval; Interview scheduling approval; Async AI interview; Test grading; Final candidate decision; Notifications/reminders; Withdrawal; Error remediation; Monitoring/governance |
| Critical business rules implemented | BR-001; BR-002; BR-004; BR-005; BR-006; BR-007; BR-011; BR-012; BR-014; BR-015; BR-017; BR-020; BR-021; BR-022; BR-023; BR-024 |
| Major assumptions | System is an internal single-organization web application plus candidate interview link.; No external ATS/CRM or native mobile app in MVP.; OCR, final scoring policy, retention, backup approver, Drive folder policy, coding sandbox, and Calendar reschedule/cancel remain unresolved and are not assumed. |

## 2. Screen / UX Definitions

### : Recruitment Pipeline Dashboard

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
| | Pipeline state summary cards | card | yes | Counts candidates by canonical business state. | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006 |
| | Pending approvals queue | table | yes | Shows screening, scheduling, and final review actions requiring explicit HR Manager decision. | BR-001; UC-003; UC-004; UC-007 |
| | Error remediation queue | table | yes | Shows ERROR items with owner, reason, previous valid state, and retry/manual review actions. | BP-010; UC-010 |
| | KPI and monitoring panel | card | yes | Shows processing, scheduling, AI quality, integration failure, and cost indicators. | BP-008; BR-015; BR-020 |

### : Candidate Sourcing and Import

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
| | Manual candidate/job form | input | yes | Required fields must pass validation before creating NEW/IMPORTED record. | UC-001; BP-001 |
| | Excel upload control | input | yes | Accept .xlsx only; reject unsupported formats before import. | UC-001; BR-004 |
| | Duplicate review table | table | yes | Requires HR decision to merge, skip, or create new candidate. | BR-003 |
| | Drive import exception list | table | yes | Displays folder/file/import error and retry/assign actions. | UC-002; BP-010 |

### : Screening Review and Approval

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
| | Screening score panel | card | yes | Displays score 0-100, sub-scores, confidence, recommendation, and prompt/model/rubric version. | BR-006; UC-003 |
| | Evidence and explainability section | card | yes | Shows strengths, weaknesses, missing skills, risk flags, and evidence spans. | BR-006; BR-005 |
| | Screening approval actions | button | yes | Requires explicit HR Manager action; no timeout auto-action. | BR-001; BR-002; UC-003 |
| | Bulk screening approval controls | table | yes | Bulk action available only for selected candidates with complete review data. | UC-003; BR-001 |

### : Interview Scheduling Approval

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
| | Availability and free/busy summary | card | yes | Displays candidate availability and interviewer free/busy source status. | BP-003; UC-004 |
| | Suggested slot list | table | yes | Ranks earliest valid slots within working hours/timezone policy. | BR-008; UC-004 |
| | Schedule approval actions | button | yes | Creates calendar event only after explicit approval. | BR-001; BR-007 |
| | Reschedule/cancel placeholder notice | card | yes | Indicates post-creation policy is unresolved and must not assume automated behavior. | BR-024; BQ-007 |

### : Async AI Interview Workspace

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
| | Interview instruction panel | card | yes | Shows async text format, deadline, reminder behavior, and privacy notice. | BP-004; UC-005 |
| | Question and answer thread | input | yes | Shows fixed questions and AI follow-ups based on prior answers. | UC-005 |
| | Submit interview button | button | yes | Requires all required answers; creates transcript and evaluation trigger. | UC-005; BR-012 |
| | Expired/incomplete interview state | card | yes | Routes to reopen/manual review/withdraw/error according to business policy. | BP-004; BP-009; BP-010 |

### : Test Setup, Submission, and Grading Review

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
| | Test definition import | input | yes | Accept configured Excel/JSON test definition with answer key/rubric/test cases. | BP-005; UC-006 |
| | Candidate submission form | input | yes | Captures MCQ/essay/coding submission and deadline status. | UC-006 |
| | Grading report | card | yes | MCQ deterministic; essay/coding rubric-backed with score and feedback. | BR-009; BR-010; UC-006 |
| | Manual review/override action | button | yes | Requires HR Manager reason and audit record for override. | BR-012; UC-006 |

### : Final Review and Decision

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
| | Evidence package summary | card | yes | Aggregates screening, interview, and test reports. | BP-006; UC-007 |
| | Final decision actions | button | yes | Requires explicit HR Manager pass/fail decision; combined policy unresolved until BQ-006. | BR-001; BR-022; UC-007 |
| | Decision audit reason input | input | yes | Required for override/defer/exception decisions. | BR-012; UC-007 |
| | Withdrawal action | button | yes | Moves candidate to WITHDRAWN and closes pending actions. | BP-009; UC-009 |

### : Admin Configuration and Monitoring

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
| | Google Workspace configuration | input | yes | Captures OAuth status, Drive folder, Gmail mailbox/templates, Calendar access. | BR-017; BQ-005 |
| | Reminder and escalation policy settings | input | yes | Reminder-only behavior enforced; escalation cannot approve automatically. | BR-002; BR-021; BQ-002 |
| | Retention policy settings placeholder | input | yes | Blocks implementation sign-off until retention/deletion periods are defined. | BR-023; BQ-003 |
| | Monitoring dashboard | card | yes | Shows uptime, AI errors, API failures, token cost, queue stalls. | BP-008; BR-015; BR-020 |


## 3. API / Interface Definitions

### : Candidate and Job Import Interface

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

### : CV/JD Text Extraction Interface

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

### : AI Screening Evaluation Interface

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

### : Approval Decision Interface

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

### : Scheduling Suggestion and Calendar Interface

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

### : Notification and Gmail Interface

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

### : Async Interview Interface

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

### : Test Grading Interface

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

### : Withdrawal Interface

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

### : Error Remediation Interface

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

### : Candidate

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

### : Job and JD

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

### : Document File

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

### : Screening Result

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

### : Approval Decision

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

### : Interview Schedule

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

### : Async Interview Transcript and Evaluation

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

### : Test Definition and Submission

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

### : Audit Event

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

### : Integration Configuration and Health

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
| | Candidate Pipeline | NEW | Candidate creation started | Allowed next states: IMPORTED, WITHDRAWN | IMPORTED; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | IMPORTED | Valid candidate/job input imported | Allowed next states: SCREENING_RUNNING, ERROR, WITHDRAWN | SCREENING_RUNNING; ERROR; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | SCREENING_RUNNING | JD and CV available | Allowed next states: SCREENING_PENDING_APPROVAL, ERROR, WITHDRAWN | SCREENING_PENDING_APPROVAL; ERROR; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | SCREENING_PENDING_APPROVAL | Screening result generated | Allowed next states: SCREENED_IN, SCREENED_OUT, SCREENING_RUNNING, WITHDRAWN | SCREENED_IN; SCREENED_OUT; SCREENING_RUNNING; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | SCREENED_IN | HR Manager approves screening | Allowed next states: AVAILABILITY_PENDING, WITHDRAWN | AVAILABILITY_PENDING; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | SCREENED_OUT | HR Manager rejects screening | Terminal state | | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | AVAILABILITY_PENDING | Candidate screened in | Allowed next states: SCHEDULING_PENDING_APPROVAL, ERROR, WITHDRAWN | SCHEDULING_PENDING_APPROVAL; ERROR; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | SCHEDULING_PENDING_APPROVAL | Valid interview slots generated | Allowed next states: INTERVIEW_SCHEDULED, AVAILABILITY_PENDING, WITHDRAWN | INTERVIEW_SCHEDULED; AVAILABILITY_PENDING; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | INTERVIEW_SCHEDULED | HR Manager approves slot | Allowed next states: AI_INTERVIEW_PENDING, WITHDRAWN, ERROR | AI_INTERVIEW_PENDING; WITHDRAWN; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | AI_INTERVIEW_PENDING | Interview link sent | Allowed next states: AI_INTERVIEW_COMPLETED, WITHDRAWN, ERROR | AI_INTERVIEW_COMPLETED; WITHDRAWN; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | AI_INTERVIEW_COMPLETED | Candidate submits async interview | Allowed next states: TEST_PENDING, FINAL_REVIEW, ERROR | TEST_PENDING; FINAL_REVIEW; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | Note: If testRequired=false (per job config), candidate transitions directly to FINAL_REVIEW without entering TEST_PENDING or TEST_GRADED. TEST-011 and TEST-012 are conditional on testRequired=true. |
| | Candidate Pipeline | TEST_PENDING | Test assigned | Allowed next states: TEST_GRADED, WITHDRAWN, ERROR | TEST_GRADED; WITHDRAWN; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | TEST_GRADED | Test sections graded | Allowed next states: FINAL_REVIEW, ERROR | FINAL_REVIEW; ERROR | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | FINAL_REVIEW | Evidence package ready | Allowed next states: PASSED, FAILED, WITHDRAWN | PASSED; FAILED; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | PASSED | Final pass decision recorded | Terminal state | | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | FAILED | Final fail decision recorded | Terminal state | | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | WITHDRAWN | Candidate withdraws or HR marks withdrawn | Terminal state | | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 |
| | Candidate Pipeline | ERROR | Blocking technical or data issue | Allowed next states: previous_valid_state, WITHDRAWN | previous_valid_state; WITHDRAWN | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | Note: ERROR captures blocking technical or data issues at any pipeline stage. The `previousValidState` field (required in error remediation) must capture the exact state before error occurred, disambiguated from itself. ERROR state disambiguates from all other states via errorId and remediation record. |

## 6. Validation Rules

| Rule ID | Input / Object | Validation | Error Message | Source BR/UC IDs |
| --- | --- | --- | --- | --- |
| | Candidate/job import | Manual and Excel inputs require required candidate, job, and supported file fields before import. | Missing or invalid import data. | BP-001; UC-001 |
| | File upload | CV and JD files must be text-native PDF/DOCX; Excel import must be .xlsx; test import must be Excel/JSON. | Unsupported file format for MVP. | BR-004; UC-001 |
| | Duplicate candidate | Potential duplicate requires HR Recruiter merge/skip/create-new decision before pipeline proceeds. | Duplicate candidate requires review. | BR-003 |
| | Screening score | AI screening score must be numeric 0-100 with summary, flags, missing skills, confidence, and evidence spans. | Screening result is incomplete. | BR-006; UC-003 |
| | Low confidence | Low parse/AI confidence must route to manual review and cannot silently advance. | Manual review required due to low confidence. | BR-005 |
| | Approval decision | Screening, scheduling, and final decisions require authorized human actor and explicit action. | Human approval is required. | BR-001; BR-021 |
| | Approval timeout | Elapsed approval time may trigger reminders/escalation but cannot auto-approve/reject/skip. | Approval timeout cannot create a decision. | BR-002; BR-021 |
| | Calendar event creation | Calendar event creation requires approved slot, valid timezone, and valid participants. | Approved slot required before event creation. | BR-007; BR-008 |
| | Notification sending | Workflow emails must use shared HR mailbox and configured templates. | Configured HR mailbox/template required. | BR-014 |
| | MCQ grading | MCQ score must be computed against answer key deterministically. | MCQ answer key required. | BR-009 |
| | Essay/coding grading | Essay/coding grading requires rubric/test cases and records AI confidence/version. | Rubric/test cases required. | BR-010 |
| | Final decision | Final pass/fail must be explicit HR Manager decision; combined policy remains blocked by BQ-006. | Final HR decision required. | BR-022; UC-007 |
| | Withdrawal | Withdrawal closes pending actions and moves candidate to terminal WITHDRAWN. | Withdrawal must close pending actions. | BP-009; UC-009 |
| | Error remediation | ERROR state requires owner, reason, prior state, and resolution action. | Error remediation owner and reason required. | BP-010; UC-010 |
| | Audit trail | All approvals, state changes, AI evaluations, imports, notifications, and remediation actions create audit events. | Audit event required. | BR-012 |

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
| | authentication | All internal HR/Admin screens and APIs require authenticated user identity. | Enforce login/session validation before access. | Access unauthenticated request is rejected. | BR-011 |
| | authorization | Candidate data and decision actions are role-bound to HR Recruiter, HR Manager, Interviewer, and Admin/IT permissions. | Role checks on screens/API actions. | Unauthorized role cannot access/action candidate data. | BR-011; ROLE-001; ROLE-002; ROLE-003; ROLE-004 |
| | privacy | CVs, transcripts, test submissions, and evaluations are sensitive candidate data. | Encrypt in transit/at rest; restrict access; avoid unnecessary exposure. | Security review plus access-control tests. | BR-011; BR-023; BAC-004 |
| | audit | All business decisions and sensitive workflow actions require immutable audit event. | Write Audit Event for state/approval/import/AI/notification/error actions. | Audit coverage tests for each core workflow. | BR-012 |
| | external integration secrets | Google OAuth tokens and AI provider credentials must not be hardcoded. | Use environment variables or secret manager; validate presence at startup. | Secret scan and config validation. | BR-017 |
| | input validation | Uploaded files, forms, Drive events, and candidate answers are untrusted input. | Validate format, size, schema, and expected enum values. | Boundary validation tests. | BR-004; BR-011 |
| | error disclosure | Errors must not leak OAuth tokens, prompts, model internals, or private candidate data. | Map internal errors to safe user messages. | Error response tests. | BP-010 |
| | accessibility | Internal and candidate-facing screens must be keyboard accessible and not rely on color alone. | Semantic controls, focus states, labels, text alternatives. | Automated and manual accessibility checks. | UC-005; |
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

## 8. Non-Functional Detail\n\n| ID | Category | Target | Measurement | Verification Method | Source IDs |\n| --- | --- | --- | --- | --- | --- |\n| | performance | Single CV screening completes under 30 seconds where AI provider is available. | Measure p95 screening duration by candidate. | Performance test and production monitoring | REQ-NF-001; BP-002; BP-008 |\n| | performance | Non-AI API responses meet p95 <2s. | Measure API p95 by route excluding AI calls. | Load test/API telemetry | REQ-NF-004; BP-008 |\n| | scalability | Support >200 jobs/month and ~10,000 CV/month planning volume. | Monthly throughput and queue capacity metrics. | Capacity test and monitoring | REQ-NF-002; REQ-NF-003; BP-001; BP-008 |\n| | concurrency | Support 50+ concurrent internal users. | Concurrent authenticated session/API test. | Load test | REQ-NF-005; BP-008 |\n| | availability | Target 99% uptime for core internal workflow. Excludes planned maintenance windows and external Google Workspace outages beyond system control. Uptime measured excluding maintenance exclusion periods. | Monthly uptime. | Monitoring report | REQ-NF-009; BP-008 |\n| | observability | Track AI errors, API failures, queue stalls, and Google integration failures. | Dashboard/alert coverage. | Alert simulation tests | REQ-NF-010; REQ-NF-011; BP-008; BP-010; BR-015 |\n| | cost monitoring | Track LLM token usage/cost by module. | Cost per candidate/job/module. | Cost report validation | REQ-NF-012; BP-008; BR-015 |\n| | AI quality | Track reviewer agreement, precision@shortlist, false reject review, prompt/rubric drift. | AI governance metrics. | Evaluation dataset/review workflow | REQ-NF-AI-002; REQ-NF-AI-004; BP-002; BP-008; BR-020 |\n| | security | Candidate data encrypted at rest and in transit. | TLS and storage encryption verification. | Security review/config check | REQ-NF-005; BR-011; BR-023 |\n| | auditability | All decisions and state transitions are auditable. | Audit event completeness. | Workflow audit tests | REQ-NF-007; BR-012; BP-008 |\n\n## 9. Test Matrix

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
| | Excel import contains valid rows plus invalid rows | Valid rows can proceed; invalid rows reported and assigned for correction without blocking whole batch unless policy requires. | BP-001; UC-001 |
| | Duplicate candidate detected across jobs | HR reviews duplicate and chooses merge/skip/create-new. | BR-003 |
| | Low AI confidence in screening | Candidate routes to manual review and cannot silently advance. | BR-005 |
| | No interview slot satisfies timezone/working-hour policy | No event created; HR requests alternatives or manual scheduling fallback. | BP-003; BR-008 |
| | Candidate interview link expires or submission incomplete | HR may reopen, manual review, withdraw, or route ERROR according to policy. | BP-004; UC-005 |
| | Coding sandbox/runtime not defined | Coding grading implementation blocked until BQ-004 is resolved. | BQ-004; UC-006 |
| | Final evidence package incomplete or conflicting | Final decision is deferred/manual reviewed with reason; no automatic pass/fail. | BP-006; BR-022 |
| | Candidate withdraws after scheduled interview | Close pending actions, notify stakeholders, move to WITHDRAWN, and require manual HR Calendar cleanup until Q4-007 is resolved. | BP-009; UC-009; BR-024; BQ-007 |
| | Repeated integration retry failure | Assign/remediate/escalate and keep ERROR owner/reason visible. | BP-010; UC-010 |
| | Post-approval reschedule/cancel requested | Implementation remains blocked by BQ-007; do not assume automated Calendar update behavior. | BR-024; BQ-007 |

## 11. Traceability Summary\n\n| Detail ID | Upstream Business IDs | Requirement IDs | Raw IDs |\n| --- | --- | --- | --- |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-008; BP-010; BR-001; BR-015; BR-020 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-054; REQ-F-055; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| | BP-001; BP-010; BR-003; BR-004; UC-001; UC-002 | REQ-C-002; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-002; BR-001; BR-002; BR-005; BR-006; UC-003 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-023; REQ-F-051; REQ-F-052; REQ-F-053; REQ-F-054; REQ-NF-AI-005 | |\n| | BP-003; BR-001; BR-007; BR-008; BR-024; UC-004 | REQ-F-017; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-051; REQ-F-054; REQ-I-002; REQ-I-003 | |\n| | BP-004; BP-009; BP-010; UC-005 | REQ-D-007; REQ-F-018; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-005; BR-009; BR-010; BR-012; UC-006 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-NF-007 | |\n| | BP-006; BP-009; BR-001; BR-012; BR-022; UC-007; UC-009 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-017; REQ-F-023; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-054; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| | BP-008; BP-010; BR-002; BR-015; BR-017; BR-020; BR-021; BR-023; BQ-002; BQ-003; BQ-005 | REQ-C-003; REQ-D-001; REQ-D-002; REQ-D-005; REQ-D-006; REQ-F-018; REQ-F-053; REQ-F-054; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-005; REQ-NF-007; REQ-NF-008; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| | BP-001; BP-010; BR-003; BR-004; BR-011; UC-001; UC-002 | REQ-C-002; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-006; REQ-NF-007; REQ-NF-008; REQ-NF-010 | |\n| | BP-002; BR-004; BR-005 | REQ-C-002; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-AI-005 | |\n| | BP-002; BR-005; BR-006; UC-003 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-F-052; REQ-F-054; REQ-NF-AI-005 | |\n| | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-017; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-045; REQ-F-050; REQ-F-051; REQ-F-052; REQ-F-053; REQ-F-054; REQ-F-055; REQ-NF-007 | |\n| | BP-003; BR-007; BR-008; BR-017; BR-024; UC-004 | REQ-C-003; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003; REQ-I-004 | |\n| | BP-007; BR-014; BR-017; UC-008 | REQ-C-003; REQ-F-026; REQ-F-060; REQ-F-061; REQ-F-062; REQ-I-003; REQ-I-004 | |\n| | BP-004; UC-005 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| | BP-005; BR-009; BR-010; UC-006; BQ-004 | REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| | BP-009; UC-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| | BP-010; UC-010; BR-012 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-009; BR-011; BR-019 | REQ-D-001; REQ-D-002; REQ-D-003; REQ-D-004; REQ-D-005; REQ-D-006; REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-055; REQ-F-056; REQ-I-001; REQ-NF-006; REQ-NF-007; REQ-NF-008 | |\n| | BP-001; BP-002; BR-019 | REQ-D-001; REQ-D-002; REQ-D-003; REQ-D-004; REQ-D-005; REQ-D-006; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-I-001 | |\n| | BR-004; BR-005; BP-002 | REQ-C-002; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-AI-005 | |\n| | BP-002; BR-005; BR-006; UC-003 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-F-052; REQ-F-054; REQ-NF-AI-005 | |\n| | BR-001; BR-002; BR-012; BR-021; UC-003; UC-004; UC-007 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-017; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-045; REQ-F-050; REQ-F-051; REQ-F-052; REQ-F-053; REQ-F-054; REQ-F-055; REQ-NF-007 | |\n| | BP-003; BR-007; BR-008; BR-024; UC-004 | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003 | |\n| | BP-004; UC-005 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| | BP-005; BR-009; BR-010; UC-006; BQ-004 | REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| | BR-012; BAC-002; BAC-004 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-007 | |\n| | BP-008; BP-010; BR-015; BR-017; BR-020 | REQ-C-003; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; BP-002; BP-003; BP-004; BP-005; BP-006; BP-009; BP-010 | REQ-D-007; REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-F-040; REQ-F-041; REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-051; REQ-F-055; REQ-F-056; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; UC-001 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001 | |\n| | BR-004; UC-001 | REQ-C-002; REQ-F-001; REQ-F-005; REQ-F-006; REQ-F-010; REQ-F-018 | |\n| | BR-003 | REQ-F-006 | |\n| | BR-006; UC-003 | REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-017; REQ-F-052; REQ-F-054 | |\n| | BR-005 | REQ-F-018; REQ-NF-AI-005 | |\n| | BR-001; BR-021 | REQ-F-017; REQ-F-023; REQ-F-051; REQ-F-053; REQ-F-054 | |\n| | BR-002; BR-021 | REQ-F-053; REQ-F-054 | |\n| | BR-007; BR-008 | REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027 | |\n| | BR-014 | REQ-F-026; REQ-F-060; REQ-F-061; REQ-F-062 | |\n| | BR-009 | REQ-F-042 | |\n| | BR-010 | REQ-F-043; REQ-F-044; REQ-F-045 | |\n| | BR-022; UC-007 | REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-055; REQ-NF-007 | |\n| | BP-009; UC-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| | BP-010; UC-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BR-012 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-007 | |\n| | BR-011 | REQ-NF-006; REQ-NF-008 | |\n| | BR-011; ROLE-001; ROLE-002; ROLE-003; ROLE-004 | REQ-NF-006; REQ-NF-008 | |\n| | BR-011; BR-023; BAC-004 | REQ-D-001; REQ-D-002; REQ-D-005; REQ-D-006; REQ-NF-005; REQ-NF-006; REQ-NF-008 | |\n| | BR-012 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-007 | |\n| | BR-017 | REQ-C-003; REQ-I-004 | |\n| | BR-004; BR-011 | REQ-C-002; REQ-F-010; REQ-F-018 | |\n| | BP-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | UC-005; | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| | BP-002; BP-008 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| | BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| | BP-001; BP-008 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| | BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-005; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| | BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| | BP-008; BP-010; BR-015 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| | BP-008; BR-015 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| | BP-002; BP-008; BR-020 | REQ-F-010; REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015; REQ-F-016; REQ-F-017; REQ-F-018; REQ-F-051; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012; REQ-NF-AI-002; REQ-NF-AI-004 | |\n| | BR-011; BR-023 | REQ-D-001; REQ-D-002; REQ-D-005; REQ-D-006; REQ-NF-005; REQ-NF-006; REQ-NF-008 | |\n| | BR-012; BP-008 | REQ-D-007; REQ-D-008; REQ-D-009; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| TEST-001 | UC-001; BP-001; | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001 | |\n| TEST-002 | UC-002; BP-010; | REQ-F-003; REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| TEST-003 | BR-004; | REQ-C-002; REQ-F-010; REQ-F-018 | |\n| TEST-004 | BR-006; | REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-015 | |\n| TEST-005 | UC-003; BR-001 | REQ-F-011; REQ-F-012; REQ-F-013; REQ-F-014; REQ-F-017; REQ-F-023; REQ-F-051; REQ-F-052; REQ-F-054 | |\n| TEST-006 | BR-002; BR-021 | REQ-F-053; REQ-F-054 | |\n| TEST-007 | UC-004; BR-007; | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025 | |\n| TEST-008 | BP-003; | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003 | |\n| TEST-009 | UC-005; | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| TEST-010 | UC-005; | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| TEST-011 | BR-009; UC-006 | REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| TEST-012 | BR-010; UC-006 | REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| TEST-013 | UC-007; BR-022 | REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-055; REQ-NF-007 | |\n| TEST-014 | UC-009; BP-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| TEST-015 | UC-010; BP-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| TEST-016 | BR-011; BR-001; | REQ-F-017; REQ-F-023; REQ-F-051; REQ-F-054; REQ-NF-006; REQ-NF-008 | |\n| TEST-017 | SCREEN-001; SCREEN-003; SCREEN-005; SCREEN-006; SCREEN-008; SEC-A11Y; UC-005; BR-011 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037; REQ-NF-006; REQ-NF-008 | |\n| TEST-018 | NFD-001; BP-002; BP-008 | REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| TEST-019 | BP-008; BP-010; | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-001; REQ-NF-002; REQ-NF-003; REQ-NF-004; REQ-NF-007; REQ-NF-009; REQ-NF-010; REQ-NF-011; REQ-NF-012 | |\n| TEST-020 | SEC-007; BP-010; BR-011 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BP-001; UC-001 | REQ-F-001; REQ-F-002; REQ-F-003; REQ-F-004; REQ-F-005; REQ-F-006; REQ-I-001 | |\n| | BR-003 | REQ-F-006 | |\n| | BR-005 | REQ-F-018; REQ-NF-AI-005 | |\n| | BP-003; BR-008 | REQ-F-020; REQ-F-021; REQ-F-022; REQ-F-023; REQ-F-024; REQ-F-025; REQ-F-027; REQ-I-002; REQ-I-003 | |\n| | BP-004; UC-005 | REQ-F-030; REQ-F-031; REQ-F-032; REQ-F-033; REQ-F-034; REQ-F-035; REQ-F-036; REQ-F-037 | |\n| | BQ-004; UC-006 | REQ-F-042; REQ-F-043; REQ-F-044; REQ-F-045; REQ-F-046 | |\n| | BP-006; BR-022 | REQ-F-045; REQ-F-046; REQ-F-050; REQ-F-055; REQ-NF-007 | |\n| | BP-009; UC-009 | REQ-D-007; REQ-F-055; REQ-F-056; REQ-NF-007 | |\n| | BP-010; UC-010 | REQ-F-018; REQ-I-001; REQ-I-002; REQ-I-003; REQ-I-004; REQ-NF-007; REQ-NF-010 | |\n| | BR-024; BQ-007 | REQ-F-023; REQ-F-024; REQ-F-025; REQ-I-002 | |\n\n## 12. Validation Gate 4

| Check | Status | Notes |
| --- | --- | --- |
| UI/screen details defined where applicable | PASS | Internal HR/admin and candidate-facing screens defined. |
| API/interface details defined where applicable | PASS | File, REST/RPC, event, and Google/AI interfaces specified at contract level. |
| Data details defined where applicable | PASS | Schema-like data objects and field validations defined. |
| Validation, state, errors covered | PASS | Canonical state machine, validations, interface errors, edge cases covered. |
| Non-functional targets measurable | PASS | Performance, availability, observability, AI quality, cost, and audit targets included. |
| Security/privacy/accessibility included where relevant | PASS | RBAC, audit, privacy, secrets, input validation, accessibility covered. |
| Test cases map to requirements/use cases | PASS | 20 tests map to UC/BP/BR/detail items. |
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
