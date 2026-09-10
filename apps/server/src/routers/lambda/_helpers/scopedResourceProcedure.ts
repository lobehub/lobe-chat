import { TRPCError } from '@trpc/server';

import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { trpc } from '@/libs/trpc/lambda/init';

/** Personal requests are allowed, but an explicit workspace must never fall back to personal data. */
export const scopedResourceProcedure = trpc.procedure
  .use(async ({ ctx, next }) => next({ ctx: { requestedResourceWorkspaceId: ctx.workspaceId } }))
  .concat(wsCompatProcedure)
  .use(async ({ ctx, next }) => {
    if (ctx.requestedResourceWorkspaceId && ctx.requestedResourceWorkspaceId !== ctx.workspaceId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Workspace is no longer accessible' });
    }
    return next();
  });
