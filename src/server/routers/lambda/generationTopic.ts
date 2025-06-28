import { z } from 'zod';

import { GenerationTopicModel } from '@/database/models/generationTopic';
import { GenerationTopicItem } from '@/database/schemas/generation';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { FileService } from '@/server/services/file';
import { GenerationService } from '@/server/services/generation';

const generationTopicProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      generationTopicModel: new GenerationTopicModel(ctx.serverDB, ctx.userId),
      fileService: new FileService(ctx.serverDB, ctx.userId),
      generationService: new GenerationService(ctx.serverDB, ctx.userId),
    },
  });
});

// Define input schemas
const updateTopicSchema = z.object({
  id: z.string(),
  value: z.object({
    title: z.string().nullable().optional(),
    coverUrl: z.string().nullable().optional(),
  }),
});

const updateTopicCoverSchema = z.object({
  id: z.string(),
  coverUrl: z.string(),
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
  updateTopicCover: generationTopicProcedure
    .input(updateTopicCoverSchema)
    .mutation(async ({ ctx, input }) => {
      // Process the cover image and get key
      const newCoverKey = await ctx.generationService.createCoverFromUrl(input.coverUrl);

      // Update the topic with the new cover key
      return ctx.generationTopicModel.update(input.id, { coverUrl: newCoverKey });
    }),
  deleteTopic: generationTopicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete the topic from database and get the deleted topic data
      const deletedTopic = await ctx.generationTopicModel.delete(input.id);

      // If topic had a cover image, delete it from S3
      if (deletedTopic && deletedTopic.coverUrl) {
        await ctx.fileService.deleteFile(deletedTopic.coverUrl);
      }

      return deletedTopic;
    }),
});

export type GenerationTopicRouter = typeof generationTopicRouter;

// Export input types for client/server service consistency
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type UpdateTopicValue = UpdateTopicInput['value'];
export type UpdateTopicCoverInput = z.infer<typeof updateTopicCoverSchema>;
