import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../../support/world';

// ============================================
// Then Steps (Assertions)
// ============================================

// Home Page Steps
Then('I should see the featured assistants section', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for featured assistants section by data-testid or heading
  const featuredSection = this.page
    .locator(
      '[data-testid="featured-assistants"], h2:has-text("Featured"), h3:has-text("Featured")',
    )
    .first();
  await expect(featuredSection).toBeVisible({ timeout: 120_000 });
});

Then('I should see the featured MCP tools section', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for featured MCP section by data-testid or heading
  const mcpSection = this.page
    .locator('[data-testid="featured-mcp"], h2:has-text("MCP"), h3:has-text("MCP")')
    .first();
  await expect(mcpSection).toBeVisible({ timeout: 120_000 });
});

// Assistant List Page Steps
Then('I should see the search bar', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // The SearchBar component from @lobehub/ui may not pass through data-testid
  // Try to find the input element within the search component
  const searchBar = this.page.locator('input[type="text"]').first();
  await expect(searchBar).toBeVisible({ timeout: 120_000 });
});

Then('I should see the category menu', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for category menu/filter by data-testid or role
  const categoryMenu = this.page
    .locator('[data-testid="category-menu"], [role="menu"], nav[aria-label*="categor" i]')
    .first();
  await expect(categoryMenu).toBeVisible({ timeout: 120_000 });
});

Then('I should see assistant cards', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for assistant items by data-testid
  const assistantItems = this.page.locator('[data-testid="assistant-item"]');

  // Wait for at least one item to be visible
  await expect(assistantItems.first()).toBeVisible({ timeout: 120_000 });

  // Check we have multiple items
  const count = await assistantItems.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see pagination controls', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for pagination controls by data-testid, role, or common pagination elements
  const pagination = this.page
    .locator(
      '[data-testid="pagination"], nav[aria-label*="pagination" i], .pagination, button:has-text("Next"), button:has-text("Previous")',
    )
    .first();
  await expect(pagination).toBeVisible({ timeout: 120_000 });
});

// Model List Page Steps
Then('I should see model cards', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for model items by data-testid
  const modelItems = this.page.locator('[data-testid="model-item"]');

  // Wait for at least one item to be visible
  await expect(modelItems.first()).toBeVisible({ timeout: 120_000 });

  // Check we have multiple items
  const count = await modelItems.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see the sort dropdown', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for sort dropdown by data-testid, role, or select element
  const sortDropdown = this.page
    .locator(
      '[data-testid="sort-dropdown"], select, button[aria-label*="sort" i], [role="combobox"]',
    )
    .first();
  await expect(sortDropdown).toBeVisible({ timeout: 120_000 });
});

// Provider List Page Steps
Then('I should see provider cards', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for provider items by data-testid
  const providerItems = this.page.locator('[data-testid="provider-item"]');

  // Wait for at least one item to be visible
  await expect(providerItems.first()).toBeVisible({ timeout: 120_000 });

  // Check we have multiple items
  const count = await providerItems.count();
  expect(count).toBeGreaterThan(0);
});

// MCP List Page Steps
Then('I should see MCP cards', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for MCP items by data-testid
  const mcpItems = this.page.locator('[data-testid="mcp-item"]');

  // Wait for at least one item to be visible
  await expect(mcpItems.first()).toBeVisible({ timeout: 120_000 });

  // Check we have multiple items
  const count = await mcpItems.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see the category filter', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });

  // Look for category filter by data-testid or similar to category menu
  const categoryFilter = this.page
    .locator(
      '[data-testid="category-filter"], [data-testid="category-menu"], [role="menu"], nav[aria-label*="categor" i]',
    )
    .first();
  await expect(categoryFilter).toBeVisible({ timeout: 120_000 });
});
