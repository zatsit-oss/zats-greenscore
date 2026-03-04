import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('should toggle between dark and light theme', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();

    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);

    // Toggle back
    await themeToggle.click();
    const restoredTheme = await html.getAttribute('data-theme');
    expect(restoredTheme).toBe(initialTheme);
  });

  test('should persist theme across page navigation', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('#theme-toggle');
    await themeToggle.click();
    const theme = await page.locator('html').getAttribute('data-theme');

    // Navigate to another page
    await page.goto('/about');
    const themeAfterNav = await page.locator('html').getAttribute('data-theme');

    expect(themeAfterNav).toBe(theme);
  });
});
