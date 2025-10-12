import { expect, test } from '@playwright/test';

// 覆盖核心可访问路径（含重定向来源）
const baseRoutes: string[] = [
  '/',
  '/chat',
  '/welcome', // next.config.ts -> /chat
  '/discover',
  '/image',
  '/files',
  '/repos', // next.config.ts -> /files
  '/changelog',
];

// settings 路由改为通过 query 参数控制 active tab
// 参考 SettingsTabs: about, agent, common, hotkey, llm, provider, proxy, storage, system-agent, tts
const settingsTabs = [
  'common',
  'llm',
  'provider',
  'about',
  'hotkey',
  'proxy',
  'storage',
  'tts',
  'system-agent',
  'agent',
];

const routes: string[] = [...baseRoutes, ...settingsTabs.map((key) => `/settings?active=${key}`)];

async function assertNoPageErrors(page: Parameters<typeof test>[0]['page']) {
  const pageErrors: Error[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (err) => pageErrors.push(err));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 稳定等待网络空闲，减少页面初始化抖动
  await page.waitForLoadState('networkidle');

  expect
    .soft(pageErrors, `page errors: ${pageErrors.map((e) => e.message).join('\n')}`)
    .toHaveLength(0);
  expect.soft(consoleErrors, `console errors: ${consoleErrors.join('\n')}`).toHaveLength(0);
}

test.describe('Smoke: core routes', () => {
  for (const path of routes) {
    test(`should open ${path} without error`, async ({ page }) => {
      const response = await page.goto(path);
      // 2xx 或 3xx 视为可接受（允许中间件/重定向）
      const status = response?.status() ?? 0;
      expect(status, `unexpected status for ${path}: ${status}`).toBeLessThan(400);

      // 一般错误标题防御
      await expect(page).not.toHaveTitle(/not found|error/i);

      // body 可见
      await expect(page.locator('body')).toBeVisible();

      await assertNoPageErrors(page);
    });
  }
});
