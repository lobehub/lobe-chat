import { TRPCError } from '@trpc/server';

import { getServerDB } from '@/database/core/db-adaptor';
import {
  authorizeHeteroCallerToken,
  hasHeteroCallerCapability,
  HeteroCallerTokenError,
} from '@/server/services/heterogeneousAgent/callerToken';

import { validateHeteroOperationClaims } from '../../utils/internalJwt';
import { trpc } from '../init';

export const oidcAuth = trpc.middleware(async (opts) => {
  const { ctx, next } = opts;

  // Check OIDC authentication
  if (ctx.oidcAuth) {
    // A hetero-operation token is accepted here only when it was minted to act
    // as its caller (`caller:act`, device runs), and only for the run's
    // workspace while the run is still going. Any other operation token is
    // limited to heteroIngest / heteroFinish, so a leaked one cannot be
    // replayed against other authed routes.
    if (ctx.oidcAuth.purpose === 'hetero-operation') {
      const claims = validateHeteroOperationClaims(ctx.oidcAuth as Record<string, unknown>);
      if (!claims || !hasHeteroCallerCapability(claims)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'hetero-operation tokens are not accepted on this endpoint',
        });
      }

      try {
        await authorizeHeteroCallerToken({
          claims,
          db: await getServerDB(),
          requestedWorkspaceId: ctx.workspaceId,
        });
      } catch (error) {
        if (!(error instanceof HeteroCallerTokenError)) throw error;
        throw new TRPCError({
          code: error.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
          message: error.message,
        });
      }
    }

    return next({
      ctx: { oidcAuth: ctx.oidcAuth, userId: ctx.oidcAuth.sub },
    });
  }

  return next();
});
