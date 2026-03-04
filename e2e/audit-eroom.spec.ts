import { test, expect } from '@playwright/test';

test.describe('EROOM Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Create an EROOM project — redirects directly to audit-eroom page
    await page.goto('/projects/new');
    await page.fill('#name', 'EROOM Audit Test');
    await page.fill('#description', 'Test EROOM audit flow');
    await page.selectOption('#evaluationType', 'eroom');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/audit-eroom\?projectId=/);
    await page.waitForLoadState('networkidle');
  });

  test('should land on the EROOM audit page after project creation', async ({ page }) => {
    const auditForm = page.locator('#auditForm');
    await expect(auditForm).toBeVisible();
  });

  test('should display stepper with category sections', async ({ page }) => {
    const stepper = page.locator('nav[aria-label="EROOM audit progress"]');
    await expect(stepper).toBeVisible();
  });

  test('should display radio button options for questions', async ({ page }) => {
    const radioInputs = page.locator('input[type="radio"]');
    const count = await radioInputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should select a radio answer and update question status', async ({ page }) => {
    // Click the label wrapping the first radio to ensure it works on mobile
    const firstRadioLabel = page.locator('label:has(input[type="radio"])').first();
    await firstRadioLabel.click();

    const firstRadio = page.locator('input[type="radio"]').first();
    await expect(firstRadio).toBeChecked();

    // The question status icon should update to "answered"
    const answeredIcon = page.locator('.icon-answered:not(.hidden)').first();
    await expect(answeredIcon).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    const nextBtn = page.locator('#nextBtn');
    const prevBtn = page.locator('#prevBtn');

    await expect(prevBtn).toBeHidden();
    await nextBtn.click();
    await expect(prevBtn).toBeVisible({ timeout: 10000 });
  });

  test('should submit EROOM audit and show score', async ({ page }) => {
    // Answer a few questions by clicking labels
    const radioLabels = page.locator('label:has(input[type="radio"])');
    const count = await radioLabels.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await radioLabels.nth(i).click();
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
