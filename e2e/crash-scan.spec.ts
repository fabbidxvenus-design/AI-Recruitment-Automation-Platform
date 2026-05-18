import { test, expect } from '@playwright/test';

test.describe('Runtime crash scan', () => {
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/jobs/intake', name: 'Jobs Intake' },
    { path: '/candidates/import', name: 'Candidates Import' },
    { path: '/final-review', name: 'Final Review' },
    { path: '/portal/interview/demo-token', name: 'Portal Interview' },
  ];

  for (const route of routes) {
    test(`crash scan: ${route.name}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Check for HTTP errors
      if (response && !response.ok()) {
        errors.push(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      // Give time for any runtime errors to surface
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('body', { state: 'visible' });

      console.log(`Route ${route.path}:`, errors.length ? errors : 'PASS');
      expect(errors, `No crashes on ${route.path}`).toHaveLength(0);
    });
  }
});