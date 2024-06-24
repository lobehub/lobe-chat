import { and, eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Adapter, AdapterAccount } from 'next-auth/adapters';

import { UserModel } from '@/database/server/models/user';
import * as schema from '@/database/server/schemas/lobechat';
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
  const userModel = new UserModel();

  return {
    async createAuthenticator(authenticator) {
      const result = await serverDB
        .insert(nextauthAuthenticators)
        .values(authenticator)
        .returning()
        .then((res) => res[0] ?? undefined);
      if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to create authenticator');
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },
    createSession: async (data) => {
      return serverDB
        .insert(nextauthSessions)
        .values(data)
        .returning()
        .then((res) => res[0]);
    },
    createUser: async (user) => {
      const { id, name, email, emailVerified, image } = user;
      await userModel.createUser(
        mapAdapterUserToLobeUser({ email, emailVerified, id, image, name }),
      );
      return user;
    },
    createVerificationToken: async (data) => {
      return serverDB
        .insert(nextauthVerificationTokens)
        .values(data)
        .returning()
        .then((res) => res[0]);
    },
    deleteSession: async (sessionToken) => {
      await serverDB
        .delete(nextauthSessions)
        .where(eq(nextauthSessions.sessionToken, sessionToken));
    },

    deleteUser: async (id) => {
      const user = await userModel.findById(id);
      if (!user) throw new Error('NextAuth: Delete User not found');

      await userModel.deleteUser(id);
    },

    async getAccount(providerAccountId, provider) {
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

    async getAuthenticator(credentialID) {
      const result = await serverDB
        .select()
        .from(nextauthAuthenticators)
        .where(eq(nextauthAuthenticators.credentialID, credentialID))
        .then((res) => res[0] ?? null);
      if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to get authenticator');
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },

    getSessionAndUser: async (sessionToken) => {
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

    getUser: async (id) => {
      try {
        const lobeUser = await userModel.findById(id);
        return mapLobeUserToAdapterUser(lobeUser);
      } catch {
        return null;
      }
    },

    getUserByAccount: async (account) => {
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

    getUserByEmail: async (email) => {
      const lobeUser = await userModel.findByEmail(email);
      return mapLobeUserToAdapterUser(lobeUser) ?? null;
    },

    linkAccount: async (data) => {
      const [account] = await serverDB
        .insert(nextauthAccounts)
        .values(data as any)
        .returning();
      if (!account) throw new Error('NextAuthAccountModel: Failed to create account');
      // TODO Update type annotation
      return account as any;
    },

    async listAuthenticatorsByUserId(userId) {
      const result = await serverDB
        .select()
        .from(nextauthAuthenticators)
        .where(eq(nextauthAuthenticators.userId, userId))
        .then((res) => res);
      if (result.length === 0)
        throw new Error('LobeNextAuthDbAdapter: Failed to get authenticator list');
      return result.map((r) => mapAuthenticatorQueryResutlToAdapterAuthenticator(r));
    },

    unlinkAccount: async (account) => {
      await serverDB
        .delete(nextauthAccounts)
        .where(
          and(
            eq(nextauthAccounts.provider, account.provider),
            eq(nextauthAccounts.providerAccountId, account.providerAccountId),
          ),
        );
    },

    updateAuthenticatorCounter: async (credentialID, counter) => {
      const result = await serverDB
        .update(nextauthAuthenticators)
        .set({ counter })
        .where(eq(nextauthAuthenticators.credentialID, credentialID))
        .returning()
        .then((res) => res[0]);
      if (!result) throw new Error('LobeNextAuthDbAdapter: Failed to update authenticator counter');
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },

    updateSession: async (data) => {
      const res = await serverDB
        .update(nextauthSessions)
        .set(data)
        .where(eq(nextauthSessions.sessionToken, data.sessionToken))
        .returning();
      return res[0];
    },

    updateUser: async (user) => {
      const lobeUser = await userModel.findById(user?.id);
      if (!lobeUser) throw new Error('NextAuth: User not found');

      const updatedUser = await userModel.updateUser(user.id, {
        ...partialMapAdapterUserToLobeUser(user),
      });
      if (!updatedUser) throw new Error('NextAuth: Failed to update user');

      // Cause the neon adapter not support update result returning
      // merge new user data with old user data
      const newAdapterUser = mapLobeUserToAdapterUser(lobeUser);
      if (!newAdapterUser) {
        throw new Error('NextAuth: Failed to map user data to adapter user');
      }
      return merge(user, newAdapterUser);
    },

    async useVerificationToken(identifier_token) {
      // Use token with 2 steps: find and remove,
      //   1. if not found, will throw error
      //   2. else means exists, invalidate it
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
