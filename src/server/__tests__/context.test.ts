import { User } from 'next-auth';
import { describe, expect, it } from 'vitest';

import { IClerkAuth } from '@/libs/clerk-auth';

import { createContextInner } from '../context';

describe('createContextInner', () => {
  it('should create context with empty params', async () => {
    const context = await createContextInner();
    expect(context).toEqual({
      authorizationHeader: undefined,
      clerkAuth: undefined,
      nextAuth: undefined,
      userId: undefined,
    });
  });

  it('should create context with authorization header', async () => {
    const authHeader = 'Bearer token123';
    const context = await createContextInner({ authorizationHeader: authHeader });
    expect(context).toEqual({
      authorizationHeader: authHeader,
      clerkAuth: undefined,
      nextAuth: undefined,
      userId: undefined,
    });
  });

  it('should create context with clerk auth', async () => {
    const mockClerkAuth = {
      protect: () => {},
      getToken: () => Promise.resolve('token'),
      authenticateRequest: () => Promise.resolve({}),
    } as unknown as IClerkAuth;

    const context = await createContextInner({ clerkAuth: mockClerkAuth });
    expect(context).toEqual({
      authorizationHeader: undefined,
      clerkAuth: mockClerkAuth,
      nextAuth: undefined,
      userId: undefined,
    });
  });

  it('should create context with next auth', async () => {
    const nextAuth = { id: 'user123', name: 'Test User' } as User;
    const context = await createContextInner({ nextAuth });
    expect(context).toEqual({
      authorizationHeader: undefined,
      clerkAuth: undefined,
      nextAuth,
      userId: undefined,
    });
  });

  it('should create context with userId', async () => {
    const userId = 'user123';
    const context = await createContextInner({ userId });
    expect(context).toEqual({
      authorizationHeader: undefined,
      clerkAuth: undefined,
      nextAuth: undefined,
      userId,
    });
  });

  it('should create context with all parameters', async () => {
    const mockClerkAuth = {
      protect: () => {},
      getToken: () => Promise.resolve('token'),
      authenticateRequest: () => Promise.resolve({}),
    } as unknown as IClerkAuth;

    const params = {
      authorizationHeader: 'Bearer token123',
      clerkAuth: mockClerkAuth,
      nextAuth: { id: 'user123', name: 'Test User' } as User,
      userId: 'user123',
    };

    const context = await createContextInner(params);
    expect(context).toEqual(params);
  });
});
