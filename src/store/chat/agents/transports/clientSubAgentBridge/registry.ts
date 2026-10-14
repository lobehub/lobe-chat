import { type ConversationContext } from '@lobechat/types';
import debug from 'debug';

import { threadService } from '@/services/thread';

import {
  type ClientSubAgentBridgeRegistration,
  type PersistedBridgeCoordinates,
  type SubAgentBridgeOutcome,
} from './types';

const log = debug('lobe-store:client-subagent-bridge');

export const registry = new Map<string, ClientSubAgentBridgeRegistration>();

/**
 * Parallel-call barrier: one parent turn may emit several `callSubAgent`
 * calls (systemRole documents parallel dispatch). All of them park the same
 * parent op, so the parent may only resume after the LAST child settles.
 * Keyed by the shared parked parent op id; each registration carries its own
 * tool message, so backfills stay per-child while the resume is barriered.
 */
export const pendingByParentOp = new Map<string, Set<string>>();

/**
 * Terminal outcomes held while a registration was still unarmed — replayed by
 * arming at the parent park (the child has no second terminal boundary). Cleared
 * per thread on replay; the test reset clears everything.
 */
export const heldCompletions = new Map<string, SubAgentBridgeOutcome>();

/**
 * Test-only reset: the registry is module-level shared state, and a restored
 * claim (retry semantics) must not leak across test cases. Not exported from
 * the package index.
 */
export const __resetBridgeForTests = (): void => {
  heldCompletions.clear();
  registry.clear();
  pendingByParentOp.clear();
};

export const trackPending = (registration: ClientSubAgentBridgeRegistration) => {
  const parentOpId =
    registration.kind === 'sub-agent'
      ? registration.parentOperationId
      : registration.orchestrationOperationId;
  let pending = pendingByParentOp.get(parentOpId);
  if (!pending) {
    pending = new Set<string>();
    pendingByParentOp.set(parentOpId, pending);
  }
  pending.add(registration.toolMessageId);
};

export const releasePending = (registration: ClientSubAgentBridgeRegistration): boolean => {
  const parentOpId =
    registration.kind === 'sub-agent'
      ? registration.parentOperationId
      : registration.orchestrationOperationId;
  const pending = pendingByParentOp.get(parentOpId);
  if (!pending) return true;
  pending.delete(registration.toolMessageId);
  if (pending.size === 0) {
    pendingByParentOp.delete(parentOpId);
    return true;
  }
  return false;
};

const registryKey = (childContext: ConversationContext): string | undefined =>
  childContext.threadId ?? undefined;

const toPersistedCoordinates = (
  registration: ClientSubAgentBridgeRegistration,
): PersistedBridgeCoordinates =>
  registration.kind === 'sub-agent'
    ? {
        kind: registration.kind,
        parentContext: registration.parentContext,
        parentOperationId: registration.parentOperationId,
        toolMessageId: registration.toolMessageId,
      }
    : {
        kind: registration.kind,
        memberAgentId: registration.memberAgentId,
        messageContext: registration.messageContext,
        orchestrationOperationId: registration.orchestrationOperationId,
        supervisorAgentId: registration.supervisorAgentId,
        supervisorSnapshot: registration.supervisorSnapshot,
        toolMessageId: registration.toolMessageId,
      };

/**
 * Merge the bridge coordinates into the child thread's metadata. Read-modify-
 * write: the server replaces the whole jsonb blob, so a blind write would
 * clobber `startedAt` and friends.
 */
const persistBridgeCoordinates = async (
  childThreadId: string,
  childTopicId: string | undefined,
  registration: ClientSubAgentBridgeRegistration,
): Promise<void> => {
  if (!childTopicId) return;
  try {
    const threads = await threadService.getThreads(childTopicId);
    const thread = threads.find((t) => t.id === childThreadId);
    // The row must still be mid-run: a settled thread means the child already
    // completed through a path that settled it — persisting now would let a
    // stale bridge re-fire after a later reload.
    if (!thread || thread.status !== 'processing') return;

    await threadService.updateThread(childThreadId, {
      metadata: {
        ...thread.metadata,
        bridge: toPersistedCoordinates(registration),
      },
    });
    log('bridge coordinates persisted to thread %s', childThreadId);
  } catch (error) {
    // Best-effort: without persistence the bridge still works in-session;
    // only the post-reload reconstruction is lost. Loud log for diagnosis.
    log('bridge: failed to persist coordinates for %s: %O', childThreadId, error);
  }
};

export const registerClientSubAgentBridge = (registration: ClientSubAgentBridgeRegistration) => {
  const key = registryKey(registration.childContext);
  if (!key) {
    log('bridge registration skipped: child context has no threadId');
    return;
  }
  // Two-phase activation: default unarmed. Only the group park-exit passes
  // `armed: true` (its park is already fully formed); the sub-agent spawner
  // registers BEFORE the parent's deferred pause assembles, so its
  // registration arms later — at the parent's actual park, inside
  // `armClientSubAgentBridgesForContext`.
  registry.set(key, { armed: false, ...registration });
  trackPending(registration);
  log(
    'bridge registered (armed=%s): key=%s kind=%s toolMessage=%s',
    String(registration.armed ?? false),
    key,
    registration.kind,
    registration.toolMessageId,
  );
  // Post-reload lifeline: the in-memory registry dies with the renderer, the
  // parked child does not. Fire-and-forget — a persistence failure must not
  // break the park.
  void persistBridgeCoordinates(key, registration.childContext.topicId ?? undefined, registration);
};

/**
 * Spawner-side registration for `runClientSubAgent` (streamingExecutor): the
 * parked child's context + the parent run's coordinates. Kept here so the
 * oversized streamingExecutor file only carries a one-line call — AGENTS.md
 * forbids growing files already over the 800-line limit.
 */
export const registerSubAgentBridgeFromSpawner = (params: {
  childContext: ConversationContext;
  childOperationId: string;
  /**
   * Operation lookup — the bridge reads the FULL parent context
   * (threadId / scope / documentId / workspaceSlug / groupId …) from
   * `getParentOperation(parentOperationId)?.context` itself, so the resume
   * reconstructs the parent's message bucket in the original scope. A
   * spawner-side trimmed context made thread- and page-scoped parents resume
   * into the main-topic bucket (messageMapKey isolation).
   */
  getParentOperation: (
    parentOperationId: string,
  ) => { context?: unknown; status: string } | undefined;
  parentAgentId: string;
  parentOperationId?: string;
  toolMessageId: string;
}): void => {
  const {
    childContext,
    childOperationId,
    getParentOperation,
    parentAgentId,
    parentOperationId,
    toolMessageId,
  } = params;

  // No parent op id (legacy spawner) → no bridge to hang the resume on.
  if (!parentOperationId) return;
  const parentOp = getParentOperation(parentOperationId);
  if (!parentOp) return;

  registerClientSubAgentBridge({
    childContext,
    childOperationId,
    kind: 'sub-agent',
    parentContext: {
      // Full parent context (see doc above); agentId pinned to the spawner's
      // value. The operation context extends ConversationContext.
      ...(parentOp.context as ConversationContext | undefined),
      agentId: parentAgentId,
    },
    parentOperationId,
    toolMessageId,
  });
};

/**
 * Member-side registration for the group-orchestration park-exit: the parked
 * member's context + the orchestration's coordinates. Same size rationale as
 * the spawner-side helper above.
 */
export const registerGroupBridgeFromParkExit = (params: {
  childContext: ConversationContext;
  childOperationId: string;
  memberAgentId: string;
  messageContext: ConversationContext;
  orchestrationOperationId: string;
  supervisorAgentId: string;
  /** Supervisor counters at the park point, restored by the re-entry. */
  supervisorSnapshot?: PersistedBridgeCoordinates['supervisorSnapshot'];
  toolMessageId: string;
}): void => {
  // Armed at registration: the group park-exit runs AFTER the orchestration
  // loop has already ended its turn with `result: undefined` — the park is
  // fully formed at this point (the loop will not assemble any further
  // deferred pause that could race the resume), unlike the sub-agent spawner
  // whose parent may still be executing sibling tool lanes.
  registerClientSubAgentBridge({
    armed: true,
    childContext: params.childContext,
    childOperationId: params.childOperationId,
    kind: 'group-orchestration',
    memberAgentId: params.memberAgentId,
    messageContext: params.messageContext,
    orchestrationOperationId: params.orchestrationOperationId,
    supervisorAgentId: params.supervisorAgentId,
    supervisorSnapshot: params.supervisorSnapshot,
    toolMessageId: params.toolMessageId,
  });
};
