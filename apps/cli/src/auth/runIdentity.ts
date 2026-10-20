import { RUN_USER_ID_ENV } from '@lobechat/heterogeneous-agents/protocol';

import { CLI_PRIMARY_BIN } from '../constants/identity';
import type { AuthSource } from './source';
import { parseJwtPayload } from './source';

/**
 * Refuse to act for a dispatched run as anyone but the user who started it.
 *
 * A device run authenticates its `lh` commands with the initiator's operation
 * token in `LOBEHUB_JWT`. If the agent clears it anyway, or the server predates
 * caller tokens and refuses it, the CLI would fall back to this machine's
 * credentials. On a shared device those belong to the device owner, not the
 * initiator: the write would land under the wrong account, in the run's
 * workspace, without any error. `lh hetero exec` records
 * the initiator in `LOBEHUB_RUN_USER_ID`, and any credential other than
 * `LOBEHUB_JWT` must belong to that user.
 *
 * Returns the reason to refuse, or `undefined` when the source may be used.
 * An API key or service token carries no readable subject, so it cannot prove
 * the match and is refused too. A source with no token passes, so the caller
 * still reports "not logged in" as before.
 */
export function checkRunIdentity(source: AuthSource): string | undefined {
  const runUserId = process.env[RUN_USER_ID_ENV]?.trim();
  if (!runUserId || source.kind === 'env-jwt' || !source.token) return;

  const sub = source.tokenType === 'jwt' ? parseJwtPayload(source.token)?.sub : undefined;
  if (sub === runUserId) return;

  const account = typeof sub === 'string' ? `user ${sub}` : 'an account this CLI cannot identify';

  return (
    `This run was started by user ${runUserId}, but ${source.origin} belongs to ${account}. ` +
    `${CLI_PRIMARY_BIN} will not act for this run as a different account. ` +
    `Tell the user this device is signed in as someone else, so the command cannot run here.`
  );
}

/** {@link checkRunIdentity}, throwing the refusal as an error. */
export function assertRunIdentity(source: AuthSource): void {
  const reason = checkRunIdentity(source);
  if (reason) throw new Error(reason);
}
