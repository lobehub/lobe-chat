import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../../support/world';

// ============================================
// Given Steps (前置条件)
// ============================================

Given('我访问 {string}', async function (this: CustomWorld, path: string) {
  const response = await this.page.goto(path, { waitUntil: 'commit' });
  this.testContext.lastResponse = response;
  await this.page.waitForLoadState('domcontentloaded');
});

Given('应用正在运行', async function (this: CustomWorld) {
  // This is a placeholder step that can be used for setup
  // The actual app is already running via the test framework
});

Given('页面完全加载', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
  await this.page.waitForTimeout(500);
});

Given('存在多个会话', async function (this: CustomWorld) {
  // This assumes sessions already exist in the test environment
  // TODO: Create sessions programmatically if needed
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
});

Given('存在一个会话', async function (this: CustomWorld) {
  // This assumes at least one session exists
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
});

// ============================================
// When Steps (操作)
// ============================================

When('我点击 {string}', async function (this: CustomWorld, elementText: string) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
  const element = this.page.getByText(elementText).first();
  await element.waitFor({ state: 'visible', timeout: 120_000 });
  await element.click();
});

When('我等待 {int} 毫秒', async function (this: CustomWorld, ms: number) {
  await this.page.waitForTimeout(ms);
});

// ============================================
// Then Steps (断言)
// ============================================

Then('页面应该正常加载', async function (this: CustomWorld) {
  // 检查没有 JavaScript 错误
  expect(this.testContext.jsErrors).toHaveLength(0);

  // 检查页面没有跳转到错误页面
  const url = this.page.url();
  expect(url).not.toMatch(/\/404|\/error|not-found/i);

  // 检查页面标题不包含错误
  const title = await this.page.title();
  expect(title).not.toMatch(/not found|error/i);
});

Then('我应该看到页面主体', async function (this: CustomWorld) {
  const body = this.page.locator('body');
  await expect(body).toBeVisible();
});

Then('URL 应该包含 {string}', async function (this: CustomWorld, urlPart: string) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
  const url = this.page.url();
  expect(url).toContain(urlPart);
});

Then('应该显示 {string}', async function (this: CustomWorld, text: string) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
  const element = this.page.getByText(text);
  await expect(element.first()).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到 {string}', async function (this: CustomWorld, text: string) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
  const element = this.page.getByText(text);
  await expect(element.first()).toBeVisible({ timeout: 120_000 });
});
