import { z } from 'zod';

import { GenerationTopicModel } from '@/database/models/generationTopic';
import { GenerationTopicItem } from '@/database/schemas/generation';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const generationTopicProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { generationTopicModel: new GenerationTopicModel(ctx.serverDB, ctx.userId) },
  });
});

// Define input schemas
const updateTopicSchema = z.object({
  id: z.string(),
  value: z.object({
    title: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
  }),
});

export const generationTopicRouter = router({
  createTopic: generationTopicProcedure.input(z.void()).mutation(async ({ ctx }) => {
    const data = await ctx.generationTopicModel.create('');
    return data.id;
  }),
  getAllGenerationTopics: generationTopicProcedure.query(async ({ ctx }) => {
    return ctx.generationTopicModel.queryAll();
  }),
  updateTopic: generationTopicProcedure
    .input(updateTopicSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.generationTopicModel.update(input.id, input.value as Partial<GenerationTopicItem>);
    }),
  deleteTopic: generationTopicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.generationTopicModel.delete(input.id);
    }),
});

export type GenerationTopicRouter = typeof generationTopicRouter;

// Export input types for client/server service consistency
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type UpdateTopicValue = UpdateTopicInput['value'];
