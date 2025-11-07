import {
  AgentEvent,
  AgentInstruction,
  AgentInstructionCallLlm,
  AgentInstructionCallTool,
  AgentRuntimeContext,
  GeneralAgentCallLLMInstructionPayload,
  GeneralAgentCallLLMResultPayload,
  GeneralAgentCallToolResultPayload,
  GeneralAgentCallingToolInstructionPayload,
  InstructionExecutor,
  UsageCounter,
} from '@lobechat/agent-runtime';
import type { ChatToolPayload, CreateMessageParams } from '@lobechat/types';
import debug from 'debug';

import type { ChatStore } from '@/store/chat/store';

const log = debug('lobe-store:agent-executors');

// Tool pricing configuration (USD per call)
const TOOL_PRICING: Record<string, number> = {
  'lobe-web-browsing/craw': 0.002,
  'lobe-web-browsing/search': 0.001,
};

/**
 * Creates custom executors for the Chat Agent Runtime
 * These executors wrap existing chat store methods to integrate with agent-runtime
 */
export const createAgentExecutors = (context: {
  get: () => ChatStore;
  messageKey: string;
  params: {
    inPortalThread?: boolean;
    inSearchWorkflow?: boolean;
    ragQuery?: string;
    threadId?: string;
    traceId?: string;
  };
  parentId: string;
  parentMessageType: 'user' | 'assistant' | 'tool';
  skipCreateFirstMessage?: boolean;
}) => {
  let shouldSkipCreateMessage = context.skipCreateFirstMessage;

  const executors: Partial<Record<AgentInstruction['type'], InstructionExecutor>> = {
    /**
     * Custom call_llm executor
     * Creates assistant message and calls internal_fetchAIChatMessage
     */
    call_llm: async (instruction, state) => {
      const sessionLogId = `${state.sessionId}:${state.stepCount}`;
      const stagePrefix = `[${sessionLogId}][call_llm]`;

      const llmPayload = (instruction as AgentInstructionCallLlm)
        .payload as GeneralAgentCallLLMInstructionPayload;

      const events: AgentEvent[] = [];

      log(`${stagePrefix} Starting session`);

      let assistantMessageId: string;

      if (shouldSkipCreateMessage) {
        // 跳过第一次创建，后续就不再跳过了
        assistantMessageId = context.parentId;
        shouldSkipCreateMessage = false;
      } else {
        // 如果是 userMessage 的第一次 regenerated 创建， llmPayload 不存在 parentMessageId
        // 因此用这种方式做个赋值
        // TODO: 也许未来这个应该用 init 方法实现
        if (!llmPayload.parentMessageId) {
          llmPayload.parentMessageId = context.parentId;
        }
        // Create assistant message (following server-side pattern)
        const assistantMessageItem = await context.get().optimisticCreateMessage({
          content: '',
          model: llmPayload.model,
          parentId: llmPayload.parentMessageId,
          provider: llmPayload.provider,
          role: 'assistant',
          sessionId: state.metadata!.sessionId!,
          threadId: state.metadata?.threadId,
          topicId: state.metadata?.topicId,
        });

        if (!assistantMessageItem) {
          throw new Error('Failed to create assistant message');
        }
        assistantMessageId = assistantMessageItem.id;
      }

      log(`${stagePrefix} Created assistant message, id: %s`, assistantMessageId);

      log(
        `${stagePrefix} calling model-runtime chat (model: %s, messages: %d, tools: %d)`,
        llmPayload.model,
        llmPayload.messages.length,
        llmPayload.tools?.length ?? 0,
      );

      // Call existing internal_fetchAIChatMessage
      // This method already handles:
      // - Stream processing (text, tool_calls, reasoning, grounding, base64_image)
      // - UI updates via dispatchMessage
      // - Loading state management
      // - Error handling
      // Use messages from state (already contains full conversation history)
      const {
        isFunctionCall,
        content,
        tools,
        usage: currentStepUsage,
        tool_calls,
      } = await context.get().internal_fetchAIChatMessage({
        messageId: assistantMessageId,
        messages: llmPayload.messages,
        model: llmPayload.model,
        params: context.params,
        provider: llmPayload.provider,
      });

      log(`[${sessionLogId}] finish model-runtime calling`);

      // Get latest messages from store (already updated by internal_fetchAIChatMessage)
      const latestMessages = context.get().dbMessagesMap[context.messageKey] || [];

      // Get updated assistant message to extract usage/cost information
      const assistantMessage = latestMessages.find((m) => m.id === assistantMessageId);

      const toolCalls = tools || [];

      if (content) {
        log(`[${sessionLogId}][content]`, content);
      }
      if (assistantMessage?.reasoning?.content) {
        log(`[${sessionLogId}][reasoning]`, assistantMessage.reasoning.content);
      }
      if (toolCalls.length > 0) {
        log(`[${sessionLogId}][toolsCalling] `, toolCalls);
      }

      // Log usage
      if (currentStepUsage) {
        log(`[${sessionLogId}][usage] %O`, currentStepUsage);
      }

      // Add llm_stream events (similar to backend)
      if (content) {
        events.push({
          chunk: { text: content, type: 'text' },
          type: 'llm_stream',
        });
      }

      if (assistantMessage?.reasoning?.content) {
        events.push({
          chunk: { text: assistantMessage.reasoning.content, type: 'reasoning' },
          type: 'llm_stream',
        });
      }

      events.push({
        result: {
          content,
          reasoning: assistantMessage?.reasoning?.content,
          tool_calls: toolCalls,
          usage: currentStepUsage,
        },
        type: 'llm_result',
      });

      log('[%s:%d] call_llm completed', state.sessionId, state.stepCount);

      // Accumulate usage and cost to state
      const newState = { ...state, messages: latestMessages };

      if (currentStepUsage) {
        // Use UsageCounter to accumulate LLM usage and cost
        const { usage, cost } = UsageCounter.accumulateLLM({
          cost: state.cost,
          model: llmPayload.model,
          modelUsage: currentStepUsage,
          provider: llmPayload.provider,
          usage: state.usage,
        });

        newState.usage = usage;
        if (cost) newState.cost = cost;
      }

      return {
        events,
        newState,
        nextContext: {
          payload: {
            hasToolsCalling: isFunctionCall,
            parentMessageId: assistantMessageId,
            result: { content, tool_calls },
            toolsCalling: toolCalls,
          } as GeneralAgentCallLLMResultPayload,
          phase: 'llm_result',
          session: {
            eventCount: events.length,
            messageCount: newState.messages.length,
            sessionId: state.sessionId,
            status: 'running',
            stepCount: state.stepCount + 1,
          },
          stepUsage: currentStepUsage,
        } as AgentRuntimeContext,
      };
    },

    /**
     * Custom call_tool executor
     * Wraps internal_invokeDifferentTypePlugin
     * Follows server-side pattern: always create tool message before execution
     */
    call_tool: async (instruction, state) => {
      const payload = (instruction as AgentInstructionCallTool)
        .payload as GeneralAgentCallingToolInstructionPayload;

      const events: AgentEvent[] = [];
      const sessionLogId = `${state.sessionId}:${state.stepCount}`;

      log('[%s][call_tool] Executor start, payload: %O', sessionLogId, payload);

      // Convert CallingToolPayload to ChatToolPayload for ToolExecutionService
      const chatToolPayload: ChatToolPayload = payload.toolCalling;

      const toolName = `${chatToolPayload.identifier}/${chatToolPayload.apiName}`;
      const startTime = performance.now();

      try {
        // Get assistant message to extract groupId
        const latestMessages = context.get().dbMessagesMap[context.messageKey] || [];
        // Find the last assistant message (should be created by call_llm)
        const assistantMessage = latestMessages.findLast((m) => m.role === 'assistant');

        // Always create new tool message (following server-side pattern)
        // This ensures consistency and avoids duplicate execution
        log(
          '[%s][call_tool] Creating tool message for tool_call_id: %s',
          sessionLogId,
          chatToolPayload.id,
        );

        const toolMessageParams: CreateMessageParams = {
          content: '',
          groupId: assistantMessage?.groupId,
          parentId: payload.parentMessageId,
          plugin: chatToolPayload,
          role: 'tool',
          sessionId: context.get().activeId,
          threadId: context.params.threadId,
          tool_call_id: chatToolPayload.id,
          topicId: context.get().activeTopicId,
        };

        const createResult = await context.get().optimisticCreateMessage(toolMessageParams);

        if (!createResult) {
          log(
            '[%s][call_tool] ERROR: Failed to create tool message for tool_call_id: %s',
            sessionLogId,
            chatToolPayload.id,
          );
          throw new Error(`Failed to create tool message for tool_call_id: ${chatToolPayload.id}`);
        }

        const toolMessageId = createResult.id;
        log('[%s][call_tool] Created tool message, id: %s', sessionLogId, toolMessageId);

        // Execute tool
        log('[%s][call_tool] Executing tool %s ...', sessionLogId, toolName);
        // This method handles:
        // - Tool execution (builtin, plugin, MCP)
        // - Content updates via optimisticUpdateMessageContent
        // - Error handling via internal_updateMessageError
        const result = await context
          .get()
          .internal_invokeDifferentTypePlugin(toolMessageId, chatToolPayload);

        const executionTime = Math.round(performance.now() - startTime);
        const isSuccess = !result.error;

        log(
          '[%s][call_tool] Executing %s in %dms, result: %O',
          sessionLogId,
          toolName,
          executionTime,
          result,
        );

        events.push({ id: chatToolPayload.id, result, type: 'tool_result' });

        // Get latest messages from store (already updated by internal_invokeDifferentTypePlugin)
        const updatedMessages = context.get().dbMessagesMap[context.messageKey] || [];

        const newState = { ...state, messages: updatedMessages };

        // Get tool unit price
        const toolCost = TOOL_PRICING[toolName] || 0;

        // Use UsageCounter to accumulate tool usage
        const { usage, cost } = UsageCounter.accumulateTool({
          cost: state.cost,
          executionTime,
          success: isSuccess,
          toolCost,
          toolName,
          usage: state.usage,
        });

        newState.usage = usage;
        if (cost) newState.cost = cost;

        // Find current tool statistics
        const currentToolStats = usage.tools.byTool.find((t) => t.name === toolName);

        // Log usage
        log(
          '[%s][tool usage] %s: calls=%d, time=%dms, success=%s, cost=$%s',
          sessionLogId,
          toolName,
          currentToolStats?.calls || 0,
          executionTime,
          isSuccess,
          toolCost.toFixed(4),
        );

        log('[%s][call_tool] Tool execution completed', sessionLogId);

        return {
          events,
          newState,
          nextContext: {
            payload: {
              data: result,
              executionTime,
              isSuccess,
              parentMessageId: toolMessageId,
              toolCall: chatToolPayload,
              toolCallId: chatToolPayload.id,
            } as GeneralAgentCallToolResultPayload,
            phase: 'tool_result',
            session: {
              eventCount: events.length,
              messageCount: newState.messages.length,
              sessionId: state.sessionId,
              status: 'running',
              stepCount: state.stepCount + 1,
            },
            stepUsage: {
              cost: toolCost,
              toolName,
              unitPrice: toolCost,
              usageCount: 1,
            },
          } as AgentRuntimeContext,
        };
      } catch (error) {
        log('[%s][call_tool] ERROR: Tool execution failed: %O', sessionLogId, error);

        events.push({ error: error, type: 'error' });

        // Return current state on error (no state change)
        return { events, newState: state };
      }
    },

    /**
     * Finish executor
     * Completes the runtime execution
     */
    finish: async (instruction, state) => {
      const { reason, reasonDetail } = instruction as Extract<AgentInstruction, { type: 'finish' }>;
      const sessionLogId = `${state.sessionId}:${state.stepCount}`;

      log(`[${sessionLogId}] Finishing execution: (%s)`, reason);

      const newState = structuredClone(state);
      newState.lastModified = new Date().toISOString();
      newState.status = 'done';

      const events: AgentEvent[] = [{ finalState: newState, reason, reasonDetail, type: 'done' }];

      return { events, newState };
    },
  };

  return executors;
};
