# Nguyên mẫu RecruitAI

RecruitAI là nguyên mẫu tự động hóa tuyển dụng được xây dựng từ tài liệu Gate 4 Detail Definition và bộ màn hình Stitch. Prototype này phục vụ demo, UAT và đánh giá sẵn sàng Gate 5, chưa phải bản triển khai production.

## Trạng thái hiện tại

- Trạng thái yêu cầu Gate 4: `CONDITIONAL_PASS`
- Trạng thái prototype: sẵn sàng demo/UAT
- Tích hợp backend/API: dữ liệu giả lập
- Google Workspace, chấm điểm AI, MFA và thông báo: chỉ mô phỏng ở UI

## Công nghệ

- Next.js 15 App Router
- React 19
- TypeScript
- CSS Modules với design tokens toàn cục
- Dữ liệu mock tĩnh trong `src/lib/mockData.ts`

## Chạy dự án

```bash
npm install
npm run dev
```

Mở URL local do Next.js hiển thị, thường là:

```text
http://localhost:3000
```

## Các lệnh có sẵn

```bash
npm run dev        # chạy dev server local
npm run build      # build production
npm run start      # chạy app sau khi build
npm run lint       # chạy lint
npm run typecheck  # kiểm tra TypeScript
```

## Các route prototype

| Màn Gate 4 | Route | Mục đích |
|---|---|---|
| SCREEN-001 Recruitment Pipeline Dashboard | `/dashboard` | KPI pipeline, phê duyệt, hàng đợi lỗi, sức khỏe tích hợp |
| SCREEN-002 Candidate Sourcing and Import | `/candidates/import` | Nhập thủ công, upload, trạng thái Drive, xử lý trùng lặp |
| SCREEN-003 Screening Review and Approval | `/screening/review` | Điểm screening AI, bằng chứng, cờ rủi ro, thao tác phê duyệt |
| SCREEN-004 Interview Scheduling Approval | `/interviews/schedule-approval` | Gợi ý lịch, trạng thái rảnh/bận, xung đột, phê duyệt lịch |
| SCREEN-005 Async AI Interview Workspace | `/portal/interview/demo-token` | Luồng phỏng vấn async cho ứng viên |
| SCREEN-006 Test Grading Review and Override | `/tests/grading` | Kết quả bài test, trạng thái chấm điểm, override thủ công |
| SCREEN-007 Final Review and Decision | `/final-review` | Tổng hợp bằng chứng và quyết định pass/fail cuối cùng |
| SCREEN-008 Admin Configuration and Monitoring | `/admin` | Cấu hình Google, giám sát, placeholder retention/escalation |
| Error Remediation Queue Detail | `/errors/ERR-2024-0892` | Retry backoff, phân công owner, escalation, review thủ công |

Route gốc `/` tự động chuyển đến `/dashboard`.

## Nguồn tham chiếu chính

Yêu cầu và traceability chính nằm tại:

```text
requirements/04-detail-definition.md
requirements/04-detail-definition.json
requirements/traceability-matrix.md
requirements/traceability-matrix.json
```

Prototype map với các màn Stitch đã xác nhận ở Gate 4:

| Màn | Stitch ID |
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

## Luồng demo đề xuất

Luồng UAT gợi ý:

1. Bắt đầu ở `/dashboard`.
2. Mở màn nhập ứng viên ở `/candidates/import`.
3. Review screening ở `/screening/review`.
4. Phê duyệt lịch ở `/interviews/schedule-approval`.
5. Chạy luồng phỏng vấn ứng viên ở `/portal/interview/demo-token`.
6. Review chấm bài test ở `/tests/grading`.
7. Ra quyết định cuối ở `/final-review`.
8. Kiểm tra admin monitoring ở `/admin`.
9. Mở chi tiết xử lý lỗi ở `/errors/ERR-2024-0892`.

## Ghi chú accessibility và UAT

Prototype hiện có:

- Skip link và main landmark
- Trạng thái focus rõ ràng
- Xử lý reduced-motion bằng CSS
- Progress bar có hỗ trợ accessibility
- Caption bảng và header có scope
- `aria-describedby` / `aria-invalid` cho các form field quan trọng
- Notice trực quan cho các câu hỏi nghiệp vụ Gate 4 chưa được chốt

UAT thủ công vẫn cần kiểm tra:

- Điều hướng chỉ bằng bàn phím
- Thông báo qua screen reader
- Độ tương phản màu
- Hành vi reduced-motion trên thiết bị/trình duyệt thật
- Mức độ hiển thị BQ blocker notice so với màn Stitch

## Giới hạn hiện tại

- Chưa có backend hoặc database thật
- Chưa tích hợp Google Drive/Gmail/Calendar thật
- Chưa gọi AI/LLM thật
- MFA và luồng phê duyệt đang được mock
- Một số ngày và dữ liệu mock là tĩnh để demo ổn định
- `npm install` hiện báo một số lỗ hổng dependency mức moderate; không nên chạy `npm audit fix --force` khi chưa đánh giá rủi ro breaking change
