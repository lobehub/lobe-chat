import { z } from 'zod';

import { SessionModel } from '@/database/models/session';
import { SessionGroupModel } from '@/database/models/sessionGroup';
import { insertAgentSchema, insertSessionSchema } from '@/database/schemas';
import { serverDB } from '@/database/server';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc';
import { AgentChatConfigSchema } from '@/types/agent';
import { LobeMetaDataSchema } from '@/types/meta';
import { BatchTaskResult } from '@/types/service';
import { ChatSessionList } from '@/types/session';
import { merge } from '@/utils/merge';

const sessionProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      sessionGroupModel: new SessionGroupModel(serverDB, ctx.userId),
      sessionModel: new SessionModel(serverDB, ctx.userId),
    },
  });
});

export const sessionRouter = router({
  batchCreateSessions: sessionProcedure
    .input(
      z.array(
        z
          .object({
            config: z.object({}).passthrough(),
            group: z.string().optional(),
            id: z.string(),
            meta: LobeMetaDataSchema,
            pinned: z.boolean().optional(),
            type: z.string(),
          })
          .partial(),
      ),
    )
    .mutation(async ({ input, ctx }): Promise<BatchTaskResult> => {
      const data = await ctx.sessionModel.batchCreate(
        input.map((item) => ({
          ...item,
          ...item.meta,
        })) as any,
      );

      return { added: data.rowCount as number, ids: [], skips: [], success: true };
    }),

  cloneSession: sessionProcedure
    .input(z.object({ id: z.string(), newTitle: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.sessionModel.duplicate(input.id, input.newTitle);

      return data?.id;
    }),

  countSessions: sessionProcedure
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
      return ctx.sessionModel.count(input);
    }),

  createSession: sessionProcedure
    .input(
      z.object({
        config: insertAgentSchema
          .omit({ chatConfig: true, plugins: true, tags: true, tts: true })
          .passthrough()
          .partial(),
        session: insertSessionSchema.omit({ createdAt: true, updatedAt: true }).partial(),
        type: z.enum(['agent', 'group']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.sessionModel.create(input);

      return data.id;
    }),

  getGroupedSessions: publicProcedure.query(async ({ ctx }): Promise<ChatSessionList> => {
    if (!ctx.userId)
      return {
        sessionGroups: [],
        sessions: [],
      };

    const sessionModel = new SessionModel(serverDB, ctx.userId);

    return sessionModel.queryWithGroups();
  }),

  getSessions: sessionProcedure
    .input(
      z.object({
        current: z.number().optional(),
        pageSize: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { current, pageSize } = input;

      return ctx.sessionModel.query({ current, pageSize });
    }),

  rankSessions: sessionProcedure.input(z.number().optional()).query(async ({ ctx, input }) => {
    return ctx.sessionModel.rank(input);
  }),

  removeAllSessions: sessionProcedure.mutation(async ({ ctx }) => {
    return ctx.sessionModel.deleteAll();
  }),

  removeSession: sessionProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.sessionModel.delete(input.id);
    }),

  searchSessions: sessionProcedure
    .input(z.object({ keywords: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.sessionModel.queryByKeyword(input.keywords);
    }),

  updateSession: sessionProcedure
    .input(
      z.object({
        id: z.string(),
        value: insertSessionSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.sessionModel.update(input.id, input.value);
    }),
  updateSessionChatConfig: sessionProcedure
    .input(
      z.object({
        id: z.string(),
        value: AgentChatConfigSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.sessionModel.findByIdOrSlug(input.id);

      if (!session) return;

      return ctx.sessionModel.updateConfig(session.agent.id, {
        chatConfig: merge(session.agent.chatConfig, input.value),
      });
    }),
  updateSessionConfig: sessionProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.object({}).passthrough().partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.sessionModel.findByIdOrSlug(input.id);

      if (!session || !input.value) return;

      if (!session.agent) {
        throw new Error(
          'this session is not assign with agent, please contact with admin to fix this issue.',
        );
      }

      const mergedValue = merge(session.agent, input.value);
      return ctx.sessionModel.updateConfig(session.agent.id, mergedValue);
    }),
});

export type SessionRouter = typeof sessionRouter;
