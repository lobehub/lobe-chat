import { eq } from 'drizzle-orm';
import type { AdapterAccount } from 'next-auth/adapters';
import { NextResponse } from 'next/server';

import { UserModel } from '@/database/models/user';
import { UserItem, nextauthAccounts, nextauthSessions } from '@/database/schemas';
import { serverDB } from '@/database/server';
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
      return NextResponse.json({ message: 'user not found', success: false }, { status: 200 });
    }
    return NextResponse.json({ message: 'user updated', success: true }, { status: 200 });
  };

  invokeSession = async ({
    providerAccountId,
    provider,
  }: {
    provider: string;
    providerAccountId: string;
  }) => {
    // 1. Find User by account
    // @ts-expect-error: Already impl in `LobeNextauthDbAdapter`
    const user = await this.adapter.getUserByAccount({
      provider,
      providerAccountId,
    });
    // 2. If found, Invalidate user session
    if (user?.id) {
      await serverDB.delete(nextauthSessions).where(eq(nextauthSessions.userId, user.id));
      pino.info(
        `Invoke user session "${JSON.stringify({ provider, providerAccountId })}" due to webhook`,
      );
    } else {
      pino.warn(
        `[${provider}]: Webhooks handler user "${JSON.stringify({ provider, providerAccountId })}" session invoke, but no user was found by the providerAccountId.`,
      );
      return NextResponse.json({ message: 'user not found', success: false }, { status: 200 });
    }
    return NextResponse.json({ message: 'session invoked', success: true }, { status: 200 });
  };

  unlinkSSOProvider = async ({
    provider,
    providerAccountId,
    userId,
  }: {
    provider: string;
    providerAccountId: string;
    userId: string;
  }) => {
    if (
      this.adapter?.unlinkAccount &&
      typeof this.adapter.unlinkAccount === 'function' &&
      this.adapter?.getAccount &&
      typeof this.adapter.getAccount === 'function'
    ) {
      const account = await this.adapter.getAccount(providerAccountId, provider);
      // The userId can either get from ctx.nextAuth?.id or ctx.userId
      if (!account || account.userId !== userId) throw new Error('The account does not exist');
      await this.adapter.unlinkAccount({ provider, providerAccountId });
    } else {
      throw new Error('Adapter does not support unlinking accounts');
    }
  };

  getUserSSOProviders = async (userId: string) => {
    const result = await serverDB
      .select({
        expiresAt: nextauthAccounts.expires_at,
        provider: nextauthAccounts.provider,
        providerAccountId: nextauthAccounts.providerAccountId,
        scope: nextauthAccounts.scope,
        type: nextauthAccounts.type,
        userId: nextauthAccounts.userId,
      })
      .from(nextauthAccounts)
      .where(eq(nextauthAccounts.userId, userId));
    return result as unknown as AdapterAccount[];
  };
}
