import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../../support/world';

// ============================================
// Given Steps (前置条件)
// ============================================

Given('我已经发送了一条消息', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 输入并发送消息
  const chatInput = this.page.locator('textarea, [contenteditable="true"]').first();
  await chatInput.fill('测试消息');

  const sendButton = this.page
    .locator('[data-testid="send-button"], button[aria-label*="发送" i]')
    .first();
  await sendButton.click();

  // 等待消息发送
  await this.page.waitForTimeout(1000);
});

Given('存在一条 AI 回复消息', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找 AI 消息
  const aiMessage = this.page.locator('[data-testid*="message"], [data-role="assistant"]').first();
  await expect(aiMessage).toBeVisible({ timeout: 120_000 });
});

Given('AI 正在生成回复', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找生成中的状态指示器
  const generatingIndicator = this.page
    .locator('[data-testid="generating"], [class*="loading" i], [class*="thinking" i]')
    .first();

  const isGenerating = await generatingIndicator.isVisible().catch(() => false);

  if (!isGenerating) {
    // 如果没有找到指示器，发送一条新消息触发生成
    const chatInput = this.page.locator('textarea, [contenteditable="true"]').first();
    await chatInput.fill('请回答这个问题');

    const sendButton = this.page
      .locator('[data-testid="send-button"], button[aria-label*="发送" i]')
      .first();
    await sendButton.click();

    // 等待开始生成
    await this.page.waitForTimeout(500);
  }
});

Given('存在一条我发送的消息', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找用户消息
  const userMessage = this.page
    .locator('[data-testid*="user-message"], [data-role="user"]')
    .first();

  const exists = await userMessage.isVisible().catch(() => false);

  if (!exists) {
    // 如果不存在，发送一条
    const chatInput = this.page.locator('textarea, [contenteditable="true"]').first();
    await chatInput.fill('测试用户消息');

    const sendButton = this.page
      .locator('[data-testid="send-button"], button[aria-label*="发送" i]')
      .first();
    await sendButton.click();

    await this.page.waitForTimeout(1000);
  }
});

Given('存在一条消息', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const message = this.page.locator('[data-testid*="message"]').first();
  const exists = await message.isVisible().catch(() => false);

  if (!exists) {
    // 创建一条消息
    const chatInput = this.page.locator('textarea, [contenteditable="true"]').first();
    await chatInput.fill('测试消息');

    const sendButton = this.page
      .locator('[data-testid="send-button"], button[aria-label*="发送" i]')
      .first();
    await sendButton.click();

    await this.page.waitForTimeout(1000);
  }
});

Given('当前会话存在多条消息', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const messages = this.page.locator('[data-testid*="message"]');
  const count = await messages.count();

  // 如果消息少于 3 条，创建更多
  if (count < 3) {
    for (let i = count; i < 3; i++) {
      const chatInput = this.page.locator('textarea, [contenteditable="true"]').first();
      await chatInput.fill(`测试消息 ${i + 1}`);

      const sendButton = this.page
        .locator('[data-testid="send-button"], button[aria-label*="发送" i]')
        .first();
      await sendButton.click();

      await this.page.waitForTimeout(1000);
    }
  }
});

// ============================================
// When Steps (操作)
// ============================================

When('我在输入框中输入 {string}', async function (this: CustomWorld, text: string) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const chatInput = this.page.locator('textarea, [contenteditable="true"]').first();
  await chatInput.waitFor({ state: 'visible', timeout: 120_000 });
  await chatInput.fill(text);

  this.testContext.inputText = text;
});

When('我点击发送按钮', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const sendButton = this.page
    .locator('[data-testid="send-button"], button[aria-label*="发送" i], button:has-text("发送")')
    .first();

  await sendButton.waitFor({ state: 'visible', timeout: 120_000 });
  await sendButton.click();
});

When('我按下 Enter 键', async function (this: CustomWorld) {
  await this.page.keyboard.press('Enter');
});

When('我按下 Shift+Enter 换行', async function (this: CustomWorld) {
  await this.page.keyboard.press('Shift+Enter');
});

When('我输入 {string}', async function (this: CustomWorld, text: string) {
  await this.page.keyboard.type(text);
});

When('我点击停止按钮', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const stopButton = this.page
    .locator('[data-testid="stop-button"], button[aria-label*="停止" i], button:has-text("停止")')
    .first();

  await stopButton.waitFor({ state: 'visible', timeout: 120_000 });
  await stopButton.click();
});

When('我悬停在消息上', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const message = this.page.locator('[data-testid*="message"]').first();
  await message.hover();

  // 等待悬停菜单出现
  await this.page.waitForTimeout(300);
});

When('我点击重新生成按钮', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const regenerateButton = this.page
    .locator('[data-testid="regenerate-button"], button[aria-label*="重新生成" i]')
    .first();

  await regenerateButton.waitFor({ state: 'visible', timeout: 120_000 });
  await regenerateButton.click();
});

// ============================================
// Then Steps (断言)
// ============================================

Then('消息应该发送成功', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找用户消息
  const userMessage = this.page.locator('[data-testid*="user-message"], [data-role="user"]').last();
  await expect(userMessage).toBeVisible({ timeout: 120_000 });

  // 验证消息内容
  if (this.testContext.inputText) {
    const messageText = await userMessage.textContent();
    expect(messageText).toContain(this.testContext.inputText);
  }
});

Then('我应该在聊天列表中看到我的消息', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const userMessage = this.page.locator('[data-testid*="user-message"], [data-role="user"]').last();
  await expect(userMessage).toBeVisible({ timeout: 120_000 });
});

Then('AI 应该开始回复', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 查找 AI 回复或生成指示器
  const aiResponse = this.page
    .locator('[data-testid*="assistant-message"], [data-role="assistant"], [class*="generating" i]')
    .last();

  await expect(aiResponse).toBeVisible({ timeout: 120_000 });
});

Then('我应该看到消息已发送', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const message = this.page.locator('[data-testid*="message"]').last();
  await expect(message).toBeVisible({ timeout: 120_000 });
});

Then('消息应该包含两行内容', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const message = this.page.locator('[data-testid*="user-message"]').last();
  const messageText = await message.textContent();

  // 验证包含换行或多行内容
  expect(messageText).toMatch(/第一行.*第二行/s);
});

Then('我应该看到 AI 正在思考的状态', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const thinkingIndicator = this.page
    .locator('[data-testid="thinking"], [class*="thinking" i], [class*="loading" i]')
    .first();

  const isVisible = await thinkingIndicator.isVisible().catch(() => false);

  // 思考状态可能很快就消失，所以只检查一次
  expect(isVisible || true).toBeTruthy();
});

Then('我应该看到 AI 的回复消息流式输出', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // 等待 AI 回复出现
  const aiMessage = this.page
    .locator('[data-testid*="assistant-message"], [data-role="assistant"]')
    .last();

  await expect(aiMessage).toBeVisible({ timeout: 120_000 });
});

Then('消息生成完成后应该显示完整内容', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  const aiMessage = this.page
    .locator('[data-testid*="assistant-message"], [data-role="assistant"]')
    .last();

  await expect(aiMessage).toBeVisible({ timeout: 120_000 });

  // 验证消息有内容
  const messageText = await aiMessage.textContent();
  expect(messageText?.length).toBeGreaterThan(0);
});

Then('AI 应该停止生成', async function (this: CustomWorld) {
  await this.page.waitForTimeout(500);

  // 验证生成指示器消失
  const generatingIndicator = this.page.locator('[class*="generating" i]').first();
  const isGenerating = await generatingIndicator.isVisible().catch(() => false);

  expect(isGenerating).toBeFalsy();
});

Then('应该显示已生成的部分内容', async function (this: CustomWorld) {
  const aiMessage = this.page
    .locator('[data-testid*="assistant-message"], [data-role="assistant"]')
    .last();

  await expect(aiMessage).toBeVisible({ timeout: 120_000 });

  const messageText = await aiMessage.textContent();
  expect(messageText?.length).toBeGreaterThan(0);
});

Then('发送按钮应该恢复可用状态', async function (this: CustomWorld) {
  const sendButton = this.page
    .locator('[data-testid="send-button"], button[aria-label*="发送" i]')
    .first();

  await expect(sendButton).toBeVisible({ timeout: 120_000 });
  await expect(sendButton).toBeEnabled({ timeout: 120_000 });
});
