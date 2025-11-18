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
import pMap from 'p-map';

import { LOADING_FLAT } from '@/const/message';
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
 *
 * @param context.operationId - Operation ID to get business context (sessionId, topicId, etc.)
 * @param context.get - Store getter function
 * @param context.messageKey - Message map key
 * @param context.parentId - Parent message ID
 * @param context.skipCreateFirstMessage - Skip first message creation
 */
export const createAgentExecutors = (context: {
  get: () => ChatStore;
  messageKey: string;
  operationId: string;
  parentId: string;
  skipCreateFirstMessage?: boolean;
}) => {
  let shouldSkipCreateMessage = context.skipCreateFirstMessage;

  /**
   * Get operation context via closure
   * Returns the business context (sessionId, topicId, etc.) captured by the operation
   */
  const getOperationContext = () => {
    const operation = context.get().operations[context.operationId];
    if (!operation) {
      throw new Error(`Operation not found: ${context.operationId}`);
    }
    return operation.context;
  };

  /* eslint-disable sort-keys-fix/sort-keys-fix */
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
        // Get context from operation
        const opContext = getOperationContext();

        // 如果是 userMessage 的第一次 regenerated 创建， llmPayload 不存在 parentMessageId
        // 因此用这种方式做个赋值
        // TODO: 也许未来这个应该用 init 方法实现
        if (!llmPayload.parentMessageId) {
          llmPayload.parentMessageId = context.parentId;
        }
        // Create assistant message (following server-side pattern)
        const assistantMessageItem = await context.get().optimisticCreateMessage({
          content: LOADING_FLAT,
          model: llmPayload.model,
          parentId: llmPayload.parentMessageId,
          provider: llmPayload.provider,
          role: 'assistant',
          sessionId: opContext.sessionId!,
          threadId: opContext.threadId,
          topicId: opContext.topicId ?? undefined,
        });

        if (!assistantMessageItem) {
          throw new Error('Failed to create assistant message');
        }
        assistantMessageId = assistantMessageItem.id;

        // Associate the assistant message with the operation for UI loading states
        context.get().associateMessageWithOperation(assistantMessageId, context.operationId);
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
      const messages = llmPayload.messages.filter((message) => message.id !== assistantMessageId);
      const {
        isFunctionCall,
        content,
        tools,
        usage: currentStepUsage,
        tool_calls,
      } = await context.get().internal_fetchAIChatMessage({
        messageId: assistantMessageId,
        messages,
        model: llmPayload.model,
        provider: llmPayload.provider,
        operationId: context.operationId,
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

        let toolMessageId: string;
        let toolOperationId: string | undefined;

        if (payload.skipCreateToolMessage) {
          // Reuse existing tool message (resumption mode)
          toolMessageId = payload.parentMessageId;
          // Check if tool message already exists (e.g., from human approval flow)
          const existingToolMessage = latestMessages.find((m) => m.id === toolMessageId)!;

          log(
            '[%s][call_tool] Resuming with existing tool message: %s (status: %s)',
            sessionLogId,
            toolMessageId,
            existingToolMessage.pluginIntervention?.status,
          );
        } else {
          // Create new tool message (normal mode)
          log(
            '[%s][call_tool] Creating tool message for tool_call_id: %s',
            sessionLogId,
            chatToolPayload.id,
          );

          // Get context from operation
          const opContext = getOperationContext();

          const toolMessageParams: CreateMessageParams = {
            content: '',
            groupId: assistantMessage?.groupId,
            parentId: payload.parentMessageId,
            plugin: chatToolPayload,
            role: 'tool',
            sessionId: opContext.sessionId!,
            threadId: opContext.threadId,
            tool_call_id: chatToolPayload.id,
            topicId: opContext.topicId ?? undefined,
          };

          const createResult = await context.get().optimisticCreateMessage(toolMessageParams);

          if (!createResult) {
            log(
              '[%s][call_tool] ERROR: Failed to create tool message for tool_call_id: %s',
              sessionLogId,
              chatToolPayload.id,
            );
            throw new Error(
              `Failed to create tool message for tool_call_id: ${chatToolPayload.id}`,
            );
          }

          toolMessageId = createResult.id;
          log('[%s][call_tool] Created tool message, id: %s', sessionLogId, toolMessageId);

          // Create toolCalling operation
          const { operationId } = context.get().startOperation({
            type: 'toolCalling',
            context: {
              sessionId: opContext.sessionId!,
              topicId: opContext.topicId,
              messageId: toolMessageId,
            },
            parentOperationId: context.operationId,
            metadata: {
              identifier: chatToolPayload.identifier,
              apiName: chatToolPayload.apiName,
              tool_call_id: chatToolPayload.id,
            },
          });
          toolOperationId = operationId;

          // Associate tool message with operation
          context.get().associateMessageWithOperation(toolMessageId, toolOperationId);

          // Check if parent operation was cancelled after creating tool message
          const parentOp = context.get().operations[context.operationId];
          if (parentOp?.status === 'cancelled') {
            log(
              '[%s][call_tool] Parent operation cancelled, skipping tool execution',
              sessionLogId,
            );

            // Update tool message to indicate it was cancelled by user
            await context
              .get()
              .optimisticUpdateMessageContent(
                toolMessageId,
                'Tool execution was cancelled by user.',
                undefined,
                { operationId: toolOperationId },
              );

            // Cancel the tool operation we just created
            context.get().cancelOperation(toolOperationId, 'Parent operation cancelled');
            return { events, newState: state };
          }
        }

        // Execute tool
        log('[%s][call_tool] Executing tool %s ...', sessionLogId, toolName);
        // This method handles:
        // - Tool execution (builtin, plugin, MCP)
        // - Content updates via optimisticUpdateMessageContent
        // - Error handling via internal_updateMessageError
        let result: any;
        let wasCancelled = false;

        try {
          result = await context
            .get()
            .internal_invokeDifferentTypePlugin(toolMessageId, chatToolPayload);
        } catch (error: any) {
          // Check if this is an abort error
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            log('[%s][call_tool] Tool execution was cancelled by user', sessionLogId);
            wasCancelled = true;

            // Update tool message to indicate cancellation
            await context
              .get()
              .optimisticUpdateMessageContent(
                toolMessageId,
                'Tool execution was cancelled by user.',
                undefined,
                { operationId: toolOperationId },
              );

            // Cancel the operation
            if (toolOperationId) {
              context.get().cancelOperation(toolOperationId, 'User cancelled during execution');
            }

            return { events, newState: state };
          }

          // Re-throw non-abort errors
          throw error;
        }

        const executionTime = Math.round(performance.now() - startTime);
        const isSuccess = !result.error;

        log(
          '[%s][call_tool] Executing %s in %dms, result: %O',
          sessionLogId,
          toolName,
          executionTime,
          result,
        );

        // Complete or fail the operation
        if (toolOperationId && !wasCancelled) {
          if (isSuccess) {
            context.get().completeOperation(toolOperationId);
          } else {
            context.get().failOperation(toolOperationId, {
              type: 'ToolExecutionError',
              message: result.error || 'Tool execution failed',
            });
          }
        }

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

    /** Create human approve executor */
    request_human_approve: async (instruction, state) => {
      const { pendingToolsCalling, reason, skipCreateToolMessage } = instruction as Extract<
        AgentInstruction,
        { type: 'request_human_approve' }
      >;
      const newState = structuredClone(state);
      const events: AgentEvent[] = [];
      const sessionLogId = `${state.sessionId}:${state.stepCount}`;

      log(
        '[%s][request_human_approve] Executor start, pending tools count: %d, reason: %s',
        sessionLogId,
        pendingToolsCalling.length,
        reason || 'human_intervention_required',
      );

      // Update state to waiting_for_human
      newState.lastModified = new Date().toISOString();
      newState.status = 'waiting_for_human';
      newState.pendingToolsCalling = pendingToolsCalling;

      // Get assistant message to extract groupId and parentId
      const latestMessages = context.get().dbMessagesMap[context.messageKey] || [];
      const assistantMessage = latestMessages.findLast((m) => m.role === 'assistant');

      if (!assistantMessage) {
        log('[%s][request_human_approve] ERROR: No assistant message found', sessionLogId);
        throw new Error('No assistant message found for intervention');
      }

      log(
        '[%s][request_human_approve] Found assistant message: %s',
        sessionLogId,
        assistantMessage.id,
      );

      if (skipCreateToolMessage) {
        // Resumption mode: Tool messages already exist, just verify them
        log('[%s][request_human_approve] Resuming with existing tool messages', sessionLogId);
      } else {
        // Get context from operation
        const opContext = getOperationContext();

        // Create tool messages for each pending tool call with intervention status
        await pMap(pendingToolsCalling, async (toolPayload) => {
          const toolName = `${toolPayload.identifier}/${toolPayload.apiName}`;
          log(
            '[%s][request_human_approve] Creating tool message for %s with tool_call_id: %s',
            sessionLogId,
            toolName,
            toolPayload.id,
          );

          const toolMessageParams: CreateMessageParams = {
            content: '',
            groupId: assistantMessage.groupId,
            parentId: assistantMessage.id,
            plugin: {
              ...toolPayload,
            },
            pluginIntervention: { status: 'pending' },
            role: 'tool',
            sessionId: opContext.sessionId!,
            threadId: opContext.threadId,
            tool_call_id: toolPayload.id,
            topicId: opContext.topicId ?? undefined,
          };

          const createResult = await context.get().optimisticCreateMessage(toolMessageParams);

          if (!createResult) {
            log(
              '[%s][request_human_approve] ERROR: Failed to create tool message for %s',
              sessionLogId,
              toolName,
            );
            throw new Error(`Failed to create tool message for ${toolName}`);
          }

          log(
            '[%s][request_human_approve] Created tool message: %s for %s',
            sessionLogId,
            createResult.id,
            toolName,
          );
        });
      }

      log(
        '[%s][request_human_approve] All tool messages created, emitting human_approve_required event',
        sessionLogId,
      );

      events.push({
        pendingToolsCalling,
        sessionId: newState.sessionId,
        type: 'human_approve_required',
      });

      return { events, newState };
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
