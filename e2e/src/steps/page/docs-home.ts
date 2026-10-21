/**
 * Docs home navigation helpers shared by the page step files.
 *
 * Pages live in Docs now (`/resource`). A returning user also gets the one-time
 * "Pages and Resources are now Docs" notice, which is a modal and therefore
 * intercepts clicks on the quick actions underneath it — every page scenario
 * timed out on the create step until the notice was dismissed.
 */
import type { CustomWorld } from '../../support/world';

const NOTICE_TITLE = /Pages and Resources are now Docs|页面和资源已合并为 Docs/;
const NOTICE_CONFIRM = /^(Got it|知道了|我知道了)$/;

/** Dismiss the merge notice when it is on screen; a no-op otherwise. */
export async function dismissDocsMergeNotice(world: CustomWorld): Promise<void> {
  const title = world.page.getByText(NOTICE_TITLE).first();

  try {
    await title.waitFor({ state: 'visible', timeout: 2000 });
  } catch {
    return;
  }

  const confirm = world.page.getByRole('button', { name: NOTICE_CONFIRM }).first();
  await confirm.click({ timeout: 5000 });
  await title.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

/** Load the Docs home with any one-time notice out of the way. */
export async function openDocsHome(world: CustomWorld): Promise<void> {
  await world.page.goto('/resource');
  await world.page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
  await dismissDocsMergeNotice(world);
}
