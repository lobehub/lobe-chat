/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @link https://trpc.io/docs/v11/router
 * @link https://trpc.io/docs/v11/procedures
 */
import { DESKTOP_USER_ID } from '@/const/desktop';
import { isDesktop } from '@/const/version';

import { userAuth } from '../middleware/userAuth';
import { edgeTrpc } from './init';
import { jwtPayloadChecker } from './middleware/jwtPayload';

/**
 * Create a router
 * @link https://trpc.io/docs/v11/router
 */
export const router = edgeTrpc.router;

/**
 * Create an unprotected procedure
 * @link https://trpc.io/docs/v11/procedures
 **/
export const publicProcedure = edgeTrpc.procedure.use(({ next, ctx }) => {
  return next({
    ctx: { userId: isDesktop ? DESKTOP_USER_ID : ctx.userId },
  });
});

// procedure that asserts that the user is logged in
export const authedProcedure = edgeTrpc.procedure.use(userAuth);

// procedure that asserts that the user add the password
export const passwordProcedure = edgeTrpc.procedure.use(jwtPayloadChecker);

/**
 * Merge multiple routers together
 * @link https://trpc.io/docs/v11/merging-routers
 */
export const mergeRouters = edgeTrpc.mergeRouters;

/**
 * Create a server-side caller
 * @link https://trpc.io/docs/v11/server/server-side-calls
 */
export const createCallerFactory = edgeTrpc.createCallerFactory;
