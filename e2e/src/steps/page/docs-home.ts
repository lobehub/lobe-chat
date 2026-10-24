/**
 * Docs home navigation helpers shared by the page step files.
 *
 * Pages live in Docs now (`/resource`). A returning user also gets the one-time
 * "Pages and Resources are now Docs" notice, which is a modal and therefore
 * intercepts clicks on the quick actions underneath it — every page scenario
 * timed out on the create step until the notice was dismissed.
 *
 * The notice mounts only after the user preference is loaded, so it can appear
 * a few seconds *after* the Docs home itself renders. Every helper that clicks
 * inside Docs therefore re-checks for it instead of dismissing it once and
 * assuming it stays gone.
 */
import type { CustomWorld } from '../../support/world';

/**
 * The modal title is read when the notice opens and can still be the raw key if the `file`
 * namespace has not loaded, so the always-translated intro identifies the notice too.
 */
const NOTICE_TEXT =
  /Pages and Resources are now (Docs|one place)|「文稿」和「资源」已(经)?合并为「云文档」/;
const NOTICE_CONFIRM = /^(Got it|知道了|我知道了)$/;

/** How long to wait for a late-mounting notice before deciding it is absent. */
const NOTICE_APPEAR_TIMEOUT = 4000;

/** Dismiss the merge notice when it is on screen; a no-op otherwise. */
export async function dismissDocsMergeNotice(
  world: CustomWorld,
  appearTimeout: number = NOTICE_APPEAR_TIMEOUT,
): Promise<void> {
  const title = world.page.getByText(NOTICE_TEXT).first();

  await title.waitFor({ state: 'visible', timeout: appearTimeout }).catch(() => {});
  if (!(await title.isVisible().catch(() => false))) return;

  const confirm = world.page.getByRole('button', { name: NOTICE_CONFIRM }).first();
  await confirm.click({ timeout: 5000 }).catch(() => {});
  await title.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

/** Load the Docs home with any one-time notice out of the way. */
export async function openDocsHome(world: CustomWorld): Promise<void> {
  await world.page.goto('/resource');
  await world.page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
  await dismissDocsMergeNotice(world);
}
