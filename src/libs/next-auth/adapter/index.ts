import type {
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from '@auth/core/adapters';
import { and, eq } from 'drizzle-orm';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Adapter, AdapterAccount } from 'next-auth/adapters';

import { UserModel } from '@/database/models/user';
import * as schema from '@/database/schemas';
import { AgentService } from '@/server/services/agent';
import { merge } from '@/utils/merge';

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

/**
 * @description LobeNextAuthDbAdapter is implemented to handle the database operations
 * for NextAuth, this function do the same things as `src/app/api/webhooks/clerk/route.ts`
 * @returns {Adapter}
 */
export function LobeNextAuthDbAdapter(serverDB: NeonDatabase<typeof schema>): Adapter {
  return {
    async createAuthenticator(authenticator): Promise<AdapterAuthenticator> {
      const result = await serverDB
        .insert(nextauthAuthenticators)
        .values(authenticator)
        .returning()
        .then((res) => res[0] ?? undefined);
      if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to create authenticator');
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },
    async createSession(data): Promise<AdapterSession> {
      return serverDB
        .insert(nextauthSessions)
        .values(data)
        .returning()
        .then((res) => res[0]);
    },
    async createUser(user): Promise<AdapterUser> {
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
    },
    async createVerificationToken(data): Promise<VerificationToken | null | undefined> {
      return serverDB
        .insert(nextauthVerificationTokens)
        .values(data)
        .returning()
        .then((res) => res[0]);
    },
    async deleteSession(sessionToken): Promise<AdapterSession | null | undefined> {
      await serverDB
        .delete(nextauthSessions)
        .where(eq(nextauthSessions.sessionToken, sessionToken));
      return;
    },
    async deleteUser(id): Promise<AdapterUser | null | undefined> {
      const user = await UserModel.findById(serverDB, id);
      if (!user) throw new Error('NextAuth: Delete User not found');

      await UserModel.deleteUser(serverDB, id);
      return;
    },

    async getAccount(providerAccountId, provider): Promise<AdapterAccount | null> {
      return serverDB
        .select()
        .from(nextauthAccounts)
        .where(
          and(
            eq(nextauthAccounts.provider, provider),
            eq(nextauthAccounts.providerAccountId, providerAccountId),
          ),
        )
        .then((res) => res[0] ?? null) as Promise<AdapterAccount | null>;
    },

    async getAuthenticator(credentialID): Promise<AdapterAuthenticator | null> {
      const result = await serverDB
        .select()
        .from(nextauthAuthenticators)
        .where(eq(nextauthAuthenticators.credentialID, credentialID))
        .then((res) => res[0] ?? null);
      if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to get authenticator');
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },

    async getSessionAndUser(sessionToken): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const result = await serverDB
        .select({
          session: nextauthSessions,
          user: users,
        })
        .from(nextauthSessions)
        .where(eq(nextauthSessions.sessionToken, sessionToken))
        .innerJoin(users, eq(users.id, nextauthSessions.userId))
        .then((res) => (res.length > 0 ? res[0] : null));

      if (!result) return null;
      const adapterUser = mapLobeUserToAdapterUser(result.user);
      if (!adapterUser) return null;
      return {
        session: result.session,
        user: adapterUser,
      };
    },

    async getUser(id): Promise<AdapterUser | null> {
      const lobeUser = await UserModel.findById(serverDB, id);
      if (!lobeUser) return null;
      return mapLobeUserToAdapterUser(lobeUser);
    },

    async getUserByAccount(account): Promise<AdapterUser | null> {
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
        .then((res) => res[0]);

      return result?.users ? mapLobeUserToAdapterUser(result.users) : null;
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      const lobeUser =
        email && typeof email === 'string' && email.trim()
          ? await UserModel.findByEmail(serverDB, email)
          : undefined;
      return lobeUser ? mapLobeUserToAdapterUser(lobeUser) : null;
    },

    async linkAccount(data): Promise<AdapterAccount | null | undefined> {
      const [account] = await serverDB
        .insert(nextauthAccounts)
        .values(data as any)
        .returning();
      if (!account) throw new Error('NextAuthAccountModel: Failed to create account');
      // TODO Update type annotation
      return account as any;
    },

    async listAuthenticatorsByUserId(userId): Promise<AdapterAuthenticator[]> {
      const result = await serverDB
        .select()
        .from(nextauthAuthenticators)
        .where(eq(nextauthAuthenticators.userId, userId))
        .then((res) => res);
      if (result.length === 0)
        throw new Error('LobeNextAuthDbAdapter: Failed to get authenticator list');
      return result.map((r) => mapAuthenticatorQueryResutlToAdapterAuthenticator(r));
    },

    // @ts-ignore: The return type is {Promise<void> | Awaitable<AdapterAccount | undefined>}
    async unlinkAccount(account): Promise<void | AdapterAccount | undefined> {
      await serverDB
        .delete(nextauthAccounts)
        .where(
          and(
            eq(nextauthAccounts.provider, account.provider),
            eq(nextauthAccounts.providerAccountId, account.providerAccountId),
          ),
        );
    },

    async updateAuthenticatorCounter(credentialID, counter): Promise<AdapterAuthenticator> {
      const result = await serverDB
        .update(nextauthAuthenticators)
        .set({ counter })
        .where(eq(nextauthAuthenticators.credentialID, credentialID))
        .returning()
        .then((res) => res[0]);
      if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to update authenticator counter');
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },

    async updateSession(data): Promise<AdapterSession | null | undefined> {
      const res = await serverDB
        .update(nextauthSessions)
        .set(data)
        .where(eq(nextauthSessions.sessionToken, data.sessionToken))
        .returning();
      return res[0];
    },

    async updateUser(user): Promise<AdapterUser> {
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
    },

    async useVerificationToken(identifier_token): Promise<VerificationToken | null> {
      return serverDB
        .delete(nextauthVerificationTokens)
        .where(
          and(
            eq(nextauthVerificationTokens.identifier, identifier_token.identifier),
            eq(nextauthVerificationTokens.token, identifier_token.token),
          ),
        )
        .returning()
        .then((res) => (res.length > 0 ? res[0] : null));
    },
  };
}
