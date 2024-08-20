import { UserJSON } from '@clerk/backend';
import { NextResponse } from 'next/server';

import { UserModel } from '@/database/server/models/user';
import { pino } from '@/libs/logger';

export class UserService {
  createUser = async (id: string, params: UserJSON) => {
    pino.info('creating user due to clerk webhook');

    // Check if user already exists
    const res = await UserModel.findById(id);

    // If user already exists, skip creating a new user
    if (res)
      return NextResponse.json(
        {
          message: 'user not created due to user already existing in the database',
          success: false,
        },
        { status: 200 },
      );

    const email = params.email_addresses.find((e) => e.id === params.primary_email_address_id);
    const phone = params.phone_numbers.find((e) => e.id === params.primary_phone_number_id);

    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */

    // 2. create user in database
    await UserModel.createUser({
      avatar: params.image_url,
      clerkCreatedAt: new Date(params.created_at),
      email: email?.email_address,
      firstName: params.first_name,
      id,
      lastName: params.last_name,
      phone: phone?.phone_number,
      username: params.username,
    });

    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */

    return NextResponse.json({ message: 'user created', success: true }, { status: 200 });
  };

  deleteUser = async (id?: string) => {
    if (id) {
      pino.info('delete user due to clerk webhook');

      await UserModel.deleteUser(id);

      return NextResponse.json({ message: 'user deleted' }, { status: 200 });
    } else {
      pino.warn('clerk sent a delete user request, but no user ID was included in the payload');
      return NextResponse.json({ message: 'ok' }, { status: 200 });
    }
  };

  updateUser = async (id: string, params: UserJSON) => {
    pino.info('updating user due to clerk webhook');

    const userModel = new UserModel();

    // Check if user already exists
    const res = await UserModel.findById(id);

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
}
