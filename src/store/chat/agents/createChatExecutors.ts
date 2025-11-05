import type {
  AgentEvent,
  AgentInstruction,
  AgentRuntimeContext,
  InstructionExecutor,
} from '@lobechat/agent-runtime';
import type { ChatToolPayload } from '@lobechat/types';
import debug from 'debug';

import type { ChatStore } from '@/store/chat/store';

const log = debug('lobe-store:chat-executors');

/**
 * Creates custom executors for the Chat Agent Runtime
 * These executors wrap existing chat store methods to integrate with agent-runtime
 */
export const createChatExecutors = (context: {
  // messageMapKey(sessionId, topicId)
  assistantMessageId: string;
  get: () => ChatStore;
  messageKey: string;
  model: string;
  params: {
    inPortalThread?: boolean;
    inSearchWorkflow?: boolean;
    isWelcomeQuestion?: boolean;
    ragQuery?: string;
    threadId?: string;
    traceId?: string;
  };
  provider: string;
}) => {
  const executors: Partial<Record<AgentInstruction['type'], InstructionExecutor>> = {
    /**
     * Custom call_llm executor
     * Wraps internal_fetchAIChatMessage instead of directly calling chatService
     */
    call_llm: async (instruction, state) => {
      const events: AgentEvent[] = [];

      log(
        '[call_llm] Executor start, messageId: %s, model: %s/%s',
        context.assistantMessageId,
        context.provider,
        context.model,
      );

      events.push({ payload: {}, type: 'llm_start' });

      // Call existing internal_fetchAIChatMessage
      // This method already handles:
      // - Stream processing (text, tool_calls, reasoning, grounding, base64_image)
      // - UI updates via dispatchMessage
      // - Loading state management
      // - Error handling
      // Use messages from state (already contains full conversation history)
      const { isFunctionCall, content } = await context.get().internal_fetchAIChatMessage({
        messageId: context.assistantMessageId,
        messages: state.messages,
        model: context.model,
        params: context.params,
        provider: context.provider,
      });

      log('[call_llm] internal_fetchAIChatMessage completed, isFunctionCall: %s', isFunctionCall);

      // Get latest messages from store (already updated by internal_fetchAIChatMessage)
      const latestMessages = context.get().messagesMap[context.messageKey] || [];
      const lastAssistant = latestMessages.findLast((m) => m.role === 'assistant');
      const toolCalls = lastAssistant?.tools || [];

      log('[call_llm] Tool calls count: %d', toolCalls.length);

      events.push({
        result: { content, tool_calls: toolCalls },
        type: 'llm_result',
      });

      return {
        events,
        newState: { ...state, messages: latestMessages },
        nextContext: {
          payload: {
            hasToolCalls: isFunctionCall,
            result: { content, tool_calls: toolCalls },
            toolCalls,
          },
          phase: 'llm_result',
          session: {
            messageCount: latestMessages.length,
            sessionId: state.sessionId,
            status: state.status,
            stepCount: state.stepCount,
          },
        } as AgentRuntimeContext,
      };
    },

    /**
     * Custom call_tool executor
     * Wraps internal_invokeDifferentTypePlugin
     */
    call_tool: async (instruction, state) => {
      const { payload: toolCall } = instruction as Extract<AgentInstruction, { type: 'call_tool' }>;
      const events: AgentEvent[] = [];

      log('[call_tool] Executor start, tool: %s, id: %s', toolCall.function?.name, toolCall.id);

      // Convert AgentRuntime toolCall format to ChatToolPayload
      const chatToolPayload: ChatToolPayload = {
        apiName: toolCall.function?.name || '',
        arguments: toolCall.function?.arguments || '{}',
        id: toolCall.id,
        identifier: toolCall.function?.name || '',
        type: 'default',
      };

      // Find the tool result message ID from store
      const latestMessages = context.get().messagesMap[context.messageKey] || [];
      const toolMessage = latestMessages.findLast(
        (m) => m.role === 'tool' && m.tool_call_id === toolCall.id,
      );

      if (!toolMessage) {
        log('[call_tool] ERROR: Tool message not found for tool_call_id: %s', toolCall.id);
        throw new Error(`Tool message not found for tool_call_id: ${toolCall.id}`);
      }

      log('[call_tool] Found tool message, id: %s', toolMessage.id);

      // Call existing internal_invokeDifferentTypePlugin
      // This method already handles:
      // - Tool execution (builtin, plugin, MCP)
      // - UI updates via dispatchMessage
      const result = await context
        .get()
        .internal_invokeDifferentTypePlugin(toolMessage.id, chatToolPayload);

      log('[call_tool] Tool execution completed');

      events.push({
        id: toolCall.id,
        result,
        type: 'tool_result',
      });

      // Get latest messages from store (already updated by internal_invokeDifferentTypePlugin)
      const updatedMessages = context.get().messagesMap[context.messageKey] || [];

      return {
        events,
        newState: { ...state, messages: updatedMessages },
        nextContext: {
          payload: {
            result,
            toolCall,
            toolCallId: toolCall.id,
          },
          phase: 'tool_result',
          session: {
            messageCount: updatedMessages.length,
            sessionId: state.sessionId,
            status: state.status,
            stepCount: state.stepCount,
          },
        } as AgentRuntimeContext,
      };
    },
  };

  return executors;
};
