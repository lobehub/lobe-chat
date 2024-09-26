import { NextResponse } from 'next/server';

import { serverDB } from '@/database/server';
import { UserModel } from '@/database/server/models/user';
import { UserItem } from '@/database/server/schemas/lobechat';
import { pino } from '@/libs/logger';
import { LobeNextAuthDbAdapter } from '@/libs/next-auth/adapter';

export class NextAuthUserService {
  userModel;
  adapter;

  constructor() {
    this.userModel = new UserModel();
    this.adapter = LobeNextAuthDbAdapter(serverDB);
  }

  safeUpdateUser = async (
    { providerAccountId, provider }: { provider: string; providerAccountId: string },
    data: Partial<UserItem>,
  ) => {
    pino.info('updating user due to webhook');
    // 1. Find User by account
    // @ts-expect-error: Already impl in `LobeNextauthDbAdapter`
    const user = await this.adapter.getUserByAccount({
      provider,
      providerAccountId,
    });

    // 2. If found, Update user data from provider
    if (user?.id) {
      // Perform update
      await this.userModel.updateUser(user.id, {
        avatar: data?.avatar,
        email: data?.email,
        fullName: data?.fullName,
      });
    } else {
      pino.warn(
        `[${provider}]: Webhooks handler user update for "${JSON.stringify(data)}", but no user was found by the providerAccountId.`,
      );
    }
    return NextResponse.json({ message: 'user updated', success: true }, { status: 200 });
  };
}
