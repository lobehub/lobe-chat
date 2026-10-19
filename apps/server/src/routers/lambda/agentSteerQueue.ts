import { randomUUID } from 'node:crypto';

import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { z } from 'zod';

import { withScopedPermission } from '@/business/server/trpc-middlewares/rbacPermission';
import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { assertCanUseWorkspaceAgent } from '@/server/routers/lambda/_helpers/workspaceAgentGuard';
import type { QueuedFollowUp } from '@/server/services/aiAgent/steerQueue';
import { findOwnLiveRuns, isRunAlive } from '@/server/services/aiAgent/steerQueue/liveRuns';
import { redisService } from '@/server/services/redis';
import {
  type SteerQueueScope,
  SteerQueueWriteUnknownError,
} from '@/server/services/redis/steerQueue';

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
  // Stored in a tab / newline delimited header, so only delimiter-safe ids.
  id: z
    .string()
    .regex(/^[\w-]{1,64}$/, 'Use letters, digits, `_` or `-` (at most 64)')
    .optional(),
  request: QueuedRequestSchema,
});

const steerQueueProcedure = wsCompatProcedure.use(serverDatabase);
const steerQueueWriteProcedure = steerQueueProcedure.use(withScopedPermission('message:create'));

/** The caller's own queue on the surface: each user only reads and fills theirs. */
const toScope = (scope: z.infer<typeof ScopeSchema>, userId: string): SteerQueueScope => ({
  threadId: scope.threadId ?? null,
  topicId: scope.topicId,
  userId,
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
   * (`full`), more than one own run is live on the surface (`ambiguous`), or
   * the follow-up could not be stored (`unavailable`). A `SERVICE_UNAVAILABLE`
   * error means the outcome is unknown: retry with the same `id`.
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

    const scope = toScope({ threadId: request.appContext?.threadId, topicId }, ctx.userId);
    const liveRuns = await findOwnLiveRuns(
      { db: ctx.serverDB, workspaceId: ctx.workspaceId },
      scope,
    );
    if (liveRuns.length === 0) return { queued: false as const, reason: 'idle' as const };
    // Two runs on one surface (thread starts are not serialized): there is no
    // telling which one the user is typing behind, so do not guess.
    if (liveRuns.length > 1) return { queued: false as const, reason: 'ambiguous' as const };
    const [behindOperationId] = liveRuns;

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

    let length: Awaited<ReturnType<typeof redisService.steerQueue.append>>;
    try {
      length = await redisService.steerQueue.append(scope, entry, behindOperationId);
    } catch (error) {
      if (!(error instanceof SteerQueueWriteUnknownError)) throw error;
      // Neither "queued" nor "send directly" is safe to answer; the client
      // retries with the same entry id, which appends at most once.
      throw new TRPCError({ cause: error, code: 'SERVICE_UNAVAILABLE', message: error.message });
    }
    if (length === undefined) return { queued: false as const, reason: 'unavailable' as const };
    if (length === 'full') return { queued: false as const, reason: 'full' as const };
    // A retry of a write that landed and was already taken by its run: it is
    // on its way, so the client must not send it again.
    if (length === 'taken') return { id: entry.id, length: 0, queued: true as const };

    // The run may have ended between the check above and the append, after its
    // drain: then nothing would ever start this entry. Take it back and let the
    // client send it. If the take-back loses, a drain already started it.
    if (
      !(await isRunAlive(
        { db: ctx.serverDB, workspaceId: ctx.workspaceId },
        ctx.userId,
        behindOperationId,
      ))
    ) {
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

    const entries = await redisService.steerQueue.list<QueuedFollowUp>(toScope(input, ctx.userId));
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
      const scope = toScope(input, ctx.userId);
      const entries = await redisService.steerQueue.list<QueuedFollowUp>(scope);
      const entry = entries.find((item) => item.id === input.id);
      if (!entry || entry.userId !== ctx.userId) return { removed: false };

      return { removed: await redisService.steerQueue.remove(scope, input.id) };
    }),
});
