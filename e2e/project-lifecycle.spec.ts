import { test, expect } from '@playwright/test';

test.describe('Project Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show welcome hero when no projects exist', async ({ page }) => {
    await page.goto('/');
    const welcomeHero = page.locator('#welcomeHero');
    await expect(welcomeHero).toBeVisible();
  });

  test('should create a new API Green Score project and redirect to audit', async ({ page }) => {
    await page.goto('/projects/new');

    await page.fill('#name', 'Test Project');
    await page.fill('#description', 'A test project for e2e');
    await page.selectOption('#evaluationType', 'apigreenscore');
    await page.click('button[type="submit"]');

    // Should redirect directly to audit page
    await expect(page).toHaveURL(/\/audit-apigreenscore\?projectId=/);
  });

  test('should create a new EROOM project and redirect to audit', async ({ page }) => {
    await page.goto('/projects/new');

    await page.fill('#name', 'EROOM Project');
    await page.fill('#description', 'An EROOM test project');
    await page.selectOption('#evaluationType', 'eroom');
    await page.click('button[type="submit"]');

    // Should redirect directly to EROOM audit page
    await expect(page).toHaveURL(/\/audit-eroom\?projectId=/);
  });

  test('should display project on dashboard after creation', async ({ page }) => {
    // Create a project
    await page.goto('/projects/new');
    await page.fill('#name', 'Dashboard Test');
    await page.fill('#description', 'Visible on dashboard');
    await page.selectOption('#evaluationType', 'apigreenscore');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/audit-apigreenscore\?projectId=/);

    // Go to dashboard
    await page.goto('/');

    // Project should appear in the grid
    const projectCard = page.locator('#projectsGrid').getByText('Dashboard Test');
    await expect(projectCard).toBeVisible();
  });

  test('should navigate to project view from dashboard', async ({ page }) => {
    // Create a project
    await page.goto('/projects/new');
    await page.fill('#name', 'View Test');
    await page.fill('#description', 'Click to view');
    await page.selectOption('#evaluationType', 'apigreenscore');
    await page.click('button[type="submit"]');

    // Go to dashboard and click project card
    await page.goto('/');
    const projectLink = page.locator('#projectsGrid a').first();
    await projectLink.click();

    await expect(page).toHaveURL(/\/projects\/view\?id=/);
    await expect(page.locator('#projectName')).toContainText('View Test');
  });

  test('should delete a project from project view', async ({ page }) => {
    // Create a project then navigate to its view
    await page.goto('/projects/new');
    await page.fill('#name', 'To Delete');
    await page.fill('#description', 'Will be deleted');
    await page.selectOption('#evaluationType', 'apigreenscore');
    await page.click('button[type="submit"]');

    // Navigate to project view via dashboard
    await page.goto('/');
    const projectLink = page.locator('#projectsGrid a').first();
    await projectLink.click();
    await expect(page).toHaveURL(/\/projects\/view\?id=/);

    // Click delete button
    await page.click('#deleteBtn');

    // Confirm in modal
    const deleteModal = page.locator('#deleteModal');
    await expect(deleteModal).toBeVisible();
    await page.click('#confirmDeleteBtn');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
  });

  test('should validate required fields on project creation', async ({ page }) => {
    await page.goto('/projects/new');

    // Try to submit without filling in the name
    await page.click('button[type="submit"]');

    // Should stay on the same page (HTML5 validation)
    await expect(page).toHaveURL(/\/projects\/new/);
  });
});
