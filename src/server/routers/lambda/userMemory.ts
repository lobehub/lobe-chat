import { CreateUserMemoryIdentitySchema, UpdateUserMemoryIdentitySchema } from '@lobechat/types';
import { z } from 'zod';

import { UserMemoryModel } from '@/database/models/userMemory';
import { UserMemoryRepo } from '@/database/repositories/userMemory';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const userMemoryProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      userMemoryModel: new UserMemoryModel(ctx.serverDB, ctx.userId),
      userMemoryRepo: new UserMemoryRepo(ctx.serverDB, ctx.userId),
    },
  });
});

export const userMemoryRouter = router({
  // ============ Identity CRUD ============

  createIdentity: userMemoryProcedure
    .input(CreateUserMemoryIdentitySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.addIdentityEntry({
        base: {},
        identity: {
          description: input.description,
          episodicDate: input.episodicDate,
          relationship: input.relationship,
          role: input.role,
          tags: input.extractedLabels,
          type: input.type,
        },
      });
    }),

  deleteIdentity: userMemoryProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.removeIdentityEntry(input.id);
    }),

  getContexts: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.searchContexts({});
  }),

  getDisplayExperiences: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryRepo.getDisplayExperiences();
  }),

  getExperiences: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.searchExperiences({});
  }),

  getIdentities: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.getAllIdentities();
  }),

  getPreferences: userMemoryProcedure.query(async ({ ctx }) => {
    return ctx.userMemoryModel.searchPreferences({});
  }),

  updateIdentity: userMemoryProcedure
    .input(
      z.object({
        data: UpdateUserMemoryIdentitySchema,
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.userMemoryModel.updateIdentityEntry({
        identity: {
          description: input.data.description,
          episodicDate: input.data.episodicDate,
          relationship: input.data.relationship,
          role: input.data.role,
          tags: input.data.extractedLabels,
          type: input.data.type,
        },
        identityId: input.id,
      });
    }),
});

export type UserMemoryRouter = typeof userMemoryRouter;
