import type {
  GroupOrchestrationContext,
  GroupOrchestrationEvent,
  GroupOrchestrationExecutor,
  GroupOrchestrationInstruction,
  GroupOrchestrationInstructionAgentSpoke,
  GroupOrchestrationInstructionAgentsBroadcasted,
  GroupOrchestrationInstructionBroadcast,
  GroupOrchestrationInstructionFinish,
  GroupOrchestrationInstructionSpeak,
} from '@lobechat/agent-runtime';
import type { ConversationContext } from '@lobechat/types';
import debug from 'debug';

import { displayMessageSelectors } from '@/store/chat/slices/message/selectors';
import type { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

const log = debug('lobe-store:group-orchestration-executors');

export interface GroupOrchestrationExecutorsContext {
  get: () => ChatStore;
  /**
   * Message context for fetching messages
   * Contains agentId (groupId for group chat), topicId, scope, etc.
   */
  messageContext: ConversationContext;
  orchestrationOperationId: string;
  supervisorAgentId: string;
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
  const { get, messageContext, orchestrationOperationId, supervisorAgentId } = context;

  // Pre-compute the chat key for message fetching
  const chatKey = messageMapKey(messageContext);

  /**
   * Helper to get current messages for the group conversation
   */
  const getMessages = () => displayMessageSelectors.getDisplayMessagesByKey(chatKey)(get());

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
      const sessionLogId = `${state.operationId}:call_supervisor`;
      log(`[${sessionLogId}] Starting supervisor agent: ${supervisorAgentId}`);

      const messages = getMessages();
      const lastMessage = messages.at(-1);

      if (!lastMessage) {
        log(`[${sessionLogId}] No messages found, cannot execute supervisor`);
        return {
          events: [{ type: 'supervisor_finished' }] as GroupOrchestrationEvent[],
          newState: { ...state, status: 'done' },
          nextContext: undefined,
        };
      }

      // Execute Supervisor agent with the supervisor's agentId in context
      await get().internal_execAgentRuntime({
        context: { ...messageContext, agentId: supervisorAgentId },
        messages,
        operationId: state.operationId,
        parentMessageId: lastMessage.id,
        parentMessageType: lastMessage.role as 'user' | 'assistant' | 'tool',
        parentOperationId: orchestrationOperationId,
      });

      log(`[${sessionLogId}] Supervisor agent finished`);

      // If we reach here, Supervisor finished without calling group-management tool
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

      const messages = getMessages();
      const lastMessage = messages.at(-1);

      if (!lastMessage) {
        log(`[${sessionLogId}] No messages found, cannot execute agent`);
        return {
          events: [{ agentId, type: 'agent_spoke' }] as GroupOrchestrationEvent[],
          newState: state,
          nextContext: {
            payload: { agentId, completed: true },
            phase: 'agent_spoke',
          } as GroupOrchestrationContext,
        };
      }

      // Execute target Agent with subAgentId for agent config retrieval
      // - messageContext keeps the group's main conversation context (for message storage)
      // - subAgentId specifies which agent's config to use
      await get().internal_execAgentRuntime({
        context: { ...messageContext, subAgentId: agentId },
        messages,
        parentMessageId: lastMessage.id,
        parentMessageType: lastMessage.role as 'user' | 'assistant' | 'tool',
        parentOperationId: orchestrationOperationId,
      });

      log(`[${sessionLogId}] Agent ${agentId} finished speaking`);

      // Return agent_spoke phase
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

      const messages = getMessages();
      const lastMessage = messages.at(-1);

      if (!lastMessage) {
        log(`[${sessionLogId}] No messages found, cannot execute agents`);
        return {
          events: [{ agentIds, type: 'agents_broadcasted' }] as GroupOrchestrationEvent[],
          newState: state,
          nextContext: {
            payload: { agentIds, completed: true },
            phase: 'agents_broadcasted',
          } as GroupOrchestrationContext,
        };
      }

      // Execute all Agents in parallel, each with their own subAgentId for config retrieval
      // - messageContext keeps the group's main conversation context (for message storage)
      // - subAgentId specifies which agent's config to use for each agent
      await Promise.all(
        agentIds.map(async (agentId) => {
          await get().internal_execAgentRuntime({
            context: { ...messageContext, subAgentId: agentId },
            messages,
            parentMessageId: lastMessage.id,
            parentMessageType: lastMessage.role as 'user' | 'assistant' | 'tool',
            parentOperationId: orchestrationOperationId,
          });
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
