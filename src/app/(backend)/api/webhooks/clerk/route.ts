import { NextResponse } from 'next/server';

import { authEnv } from '@/config/auth';
import { isServerMode } from '@/const/version';
import { pino } from '@/libs/logger';
import { UserService } from '@/server/services/user';

import { validateRequest } from './validateRequest';

if (authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH && isServerMode && !authEnv.CLERK_WEBHOOK_SECRET) {
  throw new Error('`CLERK_WEBHOOK_SECRET` environment variable is missing');
}

export const POST = async (req: Request): Promise<NextResponse> => {
  const payload = await validateRequest(req, authEnv.CLERK_WEBHOOK_SECRET!);

  if (!payload) {
    return NextResponse.json(
      { error: 'webhook verification failed or payload was malformed' },
      { status: 400 },
    );
  }

  const { type, data } = payload;

  pino.trace(`clerk webhook payload: ${{ data, type }}`);

  const userService = new UserService();
  switch (type) {
    case 'user.created': {
      pino.info('creating user due to clerk webhook');
      return userService.createUser(data.id, data);
    }
    case 'user.deleted': {
      return userService.deleteUser(data.id);
    }
    case 'user.updated': {
      return userService.updateUser(data.id, data);
    }

    default: {
      pino.warn(
        `${req.url} received event type "${type}", but no handler is defined for this type`,
      );
      return NextResponse.json({ error: `unrecognised payload type: ${type}` }, { status: 400 });
    }
    // case 'user.updated':
    //   break;
    // case 'session.created':
    //   break;
    // case 'session.ended':
    //   break;
    // case 'session.removed':
    //   break;
    // case 'session.revoked':
    //   break;
    // case 'email.created':
    //   break;
    // case 'sms.created':
    //   break;
    // case 'organization.created':
    //   break;
    // case 'organization.updated':
    //   break;
    // case 'organization.deleted':
    //   break;
    // case 'organizationMembership.created':
    //   break;
    // case 'organizationMembership.deleted':
    //   break;
    // case 'organizationMembership.updated':
    //   break;
    // case 'organizationInvitation.accepted':
    //   break;
    // case 'organizationInvitation.created':
    //   break;
    // case 'organizationInvitation.revoked':
    //   break;
  }
};
