import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

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

  it('should create context with all params', async () => {
    const params = {
      authorizationHeader: 'Bearer token',
      clerkAuth: { userId: 'clerk123' } as any,
      nextAuth: { id: 'next123', name: 'Test User' } as any,
      userId: 'user123',
    };

    const context = await createContextInner(params);

    expect(context).toEqual({
      authorizationHeader: 'Bearer token',
      clerkAuth: { userId: 'clerk123' },
      nextAuth: { id: 'next123', name: 'Test User' },
      userId: 'user123',
    });
  });

  it('should create context with partial params', async () => {
    const params = {
      authorizationHeader: 'Bearer token',
      userId: 'user123',
    };

    const context = await createContextInner(params);

    expect(context).toEqual({
      authorizationHeader: 'Bearer token',
      clerkAuth: undefined,
      nextAuth: undefined,
      userId: 'user123',
    });
  });

  it('should handle null values in params', async () => {
    const params = {
      authorizationHeader: null,
      userId: null,
    };

    const context = await createContextInner(params);

    expect(context).toEqual({
      authorizationHeader: null,
      clerkAuth: undefined,
      nextAuth: undefined,
      userId: null,
    });
  });
});
