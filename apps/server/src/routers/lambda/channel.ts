import { CHANNEL_LIMITS } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { ChannelError } from '@/database/repositories/channel';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { ChannelService } from '@/server/services/channel/ChannelService';

const channelId = z.string().regex(/^chn_[\dA-Za-z]{12}$/);
const threadId = z.string().regex(/^cht_[\dA-Za-z]{12}$/);
const agentSelection = z.object({
  agentId: z.string().min(1),
  description: z.string().max(1000).optional(),
  deviceId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  workingDirectory: z.string().trim().min(1).max(4096).optional(),
});
const channelProcedure = wsCompatProcedure.use(serverDatabase).use(async ({ ctx, next }) => {
  const result = await next({
    ctx: {
      channelService: new ChannelService(ctx.serverDB, ctx.userId, ctx.workspaceId ?? undefined),
    },
  });
  if (!result.ok && result.error.cause instanceof ChannelError) {
    const cause = result.error.cause;
    throw new TRPCError({ cause, code: cause.code, message: cause.message });
  }
  return result;
});

export const channelRouter = router({
  addAgent: channelProcedure
    .input(z.object({ channelId, agent: agentSelection }))
    .mutation(async ({ ctx, input }) => ({
      data: await ctx.channelService.addAgent(input.channelId, input.agent),
      success: true,
    })),
  create: channelProcedure
    .input(
      z.object({
        agents: z.array(agentSelection).min(1).max(20),
        title: z.string().trim().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => ({
      data: await ctx.channelService.create(input),
      success: true,
    })),
  createThread: channelProcedure
    .input(
      z.object({
        channelId,
        followerMemberIds: z.array(z.uuid()).max(100),
        rootMessageId: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => ({
      data: await ctx.channelService.repository.createThread(input.channelId, input),
      success: true,
    })),
  detail: channelProcedure
    .input(
      z.object({
        before: z.number().int().positive().optional(),
        channelId,
        limit: z.number().int().min(1).max(100).optional(),
        threadId: threadId.nullish(),
      }),
    )
    .query(async ({ ctx, input }) => ({
      data: await ctx.channelService.detail(input.channelId, input),
      success: true,
    })),
  list: channelProcedure.query(async ({ ctx }) => ({
    data: await ctx.channelService.repository.list(),
    success: true,
  })),
  markRead: channelProcedure
    .input(z.object({ channelId, sequence: z.number().int().nonnegative() }))
    .mutation(async ({ ctx, input }) => ({
      data: await ctx.channelService.repository.markRead(input.channelId, input.sequence),
      success: true,
    })),
  send: channelProcedure
    .input(
      z.object({
        channelId,
        content: z.string().max(CHANNEL_LIMITS.contentLength),
        fileIds: z.array(z.string().min(1)).max(CHANNEL_LIMITS.attachments).optional(),
        mentions: z.array(z.uuid()).max(100).optional(),
        requestKey: z.string().min(1).max(200),
        threadId: threadId.nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => ({
      data: await ctx.channelService.send(input.channelId, input),
      success: true,
    })),
  stop: channelProcedure
    .input(
      z.object({
        channelId,
        scope: z.union([
          z.object({ jobId: z.uuid() }),
          z.object({ threadId: threadId.nullable() }),
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.channelService.stop(input.channelId, input.scope);
      return { success: true };
    }),
});
