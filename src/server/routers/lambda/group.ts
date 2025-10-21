import { z } from 'zod';

import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { ChatGroupModel } from '@/database/models/chatGroup';
import { insertChatGroupSchema } from '@/database/schemas/chatGroup';
import { ChatGroupConfig } from '@/database/types/chatGroup';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const groupProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      chatGroupModel: new ChatGroupModel(ctx.serverDB, ctx.userId),
    },
  });
});

const normalizeGroupConfig = (config?: ChatGroupConfig | null): ChatGroupConfig | undefined =>
  config
    ? {
        ...DEFAULT_CHAT_GROUP_CHAT_CONFIG,
        ...config,
      }
    : undefined;

export const groupRouter = router({
  addAgentsToGroup: groupProcedure
    .input(
      z.object({
        agentIds: z.array(z.string()),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.addAgentsToGroup(input.groupId, input.agentIds);
    }),

  createGroup: groupProcedure
    .input(insertChatGroupSchema.omit({ userId: true }))
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.create({
        ...input,
        config: normalizeGroupConfig(input.config as ChatGroupConfig | null),
      });
    }),

  deleteGroup: groupProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.delete(input.id);
    }),

  getGroup: groupProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    return ctx.chatGroupModel.findById(input.id);
  }),

  getGroupAgents: groupProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.chatGroupModel.getGroupAgents(input.groupId);
    }),

  getGroups: groupProcedure.query(async ({ ctx }) => {
    return ctx.chatGroupModel.queryWithMemberDetails();
  }),

  removeAgentsFromGroup: groupProcedure
    .input(
      z.object({
        agentIds: z.array(z.string()),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      for (const agentId of input.agentIds) {
        await ctx.chatGroupModel.removeAgentFromGroup(input.groupId, agentId);
      }
    }),

  updateAgentInGroup: groupProcedure
    .input(
      z.object({
        agentId: z.string(),
        groupId: z.string(),
        updates: z.object({
          enabled: z.boolean().optional(),
          order: z.number().optional(),
          role: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.updateAgentInGroup(input.groupId, input.agentId, input.updates);
    }),

  updateGroup: groupProcedure
    .input(
      z.object({
        id: z.string(),
        value: insertChatGroupSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.update(input.id, {
        ...input.value,
        config: normalizeGroupConfig(input.value.config as ChatGroupConfig | null),
      });
    }),
});

export type GroupRouter = typeof groupRouter;
