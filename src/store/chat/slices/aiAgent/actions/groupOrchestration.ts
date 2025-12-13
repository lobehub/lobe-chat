/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import type { AgentState, GroupOrchestrationContext } from '@lobechat/agent-runtime';
import { GroupOrchestrationRuntime } from '@lobechat/agent-runtime';
import debug from 'debug';
import { StateCreator } from 'zustand/vanilla';

import {
  GroupOrchestrationSupervisor,
  createGroupOrchestrationExecutors,
} from '@/store/chat/agents/GroupOrchestration';
import { ChatStore } from '@/store/chat/store';
import type { GroupOrchestrationCallbacks } from '@/store/tool/slices/builtin/types';

const log = debug('lobe-store:group-orchestration');

/**
 * Default maximum rounds for group orchestration
 */
const DEFAULT_MAX_ROUNDS = 10;

export interface GroupOrchestrationParams {
  groupId: string;
  initialPhase: GroupOrchestrationContext;
  supervisorAgentId: string;
  topicId?: string;
}

export interface GroupOrchestrationAction {
  /**
   * Internal: Execute Group Orchestration Loop
   * Called by triggerSpeak/triggerBroadcast/triggerDelegate after supervisor decides next action
   */
  internal_execGroupOrchestration: (params: GroupOrchestrationParams) => Promise<AgentState>;

  /**
   * Get active group orchestration callbacks
   * Used by invokeBuiltinTool to inject callbacks into tool context
   */
  getGroupOrchestrationCallbacks: () => GroupOrchestrationCallbacks;

  /**
   * Trigger speak - called by speak tool when supervisor decides to let an agent speak
   * This starts the group orchestration loop with speak phase
   */
  triggerSpeak: GroupOrchestrationCallbacks['triggerSpeak'];

  /**
   * Trigger broadcast - called by broadcast tool when supervisor decides to broadcast
   * This starts the group orchestration loop with broadcast phase
   */
  triggerBroadcast: GroupOrchestrationCallbacks['triggerBroadcast'];

  /**
   * Trigger delegate - called by delegate tool when supervisor decides to delegate
   * This starts the group orchestration loop with delegate phase
   */
  triggerDelegate: GroupOrchestrationCallbacks['triggerDelegate'];
}

export const groupOrchestrationSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  GroupOrchestrationAction
> = (set, get) => ({
  /**
   * Trigger speak - Entry point when supervisor calls speak tool
   * Starts the group orchestration loop beginning with speak phase
   */
  triggerSpeak: async (params) => {
    const { supervisorAgentId, agentId, instruction } = params;
    log(
      '[triggerSpeak] Starting orchestration with speak: supervisorAgentId=%s, agentId=%s, instruction=%s',
      supervisorAgentId,
      agentId,
      instruction,
    );

    const groupId = get().activeGroupId;
    if (!groupId) {
      log('[triggerSpeak] No active group, skipping');
      return;
    }

    // Start orchestration loop with speak phase
    await get().internal_execGroupOrchestration({
      groupId,
      supervisorAgentId,
      topicId: get().activeTopicId,
      initialPhase: {
        phase: 'speak',
        payload: { agentId, instruction },
      },
    });
  },

  /**
   * Trigger broadcast - Entry point when supervisor calls broadcast tool
   * Starts the group orchestration loop beginning with broadcast phase
   */
  triggerBroadcast: async (params) => {
    const { supervisorAgentId, agentIds, instruction } = params;
    log(
      '[triggerBroadcast] Starting orchestration with broadcast: supervisorAgentId=%s, agentIds=%o, instruction=%s',
      supervisorAgentId,
      agentIds,
      instruction,
    );

    const groupId = get().activeGroupId;
    if (!groupId) {
      log('[triggerBroadcast] No active group, skipping');
      return;
    }

    // Start orchestration loop with broadcast phase
    await get().internal_execGroupOrchestration({
      groupId,
      supervisorAgentId,
      topicId: get().activeTopicId,
      initialPhase: { phase: 'broadcast', payload: { agentIds, instruction } },
    });
  },

  /**
   * Trigger delegate - Entry point when supervisor calls delegate tool
   * Starts the group orchestration loop beginning with delegate phase
   */
  triggerDelegate: async (params) => {
    const { supervisorAgentId, agentId, reason } = params;
    log(
      '[triggerDelegate] Starting orchestration with delegate: supervisorAgentId=%s, agentId=%s, reason=%s',
      supervisorAgentId,
      agentId,
      reason,
    );

    const groupId = get().activeGroupId;
    if (!groupId) {
      log('[triggerDelegate] No active group, skipping');
      return;
    }

    // Start orchestration loop with delegate phase
    await get().internal_execGroupOrchestration({
      groupId,
      supervisorAgentId,
      topicId: get().activeTopicId,
      initialPhase: {
        phase: 'delegate',
        payload: { agentId, reason },
      },
    });
  },

  /**
   * Get group orchestration callbacks
   * These are the action methods that tools can call to trigger orchestration
   */
  getGroupOrchestrationCallbacks: () => {
    return {
      triggerSpeak: get().triggerSpeak,
      triggerBroadcast: get().triggerBroadcast,
      triggerDelegate: get().triggerDelegate,
    };
  },

  /**
   * Internal: Execute the Group Orchestration Loop
   * Called after supervisor decides to speak/broadcast/delegate
   */
  internal_execGroupOrchestration: async (params) => {
    const { groupId, topicId, initialPhase, supervisorAgentId } = params;

    log(
      '[internal_execGroupOrchestration] Starting orchestration for group: %s, supervisorAgentId: %s, initialPhase: %s',
      groupId,
      supervisorAgentId,
      initialPhase.phase,
    );

    // 1. Create Orchestration Operation
    const { operationId } = get().startOperation({
      type: 'execAgentRuntime',
      context: { groupId, topicId, agentId: supervisorAgentId },
      label: `Group Orchestration (${initialPhase.phase})`,
    });

    log('[internal_execGroupOrchestration] Created operation: %s', operationId);

    // 2. Get Group Configuration - supervisorAgentId is passed from external
    const groupConfig = {
      supervisorAgentId,
      maxRounds: DEFAULT_MAX_ROUNDS,
    };

    log('[internal_execGroupOrchestration] Group config: %o', groupConfig);

    // 3. Create Orchestration Supervisor
    const orchestrationSupervisor = new GroupOrchestrationSupervisor({
      supervisorAgentId: groupConfig.supervisorAgentId,
      maxRounds: groupConfig.maxRounds,
    });

    // 4. Create Executors
    const executors = createGroupOrchestrationExecutors({
      get,
      groupId,
      topicId,
      orchestrationOperationId: operationId,
    });

    // 5. Create GroupOrchestrationRuntime
    const runtime = new GroupOrchestrationRuntime(orchestrationSupervisor, {
      executors,
      operationId,
      getOperation: (opId: string) => {
        const op = get().operations[opId];
        if (!op) throw new Error(`Operation not found: ${opId}`);
        return {
          abortController: op.abortController,
          context: op.context as Record<string, unknown>,
        };
      },
    });

    // 6. Initialize State
    let state = GroupOrchestrationRuntime.createInitialState({
      operationId,
      maxRounds: groupConfig.maxRounds,
      orchestrationRound: 0,
    } as any);

    // 7. Initial Context - start from the phase triggered by tool
    let nextContext: GroupOrchestrationContext | undefined = {
      ...initialPhase,
      operationId,
    };

    log(
      '[internal_execGroupOrchestration] Starting orchestration loop from phase: %s',
      initialPhase.phase,
    );

    // 8. Orchestration Loop
    let stepCount = 0;
    while (state.status !== 'done' && state.status !== 'error') {
      // Check if operation has been cancelled
      const currentOperation = get().operations[operationId];
      if (currentOperation?.status === 'cancelled') {
        log('[internal_execGroupOrchestration] Operation cancelled, stopping loop');
        state = { ...state, status: 'done' };
        break;
      }

      if (!nextContext) {
        log('[internal_execGroupOrchestration] No next context, stopping loop');
        break;
      }

      stepCount++;
      log(
        '[internal_execGroupOrchestration][step-%d]: phase=%s, status=%s, round=%d',
        stepCount,
        nextContext.phase,
        state.status,
        (state as any).orchestrationRound || 0,
      );

      const result = await runtime.step(state, nextContext);

      log(
        '[internal_execGroupOrchestration] Step %d completed, events: %d, newStatus=%s',
        stepCount,
        result.events.length,
        result.newState.status,
      );

      state = result.newState;
      nextContext = result.nextContext;
    }

    log(
      '[internal_execGroupOrchestration] Orchestration loop finished, final status: %s, total steps: %d',
      state.status,
      stepCount,
    );

    // 9. Complete Operation
    if (state.status === 'done') {
      get().completeOperation(operationId);
      log('[internal_execGroupOrchestration] Operation completed successfully');
    } else if (state.status === 'error') {
      get().failOperation(operationId, {
        type: 'orchestration_error',
        message: 'Group orchestration execution failed',
      });
      log('[internal_execGroupOrchestration] Operation failed');
    }

    return state;
  },
});
