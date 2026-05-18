import { expect, test } from '@playwright/test';

const routes = [
  { path: '/dashboard', text: /Tổng số ứng viên|Total Candidates/ },
  { path: '/candidates/import', text: /CV Import|Nhập CV/ },
  { path: '/jobs/intake', text: /Job Requisition|Yêu cầu Công việc/ },
  { path: '/jobs/approval', text: /JD Approval Workflow|Quy trình phê duyệt JD/ },
  { path: '/jobs/versions', text: /JD Version History|Lịch sử phiên bản JD/ },
  { path: '/screening/review', text: /Screening Review & Approval|Xem xét & Phê duyệt sàng lọc/ },
  { path: '/interviews/schedule-approval', text: /Phê duyệt lịch phỏng vấn|Schedule Approval/ },
  { path: '/assessments/setup', text: /Assessment Plan Setup|Thiết lập kế hoạch đánh giá/ },
  { path: '/tests/grading', text: /Test Grading|Chấm điểm bài kiểm tra/ },
  { path: '/final-review', text: /Final Review|Xem xét cuối cùng/ },
  { path: '/admin', text: /Admin Configuration|Cấu hình/ },
  { path: '/errors/ERR-2024-0892', text: /Error Remediation|Xử lý sự cố/ },
  { path: '/tools', text: /Tools|Trang Công cụ/ },
  { path: '/tools/content-generation', text: /Content Generation|Tạo nội dung/ },
  { path: '/tools/interview-translation', text: /Interview Translation|Dịch phỏng vấn/ },
  { path: '/tools/ai-design', text: /AI Design|Thiết kế AI/ },
  { path: '/auth/login', text: /Login|Đăng nhập/ },
  { path: '/portal/interview/demo-token', text: /Interview Portal|Cổng thông tin phỏng vấn/ },
  { path: '/portal/interview/access', text: /Access|Truy cập/ },
];

const sharedAssessmentTraceabilityValues = ['job-001', 'jd-ver-001-v2', 'assess-plan-001', 'assess-plan-ver-001', 'rubric-ver-001'];

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

  await page.locator('details').first().locator('summary').click();

  await expect(page.getByText(/Import review guidance|Hướng dẫn rà soát nhập CV/)).toBeVisible();
  await expect(page.getByText(/Invalid file|Tệp không hợp lệ/)).toBeVisible();
  await expect(page.getByText(/Duplicate detected|Phát hiện trùng lặp/)).toBeVisible();
});

test('screening review shows traceability after selecting candidate', async ({ page }) => {
  await page.goto('/screening/review');

  await expect(page.getByText(/Evidence History|Lịch sử bằng chứng/)).toBeVisible();
  await expect(page.getByText('app-001')).toBeVisible();
  await expect(page.getByText('cv-ver-001').first()).toBeVisible();
  await expect(page.getByText('jd-ver-001').first()).toBeVisible();
});

test('assessment setup shows shared assessment traceability', async ({ page }) => {
  await page.goto('/assessments/setup');

  for (const value of [...sharedAssessmentTraceabilityValues, 'iqs-ver-001', 'test-def-ver-001']) {
    await expect(page.getByText(value).first()).toBeVisible();
  }

  const parsedCriteriaRow = page
    .locator('dt', { hasText: /Evaluation Framework Version|Phiên bản khung đánh giá/i })
    .first()
    .locator('xpath=..');
  await expect(parsedCriteriaRow.locator('dd')).toHaveText('2');
});

test('interview portal shows assessment traceability for default mock session', async ({ page }) => {
  await page.goto('/portal/interview/demo-token');

  await expect(page.getByRole('heading', { name: /Assessment Evidence Trail|Chuỗi bằng chứng đánh giá/ })).toBeVisible();
  for (const value of [...sharedAssessmentTraceabilityValues, 'iqs-ver-001']) {
    await expect(page.getByText(value).first()).toBeVisible();
  }
});

test('test grading shows assessment traceability for default selected result', async ({ page }) => {
  await page.goto('/tests/grading');

  await expect(page.getByText('JavaScript Fundamentals').first()).toBeVisible();
  await expect(page.getByText('Sarah Chen').first()).toBeVisible();
  await expect(page.getByText(/Assessment Evidence Trail|Chuỗi bằng chứng đánh giá/)).toBeVisible();
  for (const value of [...sharedAssessmentTraceabilityValues, 'test-def-ver-001']) {
    await expect(page.getByText(value).first()).toBeVisible();
  }
});

test('approved assessment plan persists across interview test and final review', async ({ page }) => {
  await page.goto('/assessments/setup');
  const approveButton = page.getByRole('button', { name: /Approve and proceed|Duyệt kế hoạch local/i });
  if (await approveButton.isVisible().catch(() => false) && !(await approveButton.isDisabled().catch(() => true))) {
    await approveButton.click();
    await page.waitForTimeout(500);
  }
  await page.reload();

  await expect(page.getByText(/Approved|Đã duyệt/).first()).toBeVisible();
  for (const value of [...sharedAssessmentTraceabilityValues, 'iqs-ver-001', 'test-def-ver-001']) {
    await expect(page.getByText(value).first()).toBeVisible();
  }

  await page.goto('/portal/interview/demo-token');
  for (const value of [...sharedAssessmentTraceabilityValues, 'iqs-ver-001']) {
    await expect(page.getByText(value).first()).toBeVisible();
  }

  await page.goto('/tests/grading');
  for (const value of [...sharedAssessmentTraceabilityValues, 'test-def-ver-001']) {
    await expect(page.getByText(value).first()).toBeVisible();
  }

  await page.goto('/final-review');
  await expect(page.getByText(/Decision evidence trail|Audit trail nguồn chuẩn/)).toBeVisible();
  await expect(page.getByText('cv-ver-001').first()).toBeVisible();
  for (const value of [...sharedAssessmentTraceabilityValues, 'iqs-ver-001', 'test-def-ver-001']) {
    await expect(page.getByText(value).first()).toBeVisible();
  }
});
