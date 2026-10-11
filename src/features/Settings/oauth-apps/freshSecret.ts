/**
 * One-shot handoff of a just-issued client secret from the create flow to the
 * app detail page it navigates to.
 *
 * The plaintext lives only in memory: router state would persist it into
 * `history.state` (and so session storage), which outlives the page.
 */
const pending = new Map<string, string>();

export const stashFreshSecret = (appId: string, secret: string) => {
  pending.set(appId, secret);
};

export const peekFreshSecret = (appId: string): string | undefined => pending.get(appId);

export const clearFreshSecret = (appId: string) => {
  pending.delete(appId);
};
