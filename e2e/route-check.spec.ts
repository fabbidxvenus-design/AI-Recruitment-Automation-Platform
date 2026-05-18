import { test, expect, chromium } from '@playwright/test';

const routes = [
  '/dashboard',
  '/jobs/intake',
  '/candidates/import',
  '/assessments/setup',
  '/interviews/schedule-approval',
  '/tests/grading',
  '/final-review',
  '/tools/ai-design',
  '/tools/content-generation',
  '/tools/cv-evidence',
  '/tools/cv-translation',
  '/tools/interview-translation',
  '/admin',
  '/errors/ERR-2024-0892',
];

test.describe('Route Error Checks', () => {
  routes.forEach(route => {
    test(`Check ${route}`, async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', err => {
        errors.push(err.message);
      });

      try {
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);

        if (errors.length > 0) {
          console.log(`ERRORS on ${route}:`, errors);
        } else {
          console.log(`OK: ${route}`);
        }
      } catch (e: any) {
        console.log(`CRASH on ${route}: ${e.message}`);
      }
    });
  });
});