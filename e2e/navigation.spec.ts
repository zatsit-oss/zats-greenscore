import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Zats Green Score/i);
  });

  test('should navigate to create project page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/projects/new"]');
    await expect(page).toHaveURL(/\/projects\/new/);
  });

  test('should navigate to about page', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) {
      // Open mobile menu first
      const menuBtn = page.locator('#mobileMenuBtn');
      await menuBtn.click();
      await page.locator('#mobileMenu a[href="/about"]').click();
    } else {
      await page.click('a[href="/about"]');
    }
    await expect(page).toHaveURL(/\/about/);
  });

  test('should navigate to documentation page', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) {
      const menuBtn = page.locator('#mobileMenuBtn');
      await menuBtn.click();
      await page.locator('#mobileMenu a[href="/doc"]').click();
    } else {
      await page.click('a[href="/doc"]');
    }
    await expect(page).toHaveURL(/\/doc/);
  });

  test('should have skip-to-content link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should have main navigation with aria-label', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
  });
});
