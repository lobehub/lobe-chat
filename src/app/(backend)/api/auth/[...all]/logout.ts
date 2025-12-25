import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

test.describe('Auth0 Logout Flow', () => {

    test('TC-01: Logout clears local session cookies', async ({ page, context }) => {
        await page.goto(APP_URL);

        // Login
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByLabel('Email').fill(process.env.TEST_EMAIL!);
        await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
        await page.getByRole('button', { name: 'Continue' }).click();

        // Logout
        await page.getByRole('button', { name: 'Logout' }).click();

        // Check cookies
        const cookies = await context.cookies();
        const sessionCookie = cookies.find(c => c.name.includes('session'));
        expect(sessionCookie).toBeUndefined();
    });

    test('TC-02: Logout triggers Auth0 /v2/logout redirect', async ({ page }) => {
        await page.goto(APP_URL);

        // Login
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByLabel('Email').fill(process.env.TEST_EMAIL!);
        await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
        await page.getByRole('button', { name: 'Continue' }).click();

        // Capture redirect
        const [response] = await Promise.all([
            page.waitForNavigation(),
            page.getByRole('button', { name: 'Logout' }).click(),
        ]);

        expect(response.url()).toContain(`${AUTH0_DOMAIN}/v2/logout`);
        expect(response.url()).toContain(`client_id=${AUTH0_CLIENT_ID}`);
    });

    test('TC-03: Login after logout requires credentials', async ({ page }) => {
        await page.goto(APP_URL);

        // Login
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByLabel('Email').fill(process.env.TEST_EMAIL!);
        await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
        await page.getByRole('button', { name: 'Continue' }).click();

        // Logout
        await page.getByRole('button', { name: 'Logout' }).click();

        // Try logging in again
        await page.getByRole('button', { name: 'Login' }).click();

        // Expect Auth0 login screen
        await expect(page.getByLabel('Email')).toBeVisible();
    });

    test('TC-04: Logout from deep route still clears Auth0 session', async ({ page }) => {
        await page.goto(`${APP_URL}/chat/123`);

        // Login
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByLabel('Email').fill(process.env.TEST_EMAIL!);
        await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
        await page.getByRole('button', { name: 'Continue' }).click();

        // Logout
        await page.getByRole('button', { name: 'Logout' }).click();

        // Try logging in again
        await page.getByRole('button', { name: 'Login' }).click();

        // Should show Auth0 login screen
        await expect(page.getByLabel('Email')).toBeVisible();
    });

});