import { test, expect } from '@playwright/test';

test.describe('API Green Score Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Create a project — redirects directly to audit page
    await page.goto('/projects/new');
    await page.fill('#name', 'API GS Audit Test');
    await page.fill('#description', 'Test audit flow');
    await page.selectOption('#evaluationType', 'apigreenscore');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/audit-apigreenscore\?projectId=/);
    await page.waitForLoadState('networkidle');
  });

  test('should land on the audit page after project creation', async ({ page }) => {
    const auditForm = page.locator('#auditForm');
    await expect(auditForm).toBeVisible();
  });

  test('should display stepper with sections', async ({ page }) => {
    const stepper = page.locator('nav[aria-label="Audit progress"]');
    await expect(stepper).toBeVisible();
  });

  test('should navigate between sections with Next/Previous', async ({ page }) => {
    // Wait for the audit JS to be fully loaded (stepper items get click handlers)
    await page.waitForFunction(() => {
      const steps = document.querySelectorAll('.step-content');
      return steps.length > 0;
    });

    const nextBtn = page.locator('#nextBtn');
    await expect(nextBtn).toBeVisible();

    // Previous should be hidden on first section
    const prevBtn = page.locator('#prevBtn');
    await expect(prevBtn).toBeHidden();

    // Go to next section and verify the step content changes
    await nextBtn.click();
    await page.waitForFunction(() => {
      const btn = document.getElementById('prevBtn');
      return btn && getComputedStyle(btn).display !== 'none';
    }, { timeout: 10000 });

    await expect(prevBtn).toBeVisible();
  });

  test('should toggle a question checkbox', async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(firstCheckbox).not.toBeChecked();

    await firstCheckbox.check({ force: true });
    await expect(firstCheckbox).toBeChecked();
  });

  test('should show submit button on last section', async ({ page }) => {
    const nextBtn = page.locator('#nextBtn');
    const submitBtn = page.locator('#submitBtn');

    // Navigate to the last section
    while (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(100);
    }

    await expect(submitBtn).toBeVisible();
  });

  test('should submit audit and redirect to project view with score', async ({ page }) => {
    // Check a few questions to get a score by clicking labels
    const toggleLabels = page.locator('label:has(input[type="checkbox"])');
    const count = await toggleLabels.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await toggleLabels.nth(i).click();
    }

    // Navigate to last section
    const nextBtn = page.locator('#nextBtn');
    while (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(100);
    }

    // Submit
    const submitBtn = page.locator('#submitBtn');
    await submitBtn.click();

    // Should redirect to project view with a score
    await expect(page).toHaveURL(/\/projects\/view\?id=/);
    const scoreEl = page.locator('#projectScore');
    await expect(scoreEl).toBeVisible();
  });
});
