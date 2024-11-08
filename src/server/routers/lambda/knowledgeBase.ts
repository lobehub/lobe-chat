import { z } from 'zod';

import { KnowledgeBaseModel } from '@/database/server/models/knowledgeBase';
import { insertKnowledgeBasesSchema } from '@/database/server/schemas/lobechat';
import { authedProcedure, router } from '@/libs/trpc';
import { KnowledgeBaseItem } from '@/types/knowledgeBase';

const knowledgeBaseProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      knowledgeBaseModel: new KnowledgeBaseModel(ctx.userId),
    },
  });
});

export const knowledgeBaseRouter = router({
  addFilesToKnowledgeBase: knowledgeBaseProcedure
    .input(z.object({ ids: z.array(z.string()), knowledgeBaseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.knowledgeBaseModel.addFilesToKnowledgeBase(input.knowledgeBaseId, input.ids);
    }),

  createKnowledgeBase: knowledgeBaseProcedure
    .input(
      z.object({
        avatar: z.string().optional(),
        description: z.string().optional(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.knowledgeBaseModel.create({
        avatar: input.avatar,
        description: input.description,
        name: input.name,
      });

      return data?.id;
    }),

  getKnowledgeBaseById: knowledgeBaseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }): Promise<KnowledgeBaseItem | undefined> => {
      return ctx.knowledgeBaseModel.findById(input.id);
    }),

  getKnowledgeBases: knowledgeBaseProcedure.query(async ({ ctx }): Promise<KnowledgeBaseItem[]> => {
    return ctx.knowledgeBaseModel.query();
  }),

  removeAllKnowledgeBases: knowledgeBaseProcedure.mutation(async ({ ctx }) => {
    return ctx.knowledgeBaseModel.deleteAll();
  }),

  removeFilesFromKnowledgeBase: knowledgeBaseProcedure
    .input(z.object({ ids: z.array(z.string()), knowledgeBaseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.knowledgeBaseModel.removeFilesFromKnowledgeBase(input.knowledgeBaseId, input.ids);
    }),

  removeKnowledgeBase: knowledgeBaseProcedure
    .input(z.object({ id: z.string(), removeFiles: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.knowledgeBaseModel.delete(input.id);
    }),

  updateKnowledgeBase: knowledgeBaseProcedure
    .input(
      z.object({
        id: z.string(),
        value: insertKnowledgeBasesSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.knowledgeBaseModel.update(input.id, input.value);
    }),
});
