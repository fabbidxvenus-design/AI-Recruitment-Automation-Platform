import { expect, test } from '@playwright/test';

const routes = [
  { path: '/dashboard', text: /Tổng số ứng viên|Total Candidates/ },
  { path: '/candidates/import', text: /CV Import|Nhập CV/ },
  { path: '/jobs/intake', text: /Job Requisition|Yêu cầu Công việc/ },
  { path: '/jobs/approval', text: /JD Approval Workflow|Quy trình phê duyệt JD/ },
  { path: '/jobs/versions', text: /JD Version History|Lịch sử phiên bản JD/ },
  { path: '/screening/review', text: /Screening Review & Approval|Xem xét & Phê duyệt sàng lọc/ },
  { path: '/interviews/schedule-approval', text: /Phê duyệt lịch phỏng vấn|Schedule Approval/ },
  { path: '/tests/grading', text: /Test Grading|Chấm điểm bài kiểm tra/ },
  { path: '/final-review', text: /Final Review|Xem xét cuối cùng/ },
  { path: '/admin', text: /Admin Configuration|Cấu hình/ },
  { path: '/errors/ERR-2024-0892', text: /Error Remediation|Xử lý sự cố/ },
];

test.describe('prototype route smoke coverage', () => {
  for (const route of routes) {
    test(`${route.path} renders`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.getByText(route.text).first()).toBeVisible();
    });
  }
});

test('cv import shows validation and manual re-screen flow', async ({ page }) => {
  await page.goto('/candidates/import');

  await expect(page.getByText(/Mock Validation States|Trạng thái kiểm tra mock/)).toBeVisible();
  await expect(page.getByText(/Invalid file|Tệp không hợp lệ/)).toBeVisible();
  await expect(page.getByText(/Duplicate detected|Phát hiện trùng lặp/)).toBeVisible();
});

test('screening review shows traceability after selecting candidate', async ({ page }) => {
  await page.goto('/screening/review');

  await expect(page.getByText(/Traceability|Truy vết/)).toBeVisible();
  await expect(page.getByText('app-001')).toBeVisible();
  await expect(page.getByText('cv-ver-001').first()).toBeVisible();
  await expect(page.getByText('jd-ver-001').first()).toBeVisible();
});
