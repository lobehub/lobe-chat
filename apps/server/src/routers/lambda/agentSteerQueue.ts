import { randomUUID } from 'node:crypto';

import debug from 'debug';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { withScopedPermission } from '@/business/server/trpc-middlewares/rbacPermission';
import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { TopicModel } from '@/database/models/topic';
import { agentOperations } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { assertCanUseWorkspaceAgent } from '@/server/routers/lambda/_helpers/workspaceAgentGuard';
import type { QueuedFollowUp } from '@/server/services/aiAgent/steerQueue';
import { redisService } from '@/server/services/redis';

import { ExecAgentFieldsSchema } from './aiAgent/execSchemas';
import { assertCanUseAgentRunConversation } from './aiAgent/guards';
import { acceptsFileWorksOf, acceptsMemberRuntimeEndOf } from './aiAgent/utils';

const log = debug('lobe-lambda-router:agent-steer-queue');

/**
 * A composer send queued behind the running turn: the fresh-send part of an
 * `aiAgent.execAgent` request. Resume / regenerate / supersede fields are not
 * accepted — a follow-up always starts a new turn of its own.
 */
const QueuedRequestSchema = ExecAgentFieldsSchema.omit({
  autoStart: true,
  clientOperations: true,
  existingMessageIds: true,
  includeFinalState: true,
  parentMessageId: true,
  replacesOperationId: true,
  resumeApproval: true,
  resumeApprovals: true,
  resumeToolResult: true,
  sourceOperationId: true,
  steer: true,
}).refine((data) => data.agentId || data.slug, {
  message: 'Either agentId or slug must be provided',
});

const ScopeSchema = z.object({
  threadId: z.string().nullish(),
  topicId: z.string(),
});

const AppendSchema = z.object({
  /** Client-minted entry id, so the client can match its optimistic tray item. */
  id: z.string().min(1).max(64).optional(),
  request: QueuedRequestSchema,
});

const steerQueueProcedure = wsCompatProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  return opts.next({
    ctx: {
      topicModel: new TopicModel(ctx.serverDB, ctx.userId, ctx.workspaceId ?? undefined),
    },
  });
});
const steerQueueWriteProcedure = steerQueueProcedure.use(withScopedPermission('message:create'));

/**
 * Whether the caller's own run is live on the topic. Follow-ups only queue
 * behind it: the runtime drains them under the run owner's authority, so a run
 * someone else started is no place to leave one.
 */
const hasOwnLiveRun = async (
  ctx: { serverDB: LobeChatDatabase; topicModel: TopicModel; userId: string },
  topicId: string,
): Promise<boolean> => {
  const topic = await ctx.topicModel.findOwnTopicById(topicId);
  const runningOperation = topic?.metadata?.runningOperation;
  if (!runningOperation) return false;
  if (!(await ctx.topicModel.isRunningOperationAlive(ctx.serverDB, runningOperation))) return false;

  const [operation] = await ctx.serverDB
    .select({ userId: agentOperations.userId })
    .from(agentOperations)
    .where(eq(agentOperations.id, runningOperation.operationId))
    .limit(1);
  return operation?.userId === ctx.userId;
};

const toScope = (scope: z.infer<typeof ScopeSchema>) => ({
  threadId: scope.threadId ?? null,
  topicId: scope.topicId,
});

/**
 * Follow-ups queued behind a running agent turn ("steer"), held server-side.
 * The runtime hands the turn back at its next decision point and starts the
 * queued follow-ups as the next turn itself — see `startQueuedFollowUp`.
 */
export const agentSteerQueueRouter = router({
  /**
   * Queue a follow-up behind the topic's running turn.
   *
   * `queued: false` means nothing was stored and the client should send the
   * message itself: no own run is live (`idle`), the queue is at its bound
   * (`full`), or the server has no Redis (`unavailable`).
   */
  append: steerQueueWriteProcedure.input(AppendSchema).mutation(async ({ input, ctx }) => {
    const { streamFeatures, ...request } = input.request;
    const topicId = request.appContext?.topicId;
    if (!topicId) return { queued: false as const, reason: 'idle' as const };

    await assertCanUseWorkspaceAgent({
      agentId: request.agentId,
      db: ctx.serverDB,
      groupId: request.appContext?.groupId,
      slug: request.slug,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    });
    await assertCanUseAgentRunConversation({
      db: ctx.serverDB,
      topicId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    });

    if (!(await hasOwnLiveRun(ctx, topicId))) {
      return { queued: false as const, reason: 'idle' as const };
    }

    const scope = toScope({ threadId: request.appContext?.threadId, topicId });
    const entry: QueuedFollowUp = {
      audit: { clientIp: ctx.clientIp ?? undefined, userAgent: ctx.userAgent ?? undefined },
      createdAt: Date.now(),
      id: input.id ?? randomUUID(),
      request: {
        ...request,
        acceptsFileWorks: acceptsFileWorksOf(streamFeatures),
        acceptsMemberRuntimeEnd: acceptsMemberRuntimeEndOf(streamFeatures),
        // A follow-up continues the conversation it was typed into; it never
        // branches or creates one.
        appContext: {
          ...request.appContext,
          initialTopicMetadata: undefined,
          newThread: undefined,
          projectWorkingDirectoryId: undefined,
        },
      },
      userId: ctx.userId,
    };

    const length = await redisService.steerQueue.append(scope, entry);
    if (length === undefined) return { queued: false as const, reason: 'unavailable' as const };
    if (length === 'full') return { queued: false as const, reason: 'full' as const };

    // The run may have ended between the check above and the append, after its
    // drain: then nothing would ever start this entry. Take it back and let the
    // client send it. If the take-back loses, a drain already started it.
    if (!(await hasOwnLiveRun(ctx, topicId))) {
      const removed = await redisService.steerQueue.remove(scope, entry.id);
      if (removed) return { queued: false as const, reason: 'idle' as const };
    }

    log('append: topic=%s thread=%s id=%s length=%d', topicId, scope.threadId, entry.id, length);
    return { id: entry.id, length, queued: true as const };
  }),

  /** The follow-ups waiting on a conversation, oldest first. */
  list: steerQueueProcedure.input(ScopeSchema).query(async ({ input, ctx }) => {
    await assertCanUseAgentRunConversation({
      db: ctx.serverDB,
      topicId: input.topicId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    });

    const entries = await redisService.steerQueue.list<QueuedFollowUp>(toScope(input));
    return entries
      .filter((entry) => entry.userId === ctx.userId)
      .map(({ createdAt, id, request }) => ({
        createdAt,
        fileIds: request.fileIds,
        id,
        prompt: request.prompt,
      }));
  }),

  /**
   * Withdraw a queued follow-up. `removed: false` means it is gone already —
   * most likely a finishing run just started it.
   */
  remove: steerQueueWriteProcedure
    .input(ScopeSchema.extend({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const scope = toScope(input);
      const entries = await redisService.steerQueue.list<QueuedFollowUp>(scope);
      const entry = entries.find((item) => item.id === input.id);
      if (!entry || entry.userId !== ctx.userId) return { removed: false };

      return { removed: await redisService.steerQueue.remove(scope, input.id) };
    }),
});
