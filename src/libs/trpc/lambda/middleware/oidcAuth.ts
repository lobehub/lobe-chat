import { trpc } from '../init';

export const oidcAuth = trpc.middleware(async (opts) => {
  const { ctx, next } = opts;

  // 检查 OIDC 认证
  if (ctx.oidcAuth) {
    return next({
      ctx: { oidcAuth: ctx.oidcAuth, userId: ctx.oidcAuth.sub },
    });
  }

  return next();
});
