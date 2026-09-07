import { After, Given, Then, When } from '@cucumber/cucumber';
import { expect, request } from '@playwright/test';

import type { CustomWorld } from '../../support/world';

Given('a group profile exists for the loading regression', async function (this: CustomWorld) {
  const response = await this.page.request.post('/trpc/lambda/group.createGroup', {
    data: {
      json: { content: 'Group profile loading regression', title: 'Loading regression group' },
    },
  });
  expect(response.ok()).toBe(true);
  const body = await response.json();
  this.testContext.loadingRegressionGroupId = body.result.data.json.group.id;
  this.testContext.loadingRegressionAuth = await this.browserContext.storageState();
});

When('I open the group profile', { timeout: 120_000 }, async function (this: CustomWorld) {
  await this.page.goto(`/group/${this.testContext.loadingRegressionGroupId}/profile`, {
    timeout: 90_000,
    waitUntil: 'domcontentloaded',
  });
  await expect(
    this.page.getByText('Loading regression group', { exact: true }).first(),
  ).toBeVisible({ timeout: 90_000 });
});

Then('the group profile content remains available', async function (this: CustomWorld) {
  await expect(this.page.getByRole('button', { name: /Start Conversation|开始对话/ })).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    this.page.getByText('Group profile loading regression', { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(this.page.getByText(/Failed to load|加载失败/, { exact: true })).toHaveCount(0);
  this.attach(await this.takeScreenshot('group-profile-loading'), 'image/png');
});

After({ tags: '@agent-group' }, async function (this: CustomWorld) {
  const id = this.testContext.loadingRegressionGroupId;
  if (!id) return;
  const api = await request.newContext({
    baseURL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3006}`,
    storageState: this.testContext.loadingRegressionAuth,
  });
  try {
    const response = await api.post('/trpc/lambda/group.deleteGroup', {
      data: { json: { id } },
    });
    expect(response.ok()).toBe(true);
  } finally {
    await api.dispose();
  }
});

Given(
  'a topic exists for the group profile navigation regression',
  async function (this: CustomWorld) {
    const groupId = this.testContext.loadingRegressionGroupId;
    const topicResponse = await this.page.request.post('/trpc/lambda/topic.createTopic', {
      data: { json: { groupId, title: 'Profile navigation regression', trigger: 'chat' } },
    });
    expect(topicResponse.ok()).toBe(true);
    const topicId = (await topicResponse.json()).result.data.json;
    this.testContext.loadingRegressionTopicId = topicId;

    const messageResponse = await this.page.request.post('/trpc/lambda/message.createMessage', {
      data: {
        json: {
          content: 'Group topic must survive leaving profile',
          groupId,
          role: 'user',
          topicId,
        },
      },
    });
    expect(messageResponse.ok()).toBe(true);
  },
);

Then('I can return to the selected group topic', async function (this: CustomWorld) {
  await expect(this.page.getByRole('button', { name: /Start Conversation|开始对话/ })).toBeVisible({
    timeout: 15_000,
  });
  await this.page.getByRole('link', { name: 'Profile navigation regression', exact: true }).click();
  await expect(
    this.page.locator('[data-message-id]').getByText('Group topic must survive leaving profile', {
      exact: true,
    }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(this.page).toHaveURL(
    new RegExp(
      `/group/${this.testContext.loadingRegressionGroupId}/${this.testContext.loadingRegressionTopicId}`,
    ),
  );
  this.attach(await this.takeScreenshot('group-profile-return-topic'), 'image/png');
});
