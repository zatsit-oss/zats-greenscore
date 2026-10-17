import {execFile} from 'node:child_process';
import {promises as fs} from 'node:fs';
import * as path from 'node:path';
import {promisify} from 'node:util';
import {expect, test, type Page, type TestInfo} from '@playwright/test';

const execFileAsync = promisify(execFile);
const packageJsonPath = path.resolve(process.cwd(), 'package.json');

async function installPwa(page: Page) {
    await page.goto('/');

    const notification = page.locator('#pwa-notification');
    await expect(notification).toContainText('ready to work offline', {
        timeout: 30000,
    });

    await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}

async function navigateOffline(page: Page, route: string) {
    const response = await page.goto(route);

    if (!response) {
        throw new Error(`No response received for ${route}`);
    }

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
}

async function submitAudit(page: Page) {
    const nextButton = page.locator('#nextBtn');
    const submitButton = page.locator('#submitBtn');

    for (let step = 0; step < 100 && await nextButton.isVisible(); step += 1) {
        await nextButton.click();
        await page.waitForTimeout(50);
    }

    await expect(nextButton).toBeHidden();
    await expect(submitButton).toBeVisible();
    await submitButton.click();
}

async function buildWithVersion(version: string) {
    const originalPackageJson = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(originalPackageJson) as {version: string};
    packageJson.version = version;

    await fs.writeFile(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 2)}\n`,
        'utf8',
    );

    try {
        const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        await execFileAsync(npmCommand, ['run', 'build'], {
            cwd: process.cwd(),
            maxBuffer: 10 * 1024 * 1024,
        });
    } finally {
        await fs.writeFile(packageJsonPath, originalPackageJson, 'utf8');
    }
}

function getUpdateVersion(testInfo: TestInfo) {
    return `1.1.1-pwa-test-${testInfo.project.name}`;
}

test.describe('PWA production behavior', () => {
    test('serves every static route from the service worker while offline', async ({
        page,
        context,
    }) => {
        await installPwa(page);
        await context.setOffline(true);

        for (const route of [
            '/about',
            '/doc',
            '/projects/new',
            '/projects/view',
            '/audit-apigreenscore',
            '/audit-eroom',
        ]) {
            await navigateOffline(page, route);
        }
    });

    test('preserves an API Green Score audit offline and shows its score view', async ({
        page,
        context,
    }) => {
        await installPwa(page);
        await context.setOffline(true);

        await navigateOffline(page, '/projects/new');
        await page.fill('#name', 'Offline API project');
        await page.fill('#description', 'Created and evaluated without a network.');
        await page.selectOption('#evaluationType', 'apigreenscore');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/audit-apigreenscore\?projectId=/);

        const firstCheckbox = page.locator('input[type="checkbox"]').first();
        await firstCheckbox.check({force: true});
        await page.reload();
        await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();

        await submitAudit(page);
        await expect(page).toHaveURL(/\/projects\/view\?id=/, {timeout: 8000});
        await expect(page.locator('#projectContent')).toBeVisible();
        await expect(page.locator('#projectScore')).not.toHaveText('--');
    });

    test('preserves an EROOM audit offline and keeps its evaluation type in the score view', async ({
        page,
        context,
    }) => {
        await installPwa(page);
        await context.setOffline(true);

        await navigateOffline(page, '/projects/new');
        await page.fill('#name', 'Offline EROOM project');
        await page.fill('#description', 'Created and evaluated without a network.');
        await page.selectOption('#evaluationType', 'eroom');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/audit-eroom\?projectId=/);

        await page.locator('#introModalClose').click();
        const firstRadio = page.locator('input[type="radio"]').first();
        await page.locator('label:has(input[type="radio"])').first().click();
        await expect(firstRadio).toBeChecked();
        await page.reload();
        await page.locator('#introModalClose').click();
        await expect(page.locator('input[type="radio"]').first()).toBeChecked();

        await page.locator('#nextBtn').click();
        await expect(page.locator('#quickResultModal')).toBeVisible();
        await page.locator('#quickResultContinue').click();

        await submitAudit(page);
        await expect(page).toHaveURL(/\/projects\/view\?id=.*evaluationType=eroom/, {
            timeout: 8000,
        });
        await expect(page.locator('#projectContent')).toBeVisible();
        await expect(page.locator('#scoreLabel')).not.toHaveText('Not Started');
    });

    test('does not register a service worker inside Tauri', async ({page}) => {
        await page.addInitScript(() => {
            Object.defineProperty(globalThis, 'isTauri', {
                configurable: true,
                value: true,
            });
        });

        await page.goto('/');
        await page.waitForTimeout(500);

        const registrationCount = await page.evaluate(async () => {
            return (await navigator.serviceWorker.getRegistrations()).length;
        });

        expect(registrationCount).toBe(0);
        await expect(page.locator('#pwa-notification')).toBeHidden();
    });

    test('prompts for a real update, preserves unsaved fields, and applies it explicitly', async ({
        page,
        context,
    }, testInfo) => {
        test.setTimeout(120000);
        const updateVersion = getUpdateVersion(testInfo);

        await installPwa(page);
        await page.goto('/projects/new');
        await page.fill('#name', 'PWA update project');
        await page.fill('#description', 'Data must survive an explicit update.');

        await buildWithVersion(updateVersion);
        await page.evaluate(async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                throw new Error('No service worker registration available.');
            }
            await registration.update();
        });

        const updateButton = page.locator('#pwa-update');
        await expect(updateButton).toBeVisible({timeout: 30000});
        await expect(page.locator('#name')).toHaveValue('PWA update project');

        await page.click('#pwa-later');
        await expect(updateButton).toBeHidden();
        await expect(page.locator('#name')).toHaveValue('PWA update project');

        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/audit-apigreenscore\?projectId=/);
        const projectId = new URL(page.url()).searchParams.get('projectId');
        if (!projectId) {
            throw new Error('The project ID was not created.');
        }

        await page.goto('/');
        await page.evaluate(() => sessionStorage.removeItem('pwa-update-dismissed'));
        await page.reload();
        await expect(updateButton).toBeVisible({timeout: 30000});
        await page.click('#pwa-update');

        await expect(page.locator('footer')).toContainText(`v${updateVersion}`, {
            timeout: 30000,
        });
        await expect(page.locator('#projectsGrid')).toContainText('PWA update project');

        await context.setOffline(true);
        const response = await page.goto(`/projects/view?id=${projectId}`);
        if (!response) {
            throw new Error('No response received for the updated project view.');
        }
        expect(response.status()).toBe(200);
        expect(response.fromServiceWorker()).toBe(true);
        await expect(page.locator('#projectName')).toContainText('PWA update project');
    });
});

test.describe('PWA installation failures', () => {
    test.use({serviceWorkers: 'block'});

    test('reports a failed service-worker installation without claiming offline readiness', async ({
        page,
    }) => {
        await page.goto('/');

        const notification = page.locator('#pwa-notification');
        await expect(notification).toContainText('could not be installed', {
            timeout: 10000,
        });
        await expect(notification).not.toContainText('ready to work offline');
    });
});
