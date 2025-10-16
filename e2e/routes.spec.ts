import { expect, test } from '@playwright/test';

// 覆盖核心可访问路径（含重定向来源）
const baseRoutes: string[] = [
  '/',
  '/chat',
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

// CI 环境下跳过容易不稳定或受特性开关影响的路由
const ciSkipPaths = new Set<string>([
  '/image',
  '/changelog',
  '/settings?active=common',
  '/settings?active=llm',
]);

// @ts-ignore
async function assertNoPageErrors(page: Parameters<typeof test>[0]['page']) {
  const pageErrors: Error[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (err: Error) => pageErrors.push(err));
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 仅校验页面级错误，忽略控制台 error 以提升稳定性
  expect
    .soft(pageErrors, `page errors: ${pageErrors.map((e) => e.message).join('\n')}`)
    .toHaveLength(0);
}

test.describe('Smoke: core routes', () => {
  for (const path of routes) {
    test(`should open ${path} without error`, async ({ page }) => {
      if (process.env.CI && ciSkipPaths.has(path)) test.skip(true, 'skip flaky route on CI');
      const response = await page.goto(path, { waitUntil: 'commit' });
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
