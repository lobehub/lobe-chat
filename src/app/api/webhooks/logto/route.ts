import { NextResponse } from 'next/server';

import { authEnv } from '@/config/auth';
import { isServerMode } from '@/const/version';
import { UserModel } from '@/database/client/models/user';
import { pino } from '@/libs/logger';

import { validateRequest } from './validateRequest';

if (!authEnv.LOGTO_WEBHOOK_SIGNING_KEY && isServerMode) {
  throw new Error('`LOGTO_WEBHOOK_SIGNING_KEY` environment variable is missing');
}

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

  switch (event) {
    case 'User.Data.Updated': {
      if (data?.avatar) UserModel.updateAvatar(data.avatar);
      return NextResponse.json({ statue: 200 });
    }

    default: {
      pino.warn(
        `${req.url} received event type "${event}", but no handler is defined for this type`,
      );
      return NextResponse.json({ error: `unrecognised payload type: ${event}` }, { status: 400 });
    }
  }
};
