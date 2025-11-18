import { NextResponse } from 'next/server';

import { serverDB } from '@/database/server';
import { authEnv } from '@/envs/auth';
import { pino } from '@/libs/logger';
import { UserService } from '@/server/services/user';

import { validateRequest } from './validateRequest';

if (authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH && !authEnv.CLERK_WEBHOOK_SECRET) {
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

  const userService = new UserService(serverDB);
  switch (type) {
    case 'user.created': {
      pino.info('creating user due to clerk webhook');
      const result = await userService.createUser(data.id, data);

      return NextResponse.json(result, { status: 200 });
    }

    case 'user.deleted': {
      if (!data.id) {
        pino.warn('clerk sent a delete user request, but no user ID was included in the payload');
        return NextResponse.json({ message: 'ok' }, { status: 200 });
      }

      pino.info('delete user due to clerk webhook');

      await userService.deleteUser(data.id);

      return NextResponse.json({ message: 'user deleted' }, { status: 200 });
    }

    case 'user.updated': {
      const result = await userService.updateUser(data.id, data);

      return NextResponse.json(result, { status: 200 });
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
