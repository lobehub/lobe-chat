import { z } from 'zod';

import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { AgentModel } from '@/database/models/agent';
import { ChatGroupModel } from '@/database/models/chatGroup';
import { AgentGroupRepository } from '@/database/repositories/agentGroup';
import { insertAgentSchema } from '@/database/schemas';
import { insertChatGroupSchema } from '@/database/schemas/chatGroup';
import { ChatGroupConfig } from '@/database/types/chatGroup';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const agentGroupProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      agentGroupRepo: new AgentGroupRepository(ctx.serverDB, ctx.userId),
      agentModel: new AgentModel(ctx.serverDB, ctx.userId),
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

export const agentGroupRouter = router({
  addAgentsToGroup: agentGroupProcedure
    .input(
      z.object({
        agentIds: z.array(z.string()),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.addAgentsToGroup(input.groupId, input.agentIds);
    }),

  createGroup: agentGroupProcedure
    .input(insertChatGroupSchema.omit({ userId: true }))
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.create({
        ...input,
        config: normalizeGroupConfig(input.config as ChatGroupConfig | null),
      });
    }),

  /**
   * Create a group with virtual member agents in one request.
   * This is the recommended way to create a group from a template.
   * The backend will:
   * 1. Batch create virtual agents from member configs
   * 2. Create the group
   * 3. Add the agents to the group
   * Returns the groupId and created agentIds.
   */
  createGroupWithMembers: agentGroupProcedure
    .input(
      z.object({
        groupConfig: insertChatGroupSchema.omit({ userId: true }),
        members: z.array(
          insertAgentSchema
            .omit({
              chatConfig: true,
              openingMessage: true,
              openingQuestions: true,
              tts: true,
              userId: true,
            })
            .partial(),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Batch create virtual agents
      const memberConfigs = input.members.map((member) => ({
        ...member,
        plugins: member.plugins as string[] | undefined,
        tags: member.tags as string[] | undefined,
        virtual: true,
      }));

      const createdAgents = await ctx.agentModel.batchCreate(memberConfigs);
      const agentIds = createdAgents.map((agent) => agent.id);

      // 2. Create group with agents
      const { group } = await ctx.chatGroupModel.createWithAgents(
        {
          ...input.groupConfig,
          config: normalizeGroupConfig(input.groupConfig.config as ChatGroupConfig | null),
        },
        agentIds,
      );

      return {
        agentIds,
        groupId: group.id,
      };
    }),

  deleteGroup: agentGroupProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.chatGroupModel.delete(input.id);
    }),

  getGroup: agentGroupProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.chatGroupModel.findById(input.id);
    }),

  getGroupAgents: agentGroupProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.chatGroupModel.getGroupAgents(input.groupId);
    }),

  getGroupDetail: agentGroupProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.agentGroupRepo.findByIdWithAgents(input.id);
    }),

  getGroups: agentGroupProcedure.query(async ({ ctx }) => {
    return ctx.chatGroupModel.queryWithMemberDetails();
  }),

  removeAgentsFromGroup: agentGroupProcedure
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

  updateAgentInGroup: agentGroupProcedure
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

  updateGroup: agentGroupProcedure
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

export type AgentGroupRouter = typeof agentGroupRouter;
