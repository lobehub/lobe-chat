// @vitest-environment node
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCallerFactory } from '@/libs/trpc/edge';
import { AuthContext, createContextInner } from '@/libs/trpc/edge/context';
import { edgeTrpc as trpc } from '@/libs/trpc/edge/init';
import * as utils from '@/utils/server/jwt';

import { jwtPayloadChecker } from './jwtPayload';

const appRouter = trpc.router({
  protectedQuery: trpc.procedure.use(jwtPayloadChecker).query(async ({ ctx }) => {
    return ctx.jwtPayload;
  }),
});

const createCaller = createCallerFactory(appRouter);
let ctx: AuthContext;
let router: ReturnType<typeof createCaller>;

vi.mock('@/libs/next-auth/edge', () => {
  return {
    auth: vi.fn().mockResolvedValue(undefined),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('passwordChecker middleware', () => {
  it('should throw UNAUTHORIZED error if authorizationHeader is not present in context', async () => {
    ctx = await createContextInner();
    router = createCaller(ctx);

    await expect(router.protectedQuery()).rejects.toThrow(new TRPCError({ code: 'UNAUTHORIZED' }));
  });

  it('should call next with jwtPayload in context if access code is correct', async () => {
    const jwtPayload = { accessCode: '123' };

    vi.spyOn(utils, 'getJWTPayload').mockResolvedValue(jwtPayload);

    ctx = await createContextInner({ authorizationHeader: 'Bearer token' });
    router = createCaller(ctx);

    const data = await router.protectedQuery();

    expect(data).toEqual(jwtPayload);
  });

  it('should call next with jwtPayload in context if no access codes are set', async () => {
    const jwtPayload = {};
    vi.spyOn(utils, 'getJWTPayload').mockResolvedValue(jwtPayload);

    ctx = await createContextInner({ authorizationHeader: 'Bearer token' });
    router = createCaller(ctx);

    const data = await router.protectedQuery();

    expect(data).toEqual(jwtPayload);
  });
  it('should call next with jwtPayload in context if  access codes is undefined', async () => {
    const jwtPayload = {};
    vi.spyOn(utils, 'getJWTPayload').mockResolvedValue(jwtPayload);

    ctx = await createContextInner({ authorizationHeader: 'Bearer token' });
    router = createCaller(ctx);

    const data = await router.protectedQuery();

    expect(data).toEqual(jwtPayload);
  });
});
