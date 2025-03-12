import { NextResponse } from 'next/server';

import { UserItem } from '@/database/schemas';
import { serverDB } from '@/database/server';
import { UserModel } from '@/database/server/models/user';
import { pino } from '@/libs/logger';
import { LobeNextAuthDbAdapter } from '@/libs/next-auth/adapter';

export class NextAuthUserService {
  adapter;

  constructor() {
    this.adapter = LobeNextAuthDbAdapter(serverDB);
  }

  safeUpdateUser = async (
    { providerAccountId, provider }: { provider: string; providerAccountId: string },
    data: Partial<UserItem>,
  ) => {
    pino.info(`updating user "${JSON.stringify({ provider, providerAccountId })}" due to webhook`);
    // 1. Find User by account
    // @ts-expect-error: Already impl in `LobeNextauthDbAdapter`
    const user = await this.adapter.getUserByAccount({
      provider,
      providerAccountId,
    });

    // 2. If found, Update user data from provider
    if (user?.id) {
      const userModel = new UserModel(serverDB, user.id);

      // Perform update
      await userModel.updateUser({
        avatar: data?.avatar,
        email: data?.email,
        fullName: data?.fullName,
      });
    } else {
      pino.warn(
        `[${provider}]: Webhooks handler user "${JSON.stringify({ provider, providerAccountId })}" update for "${JSON.stringify(data)}", but no user was found by the providerAccountId.`,
      );
    }
    return NextResponse.json({ message: 'user updated', success: true }, { status: 200 });
  };
}
