import type {
  GroupOrchestrationContext,
  GroupOrchestrationEvent,
  GroupOrchestrationExecutor,
  GroupOrchestrationInstruction,
  GroupOrchestrationInstructionAgentSpoke,
  GroupOrchestrationInstructionAgentsBroadcasted,
  GroupOrchestrationInstructionBroadcast,
  GroupOrchestrationInstructionCallSupervisor,
  GroupOrchestrationInstructionFinish,
  GroupOrchestrationInstructionSpeak,
} from '@lobechat/agent-runtime';
import debug from 'debug';

import type { ChatStore } from '@/store/chat/store';

const log = debug('lobe-store:group-orchestration-executors');

export interface GroupOrchestrationExecutorsContext {
  get: () => ChatStore;
  groupId: string;
  orchestrationOperationId: string;
  topicId?: string;
}

/**
 * Creates executors for Group Orchestration
 *
 * Control flow:
 * ```
 * call_supervisor Executor
 *        │
 *        ├─► internal_execAgentRuntime(Supervisor)
 *        │        │
 *        │        ├─► Supervisor calls speak tool
 *        │        │        │
 *        │        │        └─► speak tool handler returns false
 *        │        │             │
 *        │        │             ├─► Terminates Supervisor Runtime
 *        │        │             └─► tool handler internally triggers speak Executor
 *        │        │
 *        │        └─► Supervisor finishes normally (no group-mgmt tool)
 *        │                │
 *        │                └─► Returns here, Orchestration ends
 *        │
 *        └─► return { status: 'done' }  // Only reached on normal finish
 * ```
 */
export const createGroupOrchestrationExecutors = (
  context: GroupOrchestrationExecutorsContext,
): Partial<Record<GroupOrchestrationInstruction['type'], GroupOrchestrationExecutor>> => {
  const { get, groupId, orchestrationOperationId } = context;

  /* eslint-disable sort-keys-fix/sort-keys-fix */

  return {
    /**
     * call_supervisor Executor
     * Executes the Supervisor Agent completely
     *
     * Note: When Supervisor calls a group-management tool,
     * the tool handler returns false to terminate the Runtime,
     * then the tool handler internally triggers the next step (speak/broadcast etc.)
     */
    call_supervisor: async (instruction, state) => {
      const { supervisorAgentId } = (instruction as GroupOrchestrationInstructionCallSupervisor)
        .payload;

      const sessionLogId = `${state.operationId}:call_supervisor`;
      log(`[${sessionLogId}] Starting supervisor agent: ${supervisorAgentId}`);

      // 1. Create child Operation for Supervisor
      const { operationId: supervisorOpId } = get().startOperation({
        context: { agentId: supervisorAgentId, groupId },
        parentOperationId: orchestrationOperationId,
        type: 'execAgentRuntime',
      });

      // 2. Execute Supervisor
      // TODO: Call internal_execAgentRuntime when Group Chat support is added
      // For now, just log and return
      log(`[${sessionLogId}] Would execute supervisor with operationId: ${supervisorOpId}`);

      // 3. If we reach here, Supervisor finished without calling group-management tool
      // Orchestration ends
      return {
        events: [{ type: 'supervisor_finished' }] as GroupOrchestrationEvent[],
        newState: { ...state, status: 'done' },
        nextContext: undefined,
      };
    },

    /**
     * speak Executor
     * Executes target Agent completely
     */
    speak: async (instruction, state) => {
      const { agentId, instruction: agentInstruction } = (
        instruction as GroupOrchestrationInstructionSpeak
      ).payload;

      const sessionLogId = `${state.operationId}:speak`;
      log(`[${sessionLogId}] Speaking agent: ${agentId}, instruction: ${agentInstruction}`);

      // 1. Create child Operation
      const { operationId: agentOpId } = get().startOperation({
        context: { agentId, groupId },
        parentOperationId: orchestrationOperationId,
        type: 'execAgentRuntime',
      });

      // 2. Execute target Agent completely
      // TODO: Call internal_execAgentRuntime when Group Chat support is added
      log(`[${sessionLogId}] Would execute agent with operationId: ${agentOpId}`);

      log(`[${sessionLogId}] Agent ${agentId} finished speaking`);

      // 3. Return agent_spoke phase
      return {
        events: [{ agentId, type: 'agent_spoke' }] as GroupOrchestrationEvent[],
        newState: state,
        nextContext: {
          payload: { agentId, completed: true },
          phase: 'agent_spoke',
        } as GroupOrchestrationContext,
      };
    },

    /**
     * broadcast Executor
     * Executes multiple Agents in parallel
     */
    broadcast: async (instruction, state) => {
      const { agentIds, instruction: agentInstruction } = (
        instruction as GroupOrchestrationInstructionBroadcast
      ).payload;

      const sessionLogId = `${state.operationId}:broadcast`;
      log(
        `[${sessionLogId}] Broadcasting to agents: ${agentIds.join(', ')}, instruction: ${agentInstruction}`,
      );

      // Execute all Agents in parallel
      // TODO: Call internal_execAgentRuntime when Group Chat support is added
      await Promise.all(
        agentIds.map(async (agentId) => {
          const { operationId: agentOpId } = get().startOperation({
            context: { agentId, groupId },
            parentOperationId: orchestrationOperationId,
            type: 'execAgentRuntime',
          });

          log(`[${sessionLogId}] Would execute agent ${agentId} with operationId: ${agentOpId}`);
        }),
      );

      log(`[${sessionLogId}] All agents finished broadcasting`);

      return {
        events: [{ agentIds, type: 'agents_broadcasted' }] as GroupOrchestrationEvent[],
        newState: state,
        nextContext: {
          payload: { agentIds, completed: true },
          phase: 'agents_broadcasted',
        } as GroupOrchestrationContext,
      };
    },

    /**
     * agent_spoke Executor
     * After Agent response completes, return to call_supervisor to continue loop
     */
    agent_spoke: async (instruction, state) => {
      const { agentId } = (instruction as GroupOrchestrationInstructionAgentSpoke).payload;
      const newRound = ((state as any).orchestrationRound || 0) + 1;
      const maxRounds = (state as any).maxRounds || 10;

      const sessionLogId = `${state.operationId}:agent_spoke`;
      log(`[${sessionLogId}] Agent ${agentId} spoke, round ${newRound}/${maxRounds}`);

      if (newRound >= maxRounds) {
        log(`[${sessionLogId}] Max rounds exceeded`);
        return {
          events: [{ type: 'max_rounds_exceeded' }] as GroupOrchestrationEvent[],
          newState: { ...state, status: 'done' },
          nextContext: undefined,
        };
      }

      return {
        events: [] as GroupOrchestrationEvent[],
        newState: { ...state, orchestrationRound: newRound } as any,
        nextContext: {
          payload: { round: newRound },
          phase: 'call_supervisor',
        } as GroupOrchestrationContext,
      };
    },

    /**
     * agents_broadcasted Executor
     * Same logic as agent_spoke
     */
    agents_broadcasted: async (instruction, state) => {
      const { agentIds } = (instruction as GroupOrchestrationInstructionAgentsBroadcasted).payload;
      const newRound = ((state as any).orchestrationRound || 0) + 1;
      const maxRounds = (state as any).maxRounds || 10;

      const sessionLogId = `${state.operationId}:agents_broadcasted`;
      log(
        `[${sessionLogId}] Agents ${agentIds.join(', ')} broadcasted, round ${newRound}/${maxRounds}`,
      );

      if (newRound >= maxRounds) {
        log(`[${sessionLogId}] Max rounds exceeded`);
        return {
          events: [{ type: 'max_rounds_exceeded' }] as GroupOrchestrationEvent[],
          newState: { ...state, status: 'done' },
          nextContext: undefined,
        };
      }

      return {
        events: [] as GroupOrchestrationEvent[],
        newState: { ...state, orchestrationRound: newRound } as any,
        nextContext: {
          payload: { round: newRound },
          phase: 'call_supervisor',
        } as GroupOrchestrationContext,
      };
    },

    /**
     * finish Executor
     * Ends the orchestration
     */
    finish: async (instruction, state) => {
      const { reason } = instruction as GroupOrchestrationInstructionFinish;
      const sessionLogId = `${state.operationId}:finish`;
      log(`[${sessionLogId}] Finishing orchestration: ${reason}`);

      return {
        events: [{ reason, type: 'done' }] as GroupOrchestrationEvent[],
        newState: { ...state, status: 'done' },
        nextContext: undefined,
      };
    },
  };
};
