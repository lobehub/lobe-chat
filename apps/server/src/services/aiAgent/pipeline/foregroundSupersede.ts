import debug from 'debug';

import type { AgentOperationModel } from '@/database/models/agentOperation';
import type { TopicModel } from '@/database/models/topic';
import type { AgentRuntimeService } from '@/server/services/agentRuntime';
// Imported from the module itself: tests mock the `agentRuntime` barrel.
import {
  isComposerSupersedableTrigger,
  type SupersedeKind,
  type SupersedeRecord,
} from '@/server/services/agentRuntime/foregroundOperation';

import type { InternalExecAgentParams } from '../types';

const log = debug('lobe-server:ai-agent-service');

export interface ForegroundSupersedeDeps {
  agentOperationModel: AgentOperationModel;
  agentRuntimeService: AgentRuntimeService;
  interruptTask: (params: {
    operationId?: string;
    topicId?: string;
  }) => Promise<{ success: boolean }>;
  topicModel: TopicModel;
}

export interface SupersededOperation {
  holderId: string;
  kind: SupersedeKind;
}

/**
 * The run this start replaces. A composer send names it from client state, so
 * it is honored only when it is one of this user's runs on the same topic;
 * server-derived continuations are trusted as given.
 */
export const resolveReplacedOperationId = async (
  deps: ForegroundSupersedeDeps,
  params: InternalExecAgentParams,
  topicId: string,
): Promise<string | undefined> => {
  const { replacesOperationId } = params;
  if (!replacesOperationId || !params.interactiveStart) return replacesOperationId;

  const replaced = await deps.agentOperationModel.findById(replacesOperationId);
  return replaced?.topicId === topicId ? replacesOperationId : undefined;
};

/**
 * Retire the foreground run that still owns the topic's `runningOperation`
 * before an interactive send starts the next one.
 *
 * The client is expected to stop a live run before sending (Stop / Send now)
 * or to queue the send until the run yields. When it misses one, nothing else
 * stops that run: `startOperation` overwrites the marker, and both runs keep
 * reading the same topic, interleave writes, and invalidate each other's
 * prompt cache, multiplying the conversation's cost for as long as the old
 * run lives.
 *
 * Runs inside the topic-start reservation so two fast sends cannot both read
 * the same stale holder. Only a `running` foreground run is retired; these
 * keep the existing behavior:
 * - a parked run (`waiting_for_human` etc.) — the send may be its answer;
 * - a background producer's run (task, cron, bot, …), see
 *   `isComposerSupersedableTrigger` in `agentRuntime/foregroundOperation`.
 *   An Agent Signal run on the main spine (task-result wakeup) is retired
 *   like a foreground run: the client never tracks it, so it cannot queue;
 * - a device-hosted Claude Code / Codex run: cancelling it waits up to 10s
 *   for the device, far past the reservation's ~3s retry budget, so a
 *   concurrent send would fail. Those settle through `replacesOperationId`
 *   before reserving.
 *
 * @returns the retired run and whether it had already been asked to stop, so
 * the caller can record the overlap on the new run.
 */
export const supersedeRunningForegroundOperation = async (
  deps: ForegroundSupersedeDeps,
  topicId: string,
  alreadyHandledOperationIds: (string | undefined)[],
): Promise<SupersededOperation | undefined> => {
  const topic = await deps.topicModel.findById(topicId);
  const marker = topic?.metadata?.runningOperation;
  const holderId = marker?.operationId;
  if (!holderId || marker.heteroType || alreadyHandledOperationIds.includes(holderId)) return;

  const holder = await deps.agentOperationModel.findById(holderId);
  if (holder?.status !== 'running') return;
  if (!isComposerSupersedableTrigger(holder.trigger)) return;

  // Read before interrupting: afterwards the sentinel is always set. The
  // read is diagnostic only, so a failure must not fail the send.
  let kind: SupersedeKind;
  try {
    kind = (await deps.agentRuntimeService.isOperationInterrupted(holderId))
      ? 'already_stopping'
      : 'client_missed';
  } catch (error) {
    console.error('[execAgent] failed to read interrupt state of %s:', holderId, error);
    kind = 'unknown';
  }

  log(
    'execAgent: superseding running foreground operation %s on topic %s (%s)',
    holderId,
    topicId,
    kind,
  );
  const interrupted = await deps.interruptTask({ operationId: holderId, topicId });
  // Unconfirmed only when the run has no runtime state left but its row has
  // not settled yet: nothing executes its next step, so the send proceeds
  // rather than failing on a run that cannot spend any more.
  if (!interrupted.success) {
    console.warn('[execAgent] supersede of %s was not confirmed', holderId, { topicId });
  }
  return { holderId, kind };
};

/**
 * Persist the supersede on the new run's `metadata.supersede`, with the
 * client's view of its runs at send time. A `client_missed` supersede means
 * the client let a live run keep going — the case to investigate — so it is
 * also warned. Diagnostic only: a failure here never fails the send.
 */
export const recordSupersede = async (
  deps: ForegroundSupersedeDeps,
  topicId: string,
  operationId: string,
  superseded: SupersededOperation,
  params: InternalExecAgentParams,
): Promise<void> => {
  const record: SupersedeRecord = {
    client: params.clientRunSnapshot,
    kind: superseded.kind,
    supersededAt: new Date().toISOString(),
    supersededOperationId: superseded.holderId,
  };

  if (superseded.kind === 'client_missed') {
    console.warn('[execAgent] client missed a running foreground operation', {
      client: params.clientRunSnapshot,
      operationId,
      supersededOperationId: superseded.holderId,
      topicId,
    });
  }

  try {
    await deps.agentOperationModel.mergeMetadata(operationId, { supersede: record });
  } catch (error) {
    console.error('[execAgent] failed to record supersede on %s:', operationId, error);
  }
};
