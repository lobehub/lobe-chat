import { CreateUserMemoryIdentitySchema, UpdateUserMemoryIdentitySchema } from '@lobechat/types';
import { z } from 'zod';

import { UserMemoryModel } from '@/database/models/userMemory';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const userMemoryProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      userMemoryModel: new UserMemoryModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const userMemoryRouter = router({
  countMemories: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.countMemories();
  }),

  // ============ Identity CRUD ============

  createIdentity: userMemoryProcedure
    .input(CreateUserMemoryIdentitySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.createIdentity(input as any);
    }),

  deleteIdentity: userMemoryProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.deleteIdentity(input.id);
    }),

  getContexts: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.queryContexts();
  }),

  getExperiences: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.queryExperiences();
  }),

  getIdentities: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.queryIdentities();
  }),

  getMemories: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.queryMemories();
  }),

  getPreferences: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.queryPreferences();
  }),

  updateIdentity: userMemoryProcedure
    .input(
      z.object({
        data: UpdateUserMemoryIdentitySchema,
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.updateIdentity(input.id, input.data as any);
    }),
});

export type UserMemoryRouter = typeof userMemoryRouter;
