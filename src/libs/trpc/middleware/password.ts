import { TRPCError } from '@trpc/server';

import { getJWTPayload } from '@/app/api/middleware/auth/utils';
import { getAppConfig } from '@/config/app';
import { trpc } from '@/libs/trpc/init';

export const passwordChecker = trpc.middleware(async (opts) => {
  const { ACCESS_CODES } = getAppConfig();

  const { ctx } = opts;

  if (!ctx.authorizationHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const jwtPayload = await getJWTPayload(ctx.authorizationHeader);

  // if there are access codes, check if the user has set correct one
  if (ACCESS_CODES && ACCESS_CODES.length > 0) {
    const accessCode = jwtPayload.accessCode;

    if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
  }

  return opts.next({ ctx: { jwtPayload } });
});
