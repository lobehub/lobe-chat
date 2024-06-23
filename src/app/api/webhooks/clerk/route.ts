import { UserJSON } from '@clerk/backend';
import { NextResponse } from 'next/server';

import { authEnv } from '@/config/auth';
import { isServerMode } from '@/const/version';
import { UserModel } from '@/database/server/models/user';
import { pino } from '@/libs/logger';

import { validateRequest } from './validateRequest';

if (authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH && isServerMode && !authEnv.CLERK_WEBHOOK_SECRET) {
  throw new Error('`CLERK_WEBHOOK_SECRET` environment variable is missing');
}

const createUser = async (id: string, params: UserJSON) => {
  pino.info('creating user due to clerk webhook');

  const userModel = new UserModel();

  // Check if user already exists
  const res = await userModel.findById(id);

  // If user already exists, skip creating a new user
  if (res)
    return NextResponse.json(
      { message: 'user not created due to user already existing in the database', success: false },
      { status: 200 },
    );

  const email = params.email_addresses.find((e) => e.id === params.primary_email_address_id);
  const phone = params.phone_numbers.find((e) => e.id === params.primary_phone_number_id);

  await userModel.createUser({
    avatar: params.image_url,
    clerkCreatedAt: new Date(params.created_at),
    email: email?.email_address,
    firstName: params.first_name,
    id,
    lastName: params.last_name,
    phone: phone?.phone_number,
    username: params.username,
  });

  return NextResponse.json({ message: 'user created', success: true }, { status: 200 });
};

const deleteUser = async (id?: string) => {
  if (id) {
    pino.info('delete user due to clerk webhook');
    const userModel = new UserModel();

    await userModel.deleteUser(id);

    return NextResponse.json({ message: 'user deleted' }, { status: 200 });
  } else {
    pino.warn('clerk sent a delete user request, but no user ID was included in the payload');
    return NextResponse.json({ message: 'ok' }, { status: 200 });
  }
};

const updateUser = async (id: string, params: UserJSON) => {
  pino.info('updating user due to clerk webhook');

  const userModel = new UserModel();

  // Check if user already exists
  const res = await userModel.findById(id);

  // If user not exists, skip update the user
  if (!res)
    return NextResponse.json(
      {
        message: "user not updated due to the user don't existing in the database",
        success: false,
      },
      { status: 200 },
    );

  const email = params.email_addresses.find((e) => e.id === params.primary_email_address_id);
  const phone = params.phone_numbers.find((e) => e.id === params.primary_phone_number_id);

  await userModel.updateUser(id, {
    avatar: params.image_url,
    email: email?.email_address,
    firstName: params.first_name,
    id,
    lastName: params.last_name,
    phone: phone?.phone_number,
    username: params.username,
  });

  return NextResponse.json({ message: 'user updated', success: true }, { status: 200 });
};

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

  switch (type) {
    case 'user.created': {
      return createUser(data.id, data);
    }
    case 'user.deleted': {
      return deleteUser(data.id);
    }
    case 'user.updated': {
      return updateUser(data.id, data);
    }

    default: {
      pino.warn(
        `${req.url} received event type "${type}", but no handler is defined for this type`,
      );
      return NextResponse.json({ error: `uncreognised payload type: ${type}` }, { status: 400 });
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
