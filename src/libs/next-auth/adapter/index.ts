import type {
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from '@auth/core/adapters';
import { Adapter, AdapterAccount } from 'next-auth/adapters';

import { appEnv } from '@/envs/app';
import debug from 'debug';
import urlJoin from 'url-join';
import { serverDBEnv } from '@/config/db';

const log = debug('lobe-next-auth:adapter');

interface BackendAdapterResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * @description LobeNextAuthDbAdapter is implemented to handle the database operations
 * for NextAuth, this function do the same things as `src/app/api/webhooks/clerk/route.ts`
 * @returns {Adapter}
 */
export function LobeNextAuthDbAdapter(): Adapter {
  const baseUrl = appEnv.APP_URL;

  // Ensure the baseUrl is set, otherwise throw an error
  if (!baseUrl) {
    throw new Error('LobeNextAuthDbAdapter: APP_URL is not set in environment variables');
  }
  const interactionUrl = urlJoin(baseUrl, '/api/auth/adapter')
  log(`LobeNextAuthDbAdapter initialized with url: ${interactionUrl}`);

  // Ensure serverDBEnv.KEY_VAULTS_SECRET is set, otherwise throw an error
  if (!serverDBEnv.KEY_VAULTS_SECRET) {
    throw new Error('LobeNextAuthDbAdapter: KEY_VAULTS_SECRET is not set in environment variables');
  }

  const fetcher = (action: string, data: any) => fetch(interactionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serverDBEnv.KEY_VAULTS_SECRET}`,
    },
    body: JSON.stringify({ data, action }),
  });
  const postProcessor = async (res: Response) => {
    const data = (await res.json()) as BackendAdapterResponse;
    if (!data.success) {
      log('LobeNextAuthDbAdapter: Error in postProcessor:', data.error);
      throw new Error(`LobeNextAuthDbAdapter: ${data.error}`);
    }
    return data.data
  }

  return {
    async createAuthenticator(authenticator): Promise<AdapterAuthenticator> {
      const data = await fetcher('createAuthenticator', authenticator);
      return await postProcessor(data);
    },
    async createSession(session): Promise<AdapterSession> {
      const data = await fetcher('createSession', session);
      return await postProcessor(data)
    },
    async createUser(user): Promise<AdapterUser> {
      const data = await fetcher('createUser', user);
      return await postProcessor(data);
    },
    async createVerificationToken(data): Promise<VerificationToken | null | undefined> {
      const result = await fetcher('createVerificationToken', data);
      return await postProcessor(result);
    },
    async deleteSession(sessionToken): Promise<AdapterSession | null | undefined> {
      const result = await fetcher('deleteSession', sessionToken);
      await postProcessor(result);
      return;
    },
    async deleteUser(id): Promise<AdapterUser | null | undefined> {
      const result = await fetcher('deleteUser', id);
      await postProcessor(result);
      return;
    },

    async getAccount(providerAccountId, provider): Promise<AdapterAccount | null> {
      const data = await fetcher('getAccount', {
        providerAccountId,
        provider,
      });
      const result = await postProcessor(data);
      return result;
    },

    async getAuthenticator(credentialID): Promise<AdapterAuthenticator | null> {
      const result = await fetcher('getAuthenticator', credentialID);
      const data = await postProcessor(result);
      return data
    },

    async getSessionAndUser(sessionToken): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const result = await fetcher('getSessionAndUser', sessionToken);
      const data = await postProcessor(result);
      return data
    },

    async getUser(id): Promise<AdapterUser | null> {
      log('getUser called with id:', id);
      const result = await fetcher('getUserInfo', id)
      const data = await postProcessor(result);
      return data;
    },

    async getUserByAccount(account): Promise<AdapterUser | null> {
      const data = await fetcher('getUserByAccount', account)
      const result = await postProcessor(data);
      return result;
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      const data = await fetcher('getUserByEmail', email);
      const result = await postProcessor(data);
      return result;
    },

    async linkAccount(data): Promise<AdapterAccount | null | undefined> {
      const result = await fetcher('linkAccount', data);
      const account = await postProcessor(result);
      return account;
    },

    async listAuthenticatorsByUserId(userId): Promise<AdapterAuthenticator[]> {
      const result = await fetcher('listAuthenticatorsByUserId', userId);
      const data = await postProcessor(result);
      return data;
    },

    // @ts-ignore: The return type is {Promise<void> | Awaitable<AdapterAccount | undefined>}
    async unlinkAccount(account): Promise<void | AdapterAccount | undefined> {
      const result = await fetcher('unlinkAccount', account);
      await postProcessor(result);
      return
    },

    async updateAuthenticatorCounter(credentialID, counter): Promise<AdapterAuthenticator> {
      const result = await fetcher('updateAuthenticatorCounter', {
        credentialID,
        counter,
      });
      const data = await postProcessor(result);
      return data;
    },

    async updateSession(data): Promise<AdapterSession | null | undefined> {
      const result = await fetcher('updateSession', data);
      const session = await postProcessor(result);
      return session;
    },

    async updateUser(user): Promise<AdapterUser> {
      const result = await fetcher('updateUser', user);
      const data = await postProcessor(result);
      return data;
    },

    async useVerificationToken(identifier_token): Promise<VerificationToken | null> {
      const result = await fetcher('useVerificationToken', identifier_token);
      const data = await postProcessor(result);
      return data;
    },
  };
}
