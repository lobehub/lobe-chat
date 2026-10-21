import { After, Given, Then, When } from '@cucumber/cucumber';
import { type APIRequestContext, expect, request } from '@playwright/test';

import type { CustomWorld } from '../../support/world';

const categoryName =
  '移动端分类操作触控边界与超长标题省略验证：此分类名称必须在三百九十和三百二十像素视口下均超出可用文本区域';

async function mutate(api: APIRequestContext, procedure: string, input: unknown) {
  const response = await api.post(`/trpc/lambda/${procedure}`, {
    data: { json: input },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()).result.data.json;
}

function category(world: CustomWorld) {
  return world.page.getByRole('button', { exact: true, name: categoryName });
}

function action(world: CustomWorld) {
  return category(world).locator('..').locator('.accordion-action');
}

Given(
  '触屏首页宽度为 {int} 且有分类和助理',
  { timeout: 90_000 },
  async function (this: CustomWorld, width: number) {
    const cookies = await this.browserContext.cookies();
    const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3006}`;
    this.testContext.mobileCookies = cookies;
    this.testContext.mobileBaseURL = baseURL;
    await this.browserContext.close();
    this.browserContext = await this.browser.newContext({
      baseURL,
      deviceScaleFactor: 3,
      hasTouch: true,
      isMobile: true,
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      viewport: { height: 844, width },
    });
    await this.browserContext.addCookies(cookies);
    this.page = await this.browserContext.newPage();
    this.testContext.mobileCategoryId = await mutate(
      this.page.request,
      'sessionGroup.createSessionGroup',
      {
        name: categoryName,
      },
    );
    const { agentId } = await mutate(this.page.request, 'agent.createAgent', {
      config: { title: '分类边界助理' },
      groupId: this.testContext.mobileCategoryId,
    });
    this.testContext.mobileAgentId = agentId;
    await this.page.goto('/');
    await expect(category(this)).toBeVisible({ timeout: 60_000 });
    const devDock = this.page.getByRole('button', { name: 'Collapse DevDock' });
    if (await devDock.isVisible()) await devDock.click();
    this.testContext.categoryExpanded = await category(this).getAttribute('aria-expanded');
    this.testContext.categoryUrl = this.page.url();
  },
);

Then('分类操作默认可见且有足够的触控区域', async function (this: CustomWorld) {
  await expect(action(this)).toHaveCSS('opacity', '1');
  const title = category(this).getByText(categoryName, { exact: true });
  await expect(title).toBeVisible();
  await expect(title).toHaveCSS('text-overflow', 'ellipsis');
  await expect(title).toHaveCSS('overflow-x', 'hidden');
  const textBounds = await title.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  console.log('Category title truncation:', this.page.viewportSize()!.width, textBounds);
  expect(textBounds.clientWidth).toBeGreaterThan(0);
  expect(textBounds.scrollWidth).toBeGreaterThan(textBounds.clientWidth);
  const button = action(this).getByRole('button');
  await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(button).toHaveCSS('box-shadow', 'none');
  const bounds = await button.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  const titleBounds = await category(this).boundingBox();
  expect(titleBounds!.x + titleBounds!.width).toBeLessThanOrEqual(bounds!.x);
  expect(await this.page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    this.page.viewportSize()!.width,
  );
});

When('直接触摸分类操作的中心和四侧内边界', async function (this: CustomWorld) {
  const box = (await action(this).getByRole('button').boundingBox())!;
  const points = [
    [box.width / 2, box.height / 2],
    [1, box.height / 2],
    [box.width - 1, box.height / 2],
    [box.width / 2, 1],
    [box.width / 2, box.height - 1],
  ];
  for (const [x, y] of points) {
    await this.page.touchscreen.tap(box.x + x, box.y + y);
    await expect(this.page.getByRole('menu')).toBeVisible();
    await expect(category(this)).toHaveAttribute(
      'aria-expanded',
      this.testContext.categoryExpanded,
    );
    expect(this.page.url()).toBe(this.testContext.categoryUrl);
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByRole('menu')).toBeHidden();
  }
});

Then('分类折叠状态和当前页面没有改变', async function (this: CustomWorld) {
  await expect(category(this)).toHaveAttribute('aria-expanded', this.testContext.categoryExpanded);
  expect(this.page.url()).toBe(this.testContext.categoryUrl);
});

When('关闭分类菜单并将焦点移到搜索框', async function (this: CustomWorld) {
  await this.page.keyboard.press('Escape');
  await this.page.getByRole('textbox').first().focus();
});

When('触摸分类标题后选择助理', async function (this: CustomWorld) {
  const trigger = category(this);
  if ((await trigger.getAttribute('aria-expanded')) === 'true') await trigger.tap();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  const titleBounds = (await trigger.boundingBox())!;
  await this.page.touchscreen.tap(
    titleBounds.x + titleBounds.width - 1,
    titleBounds.y + titleBounds.height / 2,
  );
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(this.page.getByRole('menu')).toBeHidden();
  const agentLink = this.page.getByRole('link', {
    exact: true,
    name: this.testContext.mobileAgentId,
  });
  const href = await agentLink.getAttribute('href');
  expect(href).toMatch(/\/agent\/agt_/);
  this.testContext.mobileAgentURL = new URL(href!, this.testContext.mobileBaseURL).href;
  const rowBounds = (await agentLink.boundingBox())!;
  await this.page.touchscreen.tap(rowBounds.x + rowBounds.width / 2, rowBounds.y + 1);
});

Then('只进入该分类的助理', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(this.testContext.mobileAgentURL);
  await expect(this.page.getByRole('menu')).toBeHidden();
});

After({ tags: '@mobile-category-actions' }, async function (this: CustomWorld) {
  if (!this.testContext.mobileCookies) return;
  const api = await request.newContext({
    baseURL: this.testContext.mobileBaseURL,
    storageState: { cookies: this.testContext.mobileCookies, origins: [] },
  });
  try {
    if (this.testContext.mobileAgentId)
      await mutate(api, 'agent.removeAgent', { agentId: this.testContext.mobileAgentId });
    if (this.testContext.mobileCategoryId)
      await mutate(api, 'sessionGroup.removeSessionGroup', {
        id: this.testContext.mobileCategoryId,
      });
  } finally {
    await api.dispose();
  }
});
