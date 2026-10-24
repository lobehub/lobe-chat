import type { LobeChatDatabase } from '@lobechat/database';
import { buildChannelPrompt, CHANNEL_INSTRUCTIONS } from '@lobechat/prompts';
import type { ChannelExecutionConfig } from '@lobechat/types';
import { isRecord } from '@lobechat/utils/object';
import { and, asc, eq, isNull, or } from 'drizzle-orm';
import pMap from 'p-map';

import { getServerDB } from '@/database/core/db-adaptor';
import { AgentOperationModel } from '@/database/models/agentOperation';
import { MessageModel } from '@/database/models/message';
import type { ChannelClaim } from '@/database/repositories/channel';
import { ChannelExecutionRepository } from '@/database/repositories/channel';
import { agentOperations, channelJobs, channelMembers, channels } from '@/database/schemas';
import { getServerDefaultAgentConfig } from '@/server/globalConfig';
import { extractTextFromMessage } from '@/server/services/agentRuntime/CompletionLifecycle/messageContent';
import type { AgentHook } from '@/server/services/agentRuntime/hooks/types';
import { AiAgentService } from '@/server/services/aiAgent';
import { deviceGateway } from '@/server/services/deviceGateway';
import { getScopedOnlineDevices } from '@/server/services/deviceGateway/scopedDevices';
import { isQueueAgentRuntimeEnabled } from '@/server/services/queue/impls';

import { resolveChannelAttachments } from './attachments';
import { notifyChannel } from './notify';
import { registerLocalChannelAdvance, wakeChannel } from './queue';

const LEASE_MS = 60_000;

/** Source-side coordination. Both Native and Codex execute through the ordinary Agent pipeline. */
export class ChannelCoordinator {
  private readonly executions: ChannelExecutionRepository;

  constructor(private readonly db: LobeChatDatabase) {
    this.executions = new ChannelExecutionRepository(db);
  }

  private service(userId: string, workspaceId: string | null) {
    return new AiAgentService(this.db, userId, { workspaceId: workspaceId ?? undefined });
  }

  advance = async (channelId: string) => {
    const [channel] = await this.db.select().from(channels).where(eq(channels.id, channelId));
    if (!channel) return;
    const pending = await this.db
      .select()
      .from(channelJobs)
      .where(
        and(
          eq(channelJobs.channelId, channelId),
          or(
            eq(channelJobs.status, 'queued'),
            eq(channelJobs.writerHeld, true),
            and(eq(channelJobs.status, 'running'), isNull(channelJobs.publishedMessageId)),
          ),
        ),
      )
      .orderBy(asc(channelJobs.createdAt))
      .limit(100);

    // Reserve the next recovery before dispatch. A worker can die after the device
    // accepted a run but before this invocation reaches its end.
    if (pending.length) await wakeChannel(channelId, LEASE_MS);

    const members = pending.some((job) => job.status === 'queued')
      ? await this.db
          .select({ config: channelMembers.config })
          .from(channelMembers)
          .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.active, true)))
      : [];
    const owners = [
      ...new Set(
        members.flatMap(({ config }) => (config?.deviceOwnerId ? [config.deviceOwnerId] : [])),
      ),
    ];
    const presence = await pMap(
      owners,
      (owner) => getScopedOnlineDevices(this.db, owner, channel.workspaceId ?? undefined),
      { concurrency: 5 },
    );
    const onlineDeviceIds = presence
      .flat()
      .filter((device) => device.online)
      .map((device) => device.deviceId);

    for (const job of pending) {
      if (job.status !== 'queued') {
        await this.complete(channelId, job.id, job.operationId ?? undefined);
        continue;
      }
      const claim = await this.executions.claim(channelId, job.id, {
        leaseMs: LEASE_MS,
        leaseOwner: crypto.randomUUID(),
        onlineDeviceIds,
        serverDefaultAgentConfig: getServerDefaultAgentConfig(),
      });
      if (claim) await this.dispatch(claim, channel.workspaceId);
    }
    if (pending.length) await notifyChannel(this.db, channelId);
  };

  private async dispatch({ job, member, topic }: ChannelClaim, workspaceId: string | null) {
    if (
      !job.operationId ||
      !job.manifest ||
      !job.executionConfig ||
      !member.agentId ||
      !topic.userId
    )
      throw new Error('Incomplete Channel execution claim');
    const config: ChannelExecutionConfig = structuredClone(job.executionConfig);
    // The claimed Channel environment is authoritative for this run.
    config.agencyConfig = {
      ...config.agencyConfig,
      executionTarget: config.deviceId ? 'device' : 'none',
      executionTargetSelectionPolicy: 'fixed',
      boundDeviceId: config.deviceId,
      workingDirByDevice:
        config.deviceId && config.workingDirectory
          ? { [config.deviceId]: config.workingDirectory }
          : {},
    };
    const completion: AgentHook = {
      id: `channel:${job.id}`,
      type: 'onComplete',
      ...(isQueueAgentRuntimeEnabled()
        ? {
            webhook: {
              url: '/api/agent/webhooks/channel-callback',
              delivery: 'qstash' as const,
              fallback: 'none' as const,
              body: { channelId: job.channelId, jobId: job.id },
            },
          }
        : {
            handler: async () => {
              await this.complete(job.channelId, job.id, job.operationId!);
              await wakeChannel(job.channelId);
            },
          }),
    };
    try {
      const input = await this.executions.input(job.channelId, job.id);
      const attachments = await resolveChannelAttachments(
        this.db,
        topic.userId,
        workspaceId,
        input,
      );
      const result = await this.service(topic.userId, workspaceId).execAgent({
        agentId: member.agentId,
        agentConfigSnapshot: config,
        appContext: { topicId: topic.id },
        deviceId: config.deviceId,
        disableLocalSystem: !config.deviceId,
        ...attachments,
        hooks: [completion],
        instructions: CHANNEL_INSTRUCTIONS,
        maxSteps: 32,
        prompt: buildChannelPrompt(job.manifest, input),
        reservedOperationId: job.operationId,
        trigger: 'channel',
        userInterventionConfig: { approvalMode: 'headless' },
      });
      if (!result.success) throw new Error(result.error || 'Agent could not start');
      await this.executions.accepted(job.channelId, job.id, {});
    } catch (error) {
      console.error('[channel:dispatch]', error);
      const operation = await new AgentOperationModel(
        this.db,
        topic.userId,
        workspaceId ?? undefined,
      ).findById(job.operationId);
      if (operation?.status === 'idle') {
        await this.executions.retireReservation(job.channelId, job.id);
      } else
        await this.executions.fail(job.channelId, job.id, {
          message: error instanceof Error ? error.message : 'Agent could not start',
          // An untouched reservation proves no runtime was dispatched. Anything else is inspected.
          notSubmitted: false,
        });
    } finally {
      await this.executions.finishDispatch(job.channelId, job.id);
      await wakeChannel(job.channelId);
    }
  }

  /** Callbacks carry identity only; read the authoritative final reply from ordinary storage. */
  complete = async (channelId: string, jobId: string, operationId?: string) => {
    const [row] = await this.db
      .select({ job: channelJobs, operation: agentOperations })
      .from(channelJobs)
      .leftJoin(agentOperations, eq(agentOperations.id, channelJobs.operationId))
      .where(and(eq(channelJobs.channelId, channelId), eq(channelJobs.id, jobId)))
      .limit(1);
    if (!row || !operationId || row.job.operationId !== operationId) return;
    const { job, operation } = row;
    if (!operation || !job.manifest) return;
    if (
      operation.status === 'idle' &&
      job.leaseExpiresAt &&
      job.leaseExpiresAt.getTime() < Date.now()
    ) {
      // A reservation that was never started can be retired. Its old dispatcher cannot
      // initialise this now-terminal operation, even if it resumes after a process stall.
      await this.executions.retireReservation(channelId, jobId);
      return;
    }
    if (job.publicationRevoked && operation.status !== 'done') {
      await this.stopWriters([job]);
      return;
    }
    if (operation.status === 'done') {
      if (job.publicationRevoked) {
        await this.stopWriters([job]);
        return;
      }
      if (job.draft === null) {
        if (!operation.userId || !job.topicId) return;
        const final = await new MessageModel(
          this.db,
          operation.userId,
          operation.workspaceId ?? undefined,
        ).findLatestAssistantByOperationId({ operationId, topicId: job.topicId });
        const content = final?.tools?.length ? undefined : extractTextFromMessage(final);
        if (!content?.trim()) {
          await this.stopWriters([job]);
          await notifyChannel(this.db, channelId);
          return;
        }
        await this.executions.accepted(channelId, jobId, {});
        await this.executions.saveDraft(channelId, jobId, content);
      }
      await this.executions.publish(channelId, jobId);
      await this.stopWriters([job]);
      await notifyChannel(this.db, channelId);
    } else if (['error', 'interrupted', 'abandoned'].includes(operation.status)) {
      await this.executions.fail(channelId, jobId, {
        message: 'Agent execution ended without a reply',
      });
      if (job.writerHeld) await this.stopWriters([job]);
      // Device cancellation/unknown outcomes keep the physical writer until confirmed by stop.
    }
  };

  stopWriters = async (
    jobs: Array<{ channelId: string; id: string; operationId: string | null }>,
  ) => {
    for (const job of jobs) {
      if (!job.operationId) continue;
      const [row] = await this.db
        .select({ operation: agentOperations, config: channelJobs.executionConfig })
        .from(agentOperations)
        .innerJoin(channelJobs, eq(channelJobs.operationId, agentOperations.id))
        .where(eq(agentOperations.id, job.operationId));
      if (!row?.operation.userId) continue;
      if (await this.executions.retireReservation(job.channelId, job.id)) continue;
      // Cancellation must not release the writer while a dispatcher can still submit
      // its network request. An operation result alone does not prove device exit.
      const [current] = await this.db.select().from(channelJobs).where(eq(channelJobs.id, job.id));
      if (!current?.writerHeld || current.leaseOwner) continue;
      if (row.config?.runtime === 'native') {
        const result = await this.service(
          row.operation.userId,
          row.operation.workspaceId,
        ).interruptTask({
          operationId: job.operationId,
          topicId: row.operation.topicId ?? undefined,
        });
        if (
          result.success ||
          ['done', 'error', 'interrupted', 'abandoned'].includes(row.operation.status)
        )
          await this.executions.releaseWriter(job.channelId, job.id);
      } else if (row.config?.deviceId) {
        // Use the frozen identity even if runtime cleanup already removed the topic marker.
        const result = await deviceGateway.executeToolCall(
          {
            deviceId: row.config.deviceId,
            userId: row.config.deviceOwnerId ?? row.operation.userId,
            workspaceId: row.operation.workspaceId ?? undefined,
          },
          {
            apiName: 'cancelHeteroTask',
            arguments: JSON.stringify({ signal: 'SIGINT', taskId: job.operationId }),
            identifier: 'cancelHeteroTask',
          },
          10_000,
        );
        if (result.success && isRecord(result.state) && result.state.exited === true)
          await this.executions.releaseWriter(job.channelId, job.id);
      }
    }
  };
}

registerLocalChannelAdvance(async (channelId) => {
  await new ChannelCoordinator(await getServerDB()).advance(channelId);
});
