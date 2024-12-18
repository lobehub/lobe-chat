import { z } from 'zod';

import { serverDB } from '@/database/server';
import { TopicModel } from '@/database/server/models/topic';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc';
import { BatchTaskResult } from '@/types/service';

const topicProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { topicModel: new TopicModel(serverDB, ctx.userId) },
  });
});

export const topicRouter = router({
  batchCreateTopics: topicProcedure
    .input(
      z.array(
        z.object({
          favorite: z.boolean().optional(),
          id: z.string().optional(),
          messages: z.array(z.string()).optional(),
          sessionId: z.string().optional(),
          title: z.string(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }): Promise<BatchTaskResult> => {
      const data = await ctx.topicModel.batchCreate(
        input.map((item) => ({
          ...item,
        })) as any,
      );

      return { added: data.length, ids: [], skips: [], success: true };
    }),

  batchDelete: topicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      return ctx.topicModel.batchDelete(input.ids);
    }),

  batchDeleteBySessionId: topicProcedure
    .input(z.object({ id: z.string().nullable().optional() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.topicModel.batchDeleteBySessionId(input.id);
    }),

  cloneTopic: topicProcedure
    .input(z.object({ id: z.string(), newTitle: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.topicModel.duplicate(input.id, input.newTitle);

      return data.topic.id;
    }),

  countTopics: topicProcedure.query(async ({ ctx }) => {
    return ctx.topicModel.count();
  }),

  createTopic: topicProcedure
    .input(
      z.object({
        favorite: z.boolean().optional(),
        messages: z.array(z.string()).optional(),
        sessionId: z.string().nullable().optional(),
        title: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.topicModel.create(input);

      return data.id;
    }),

  getAllTopics: topicProcedure.query(async ({ ctx }) => {
    return ctx.topicModel.queryAll();
  }),

  // TODO: this procedure should be used with authedProcedure
  getTopics: publicProcedure
    .input(
      z.object({
        current: z.number().optional(),
        pageSize: z.number().optional(),
        sessionId: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) return [];

      const topicModel = new TopicModel(serverDB, ctx.userId);

      return topicModel.query(input);
    }),

  hasTopics: topicProcedure.query(async ({ ctx }) => {
    return (await ctx.topicModel.count()) === 0;
  }),

  removeAllTopics: topicProcedure.mutation(async ({ ctx }) => {
    return ctx.topicModel.deleteAll();
  }),

  removeTopic: topicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.topicModel.delete(input.id);
    }),

  searchTopics: topicProcedure
    .input(z.object({ keywords: z.string(), sessionId: z.string().nullable().optional() }))
    .query(async ({ input, ctx }) => {
      return ctx.topicModel.queryByKeyword(input.keywords, input.sessionId);
    }),

  updateTopic: topicProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.object({
          favorite: z.boolean().optional(),
          historySummary: z.string().optional(),
          messages: z.array(z.string()).optional(),
          metadata: z
            .object({
              model: z.string().optional(),
              provider: z.string().optional(),
            })
            .optional(),
          sessionId: z.string().optional(),
          title: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.topicModel.update(input.id, input.value);
    }),
});

export type TopicRouter = typeof topicRouter;
