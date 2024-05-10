/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @link https://trpc.io/docs/v11/router
 * @link https://trpc.io/docs/v11/procedures
 */
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';

import type { Context } from '@/server/context';

const t = initTRPC.context<Context>().create({
  /**
   * @link https://trpc.io/docs/v11/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
  /**
   * @link https://trpc.io/docs/v11/data-transformers
   */
  transformer: superjson,
});

/**
 * Create a router
 * @link https://trpc.io/docs/v11/router
 */
export const router = t.router;

/**
 * Create an unprotected procedure
 * @link https://trpc.io/docs/v11/procedures
 **/
export const publicProcedure = t.procedure;

// procedure that asserts that the user is logged in
export const authedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  // `ctx.user` is nullable
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      // ✅ user value is known to be non-null now
      userId: ctx.userId,
    },
  });
});

/**
 * Merge multiple routers together
 * @link https://trpc.io/docs/v11/merging-routers
 */
export const mergeRouters = t.mergeRouters;

/**
 * Create a server-side caller
 * @link https://trpc.io/docs/v11/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;
