import { NextResponse } from 'next/server';

import { authEnv } from '@/config/auth';
import { pino } from '@/libs/logger';
import { NextAuthUserService } from '@/server/services/nextAuthUser';

import { validateRequest } from './validateRequest';

export const POST = async (req: Request): Promise<NextResponse> => {
  const payload = await validateRequest(req, authEnv.CASDOOR_WEBHOOK_SECRET);

  if (!payload) {
    return NextResponse.json(
      { error: 'webhook verification failed or payload was malformed' },
      { status: 400 },
    );
  }

  const { action, extendedUser } = payload;

  pino.trace(`casdoor webhook payload: ${{ action, extendedUser }}`);

  const nextAuthUserService = new NextAuthUserService();
  switch (action) {
    case 'update-user': {
      return nextAuthUserService.safeUpdateUser(extendedUser.id, {
        avatar: extendedUser?.avatar,
        email: extendedUser?.email,
        fullName: extendedUser.displayName,
      });
    }

    default: {
      pino.warn(
        `${req.url} received event type "${action}", but no handler is defined for this type`,
      );
      return NextResponse.json({ error: `unrecognised payload type: ${action}` }, { status: 400 });
    }
  }
};
