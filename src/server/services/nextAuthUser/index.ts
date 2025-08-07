import { and, eq } from 'drizzle-orm';
import { Adapter, AdapterAccount } from 'next-auth/adapters';
import { NextResponse } from 'next/server';

import { UserModel } from '@/database/models/user';
import { UserItem } from '@/database/schemas';
import * as schema from '@/database/schemas';
import { serverDB } from '@/database/server';
import { pino } from '@/libs/logger';
import { merge } from '@/utils/merge';

import { AgentService } from '../agent';
import {
  mapAdapterUserToLobeUser,
  mapAuthenticatorQueryResutlToAdapterAuthenticator,
  mapLobeUserToAdapterUser,
  partialMapAdapterUserToLobeUser,
} from './utils';

const {
  nextauthAccounts,
  nextauthAuthenticators,
  nextauthSessions,
  nextauthVerificationTokens,
  users,
} = schema;

export class NextAuthUserService {
  safeUpdateUser = async (
    { providerAccountId, provider }: { provider: string; providerAccountId: string },
    data: Partial<UserItem>,
  ) => {
    pino.info(`updating user "${JSON.stringify({ provider, providerAccountId })}" due to webhook`);
    // 1. Find User by account
    const user = await this.getUserByAccount({
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

  createAuthenticator: NonNullable<Adapter['createAuthenticator']> = async (authenticator) => {
    return serverDB
      .insert(nextauthAuthenticators)
      .values(authenticator)
      .returning()
      .then((res: any) => res[0] ?? undefined);
  };

  createSession: NonNullable<Adapter['createSession']> = async (data) => {
    return serverDB
      .insert(nextauthSessions)
      .values(data)
      .returning()
      .then((res: any) => res[0]);
  };

  createUser: NonNullable<Adapter['createUser']> = async (user) => {
    const { id, name, email, emailVerified, image, providerAccountId } = user;
    // return the user if it already exists
    let existingUser =
      email && typeof email === 'string' && email.trim()
        ? await UserModel.findByEmail(serverDB, email)
        : undefined;
    // If the user is not found by email, try to find by providerAccountId
    if (!existingUser && providerAccountId) {
      existingUser = await UserModel.findById(serverDB, providerAccountId);
    }
    if (existingUser) {
      const adapterUser = mapLobeUserToAdapterUser(existingUser);
      return adapterUser;
    }

    // create a new user if it does not exist
    // Use id from provider if it exists, otherwise use id assigned by next-auth
    // ref: https://github.com/lobehub/lobe-chat/pull/2935
    const uid = providerAccountId ?? id;
    await UserModel.createUser(
      serverDB,
      mapAdapterUserToLobeUser({
        email,
        emailVerified,
        // Use providerAccountId as userid to identify if the user exists in a SSO provider
        id: uid,
        image,
        name,
      }),
    );

    // 3. Create an inbox session for the user
    const agentService = new AgentService(serverDB, uid);
    await agentService.createInbox();

    return { ...user, id: uid };
  };

  createVerificationToken: NonNullable<Adapter['createVerificationToken']> = async (data) => {
    return await serverDB
      .insert(nextauthVerificationTokens)
      .values(data)
      .returning()
      .then((res: any) => res[0]);
  };

  deleteSession: NonNullable<Adapter['deleteSession']> = async (sessionToken) => {
    await serverDB.delete(nextauthSessions).where(eq(nextauthSessions.sessionToken, sessionToken));
  };

  deleteUser: NonNullable<Adapter['deleteUser']> = async (id) => {
    const user = await UserModel.findById(serverDB, id);
    if (!user) throw new Error('NextAuth: Delete User not found');
    await UserModel.deleteUser(serverDB, id);
  };

  getAccount: NonNullable<Adapter['getAccount']> = async (providerAccountId, provider) => {
    return (await serverDB
      .select()
      .from(nextauthAccounts)
      .where(
        and(
          eq(nextauthAccounts.provider, provider),
          eq(nextauthAccounts.providerAccountId, providerAccountId),
        ),
      )
      .then((res: any) => res[0] ?? null)) as Promise<AdapterAccount | null>;
  };

  getAuthenticator: NonNullable<Adapter['getAuthenticator']> = async (credentialID) => {
    const result = await serverDB
      .select()
      .from(nextauthAuthenticators)
      .where(eq(nextauthAuthenticators.credentialID, credentialID))
      .then((res) => res[0] ?? null);
    if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to get authenticator');
    return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
  };

  getSessionAndUser: NonNullable<Adapter['getSessionAndUser']> = async (sessionToken) => {
    const result = await serverDB
      .select({
        session: nextauthSessions,
        user: users,
      })
      .from(nextauthSessions)
      .where(eq(nextauthSessions.sessionToken, sessionToken))
      .innerJoin(users, eq(users.id, nextauthSessions.userId))
      .then((res: any) => (res.length > 0 ? res[0] : null));

    if (!result) return null;
    const adapterUser = mapLobeUserToAdapterUser(result.user);
    if (!adapterUser) return null;
    return {
      session: result.session,
      user: adapterUser,
    };
  };

  getUser: NonNullable<Adapter['getUser']> = async (id) => {
    const lobeUser = await UserModel.findById(serverDB, id);
    if (!lobeUser) return null;
    return mapLobeUserToAdapterUser(lobeUser);
  };

  getUserByAccount: NonNullable<Adapter['getUserByAccount']> = async (account) => {
    const result = await serverDB
      .select({
        account: nextauthAccounts,
        users,
      })
      .from(nextauthAccounts)
      .innerJoin(users, eq(nextauthAccounts.userId, users.id))
      .where(
        and(
          eq(nextauthAccounts.provider, account.provider),
          eq(nextauthAccounts.providerAccountId, account.providerAccountId),
        ),
      )
      .then((res: any) => res[0]);

    return result?.users ? mapLobeUserToAdapterUser(result.users) : null;
  };

  getUserByEmail: NonNullable<Adapter['getUserByEmail']> = async (email) => {
    const lobeUser =
      email && typeof email === 'string' && email.trim()
        ? await UserModel.findByEmail(serverDB, email)
        : undefined;
    return lobeUser ? mapLobeUserToAdapterUser(lobeUser) : null;
  };

  linkAccount: NonNullable<Adapter['linkAccount']> = async (data) => {
    const [account] = await serverDB
      .insert(nextauthAccounts)
      .values(data as any)
      .returning();
    if (!account) throw new Error('NextAuthAccountModel: Failed to create account');
    // TODO Update type annotation
    return account as any;
  };

  listAuthenticatorsByUserId: NonNullable<Adapter['listAuthenticatorsByUserId']> = async (
    userId,
  ) => {
    const result = await serverDB
      .select()
      .from(nextauthAuthenticators)
      .where(eq(nextauthAuthenticators.userId, userId))
      .then((res: any) => res);
    if (result.length === 0)
      throw new Error('LobeNextAuthDbAdapter: Failed to get authenticator list');
    return result.map((r: any) => mapAuthenticatorQueryResutlToAdapterAuthenticator(r));
  };

  unlinkAccount: NonNullable<Adapter['unlinkAccount']> = async (account) => {
    await serverDB
      .delete(nextauthAccounts)
      .where(
        and(
          eq(nextauthAccounts.provider, account.provider),
          eq(nextauthAccounts.providerAccountId, account.providerAccountId),
        ),
      );
  };

  updateAuthenticatorCounter: NonNullable<Adapter['updateAuthenticatorCounter']> = async (
    credentialID,
    counter,
  ) => {
    const result = await serverDB
      .update(nextauthAuthenticators)
      .set({ counter })
      .where(eq(nextauthAuthenticators.credentialID, credentialID))
      .returning()
      .then((res: any) => res[0]);
    if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to update authenticator counter');
    return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
  };

  updateSession: NonNullable<Adapter['updateSession']> = async (data) => {
    const res = await serverDB
      .update(nextauthSessions)
      .set(data)
      .where(eq(nextauthSessions.sessionToken, data.sessionToken))
      .returning();
    return res[0];
  };

  updateUser: NonNullable<Adapter['updateUser']> = async (user) => {
    const lobeUser = await UserModel.findById(serverDB, user?.id);
    if (!lobeUser) throw new Error('NextAuth: User not found');
    const userModel = new UserModel(serverDB, user.id);

    const updatedUser = await userModel.updateUser({
      ...partialMapAdapterUserToLobeUser(user),
    });
    if (!updatedUser) throw new Error('NextAuth: Failed to update user');

    // merge new user data with old user data
    const newAdapterUser = mapLobeUserToAdapterUser(lobeUser);
    if (!newAdapterUser) {
      throw new Error('NextAuth: Failed to map user data to adapter user');
    }
    return merge(newAdapterUser, user);
  };

  useVerificationToken: NonNullable<Adapter['useVerificationToken']> = async (identifier_token) => {
    return serverDB
      .delete(nextauthVerificationTokens)
      .where(
        and(
          eq(nextauthVerificationTokens.identifier, identifier_token.identifier),
          eq(nextauthVerificationTokens.token, identifier_token.token),
        ),
      )
      .returning()
      .then((res: any) => (res.length > 0 ? res[0] : null));
  };
}
