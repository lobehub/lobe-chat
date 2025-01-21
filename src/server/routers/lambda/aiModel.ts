import { z } from 'zod';

import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { serverDB } from '@/database/server';
import { AiModelModel } from '@/database/server/models/aiModel';
import { UserModel } from '@/database/server/models/user';
import { authedProcedure, router } from '@/libs/trpc';
import { getServerGlobalConfig } from '@/server/globalConfig';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import {
  AiProviderModelListItem,
  CreateAiModelSchema,
  ToggleAiModelEnableSchema,
  UpdateAiModelSchema,
} from '@/types/aiModel';
import { ProviderConfig } from '@/types/user/settings';

const aiModelProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
  const { aiProvider } = getServerGlobalConfig();

  return opts.next({
    ctx: {
      aiInfraRepos: new AiInfraRepos(
        serverDB,
        ctx.userId,
        aiProvider as Record<string, ProviderConfig>,
      ),
      aiModelModel: new AiModelModel(serverDB, ctx.userId),
      gateKeeper,
      userModel: new UserModel(serverDB, ctx.userId),
    },
  });
});

export const aiModelRouter = router({
  batchToggleAiModels: aiModelProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        id: z.string(),
        models: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiModelModel.batchToggleAiModels(input.id, input.models, input.enabled);
    }),
  batchUpdateAiModels: aiModelProcedure
    .input(
      z.object({
        id: z.string(),
        // TODO: 补齐校验 Schema
        models: z.array(z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiModelModel.batchUpdateAiModels(input.id, input.models);
    }),

  clearRemoteModels: aiModelProcedure
    .input(z.object({ providerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.aiModelModel.clearRemoteModels(input.providerId);
    }),

  createAiModel: aiModelProcedure.input(CreateAiModelSchema).mutation(async ({ input, ctx }) => {
    const data = await ctx.aiModelModel.create(input);

    return data?.id;
  }),

  getAiModelById: aiModelProcedure
    .input(z.object({ id: z.string() }))

    .query(async ({ input, ctx }) => {
      return ctx.aiModelModel.findById(input.id);
    }),

  getAiProviderModelList: aiModelProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }): Promise<AiProviderModelListItem[]> => {
      return ctx.aiInfraRepos.getAiProviderModelList(input.id);
    }),

  removeAiModel: aiModelProcedure
    .input(z.object({ id: z.string(), providerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.aiModelModel.delete(input.id, input.providerId);
    }),

  toggleModelEnabled: aiModelProcedure
    .input(ToggleAiModelEnableSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.aiModelModel.toggleModelEnabled(input);
    }),

  updateAiModel: aiModelProcedure
    .input(
      z.object({
        id: z.string(),
        providerId: z.string(),
        value: UpdateAiModelSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiModelModel.update(input.id, input.providerId, input.value);
    }),

  updateAiModelOrder: aiModelProcedure
    .input(
      z.object({
        providerId: z.string(),
        sortMap: z.array(
          z.object({
            id: z.string(),
            sort: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiModelModel.updateModelsOrder(input.providerId, input.sortMap);
    }),
});

export type AiModelRouter = typeof aiModelRouter;
