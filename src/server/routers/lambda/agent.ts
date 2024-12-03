import { z } from 'zod';

import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { serverDB } from '@/database/server';
import { AgentModel } from '@/database/server/models/agent';
import { FileModel } from '@/database/server/models/file';
import { KnowledgeBaseModel } from '@/database/server/models/knowledgeBase';
import { SessionModel } from '@/database/server/models/session';
import { UserModel } from '@/database/server/models/user';
import { pino } from '@/libs/logger';
import { authedProcedure, router } from '@/libs/trpc';
import { KnowledgeItem, KnowledgeType } from '@/types/knowledgeBase';

const agentProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      agentModel: new AgentModel(serverDB, ctx.userId),
      fileModel: new FileModel(serverDB, ctx.userId),
      knowledgeBaseModel: new KnowledgeBaseModel(serverDB, ctx.userId),
      sessionModel: new SessionModel(serverDB, ctx.userId),
    },
  });
});

export const agentRouter = router({
  createAgentFiles: agentProcedure
    .input(
      z.object({
        agentId: z.string(),
        enabled: z.boolean().optional(),
        fileIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.agentModel.createAgentFiles(input.agentId, input.fileIds, input.enabled);
    }),

  createAgentKnowledgeBase: agentProcedure
    .input(
      z.object({
        agentId: z.string(),
        enabled: z.boolean().optional(),
        knowledgeBaseId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.agentModel.createAgentKnowledgeBase(
        input.agentId,
        input.knowledgeBaseId,
        input.enabled,
      );
    }),

  deleteAgentFile: agentProcedure
    .input(
      z.object({
        agentId: z.string(),
        fileId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.agentModel.deleteAgentFile(input.agentId, input.fileId);
    }),

  deleteAgentKnowledgeBase: agentProcedure
    .input(
      z.object({
        agentId: z.string(),
        knowledgeBaseId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.agentModel.deleteAgentKnowledgeBase(input.agentId, input.knowledgeBaseId);
    }),

  getAgentConfig: agentProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.sessionId === INBOX_SESSION_ID) {
        const item = await ctx.sessionModel.findByIdOrSlug(INBOX_SESSION_ID);
        // if there is no session for user, create one
        if (!item) {
          // if there is no user, return default config
          const user = await UserModel.findById(serverDB, ctx.userId);
          if (!user) return DEFAULT_AGENT_CONFIG;

          const res = await ctx.sessionModel.createInbox();
          pino.info('create inbox session', res);
        }
      }

      const session = await ctx.sessionModel.findByIdOrSlug(input.sessionId);

      if (!session) throw new Error('Session not found');
      const sessionId = session.id;

      return await ctx.agentModel.findBySessionId(sessionId);
    }),

  getKnowledgeBasesAndFiles: agentProcedure
    .input(
      z.object({
        agentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<KnowledgeItem[]> => {
      const knowledgeBases = await ctx.knowledgeBaseModel.query();

      const files = await ctx.fileModel.query({
        showFilesInKnowledgeBase: false,
      });

      const knowledge = await ctx.agentModel.getAgentAssignedKnowledge(input.agentId);

      return [
        ...files.map((file) => ({
          enabled: knowledge.files.some((item) => item.id === file.id),
          fileType: file.fileType,
          id: file.id,
          name: file.name,
          type: KnowledgeType.File,
        })),
        ...knowledgeBases.map((knowledgeBase) => ({
          avatar: knowledgeBase.avatar,
          description: knowledgeBase.description,
          enabled: knowledge.knowledgeBases.some((item) => item.id === knowledgeBase.id),
          id: knowledgeBase.id,
          name: knowledgeBase.name,
          type: KnowledgeType.KnowledgeBase,
        })),
      ];
    }),

  toggleFile: agentProcedure
    .input(
      z.object({
        agentId: z.string(),
        enabled: z.boolean().optional(),
        fileId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.agentModel.toggleFile(input.agentId, input.fileId, input.enabled);
    }),

  toggleKnowledgeBase: agentProcedure
    .input(
      z.object({
        agentId: z.string(),
        enabled: z.boolean().optional(),
        knowledgeBaseId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.agentModel.toggleKnowledgeBase(
        input.agentId,
        input.knowledgeBaseId,
        input.enabled,
      );
    }),
});
