import { z } from 'zod';

import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { serverDB } from '@/database/server';
import { AiProviderModel } from '@/database/server/models/aiProvider';
import { UserModel } from '@/database/server/models/user';
import { authedProcedure, router } from '@/libs/trpc';
import { getServerGlobalConfig } from '@/server/globalConfig';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import {
  AiProviderDetailItem,
  AiProviderRuntimeState,
  CreateAiProviderSchema,
  UpdateAiProviderConfigSchema,
} from '@/types/aiProvider';
import { ProviderConfig } from '@/types/user/settings';

const aiProviderProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  const { aiProvider } = getServerGlobalConfig();

  const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
  return opts.next({
    ctx: {
      aiInfraRepos: new AiInfraRepos(
        serverDB,
        ctx.userId,
        aiProvider as Record<string, ProviderConfig>,
      ),
      aiProviderModel: new AiProviderModel(serverDB, ctx.userId),
      gateKeeper,
      userModel: new UserModel(serverDB, ctx.userId),
    },
  });
});

export const aiProviderRouter = router({
  createAiProvider: aiProviderProcedure
    .input(CreateAiProviderSchema)
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.aiProviderModel.create(input, ctx.gateKeeper.encrypt);

      return data?.id;
    }),

  getAiProviderById: aiProviderProcedure
    .input(z.object({ id: z.string() }))

    .query(async ({ input, ctx }): Promise<AiProviderDetailItem | undefined> => {
      return ctx.aiInfraRepos.getAiProviderDetail(input.id, KeyVaultsGateKeeper.getUserKeyVaults);
    }),

  getAiProviderList: aiProviderProcedure.query(async ({ ctx }) => {
    return await ctx.aiInfraRepos.getAiProviderList();
  }),

  getAiProviderRuntimeState: aiProviderProcedure
    .input(z.object({ isLogin: z.boolean().optional() }))
    .query(async ({ ctx }): Promise<AiProviderRuntimeState> => {
      return ctx.aiInfraRepos.getAiProviderRuntimeState(KeyVaultsGateKeeper.getUserKeyVaults);
    }),

  removeAiProvider: aiProviderProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.aiProviderModel.delete(input.id);
    }),

  toggleProviderEnabled: aiProviderProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiProviderModel.toggleProviderEnabled(input.id, input.enabled);
    }),

  updateAiProvider: aiProviderProcedure
    .input(
      z.object({
        id: z.string(),
        value: CreateAiProviderSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiProviderModel.update(input.id, input.value);
    }),

  updateAiProviderConfig: aiProviderProcedure
    .input(
      z.object({
        id: z.string(),
        value: UpdateAiProviderConfigSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiProviderModel.updateConfig(input.id, input.value, ctx.gateKeeper.encrypt);
    }),

  updateAiProviderOrder: aiProviderProcedure
    .input(
      z.object({
        sortMap: z.array(
          z.object({
            id: z.string(),
            sort: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.aiProviderModel.updateOrder(input.sortMap);
    }),
});

export type AiProviderRouter = typeof aiProviderRouter;
