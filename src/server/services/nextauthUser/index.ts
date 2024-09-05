import { NextResponse } from 'next/server';

import { UserModel } from '@/database/server/models/user';
import { UserItem } from '@/database/server/schemas/lobechat';
import { pino } from '@/libs/logger';

export class NextAuthUserService {
  safeUpdateUser = async (id: string, data: Partial<UserItem>) => {
    pino.info('updating user due to webhook');
    const userModel = new UserModel();
    // 1. Find User by id from sso provider
    // We using providerAccountId as userId
    let user = await UserModel.findById(id);
    // Should not edit email if user use email linking
    const allowEditEmail = !!user;
    // We using provider email to link accont automatically
    if (!user && data?.email) user = await UserModel.findByEmail(data.email);

    // 2. Update user data from provider
    if (user?.id) {
      let updateContent = {
        avatar: data?.avatar,
        fullName: data?.fullName,
      } as Partial<UserItem>;
      // If allowed to edit email and email changed
      if (allowEditEmail && data?.email && user.email !== data?.email)
        updateContent.email = data.email;
      // Perform update
      await userModel.updateUser(user.id, updateContent);
    } else {
      pino.warn(
        `[logto]: Webhooks handler received event type "${event}", but no user was found by the providerAccountId.`,
      );
    }
    return NextResponse.json({ message: 'user updated', success: true }, { status: 200 });
  };
}
