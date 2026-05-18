import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/jobs/intake', name: 'Jobs Intake' },
  { path: '/candidates/import', name: 'Candidates Import' },
  { path: '/final-review', name: 'Final Review' },
  { path: '/portal/interview/demo-token', name: 'Demo Token' },
];

for (const route of routes) {
  test(`${route.name} (${route.path}) - no runtime crash`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('body', { state: 'visible' });

    // Check for runtime errors only, not build warnings
    if (errors.length > 0) {
      console.log(`[CRASH] ${route.path}:`, errors);
    }
    expect(errors.length).toBe(0);
  });
}