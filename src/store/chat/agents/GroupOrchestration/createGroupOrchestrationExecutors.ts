import type {
  GroupOrchestrationEvent,
  GroupOrchestrationExecutor,
  GroupOrchestrationExecutorOutput,
  SupervisorInstruction,
  SupervisorInstructionCallAgent,
  SupervisorInstructionCallSupervisor,
  SupervisorInstructionDelegate,
  SupervisorInstructionExecAsyncTask,
  SupervisorInstructionParallelCallAgents,
} from '@lobechat/agent-runtime';
import type { ConversationContext, UIChatMessage } from '@lobechat/types';
import debug from 'debug';

import { dbMessageSelectors } from '@/store/chat/slices/message/selectors';
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
 * Architecture:
 * - Supervisor (State Machine): Receives ExecutorResult → Returns SupervisorInstruction
 * - Executor (Execution Layer): Receives SupervisorInstruction → Returns ExecutorResult
 *
 * Flow:
 * ```
 * Supervisor.decide(init)
 *        │
 *        └─► call_supervisor instruction
 *                │
 *                └─► call_supervisor Executor
 *                        │
 *                        ├─► internal_execAgentRuntime(Supervisor)
 *                        │        │
 *                        │        ├─► Supervisor calls speak tool
 *                        │        │        │
 *                        │        │        └─► tool handler triggers orchestration
 *                        │        │
 *                        │        └─► Supervisor finishes normally
 *                        │
 *                        └─► Returns supervisor_decided result
 *                                │
 *                                └─► Supervisor.decide(supervisor_decided)
 *                                        │
 *                                        └─► call_agent instruction
 *                                                │
 *                                                └─► call_agent Executor
 *                                                        │
 *                                                        └─► Returns agent_spoke result
 *                                                                │
 *                                                                └─► Supervisor.decide(agent_spoke)
 *                                                                        │
 *                                                                        └─► call_supervisor OR finish
 * ```
 */
export const createGroupOrchestrationExecutors = (
  context: GroupOrchestrationExecutorsContext,
): Partial<Record<SupervisorInstruction['type'], GroupOrchestrationExecutor>> => {
  const { get, messageContext, orchestrationOperationId, supervisorAgentId } = context;

  // Pre-compute the chat key for message fetching
  const chatKey = messageMapKey(messageContext);

  /**
   * Helper to get current messages for the group conversation
   */
  const getMessages = () => dbMessageSelectors.getDbMessagesByKey(chatKey)(get());

  /* eslint-disable sort-keys-fix/sort-keys-fix */

  return {
    /**
     * call_supervisor Executor
     * Executes the Supervisor Agent completely
     *
     * Returns: supervisor_decided result with the decision made by supervisor
     *
     * Note: When Supervisor calls a group-management tool (speak/broadcast/delegate),
     * the tool returns `stop: true` which terminates the AgentRuntime.
     * The tool also registers an afterCompletion callback to trigger the orchestration.
     */
    call_supervisor: async (instruction, state): Promise<GroupOrchestrationExecutorOutput> => {
      const { supervisorAgentId: agentId } = (instruction as SupervisorInstructionCallSupervisor)
        .payload;

      const sessionLogId = `${state.operationId}:call_supervisor`;
      log(`[${sessionLogId}] Starting supervisor agent: ${agentId}`);

      const messages = getMessages();
      const lastMessage = messages.at(-1);

      if (!lastMessage) {
        log(`[${sessionLogId}] No messages found, cannot execute supervisor`);
        return {
          events: [{ type: 'supervisor_finished' }] as GroupOrchestrationEvent[],
          newState: { ...state, status: 'done' },
          // Supervisor finished without action - end orchestration
          result: undefined,
        };
      }

      // Variable to capture the decision from tool handler
      // let decision: ExecutorResult['type'] | undefined;
      // let decisionParams: Record<string, unknown> = {};
      // let skipCallSupervisor = false;

      // Execute Supervisor agent with the supervisor's agentId in context
      // Mark isSupervisor=true so assistant messages get metadata.isSupervisor for UI rendering
      await get().internal_execAgentRuntime({
        context: { ...messageContext, agentId: supervisorAgentId, isSupervisor: true },
        messages,
        operationId: state.operationId,
        parentMessageId: lastMessage.id,
        parentMessageType: lastMessage.role as 'user' | 'assistant' | 'tool',
        parentOperationId: orchestrationOperationId,
      });

      log(`[${sessionLogId}] Supervisor agent finished`);

      // Check what decision was made by the supervisor
      // This is captured from the groupOrchestration callbacks registered by tools
      // const orchestrationCallbacks = get().getGroupOrchestrationCallbacks();

      // If no tool was called (supervisor finished normally), end orchestration
      // The actual decision is captured via the afterCompletion callbacks
      // For now, return a finish decision if we reach here
      return {
        events: [{ type: 'supervisor_finished' }] as GroupOrchestrationEvent[],
        newState: state,
        result: {
          payload: {
            decision: 'finish',
            params: { reason: 'supervisor_completed_without_action' },
            skipCallSupervisor: false,
          },
          type: 'supervisor_decided',
        },
      };
    },

    /**
     * call_agent Executor
     * Executes a single target Agent completely
     *
     * Returns: agent_spoke result
     *
     * If the Supervisor provides an instruction, it will be injected as a virtual
     * User Message at the end of the messages array. This improves instruction-following
     * as User Messages have stronger influence on model behavior.
     */
    call_agent: async (instruction, state): Promise<GroupOrchestrationExecutorOutput> => {
      const { agentId, instruction: agentInstruction } = (
        instruction as SupervisorInstructionCallAgent
      ).payload;

      const sessionLogId = `${state.operationId}:call_agent`;
      log(`[${sessionLogId}] Calling agent: ${agentId}, instruction: ${agentInstruction}`);

      const messages = getMessages();
      const lastMessage = messages.at(-1);

      if (!lastMessage) {
        log(`[${sessionLogId}] No messages found, cannot execute agent`);
        return {
          events: [{ agentId, type: 'agent_spoke' }] as GroupOrchestrationEvent[],
          newState: state,
          result: { payload: { agentId, completed: true }, type: 'agent_spoke' },
        };
      }

      // If instruction is provided, inject it as a virtual User Message
      // This virtual message is not persisted to database, only used for model context
      const now = Date.now();
      const messagesWithInstruction: UIChatMessage[] = agentInstruction
        ? [
            ...messages,
            {
              content: agentInstruction,
              createdAt: now,
              id: `virtual_speak_instruction_${now}`,
              meta: {},
              role: 'user',
              updatedAt: now,
            },
          ]
        : messages;

      // Execute target Agent with subAgentId for agent config retrieval
      // - messageContext keeps the group's main conversation context (for message storage)
      // - subAgentId specifies which agent's config to use
      await get().internal_execAgentRuntime({
        context: { ...messageContext, subAgentId: agentId },
        messages: messagesWithInstruction,
        parentMessageId: lastMessage.id,
        parentMessageType: lastMessage.role as 'user' | 'assistant' | 'tool',
        parentOperationId: orchestrationOperationId,
      });

      log(`[${sessionLogId}] Agent ${agentId} finished speaking`);

      // Return agent_spoke result
      return {
        events: [{ agentId, type: 'agent_spoke' }] as GroupOrchestrationEvent[],
        newState: state,
        result: {
          payload: { agentId, completed: true },
          type: 'agent_spoke',
        },
      };
    },

    /**
     * parallel_call_agents Executor
     * Executes multiple Agents in parallel
     *
     * Returns: agents_broadcasted result
     *
     * If the Supervisor provides an instruction, it will be injected as a virtual
     * User Message at the end of the messages array. This improves instruction-following
     * as User Messages have stronger influence on model behavior.
     */
    parallel_call_agents: async (instruction, state): Promise<GroupOrchestrationExecutorOutput> => {
      const {
        agentIds,
        instruction: agentInstruction,
        toolMessageId,
      } = (instruction as SupervisorInstructionParallelCallAgents).payload;

      const sessionLogId = `${state.operationId}:parallel_call_agents`;
      log(
        `[${sessionLogId}] Broadcasting to agents: ${agentIds.join(', ')}, instruction: ${agentInstruction}, toolMessageId: ${toolMessageId}`,
      );

      const messages = getMessages();

      if (messages.length === 0) {
        log(`[${sessionLogId}] No messages found, cannot execute agents`);
        return {
          events: [{ agentIds, type: 'agents_broadcasted' }] as GroupOrchestrationEvent[],
          newState: state,
          result: {
            payload: { agentIds, completed: true },
            type: 'agents_broadcasted',
          },
        };
      }

      // If instruction is provided, inject it as a virtual User Message
      // This virtual message is not persisted to database, only used for model context
      const now = Date.now();
      const messagesWithInstruction: UIChatMessage[] = agentInstruction
        ? [
            ...messages,
            {
              content: agentInstruction,
              createdAt: now,
              id: `virtual_broadcast_instruction_${now}`,
              meta: {},
              role: 'user',
              updatedAt: now,
            },
          ]
        : messages;

      // Execute all Agents in parallel, each with their own subAgentId for config retrieval
      // - messageContext keeps the group's main conversation context (for message storage)
      // - subAgentId specifies which agent's config to use for each agent
      // - toolMessageId is used as parentMessageId so agent responses are children of the tool message
      await Promise.all(
        agentIds.map(async (agentId) => {
          await get().internal_execAgentRuntime({
            context: { ...messageContext, subAgentId: agentId },
            messages: messagesWithInstruction,
            parentMessageId: toolMessageId,
            parentMessageType: 'tool',
            parentOperationId: orchestrationOperationId,
          });
        }),
      );

      log(`[${sessionLogId}] All agents finished broadcasting`);

      // Return agents_broadcasted result
      return {
        events: [{ agentIds, type: 'agents_broadcasted' }] as GroupOrchestrationEvent[],
        newState: state,
        result: {
          payload: { agentIds, completed: true },
          type: 'agents_broadcasted',
        },
      };
    },

    /**
     * delegate Executor
     * Delegates control to another agent
     *
     * Returns: delegated result
     */
    delegate: async (instruction, state): Promise<GroupOrchestrationExecutorOutput> => {
      const { agentId, reason } = (instruction as SupervisorInstructionDelegate).payload;

      const sessionLogId = `${state.operationId}:delegate`;
      log(`[${sessionLogId}] Delegating to agent: ${agentId}, reason: ${reason}`);

      const messages = getMessages();
      const lastMessage = messages.at(-1);

      if (!lastMessage) {
        log(`[${sessionLogId}] No messages found, cannot delegate`);
        return {
          events: [] as GroupOrchestrationEvent[],
          newState: state,
          result: {
            payload: { agentId, completed: true },
            type: 'delegated',
          },
        };
      }

      // Execute delegated Agent
      await get().internal_execAgentRuntime({
        context: { ...messageContext, subAgentId: agentId },
        messages,
        parentMessageId: lastMessage.id,
        parentMessageType: lastMessage.role as 'user' | 'assistant' | 'tool',
        parentOperationId: orchestrationOperationId,
      });

      log(`[${sessionLogId}] Delegated agent ${agentId} finished`);

      // Return delegated result
      return {
        events: [] as GroupOrchestrationEvent[],
        newState: state,
        result: {
          payload: { agentId, completed: true },
          type: 'delegated',
        },
      };
    },

    /**
     * exec_async_task Executor
     * Executes an async task for an agent
     *
     * Returns: task_completed result
     */
    exec_async_task: async (instruction, state): Promise<GroupOrchestrationExecutorOutput> => {
      const { agentId, task, timeout, toolMessageId } = (
        instruction as SupervisorInstructionExecAsyncTask
      ).payload;

      const sessionLogId = `${state.operationId}:exec_async_task`;
      log(
        `[${sessionLogId}] Executing async task for agent: ${agentId}, task: ${task}, timeout: ${timeout}`,
      );

      const messages = getMessages();

      // Inject task as virtual user message
      const now = Date.now();
      const messagesWithTask: UIChatMessage[] = [
        ...messages,
        {
          content: task,
          createdAt: now,
          id: `virtual_task_instruction_${now}`,
          meta: {},
          role: 'user',
          updatedAt: now,
        },
      ];

      // Execute agent with task
      await get().internal_execAgentRuntime({
        context: { ...messageContext, subAgentId: agentId },
        messages: messagesWithTask,
        parentMessageId: toolMessageId,
        parentMessageType: 'tool',
        parentOperationId: orchestrationOperationId,
      });

      log(`[${sessionLogId}] Async task for agent ${agentId} completed`);

      // Return task_completed result
      return {
        events: [] as GroupOrchestrationEvent[],
        newState: state,
        result: {
          payload: { agentId, success: true },
          type: 'task_completed',
        },
      };
    },
  };
};
