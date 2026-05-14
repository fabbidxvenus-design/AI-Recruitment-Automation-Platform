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
- Mock fixtures cho AI Tools trong `src/lib/mock-content-data.ts` và `src/lib/ai-design-mock.ts`
- Mock fixtures cho CV/Job Intake trong `src/lib/cvIntakeMockData.ts` và `src/lib/jobIntakeMockData.ts`

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
| AI Content & Design Tools Hub | `/tools` | Hub truy cập các module AI standalone mới |
| AI Recruitment Content Generation | `/tools/content-generation` | Tạo nội dung tuyển dụng bằng mock AI, review biến thể, phê duyệt HR, copy/download local |
| AI Design / Mock Image Generation | `/tools/ai-design` | Tạo mock design/image theo brief, duyệt gallery, phê duyệt/revision, export local fallback |
| CV Evidence Viewer | `/tools/cv-evidence` | Xem dữ liệu cấu trúc trích xuất từ CV bằng AI |
| AI CV Translation | `/tools/cv-translation` | Dịch CV ứng viên đa ngôn ngữ bằng AI |
| AI Interview Translation | `/tools/interview-translation` | Dịch bản ghi phỏng vấn và phân đoạn người nói |
| Job/JD Intake | `/jobs/intake` | Tạo mới Job và nhập Job Description (thủ công, PDF, Drive) |

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

Các màn AI Tools bổ sung từ Stitch project `8539967708489554875`:

| Màn bổ sung | Stitch ID | Prototype route |
|---|---|---|
| AI Content & Design Tools | `7ff32ca5303a4aa3b27af88a63829b94` | `/tools` |
| Content Generator Hub | `25fb4670542e43a1b10fd1f75f0c92f3` | `/tools/content-generation` |
| Content Generation Entry | `73f889ad58c14708b35c20b042c71a9c` | `/tools/content-generation` |
| Content Generation Workspace | `3c1342027ddf462ea7ade3139c65b05c` | `/tools/content-generation` |
| Review Generation Results | `bc3cd96eee934622855d293c9de6bc18` | `/tools/content-generation` |
| Export & Publish Content | `fa2fdb281d4d4afc8ab7071eb60a2f9d` | `/tools/content-generation` |
| AI Design Generation Workspace | `da61f76d813a4cd4884056494befe535` | `/tools/ai-design` |
| AI Design Generation Workspace Variant | `f02687a232314b67ab70a390ef72fd2d` | `/tools/ai-design` |

## Module AI Tools mới

### AI Recruitment Content Generation

- Route: `/tools/content-generation`
- Phạm vi: nhập brief tuyển dụng, tạo mock content bằng AI giả lập, so sánh biến thể, chỉnh sửa nội dung, phê duyệt/từ chối bởi HR, copy/download local.
- Yêu cầu liên quan: `REQ-F-070` đến `REQ-F-075`, `BR-025`, `BR-027`, `BR-028`, `BR-033`.
- Tích hợp hiện tại: local-only, không gọi LLM/API thật, không publish ra hệ thống bên ngoài.

### AI Design / Mock Image Generation

- Route: `/tools/ai-design`
- Phạm vi: nhập design brief, tạo gallery mock image/design, chọn biến thể, review thông tin AI provenance, phê duyệt/revision/regenerate, export local fallback.
- Yêu cầu liên quan: `REQ-F-080` đến `REQ-F-083`, `BR-026`, `BR-027`, `BR-028`, `BR-033`.
- Tích hợp hiện tại: mock generation hybrid/deterministic, export local-only, tab/section fallback thay cho Design Export integration thật.

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
10. Mở AI Tools hub ở `/tools`.
11. Chạy luồng tạo nội dung tuyển dụng ở `/tools/content-generation`: nhập brief, generate, chọn biến thể, edit, approve, copy/download.
12. Chạy luồng AI Design ở `/tools/ai-design`: nhập brief, generate gallery, chọn design, approve hoặc request revision, export local fallback.

## Ghi chú accessibility và UAT

Prototype hiện có:

- Skip link và main landmark
- Trạng thái focus rõ ràng
- Xử lý reduced-motion bằng CSS
- Progress bar có hỗ trợ accessibility
- Caption bảng và header có scope
- `aria-describedby` / `aria-invalid` cho các form field quan trọng
- Radio/selection controls trong AI Tools dùng native button semantics và trạng thái focus rõ ràng
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
- Chưa gọi AI/LLM thật; hai module AI Tools dùng mock generation local-only
- Chưa publish nội dung hoặc design ra hệ thống bên ngoài; copy/download/export hiện là fallback local
- MFA và luồng phê duyệt đang được mock
- Một số ngày và dữ liệu mock là tĩnh để demo ổn định
- `npm install` hiện báo một số lỗ hổng dependency mức moderate; không nên chạy `npm audit fix --force` khi chưa đánh giá rủi ro breaking change
