import { NextResponse } from 'next/server';

import { authEnv } from '@/config/auth';
import { pino } from '@/libs/logger';
import { NextAuthUserService } from '@/server/services/nextAuthUser';

import { validateRequest } from './validateRequest';

export const POST = async (req: Request): Promise<NextResponse> => {
  const payload = await validateRequest(req, authEnv.LOGTO_WEBHOOK_SIGNING_KEY!);

  if (!payload) {
    return NextResponse.json(
      { error: 'webhook verification failed or payload was malformed' },
      { status: 400 },
    );
  }

  const { event, data } = payload;

  pino.trace(`logto webhook payload: ${{ data, event }}`);

  const nextAuthUserService = new NextAuthUserService();
  switch (event) {
    case 'User.Data.Updated': {
      return nextAuthUserService.safeUpdateUser(
        {
          provider: 'logto',
          providerAccountId: data.id,
        },
        {
          avatar: data?.avatar,
          email: data?.primaryEmail,
          fullName: data?.name,
        },
      );
    }

    default: {
      pino.warn(
        `${req.url} received event type "${event}", but no handler is defined for this type`,
      );
      return NextResponse.json({ error: `unrecognised payload type: ${event}` }, { status: 400 });
    }
  }
};
