import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as utils from '@/app/api/middleware/auth/utils';
import * as serverConfig from '@/config/server';
import { createCallerFactory } from '@/libs/trpc';
import { trpc } from '@/libs/trpc/init';
import { AuthContext, createContextInner } from '@/server/context';

import { passwordChecker } from './password';

const appRouter = trpc.router({
  protectedQuery: trpc.procedure.use(passwordChecker).query(async ({ ctx }) => {
    return ctx.jwtPayload;
  }),
});

const createCaller = createCallerFactory(appRouter);
let ctx: AuthContext;
let router: ReturnType<typeof createCaller>;

beforeEach(() => {
  vi.resetAllMocks();
});

describe('passwordChecker middleware', () => {
  it('should throw UNAUTHORIZED error if authorizationHeader is not present in context', async () => {
    ctx = await createContextInner();
    router = createCaller(ctx);

    await expect(router.protectedQuery()).rejects.toThrow(new TRPCError({ code: 'UNAUTHORIZED' }));
  });

  it('should throw UNAUTHORIZED error if access code is not correct', async () => {
    vi.spyOn(serverConfig, 'getServerConfig').mockReturnValue({
      ACCESS_CODES: ['123'],
    } as any);
    vi.spyOn(utils, 'getJWTPayload').mockResolvedValue({ accessCode: '456' });

    ctx = await createContextInner({ authorizationHeader: 'Bearer token' });
    router = createCaller(ctx);

    await expect(router.protectedQuery()).rejects.toThrow(new TRPCError({ code: 'UNAUTHORIZED' }));
  });

  it('should call next with jwtPayload in context if access code is correct', async () => {
    const jwtPayload = { accessCode: '123' };
    vi.spyOn(serverConfig, 'getServerConfig').mockReturnValue({
      ACCESS_CODES: ['123'],
    } as any);
    vi.spyOn(utils, 'getJWTPayload').mockResolvedValue(jwtPayload);

    ctx = await createContextInner({ authorizationHeader: 'Bearer token' });
    router = createCaller(ctx);

    const data = await router.protectedQuery();

    expect(data).toEqual(jwtPayload);
  });

  it('should call next with jwtPayload in context if no access codes are set', async () => {
    const jwtPayload = {};
    vi.spyOn(serverConfig, 'getServerConfig').mockReturnValue({
      ACCESS_CODES: [],
    } as any);
    vi.spyOn(utils, 'getJWTPayload').mockResolvedValue(jwtPayload);

    ctx = await createContextInner({ authorizationHeader: 'Bearer token' });
    router = createCaller(ctx);

    const data = await router.protectedQuery();

    expect(data).toEqual(jwtPayload);
  });
  it('should call next with jwtPayload in context if  access codes is undefined', async () => {
    const jwtPayload = {};
    vi.spyOn(serverConfig, 'getServerConfig').mockReturnValue({} as any);
    vi.spyOn(utils, 'getJWTPayload').mockResolvedValue(jwtPayload);

    ctx = await createContextInner({ authorizationHeader: 'Bearer token' });
    router = createCaller(ctx);

    const data = await router.protectedQuery();

    expect(data).toEqual(jwtPayload);
  });
});
