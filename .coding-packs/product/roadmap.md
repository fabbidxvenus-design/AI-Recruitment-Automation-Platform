# recruitAI-web — Roadmap

## MVP Must-Have Features

MVP scope is the current productized recruitment operating system:

1. **Dashboard** — workspace readiness, pipeline status, operational next actions.
2. **Job/JD Intake** — requisition setup, JD source readiness, handoff to JD approval.
3. **JD Approval + Versioning** — parsed JD review, approval/rejection, version evidence, comparison.
4. **Candidate Import** — CV batch intake, import timeline, handoff to screening review.
5. **Screening Review** — CV-to-JD evaluation, evidence context, stage advancement.
6. **Interview Schedule Approval** — slot review, invite prepared, workspace readiness.
7. **Candidate Interview Workspace** — async AI interview lifecycle: not started, in progress, submitted, evidence ready.
8. **Assessment Setup** — plan state, rubric version evidence, approval owner, next action.
9. **Test Grading** — rubric evidence, score breakdown, reviewer override/approval.
10. **Final Review** — evidence package, decision history, final approve/reject/request info.
11. **AI Tools Hub** — business workspaces for AI Design, Content Generation, CV Evidence, CV Translation, Interview Translation.
12. **Error Remediation** — incident workspace with impact, SLA, retry timeline, owner, next action.

## Post-Launch Plan

Primary post-launch track: **Backend Integration**.

1. Add authentication and role-based access control.
2. Replace mock data/localStorage with persistent data storage.
3. Integrate real LLM/OCR providers for screening, translation, evidence extraction, content generation, and grading.
4. Integrate Google Drive/Sheets/Calendar for source intake and scheduling.
5. Add real audit logs for evidence versioning and approval history.
6. Add production-ready error handling, retry queues, and operational monitoring.

## Out of Scope for Current MVP

- Real backend APIs
- Real database persistence
- Real Google integration
- Real ATS/job board publishing
- Real AI model calls
- Real candidate email delivery
