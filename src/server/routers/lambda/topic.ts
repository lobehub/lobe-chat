import { RecentTopic } from '@lobechat/types';
import { z } from 'zod';

import { TopicModel } from '@/database/models/topic';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { BatchTaskResult } from '@/types/service';

import { resolveAgentIdFromSession, resolveContext } from './_helpers/resolveContext';
import { basicContextSchema } from './_schema/context';

const topicProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { topicModel: new TopicModel(ctx.serverDB, ctx.userId) },
  });
});

export const topicRouter = router({
  batchCreateTopics: topicProcedure
    .input(
      z.array(
        z
          .object({
            favorite: z.boolean().optional(),
            id: z.string().optional(),
            messages: z.array(z.string()).optional(),
            title: z.string(),
          })
          .extend(basicContextSchema.shape),
      ),
    )
    .mutation(async ({ input, ctx }): Promise<BatchTaskResult> => {
      // 解析每个 topic 的 sessionId
      const resolvedTopics = await Promise.all(
        input.map(async (item) => {
          const { agentId, ...rest } = item;
          const resolved = await resolveContext(
            { agentId, sessionId: rest.sessionId },
            ctx.serverDB,
            ctx.userId,
          );
          return { ...rest, sessionId: resolved.sessionId };
        }),
      );

      const data = await ctx.topicModel.batchCreate(resolvedTopics as any);

      return { added: data.length, ids: [], skips: [], success: true };
    }),

  batchDelete: topicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      return ctx.topicModel.batchDelete(input.ids);
    }),

  batchDeleteBySessionId: topicProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        id: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const resolved = await resolveContext(
        { agentId: input.agentId, sessionId: input.id },
        ctx.serverDB,
        ctx.userId,
      );

      return ctx.topicModel.batchDeleteBySessionId(resolved.sessionId);
    }),

  cloneTopic: topicProcedure
    .input(z.object({ id: z.string(), newTitle: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.topicModel.duplicate(input.id, input.newTitle);

      return data.topic.id;
    }),

  countTopics: topicProcedure
    .input(
      z
        .object({
          endDate: z.string().optional(),
          range: z.tuple([z.string(), z.string()]).optional(),
          startDate: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.topicModel.count(input);
    }),

  createTopic: topicProcedure
    .input(
      z
        .object({
          favorite: z.boolean().optional(),
          groupId: z.string().nullable().optional(),
          messages: z.array(z.string()).optional(),
          title: z.string(),
        })
        .extend(basicContextSchema.shape),
    )
    .mutation(async ({ input, ctx }) => {
      const { agentId, ...rest } = input;
      const resolved = await resolveContext(
        { agentId, sessionId: rest.sessionId },
        ctx.serverDB,
        ctx.userId,
      );

      const data = await ctx.topicModel.create({ ...rest, sessionId: resolved.sessionId });

      return data.id;
    }),

  getAllTopics: topicProcedure.query(async ({ ctx }) => {
    return ctx.topicModel.queryAll();
  }),

  getTopics: topicProcedure
    .input(
      z.object({
        agentId: z.string().nullable().optional(),
        containerId: z.string().nullable().optional(),
        current: z.number().optional(),
        pageSize: z.number().optional(),
        sessionId: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { sessionId, ...rest } = input;

      // 如果提供了 sessionId 但没有 agentId，需要反向查找 agentId
      let effectiveAgentId = rest.agentId;
      if (!effectiveAgentId && sessionId) {
        effectiveAgentId = await resolveAgentIdFromSession(sessionId, ctx.serverDB, ctx.userId);
      }

      return ctx.topicModel.query({ ...rest, agentId: effectiveAgentId });
    }),

  hasTopics: topicProcedure.query(async ({ ctx }) => {
    return (await ctx.topicModel.count()) === 0;
  }),

  rankTopics: topicProcedure.input(z.number().optional()).query(async ({ ctx, input }) => {
    return ctx.topicModel.rank(input);
  }),

  recentTopics: topicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }): Promise<RecentTopic[]> => {
      return ctx.topicModel.queryRecent(input?.limit ?? 12);
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
    .input(
      z.object({
        agentId: z.string().optional(),
        groupId: z.string().nullable().optional(),
        keywords: z.string(),
        sessionId: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const resolved = await resolveContext(
        { agentId: input.agentId, sessionId: input.sessionId },
        ctx.serverDB,
        ctx.userId,
      );

      return ctx.topicModel.queryByKeyword(input.keywords, resolved.sessionId);
    }),

  updateTopic: topicProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.object({
          agentId: z.string().optional(),
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
      const { agentId, ...restValue } = input.value;

      // 如果提供了 agentId，解析为 sessionId
      let resolvedSessionId = restValue.sessionId;
      if (agentId && !resolvedSessionId) {
        const resolved = await resolveContext({ agentId }, ctx.serverDB, ctx.userId);
        resolvedSessionId = resolved.sessionId ?? undefined;
      }

      return ctx.topicModel.update(input.id, { ...restValue, sessionId: resolvedSessionId });
    }),
});

export type TopicRouter = typeof topicRouter;
