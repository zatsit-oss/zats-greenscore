import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './e2e/pwa',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: 'html',
    use: {
        baseURL: 'http://127.0.0.1:4322',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
        {
            name: 'mobile',
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: 390, height: 844},
                isMobile: true,
            },
        },
    ],
    webServer: {
        command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4322',
        url: 'http://127.0.0.1:4322/',
        reuseExistingServer: false,
        timeout: 120000,
    },
});
