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

const log = debug('lobe-store:group-orchestration');

/**
 * Default maximum rounds for group orchestration
 */
const DEFAULT_MAX_ROUNDS = 10;

export interface GroupOrchestrationParams {
  groupId: string;
  topicId?: string;
  userMessageId: string;
}

export interface GroupOrchestrationAction {
  /**
   * Execute Group Orchestration
   * This is the entry point for Multi-Agent collaboration
   */
  execGroupOrchestration: (params: GroupOrchestrationParams) => Promise<AgentState>;
}

export const groupOrchestrationSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  GroupOrchestrationAction
> = (set, get) => ({
  execGroupOrchestration: async (params) => {
    const { groupId, topicId, userMessageId } = params;

    log('[execGroupOrchestration] Starting orchestration for group: %s', groupId);

    // 1. Create Orchestration Operation
    const { operationId } = get().startOperation({
      type: 'execAgentRuntime',
      context: { groupId, topicId, messageId: userMessageId },
      label: 'Group Orchestration',
    });

    log('[execGroupOrchestration] Created operation: %s', operationId);

    // 2. Get Group Configuration
    // TODO: Implement getGroupConfig to get supervisorAgentId and other settings
    const groupConfig = {
      supervisorAgentId: groupId, // For now, use groupId as supervisor (will be replaced with actual supervisor agent)
      maxRounds: DEFAULT_MAX_ROUNDS,
    };

    log('[execGroupOrchestration] Group config: %o', groupConfig);

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

    // 5. Create GroupOrchestrationRuntime (not AgentRuntime)
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

    // 7. Initial Context
    let nextContext: GroupOrchestrationContext | undefined = {
      phase: 'call_supervisor',
      payload: {
        supervisorAgentId: groupConfig.supervisorAgentId,
        groupId,
        round: 0,
      },
      operationId,
    };

    log('[execGroupOrchestration] Starting orchestration loop');

    // 8. Orchestration Loop
    let stepCount = 0;
    while (state.status !== 'done' && state.status !== 'error') {
      // Check if operation has been cancelled
      const currentOperation = get().operations[operationId];
      if (currentOperation?.status === 'cancelled') {
        log('[execGroupOrchestration] Operation cancelled, stopping loop');
        state = { ...state, status: 'done' };
        break;
      }

      if (!nextContext) {
        log('[execGroupOrchestration] No next context, stopping loop');
        break;
      }

      stepCount++;
      log(
        '[execGroupOrchestration][step-%d]: phase=%s, status=%s, round=%d',
        stepCount,
        nextContext.phase,
        state.status,
        (state as any).orchestrationRound || 0,
      );

      const result = await runtime.step(state, nextContext);

      log(
        '[execGroupOrchestration] Step %d completed, events: %d, newStatus=%s',
        stepCount,
        result.events.length,
        result.newState.status,
      );

      state = result.newState;
      nextContext = result.nextContext;
    }

    log(
      '[execGroupOrchestration] Orchestration loop finished, final status: %s, total steps: %d',
      state.status,
      stepCount,
    );

    // 9. Complete Operation
    if (state.status === 'done') {
      get().completeOperation(operationId);
      log('[execGroupOrchestration] Operation completed successfully');
    } else if (state.status === 'error') {
      get().failOperation(operationId, {
        type: 'orchestration_error',
        message: 'Group orchestration execution failed',
      });
      log('[execGroupOrchestration] Operation failed');
    }

    return state;
  },
});
