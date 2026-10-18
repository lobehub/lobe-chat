import { type AgentOperationStatus, isAgentOperationInFlight, ThreadStatus } from '@lobechat/types';
import debug from 'debug';

import { ThreadModel } from '@/database/models/thread';
import { TopicModel } from '@/database/models/topic';
import { type LobeChatDatabase } from '@/database/type';

import { formatErrorForMetadata } from './AgentRuntimeService/utils';

const log = debug('lobe-server:agent-runtime:settle-run-marks');

/**
 * Converge the rows that display a run as "running" once its terminal
 * `agent_operations` row is durable. Called from
 * `CompletionLifecycle.persistCompletion`, the one place every ending passes
 * through — in-process and queue mode alike.
 */
export interface SettleRunMarksDeps {
  includeShareVisitor: boolean;
  serverDB: LobeChatDatabase;
  userId: string;
  workspaceId?: string;
}

/**
 * The topic status a finished run leaves behind, mirroring what the client
 * writes for the same outcome (`executeGatewayAgent`'s `onSessionComplete`) and
 * what `agentNotify` does for the remote path: only a clean finish is something
 * the user may not have watched (`unread`); every other ending is an
 * interruption they already saw (`active`).
 *
 * Agrees with the one existing server-side settle, too:
 * `ServerOperationStore.clearRunningMark` hardcodes `unread`, and it only ever
 * runs from the `finish` executor — the success path, where this helper returns
 * `unread` as well.
 */
const topicStatusForTerminalRun = (status: string): 'active' | 'unread' =>
  status === 'done' ? 'unread' : 'active';

/**
 * Drop the topic's `runningOperation` mark when a run reaches its terminal row.
 *
 * The ONLY server-side settle used to be `ServerOperationStore.clearRunningMark`,
 * and it runs from a single place: the `finish` executor. Every ending that
 * never emits a `finish` instruction therefore wrote a terminal
 * `agent_operations` row and left the topic exactly as the run's start had left
 * it — `status = 'running'` with `metadata.runningOperation` naming an operation
 * that had already finished:
 *
 * - a Stop is persisted at the step boundary (`AgentRuntimeService.executeStep`
 *   sets the state to `interrupted` once the in-flight step returns), and the
 *   following delivery usually finds the operation already terminal;
 * - `interruptOperation` settles a client-parked run itself, and
 *   `buildShareAbortResult` settles a revoked share visitor run;
 * - a loop stopped by `max_steps` / `cost_limit` ends without the agent asking
 *   to finish.
 *
 * Nothing then revisited the row: the client's own settle is a single attempt
 * that a transient server refusal discards, and the client watchdog only runs
 * with that user's sidebar open. Observed 2026-10-13 on a self-hosted
 * deployment as a topic shown "running" for 45 minutes whose operation row had
 * been `interrupted` since 03:33:58Z with `topics.updated_at` frozen at the
 * run's start — `settleRunningOperation` always bumps `updated_at`, so that
 * timestamp is proof no settle ever reached the row. 16 rows of the same shape,
 * the oldest two months old.
 *
 * Persisting the terminal row is the moment the run is over, so converging
 * here covers every ending above (and any future one) instead of adding a call
 * to each caller. Compare-and-clear, exactly as the executor's adapter does:
 * only the operation the mark names — or one of its children — may drop it, so
 * a newer run that claimed the topic meanwhile is left alone and answers
 * `conflict`. Best-effort: a topic that cannot be reached must not fail the
 * completion it already persisted.
 */
export const settleTopicRunningMark = async (
  deps: SettleRunMarksDeps,
  params: { operationId: string; status: AgentOperationStatus; topicId?: string },
): Promise<void> => {
  const { operationId, status, topicId } = params;

  // No topic to settle (a sub-agent run, a bot thread, a verify pass).
  if (!topicId) return;
  // Only an ending may drop the mark. Not merely the parked three: the fallback
  // above settles for the status read back from the row rather than one this
  // callback authored, and `idle` / `running` are no more of an ending than a
  // pause is. `isAgentOperationInFlight` is the shared authority for both.
  if (isAgentOperationInFlight(status)) return;
  // A lease-expired abandon settles the topic on its own path with its own
  // status (`AbandonOperationService`); leave that one to it.
  if (status === 'abandoned') return;

  try {
    const topicModel = new TopicModel(deps.serverDB, deps.userId, deps.workspaceId, undefined, {
      includeShareVisitor: deps.includeShareVisitor,
    });

    const settled = await topicModel.settleRunningOperation(
      topicId,
      operationId,
      topicStatusForTerminalRun(status),
    );

    // `missing` (another writer already cleared it) and `conflict` (a newer run
    // owns the mark) are both correct no-ops, not failures.
    if (settled.status !== 'settled') {
      log('[%s] Topic running mark left alone: %s', operationId, settled.status);
    }
  } catch (error) {
    log('[%s] Failed to settle the topic running mark (non-fatal): %O', operationId, error);
  }
};

/**
 * The isolation-thread status a finished run leaves behind. Mirrors the
 * thread hooks' reason mapping (`createThreadHooks`), keyed by the durable
 * operation status instead.
 */
const threadStatusForTerminalRun = (status: AgentOperationStatus): ThreadStatus | undefined => {
  switch (status) {
    case 'done': {
      return ThreadStatus.Completed;
    }
    case 'error':
    case 'abandoned': {
      return ThreadStatus.Failed;
    }
    case 'interrupted': {
      return ThreadStatus.Cancel;
    }
    default: {
      return undefined;
    }
  }
};

/**
 * Move the isolation thread a sub-agent / isolated member ran in out of
 * `processing` when that run ends.
 *
 * The thread hooks registered by `execAgentThreadRun` (`createThreadHooks`)
 * carry only in-memory handlers, and in queue mode `HookDispatcher` delivers
 * webhooks only, so in production they never fire: every `callAgent` /
 * `callSubAgent` thread stayed `processing` after its operation was `done`
 * and the task card spun forever. Observed 2026-10-18: 562 isolation threads
 * in two days `processing` with a `done` operation.
 *
 * Compare-and-set on the run (`ThreadModel.settleIsolationRun`), so a
 * follow-up run already claimed on the same thread is left alone. In local
 * mode the thread hook still writes the same outcome; whichever lands second
 * is a no-op. Best-effort: never fails the completion it follows.
 */
export const settleIsolationThread = async (
  deps: SettleRunMarksDeps,
  params: {
    error?: unknown;
    operationId: string;
    status: AgentOperationStatus;
    threadId?: string;
  },
): Promise<void> => {
  const { error, operationId, status, threadId } = params;
  if (!threadId) return;

  const threadStatus = threadStatusForTerminalRun(status);
  if (!threadStatus) return;

  try {
    const threadModel = new ThreadModel(deps.serverDB, deps.userId, deps.workspaceId);
    const settled = await threadModel.settleIsolationRun(threadId, operationId, {
      error: threadStatus === ThreadStatus.Completed ? undefined : formatErrorForMetadata(error),
      status: threadStatus,
    });
    if (!settled) log('[%s] Thread %s left alone', operationId, threadId);
  } catch (error) {
    log('[%s] Failed to settle isolation thread (non-fatal): %O', operationId, error);
  }
};
