import { markProjectionReset, subscribeRemoteProjectionReset } from '@/libs/queryProjectionStorage';

/**
 * Switching the Desktop data context (connecting to another server,
 * disconnecting) replaces every piece of user data the renderers hold.
 *
 * Wiping it in place cannot be made airtight: requests already in flight to
 * the previous server, state in every store, other windows (topic popups) and
 * workspaces the user visited each keep their own copy. So the reset retires
 * every persisted projection (`markProjectionReset`) and reloads the renderer;
 * other windows see the shared epoch change and reload too.
 */
export const dataContextReset = {
  reload: () => window.location.reload(),
};

/** Retire the previous context's persisted data, then reload this renderer. */
export const resetDataContext = async (): Promise<void> => {
  await markProjectionReset();
  dataContextReset.reload();
};

/** Reload this renderer when another window resets the data context. Call once per entry. */
export const followDataContextReset = (): (() => void) =>
  subscribeRemoteProjectionReset(() => dataContextReset.reload());
