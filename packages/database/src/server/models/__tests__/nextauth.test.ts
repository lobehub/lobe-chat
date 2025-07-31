import type {
  AdapterAccount,
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from '@auth/core/adapters';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeNextAuthDbAdapter } from '@/libs/next-auth/adapter';

import { getTestDBInstance } from '../../../core/dbForTest';
import {
  nextauthAccounts,
  nextauthAuthenticators,
  nextauthSessions,
  nextauthVerificationTokens,
  users,
} from '../../../schemas';

let serverDB = await getTestDBInstance();

let nextAuthAdapter = LobeNextAuthDbAdapter(serverDB);

const userId = 'user-db';
const user: AdapterUser = {
  id: userId,
  name: 'John Doe',
  email: 'john.doe@example.com',
  emailVerified: new Date(),
  image: 'https://example.com/avatar.jpg',
};

const sessionToken = 'session-token';

beforeAll(async () => {
  await serverDB.delete(users);
  await serverDB.delete(nextauthAccounts);
  await serverDB.delete(nextauthAuthenticators);
  await serverDB.delete(nextauthSessions);
  await serverDB.delete(nextauthVerificationTokens);
});

beforeEach(async () => {
  process.env.KEY_VAULTS_SECRET = 'ofQiJCXLF8mYemwfMWLOHoHimlPu91YmLfU7YZ4lreQ=';
  // insert a user
  // @ts-expect-error: createUser is defined
  await nextAuthAdapter.createUser(user);
});

afterEach(async () => {
  await serverDB.delete(users);
});

afterAll(async () => {
  await serverDB.delete(users);
  await serverDB.delete(nextauthAccounts);
  await serverDB.delete(nextauthAuthenticators);
  await serverDB.delete(nextauthSessions);
  await serverDB.delete(nextauthVerificationTokens);
  process.env.KEY_VAULTS_SECRET = undefined;
});

/**
 * The tests below only test the database operation functionality,
 * the mock values might not represent the actual value
 */
describe('LobeNextAuthDbAdapter', () => {
  describe('users', () => {
    describe('createUser', () => {
      it('should create a new user', async () => {
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.createUser).toBeDefined();
        const anotherUserId = 'user-db-2';
        const anotherUserName = 'John Doe 2';
        const anotherEmail = 'john.doe.2@example.com';
        // @ts-expect-error: createUser is defined
        const createdUser = await nextAuthAdapter.createUser({
          ...user,
          id: anotherUserId,
          name: anotherUserName,
          email: anotherEmail,
        });
        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBe(anotherUserId);
        expect(createdUser.name).toBe(anotherUserName);
        expect(createdUser.email).toBe(anotherEmail);
        expect(createdUser.emailVerified).toBe(user.emailVerified);
        expect(createdUser.image).toBe(user.image);
      });

      it('should not create a user if it already exists', async () => {
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.createUser).toBeDefined();
        // @ts-expect-error: createUser is defined
        await nextAuthAdapter.createUser(user);
        // Should not create a new user if it already exists
        expect(
          await serverDB.query.users.findMany({ where: eq(users.email, user.email) }),
        ).toHaveLength(1);
      });

      it('should not create a user if email exist', async () => {
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.createUser).toBeDefined();
        const anotherUserId = 'user-db-2';
        const anotherUserName = 'John Doe 2';
        // @ts-expect-error: createUser is defined
        await nextAuthAdapter.createUser({
          ...user,
          id: anotherUserId,
          name: anotherUserName,
        });
        // Should not create a new user if email already exists
        expect(
          await serverDB.query.users.findMany({ where: eq(users.email, user.email) }),
        ).toHaveLength(1);
      });

      it('should create a user if id not exist and email is null', async () => {
        // In previous version, it will link the account to the existing user if the email is null
        // issue: https://github.com/lobehub/lobe-chat/issues/4918
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.createUser).toBeDefined();

        const existUserId = 'user-db-1';
        const existUserName = 'John Doe 1';
        // @ts-expect-error: createUser is defined
        await nextAuthAdapter.createUser({
          ...user,
          id: existUserId,
          name: existUserName,
          email: '',
        });

        const anotherUserId = 'user-db-2';
        const anotherUserName = 'John Doe 2';
        // @ts-expect-error: createUser is defined
        await nextAuthAdapter.createUser({
          ...user,
          id: anotherUserId,
          name: anotherUserName,
          email: '',
        });
        // Should create a new user if id not exists and email is null
        expect(
          await serverDB.query.users.findMany({ where: eq(users.id, anotherUserId) }),
        ).toHaveLength(1);
      });

      it('should create a user if id not exist even email is invalid type', async () => {
        // In previous version, it will link the account to the existing user if the email is null
        // issue: https://github.com/lobehub/lobe-chat/issues/4918
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.createUser).toBeDefined();

        const existUserId = 'user-db-1';
        const existUserName = 'John Doe 1';
        // @ts-expect-error: createUser is defined
        await nextAuthAdapter.createUser({
          ...user,
          id: existUserId,
          name: existUserName,
          email: Object({}), // assign a non-string value
        });

        const anotherUserId = 'user-db-2';
        const anotherUserName = 'John Doe 2';
        // @ts-expect-error: createUser is defined
        await nextAuthAdapter.createUser({
          ...user,
          id: anotherUserId,
          name: anotherUserName,
          // @ts-expect-error: try to assign undefined value
          email: undefined,
        });

        // Should create a new user if id not exists and email is null
        expect(
          await serverDB.query.users.findMany({ where: eq(users.id, anotherUserId) }),
        ).toHaveLength(1);
      });
    });

    describe('deleteUser', () => {
      it('should delete a user', async () => {
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.deleteUser).toBeDefined();
        // @ts-expect-error: deleteUser is defined
        await nextAuthAdapter.deleteUser(userId);
        const deletedUser = await serverDB.query.users.findFirst({ where: eq(users.id, userId) });
        expect(deletedUser).toBeUndefined();
      });
    });

    describe('getUser', () => {
      it('should get a user', async () => {
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.getUser).toBeDefined();
        // @ts-expect-error: getUser is defined
        const fetchedUser = await nextAuthAdapter.getUser(userId);
        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.id).toBe(user.id);
        expect(fetchedUser?.name).toBe(user.name);
        expect(fetchedUser?.email).toBe(user.email);
        expect(fetchedUser?.emailVerified).toEqual(user.emailVerified);
        expect(fetchedUser?.image).toBe(user.image);
      });
    });

    describe('getUserByEmail', () => {
      it('should get a user by email', async () => {
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.getUserByEmail).toBeDefined();
        // @ts-expect-error: getUserByEmail is defined
        const fetchedUser = await nextAuthAdapter.getUserByEmail(user.email);
        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.id).toBe(user.id);
        expect(fetchedUser?.name).toBe(user.name);
        expect(fetchedUser?.email).toBe(user.email);
        expect(fetchedUser?.emailVerified).toEqual(user.emailVerified);
        expect(fetchedUser?.image).toBe(user.image);
      });
    });

    describe('getUserByAccount', () => {
      it('should get a user by account', async () => {
        const account: AdapterAccount = {
          providerAccountId: 'provider-account-id',
          userId: userId,
          provider: 'auth0',
          type: 'email',
        };
        // @ts-expect-error: linkAccount is defined
        await nextAuthAdapter.linkAccount(account);
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.getUserByAccount).toBeDefined();
        // @ts-expect-error: getUserByAccount is defined
        const fetchedUser = await nextAuthAdapter.getUserByAccount(account);
        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.id).toBe(user.id);
        expect(fetchedUser?.name).toBe(user.name);
        expect(fetchedUser?.email).toBe(user.email);
        expect(fetchedUser?.emailVerified).toEqual(user.emailVerified);
        expect(fetchedUser?.image).toBe(user.image);
      });
    });

    describe('updateUser', () => {
      it('should update a user', async () => {
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.updateUser).toBeDefined();
        const updatedName = 'updated' + user.name;
        const updatedEmail = 'updated' + user.email;
        // @ts-expect-error: updateUser is defined
        const updatedUser = await nextAuthAdapter.updateUser({
          id: userId,
          name: updatedName,
          email: updatedEmail,
        });
        expect(updatedUser).toBeDefined();
        expect(updatedUser.id).toBe(userId);
        expect(updatedUser.name).toBe(updatedName);
        expect(updatedUser.email).toBe(updatedEmail);
      });
    });
  });

  describe('authenticators', () => {
    describe('createAuthenticator', () => {
      it('should create a new authenticator', async () => {
        // Create an authenticator and link to the exists user
        const params: AdapterAuthenticator = {
          credentialBackedUp: false,
          credentialDeviceType: 'type',
          credentialID: 'some-id',
          credentialPublicKey: 'some-key',
          userId: userId,
          providerAccountId: 'provider-account-id',
          counter: 1,
        };
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.createAuthenticator).toBeDefined();
        // @ts-expect-error: createAuthenticator is defined
        const authenticator = await nextAuthAdapter.createAuthenticator(params);

        expect(authenticator).toBeDefined();
        expect(authenticator.userId).toBe(params.userId);
        expect(authenticator.providerAccountId).toBe(params.providerAccountId);
      });
    });

    describe('getAuthenticator', () => {
      it('should get an authenticator', async () => {
        // Create an authenticator and link to the exists user
        const params: AdapterAuthenticator = {
          credentialBackedUp: false,
          credentialDeviceType: 'type',
          credentialID: 'some-id',
          credentialPublicKey: 'some-key',
          userId: userId,
          providerAccountId: 'provider-account-id',
          counter: 1,
        };
        // @ts-expect-error: createAuthenticator is defined
        await nextAuthAdapter.createAuthenticator(params);
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.getAuthenticator).toBeDefined();
        // @ts-expect-error: getAuthenticator is defined
        const fetchedAuthenticator = await nextAuthAdapter.getAuthenticator(params.credentialID);
        expect(fetchedAuthenticator).toBeDefined();
        expect(fetchedAuthenticator?.userId).toBe(params.userId);
        expect(fetchedAuthenticator?.providerAccountId).toBe(params.providerAccountId);
      });
    });

    describe('updateAuthenticatorCounter', () => {
      it('should update an authenticator counter', async () => {
        // Create an authenticator and link to the exists user
        const params: AdapterAuthenticator = {
          credentialBackedUp: false,
          credentialDeviceType: 'type',
          credentialID: 'some-id',
          credentialPublicKey: 'some-key',
          userId: userId,
          providerAccountId: 'provider-account-id',
          counter: 1,
        };
        // @ts-expect-error: createAuthenticator is defined
        await nextAuthAdapter.createAuthenticator(params);
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.updateAuthenticatorCounter).toBeDefined();
        // @ts-expect-error: updateAuthenticatorCounter is defined
        const updatedAuthenticator = await nextAuthAdapter.updateAuthenticatorCounter(
          params.credentialID,
          2,
        );
        expect(updatedAuthenticator).toBeDefined();
        expect(updatedAuthenticator.counter).toBe(2);
      });
    });

    describe('listAuthenticatorsByUserId', () => {
      it('should list authenticators by user id', async () => {
        // Create an authenticator and link to the exists user
        const params: AdapterAuthenticator = {
          credentialBackedUp: false,
          credentialDeviceType: 'type',
          credentialID: 'some-id',
          credentialPublicKey: 'some-key',
          userId: userId,
          providerAccountId: 'provider-account-id',
          counter: 1,
        };
        // @ts-expect-error: createAuthenticator is defined
        await nextAuthAdapter.createAuthenticator(params);
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.listAuthenticatorsByUserId).toBeDefined();
        // @ts-expect-error: listAuthenticatorsByUserId is defined
        const authenticators = await nextAuthAdapter.listAuthenticatorsByUserId(userId);
        expect(authenticators).toBeDefined();
        expect(authenticators.length).toBeGreaterThan(0);
        expect(authenticators[0].userId).toBe(params.userId);
        expect(authenticators[0].providerAccountId).toBe(params.providerAccountId);
      });
    });
  });

  describe('session', () => {
    describe('createSession', () => {
      it('should create a new session', async () => {
        const data: AdapterSession = {
          sessionToken,
          userId: userId,
          expires: new Date(),
        };
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.createSession).toBeDefined();

        // @ts-expect-error: createSession is defined
        const session = await nextAuthAdapter.createSession(data);

        expect(session).toBeDefined();
        expect(session.sessionToken).toBe(data.sessionToken);
        expect(session.userId).toBe(data.userId);
        expect(session.expires).toEqual(data.expires);
      });
    });

    describe('updateSession', () => {
      it('should update a session', async () => {
        const data: AdapterSession = {
          sessionToken,
          userId: userId,
          expires: new Date(),
        };
        // @ts-expect-error: createSession is defined
        await nextAuthAdapter.createSession(data);
        const updatedExpires = new Date();
        expect(nextAuthAdapter).toBeDefined();
        expect(nextAuthAdapter.updateSession).toBeDefined();
        // @ts-expect-error: updateSession is defined
        const updatedSession = await nextAuthAdapter.updateSession({
          sessionToken,
          expires: updatedExpires,
        });
        expect(updatedSession).toBeDefined();
        expect(updatedSession?.sessionToken).toBe(data.sessionToken);
        expect(updatedSession?.expires).toEqual(updatedExpires);
      });
    });

    describe('getSessionAndUser', () => {
      it('should get a session and user', async () => {
        // create session
        const data = {
          sessionToken,
          userId: userId,
          expires: new Date(),
        };
        // @ts-expect-error: createSession is defined
        await nextAuthAdapter.createSession(data);

        // @ts-expect-error: getSessionAndUser is defined
        const sessionAndUser = await nextAuthAdapter.getSessionAndUser(sessionToken);
        expect(sessionAndUser?.session.sessionToken).toBe(sessionToken);
        expect(sessionAndUser?.user.id).toBe(user.id);
      });
    });

    describe('deleteSession', () => {
      it('should delete a session', async () => {
        const data = {
          sessionToken,
          userId: userId,
          expires: new Date(),
        };
        // @ts-expect-error: createSession is defined
        await nextAuthAdapter.createSession(data);

        // @ts-expect-error: deleteSession is defined
        await nextAuthAdapter.deleteSession(sessionToken);
        const session = await serverDB.query.nextauthSessions.findFirst({
          where: eq(nextauthSessions.sessionToken, sessionToken),
        });
        expect(session).toBeUndefined();
      });
    });
  });

  describe('verificationToken', () => {
    describe('createVerificationToken', () => {
      it('should create a new verification token', async () => {
        const token: VerificationToken = {
          identifier: 'identifier',
          expires: new Date(),
          token: 'token',
        };
        // @ts-expect-error: createVerificationToken is defined
        const createdToken = await nextAuthAdapter.createVerificationToken(token);
        expect(createdToken).toBeDefined();
        expect(createdToken?.identifier).toBe(token.identifier);
        expect(createdToken?.expires).toEqual(token.expires);
        expect(createdToken?.token).toBe(token.token);
      });
    });

    describe('useVerificationToken', () => {
      it('should use a verification token if exist', async () => {
        const token: VerificationToken = {
          identifier: 'identifier',
          expires: new Date(),
          token: 'token2',
        };
        // @ts-expect-error: createVerificationToken is defined
        await nextAuthAdapter.createVerificationToken(token);
        // @ts-expect-error: useVerificationToken is defined
        await nextAuthAdapter.useVerificationToken(token.token);
      });

      it('should return null if the token does not exist', async () => {
        const token: VerificationToken = {
          identifier: 'identifier',
          expires: new Date(),
          token: 'token-not-exist',
        };
        // @ts-expect-error: useVerificationToken is defined
        const result = await nextAuthAdapter.useVerificationToken(token.token);
        expect(result).toBeNull();
      });
    });
  });

  describe('accounts', () => {
    describe('linkAccount', () => {
      it('should link an account', async () => {
        const account: AdapterAccount = {
          providerAccountId: 'provider-account-id',
          userId: userId,
          provider: 'auth0',
          type: 'email',
        };
        // @ts-expect-error: linkAccount is defined
        const insertedAccount = await nextAuthAdapter.linkAccount(account);
        expect(insertedAccount).toBeDefined();
        expect(insertedAccount?.providerAccountId).toBe(account.providerAccountId);
        expect(insertedAccount?.userId).toBe(userId);
        expect(insertedAccount?.provider).toBe(account.provider);
        expect(insertedAccount?.type).toBe(account.type);
      });
    });

    describe('getAccount', () => {
      it('should get an account', async () => {
        const account: AdapterAccount = {
          providerAccountId: 'provider-account-id',
          userId: userId,
          provider: 'auth0',
          type: 'email',
        };
        // @ts-expect-error: linkAccount is defined
        await nextAuthAdapter.linkAccount(account);
        // @ts-expect-error: getAccount is defined
        const fetchedAccount = await nextAuthAdapter.getAccount(
          account.providerAccountId,
          account.provider,
        );
        expect(fetchedAccount).toBeDefined();
        expect(fetchedAccount?.providerAccountId).toBe(account.providerAccountId);
        expect(fetchedAccount?.userId).toBe(userId);
        expect(fetchedAccount?.provider).toBe(account.provider);
        expect(fetchedAccount?.type).toBe(account.type);
      });
    });

    describe('unlinkAccount', () => {
      it('should unlink an account', async () => {
        const account: AdapterAccount = {
          providerAccountId: 'provider-account-id',
          userId: userId,
          provider: 'auth0',
          type: 'email',
        };
        // @ts-expect-error: linkAccount is defined
        await nextAuthAdapter.linkAccount(account);
        // @ts-expect-error: unlinkAccount is defined
        await nextAuthAdapter.unlinkAccount(account);
        const fetchedAccount = await serverDB.query.nextauthAccounts.findFirst({
          where: eq(nextauthAccounts.providerAccountId, account.providerAccountId),
        });
        expect(fetchedAccount).toBeUndefined();
      });
    });
  });
});
