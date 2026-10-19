import type { Operation, TRPCLink } from '@trpc/client';
import { isTRPCClientError } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';

import { getValidToken } from '../auth/refresh';
import { parseJwtPayload } from '../auth/source';
import { log } from '../utils/logger';

/**
 * Device-dispatched runs (desktop gateway, `lh connect`) carry the run's narrow
 * `hetero-operation` token in `LOBEHUB_JWT`. It is accepted by the operation
 * endpoints (`heteroIngest`, `goal.*Operation`, …) and refused by every
 * user-scoped one, while it still outranks the machine's stored login. So an
 * agent's `lh doc` / `lh kb` / … failed until the agent itself cleared the
 * variable — an instruction the `lh` guide had to teach, and one an agent then
 * applied to errors it did not fit.
 *
 * The refusal is a fixed `oidcAuth` answer, so the client recognises exactly it
 * and re-sends that one request with the stored login — but only when that
 * login is the same account the operation token was minted for. A workspace
 * device is reachable by every member, so the machine's login can belong to
 * someone other than the member whose run this is; borrowing it would read and
 * write that person's data. Everything else is unchanged: operation endpoints
 * keep the operation token, and the workspace header stays the run's own scope
 * (`LOBEHUB_WORKSPACE_ID` or personal) — which the manual fallback did not do,
 * since an empty `LOBEHUB_JWT` re-enables the terminal's persisted
 * `lh workspace use` scope.
 */

/** `oidcAuth`'s message when an operation token reaches a user-scoped route. */
export const OPERATION_TOKEN_REFUSAL = 'hetero-operation tokens are not accepted on this endpoint';

/** Operation-context flag on the request the fallback link re-sends. */
const USE_STORED_LOGIN = 'useStoredLogin';

export const isOperationToken = (token: string | undefined): boolean =>
  !!token && parseJwtPayload(token)?.purpose === 'hetero-operation';

const subjectOf = (token: string) => {
  const sub = parseJwtPayload(token)?.sub;
  return typeof sub === 'string' && sub ? sub : undefined;
};

export const isOperationTokenRefusal = (error: unknown): boolean =>
  isTRPCClientError(error) &&
  error.data?.code === 'UNAUTHORIZED' &&
  error.message === OPERATION_TOKEN_REFUSAL;

/**
 * Retry a request whose operation token was refused, once, flagged so the
 * headers callback answers with the stored login instead.
 */
export const operationTokenFallbackLink =
  <TRouter extends AnyRouter>(): TRPCLink<TRouter> =>
  () =>
  ({ next, op }) =>
    observable((observer) => {
      let subscription = next(op).subscribe({
        complete: () => observer.complete(),
        error: (error) => {
          if (op.context[USE_STORED_LOGIN] || !isOperationTokenRefusal(error)) {
            observer.error(error);
            return;
          }
          log.debug(`${op.path}: operation token refused, retrying with the stored login`);
          subscription = next({
            ...op,
            context: { ...op.context, [USE_STORED_LOGIN]: true },
          }).subscribe(observer);
        },
        next: (value) => observer.next(value),
      });

      return () => subscription.unsubscribe();
    });

/**
 * The stored login, when it is usable and belongs to the operation token's own
 * account.
 */
const storedLoginFor = async (operationToken: string): Promise<string | undefined> => {
  const result = await getValidToken().catch(() => undefined);
  if (result?.status !== 'ok') return;

  const owner = subjectOf(operationToken);
  const stored = result.credentials.accessToken;
  return owner && subjectOf(stored) === owner ? stored : undefined;
};

/**
 * Auth headers for a client holding an operation token: the token itself, or
 * the stored login on a request `operationTokenFallbackLink` re-sent. Without a
 * stored login of the same account the retry carries the token again and fails
 * as before.
 */
export const operationTokenHeaders =
  (operationToken: () => string) =>
  (opts?: { op?: Operation }): Record<string, string> | Promise<Record<string, string>> => {
    const token = operationToken();
    if (!opts?.op?.context[USE_STORED_LOGIN]) return { 'Oidc-Auth': token };

    return storedLoginFor(token).then((stored) => ({ 'Oidc-Auth': stored ?? token }));
  };
