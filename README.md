# RecruitAI Prototype / Nguyên mẫu RecruitAI

RecruitAI is a recruitment automation prototype built from the Gate 4 detail definition and Stitch screen implementation. It is intended for demo, UAT, and Gate 5 readiness review rather than production deployment.

RecruitAI là nguyên mẫu tự động hóa tuyển dụng được xây dựng từ tài liệu Gate 4 Detail Definition và bộ màn hình Stitch. Prototype này phục vụ demo, UAT và đánh giá sẵn sàng Gate 5, chưa phải bản triển khai production.

## Current status / Trạng thái hiện tại

- Gate 4 requirements status / Trạng thái yêu cầu Gate 4: `CONDITIONAL_PASS`
- Prototype status / Trạng thái prototype: ready for demo/UAT / sẵn sàng demo/UAT
- Backend/API integrations / Tích hợp backend/API: mocked / dữ liệu giả lập
- Google Workspace, AI scoring, MFA, and notifications / Google Workspace, chấm điểm AI, MFA và thông báo: simulated UI only / chỉ mô phỏng ở UI

## Tech stack / Công nghệ

- Next.js 15 App Router
- React 19
- TypeScript
- CSS Modules with global CSS design tokens / CSS Modules với design tokens toàn cục
- Static mock data in `src/lib/mockData.ts` / Dữ liệu mock tĩnh trong `src/lib/mockData.ts`

## Getting started / Chạy dự án

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js, usually / Mở URL local do Next.js hiển thị, thường là:

```text
http://localhost:3000
```

## Available scripts / Các lệnh có sẵn

```bash
npm run dev        # start local dev server / chạy dev server local
npm run build      # production build / build production
npm run start      # start built app / chạy app sau khi build
npm run lint       # run Next.js lint command / chạy lint
npm run typecheck  # run TypeScript checks / kiểm tra TypeScript
```

## Prototype routes / Các route prototype

| Gate 4 screen / Màn Gate 4 | Route | Purpose / Mục đích |
|---|---|---|
| SCREEN-001 Recruitment Pipeline Dashboard | `/dashboard` | Pipeline KPIs, approvals, error queue, integration health / KPI pipeline, phê duyệt, hàng đợi lỗi, sức khỏe tích hợp |
| SCREEN-002 Candidate Sourcing and Import | `/candidates/import` | Manual import, upload flow, Drive status, duplicate handling / Nhập thủ công, upload, trạng thái Drive, xử lý trùng lặp |
| SCREEN-003 Screening Review and Approval | `/screening/review` | AI screening score, evidence, risk flags, approval actions / Điểm screening AI, bằng chứng, cờ rủi ro, thao tác phê duyệt |
| SCREEN-004 Interview Scheduling Approval | `/interviews/schedule-approval` | Slot suggestions, availability, conflicts, schedule approval / Gợi ý lịch, trạng thái rảnh/bận, xung đột, phê duyệt lịch |
| SCREEN-005 Async AI Interview Workspace | `/portal/interview/demo-token` | Candidate-facing async interview flow / Luồng phỏng vấn async cho ứng viên |
| SCREEN-006 Test Grading Review and Override | `/tests/grading` | Test results, grading states, override workflow / Kết quả bài test, trạng thái chấm điểm, override thủ công |
| SCREEN-007 Final Review and Decision | `/final-review` | Consolidated evidence and final pass/fail decision / Tổng hợp bằng chứng và quyết định pass/fail cuối cùng |
| SCREEN-008 Admin Configuration and Monitoring | `/admin` | Google config, monitoring, retention/escalation placeholders / Cấu hình Google, giám sát, placeholder retention/escalation |
| Error Remediation Queue Detail | `/errors/ERR-2024-0892` | Retry backoff, owner assignment, escalation, manual review / Retry backoff, phân công owner, escalation, review thủ công |

The root route `/` redirects to `/dashboard`.

Route gốc `/` tự động chuyển đến `/dashboard`.

## Source of truth / Nguồn tham chiếu chính

Primary requirements and traceability are in / Yêu cầu và traceability chính nằm tại:

```text
requirements/04-detail-definition.md
requirements/04-detail-definition.json
requirements/traceability-matrix.md
requirements/traceability-matrix.json
```

The prototype maps to the confirmed Stitch screens from Gate 4 / Prototype map với các màn Stitch đã xác nhận ở Gate 4:

| Screen / Màn | Stitch ID |
|---|---|
| SCREEN-001 | `155d23ba71e44cf9bab0708cc68df670` |
| SCREEN-002 | `8c563e836b1c44fba401f25fc05fbde0` |
| SCREEN-003 | `bab2ca7af2ea4c99952335bb0f2b54fc` |
| SCREEN-004 | `50f70db4534e455190a90a3da5a8b97b` |
| SCREEN-005 | `367bcd74bd49454e84f255bcbdaf42c9` |
| SCREEN-006 | `edcd330a8c1d475aa57a64d56fd41dd6` |
| SCREEN-007 | `b1f39636bae24920ab06efbda3264ba0` |
| SCREEN-008 | `e54adc783e0a4ebda02cf8146e3b241c` |
| Error Remediation Detail | `6b4660bf421b42338a089bc3be0fb4a2` |

## Demo journey / Luồng demo đề xuất

A suggested UAT walkthrough / Luồng UAT gợi ý:

1. Start at `/dashboard` / Bắt đầu ở `/dashboard`.
2. Open candidate import at `/candidates/import` / Mở màn nhập ứng viên ở `/candidates/import`.
3. Review screening at `/screening/review` / Review screening ở `/screening/review`.
4. Approve scheduling at `/interviews/schedule-approval` / Phê duyệt lịch ở `/interviews/schedule-approval`.
5. Walk through the candidate interview at `/portal/interview/demo-token` / Chạy luồng phỏng vấn ứng viên ở `/portal/interview/demo-token`.
6. Review test grading at `/tests/grading` / Review chấm bài test ở `/tests/grading`.
7. Make the final decision at `/final-review` / Ra quyết định cuối ở `/final-review`.
8. Review admin monitoring at `/admin` / Kiểm tra admin monitoring ở `/admin`.
9. Open remediation detail at `/errors/ERR-2024-0892` / Mở chi tiết xử lý lỗi ở `/errors/ERR-2024-0892`.

## Accessibility and UAT notes / Ghi chú accessibility và UAT

The prototype includes / Prototype hiện có:

- Skip link and main landmark / Skip link và main landmark
- Visible focus states / Trạng thái focus rõ ràng
- Reduced-motion CSS handling / Xử lý reduced-motion bằng CSS
- Accessible progress bars / Progress bar có hỗ trợ accessibility
- Table captions and scoped headers / Caption bảng và header có scope
- `aria-describedby` / `aria-invalid` on key form fields / `aria-describedby` / `aria-invalid` cho các form field quan trọng
- Visual blocker notices for unresolved Gate 4 business questions / Notice trực quan cho các câu hỏi nghiệp vụ Gate 4 chưa được chốt

Manual UAT should still verify / UAT thủ công vẫn cần kiểm tra:

- Keyboard-only navigation / Điều hướng chỉ bằng bàn phím
- Screen reader announcements / Thông báo qua screen reader
- Color contrast / Độ tương phản màu
- Reduced-motion behavior on an actual device/browser setting / Hành vi reduced-motion trên thiết bị/trình duyệt thật
- BQ blocker notice visibility against the Stitch screens / Mức độ hiển thị BQ blocker notice so với màn Stitch

## Known limitations / Giới hạn hiện tại

- No real backend or database calls / Chưa có backend hoặc database thật
- No real Google Drive/Gmail/Calendar integration / Chưa tích hợp Google Drive/Gmail/Calendar thật
- No real AI/LLM calls / Chưa gọi AI/LLM thật
- MFA and approval flows are mocked / MFA và luồng phê duyệt đang được mock
- Some mock dates and data are static for demo consistency / Một số ngày và dữ liệu mock là tĩnh để demo ổn định
- `npm install` currently reports moderate dependency vulnerabilities; do not run `npm audit fix --force` without reviewing breaking-change impact / `npm install` hiện báo một số lỗ hổng dependency mức moderate; không nên chạy `npm audit fix --force` khi chưa đánh giá rủi ro breaking change
