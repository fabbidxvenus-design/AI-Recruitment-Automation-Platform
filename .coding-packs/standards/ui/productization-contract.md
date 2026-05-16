# Productization Contract for Workflow Pages

## Rule

Every meaningful workflow page must expose **5 UI blocks** where relevant to the business state.

## The 5 Blocks

1. **State** — current business state: prepared, in review, awaiting candidate, evidence ready, approved, returned for revision, completed.
2. **Timeline** — dated sequence of local workflow events: prepared, reviewed, approved, queued, completed, exported.
3. **Evidence** — source-of-truth IDs/labels: CV version, JD version, assessment plan version, rubric version, candidate/job IDs.
4. **Approval** — who owns the decision, what is pending, and safe approve/reject/request-change actions.
5. **Next Action** — one obvious CTA that explains what the user should do next and where the workflow continues.

## When to Apply

Apply all 5 blocks to:
- Dashboard summary widgets
- JD Approval page
- Assessment Setup page
- Test Grading page
- Final Review page
- Error Remediation page
- Any page that represents a business workflow step

## Simplify When Appropriate

Not every page needs all 5. A page with a single focused action (e.g., a modal confirmation) can show only:
- State: "Are you sure?"
- Next Action: Confirm / Cancel

## Implementation

Use existing components: `Card`, `StatusBadge`, `Notice`, `Button`. Add workflow-specific CSS in the page's `*.module.css`.

## Citation

[SoT: codebase] — Productization contract applied during Phase 1-4 productization (2026-05-16). Applied to dashboard, jobs approval/versions, assessment setup, tests grading, final review, error remediation, tools pages.