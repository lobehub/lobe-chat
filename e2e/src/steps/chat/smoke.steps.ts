import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../../support/world';

// ============================================
// Then Steps (断言) - 冒烟测试
// ============================================

// 会话列表相关
Then('我应该看到会话列表面板', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找会话列表面板
  const sessionPanel = this.page
    .locator(
      '[data-testid="session-panel"], [data-testid="session-list"], aside, nav[aria-label*="session" i]',
    )
    .first();

  await expect(sessionPanel).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到聊天输入框', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找聊天输入框
  const chatInput = this.page
    .locator(
      '[data-testid="chat-input"], textarea[placeholder*="消息" i], textarea[placeholder*="message" i], [contenteditable="true"]',
    )
    .first();

  await expect(chatInput).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到默认会话', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找会话内容区域
  const chatContent = this.page
    .locator('[data-testid="chat-content"], [data-testid="conversation"], main')
    .first();

  await expect(chatContent).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到欢迎消息', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找欢迎消息，可能包含"你好"、"Hello"等
  const welcomeMessage = this.page
    .locator('[data-testid="welcome-message"], .welcome, [class*="welcome" i]')
    .first();

  // 如果找不到特定的欢迎组件，查找包含欢迎文本的元素
  const hasWelcome = await welcomeMessage.isVisible().catch(() => false);

  if (!hasWelcome) {
    const textContent = await this.page.textContent('body');
    expect(textContent).toMatch(/你好|hello|欢迎|welcome/i);
  } else {
    await expect(welcomeMessage).toBeVisible({ timeout: 120_000 });
  }
});

Then('我应该看到会话列表', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找会话列表
  const sessionList = this.page.locator('[data-testid="session-list"], [role="list"]').first();

  await expect(sessionList).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到新建会话按钮', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找新建会话按钮
  const newSessionButton = this.page
    .locator(
      '[data-testid="new-session"], button:has-text("新建"), button[aria-label*="新建" i], button[title*="新建" i]',
    )
    .first();

  await expect(newSessionButton).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到收件箱入口', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找收件箱入口
  const inboxEntry = this.page
    .locator(
      '[data-testid="inbox"], [href*="inbox" i], button:has-text("收件箱"), a:has-text("收件箱")',
    )
    .first();

  const isVisible = await inboxEntry.isVisible().catch(() => false);

  // 收件箱可能是默认选中的，所以也检查文本内容
  if (!isVisible) {
    const textContent = await this.page.textContent('body');
    expect(textContent).toMatch(/收件箱|inbox|随便聊聊/i);
  } else {
    await expect(inboxEntry).toBeVisible({ timeout: 120_000 });
  }
});

Then('输入框应该可以点击', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const chatInput = this.page
    .locator('[data-testid="chat-input"], textarea, [contenteditable="true"]')
    .first();

  await expect(chatInput).toBeVisible({ timeout: 120_000 });
  await expect(chatInput).toBeEnabled({ timeout: 120_000 });

  // 尝试点击输入框
  await chatInput.click();

  // 验证输入框获得焦点
  const isFocused = await chatInput.evaluate((el) => el === document.activeElement);
  expect(isFocused).toBe(true);
});

Then('我应该看到发送按钮', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找发送按钮
  const sendButton = this.page
    .locator(
      '[data-testid="send-button"], button[aria-label*="发送" i], button[aria-label*="send" i], button:has-text("发送")',
    )
    .first();

  await expect(sendButton).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到输入框操作栏', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找输入框操作栏（包含模型选择、工具等按钮）
  const actionBar = this.page
    .locator(
      '[data-testid="action-bar"], [data-testid="input-actions"], [class*="action" i][class*="bar" i]',
    )
    .first();

  const isVisible = await actionBar.isVisible().catch(() => false);

  if (!isVisible) {
    // 检查是否有模型选择或工具按钮作为替代
    const modelButton = this.page
      .locator('button[aria-label*="模型" i], button[aria-label*="model" i]')
      .first();

    await expect(modelButton).toBeVisible({ timeout: 120_000 });
  } else {
    await expect(actionBar).toBeVisible({ timeout: 120_000 });
  }
});
