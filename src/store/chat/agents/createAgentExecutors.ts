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
        const assistantMessageItem = await context.get().optimisticCreateMessage(
          {
            content: LOADING_FLAT,
            model: llmPayload.model,
            parentId: llmPayload.parentMessageId,
            provider: llmPayload.provider,
            role: 'assistant',
            sessionId: opContext.sessionId!,
            threadId: opContext.threadId,
            topicId: opContext.topicId ?? undefined,
          },
          { operationId: context.operationId },
        );

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
        finishType,
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

      // Log llm result
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

      log(
        '[%s:%d] call_llm completed, finishType: %s',
        state.sessionId,
        state.stepCount,
        finishType,
      );

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

      // If operation was aborted, enter human_abort phase to let agent decide how to handle
      if (finishType === 'abort') {
        log(
          '[%s:%d] call_llm aborted by user, entering human_abort phase',
          state.sessionId,
          state.stepCount,
        );

        return {
          events: [],
          newState,
          nextContext: {
            payload: {
              reason: 'user_cancelled',
              parentMessageId: assistantMessageId,
              hasToolsCalling: isFunctionCall,
              toolsCalling: toolCalls,
              result: { content, tool_calls },
            },
            phase: 'human_abort',
            session: {
              messageCount: newState.messages.length,
              sessionId: state.sessionId,
              status: 'running',
              stepCount: state.stepCount + 1,
            },
          } as AgentRuntimeContext,
        };
      }

      return {
        events: [],
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

      // Get context from operation
      const opContext = getOperationContext();

      let toolOperationId: string | undefined;
      // ============ Create toolCalling operation (top-level) ============
      const { operationId } = context.get().startOperation({
        type: 'toolCalling',
        context: {
          sessionId: opContext.sessionId!,
          topicId: opContext.topicId,
        },
        parentOperationId: context.operationId,
        metadata: {
          startTime: Date.now(),
          identifier: chatToolPayload.identifier,
          apiName: chatToolPayload.apiName,
          tool_call_id: chatToolPayload.id,
        },
      });
      toolOperationId = operationId;

      try {
        // Get assistant message to extract groupId
        const latestMessages = context.get().dbMessagesMap[context.messageKey] || [];
        // Find the last assistant message (should be created by call_llm)
        const assistantMessage = latestMessages.findLast((m) => m.role === 'assistant');

        let toolMessageId: string;

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

          // ============ Sub-operation 1: Create tool message ============
          const createToolMsgOpId = context.get().startOperation({
            type: 'createToolMessage',
            context: {
              sessionId: opContext.sessionId!,
              topicId: opContext.topicId,
            },
            parentOperationId: toolOperationId,
            metadata: {
              startTime: Date.now(),
              tool_call_id: chatToolPayload.id,
            },
          }).operationId;

          // Register cancel handler: Ensure message creation completes, then mark as aborted
          context.get().onOperationCancel(createToolMsgOpId, async ({ metadata }) => {
            log(
              '[%s][call_tool] createToolMessage cancelled, ensuring creation completes',
              sessionLogId,
            );

            // Wait for message creation to complete (ensure-complete strategy)
            const createResult = await metadata?.createMessagePromise;
            if (createResult) {
              const msgId = createResult.id;
              // Update message to aborted state
              await Promise.all([
                context
                  .get()
                  .optimisticUpdateMessageContent(
                    msgId,
                    'Tool execution was cancelled by user.',
                    undefined,
                    { operationId: createToolMsgOpId },
                  ),
                context
                  .get()
                  .optimisticUpdateMessagePlugin(
                    msgId,
                    { intervention: { status: 'aborted' } },
                    { operationId: createToolMsgOpId },
                  ),
              ]);
            }
          });

          // Execute creation and save Promise to metadata
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

          const createPromise = context
            .get()
            .optimisticCreateMessage(toolMessageParams, { operationId: createToolMsgOpId });
          context.get().updateOperationMetadata(createToolMsgOpId, {
            createMessagePromise: createPromise,
          });
          const createResult = await createPromise;

          if (!createResult) {
            context.get().failOperation(createToolMsgOpId, {
              type: 'CreateMessageError',
              message: `Failed to create tool message for tool_call_id: ${chatToolPayload.id}`,
            });
            throw new Error(
              `Failed to create tool message for tool_call_id: ${chatToolPayload.id}`,
            );
          }

          toolMessageId = createResult.id;
          log('[%s][call_tool] Created tool message, id: %s', sessionLogId, toolMessageId);
          context.get().completeOperation(createToolMsgOpId);
        }

        // Check if parent operation was cancelled while creating message
        const toolOperation = toolOperationId
          ? context.get().operations[toolOperationId]
          : undefined;
        if (toolOperation?.abortController.signal.aborted) {
          log('[%s][call_tool] Parent operation cancelled, skipping tool execution', sessionLogId);
          // Message already created with aborted status by cancel handler
          return { events, newState: state };
        }

        // ============ Sub-operation 2: Execute tool call ============
        // Auto-associates message with this operation via messageId in context
        const { operationId: executeToolOpId } = context.get().startOperation({
          type: 'executeToolCall',
          context: {
            messageId: toolMessageId,
          },
          parentOperationId: toolOperationId,
          metadata: {
            startTime: Date.now(),
            tool_call_id: chatToolPayload.id,
          },
        });

        log(
          '[%s][call_tool] Created executeToolCall operation %s for message %s',
          sessionLogId,
          executeToolOpId,
          toolMessageId,
        );

        // Register cancel handler: Just update message (message already exists)
        context.get().onOperationCancel(executeToolOpId, async () => {
          log('[%s][call_tool] executeToolCall cancelled, updating message', sessionLogId);

          // Update message to aborted state (cleanup strategy)
          await Promise.all([
            context
              .get()
              .optimisticUpdateMessageContent(
                toolMessageId,
                'Tool execution was cancelled by user.',
                undefined,
                { operationId: executeToolOpId },
              ),
            context
              .get()
              .optimisticUpdateMessagePlugin(
                toolMessageId,
                { intervention: { status: 'aborted' } },
                { operationId: executeToolOpId },
              ),
          ]);
        });

        // Execute tool - abort handling is done by cancel handler
        log('[%s][call_tool] Executing tool %s ...', sessionLogId, toolName);
        const result = await context
          .get()
          .internal_invokeDifferentTypePlugin(toolMessageId, chatToolPayload);

        // Check if operation was cancelled during tool execution
        const executeToolOperation = context.get().operations[executeToolOpId];
        if (executeToolOperation?.abortController.signal.aborted) {
          log('[%s][call_tool] Tool execution completed but operation was cancelled', sessionLogId);
          // Don't complete - cancel handler already updated message to aborted
          return { events, newState: state };
        }

        context.get().completeOperation(executeToolOpId);

        const executionTime = Math.round(performance.now() - startTime);
        const isSuccess = !result.error;

        log(
          '[%s][call_tool] Executing %s in %dms, result: %O',
          sessionLogId,
          toolName,
          executionTime,
          result,
        );

        // Complete or fail the toolCalling operation
        if (toolOperationId) {
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

          const createResult = await context
            .get()
            .optimisticCreateMessage(toolMessageParams, { operationId: context.operationId });

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
     * Resolve aborted tools executor
     * Creates tool messages with 'aborted' intervention status for cancelled tools
     */
    resolve_aborted_tools: async (instruction, state) => {
      const { parentMessageId, toolsCalling } = (
        instruction as Extract<AgentInstruction, { type: 'resolve_aborted_tools' }>
      ).payload;

      const events: AgentEvent[] = [];
      const sessionLogId = `${state.sessionId}:${state.stepCount}`;
      const newState = structuredClone(state);

      log(
        '[%s][resolve_aborted_tools] Resolving %d aborted tools',
        sessionLogId,
        toolsCalling.length,
      );

      // Get context from operation
      const opContext = getOperationContext();

      // Create tool messages for each aborted tool
      await pMap(toolsCalling, async (toolPayload) => {
        const toolName = `${toolPayload.identifier}/${toolPayload.apiName}`;
        log(
          '[%s][resolve_aborted_tools] Creating aborted tool message for %s',
          sessionLogId,
          toolName,
        );

        const toolMessageParams: CreateMessageParams = {
          content: 'Tool execution was aborted by user.',
          parentId: parentMessageId,
          plugin: toolPayload,
          pluginIntervention: { status: 'aborted' },
          role: 'tool',
          sessionId: opContext.sessionId!,
          threadId: opContext.threadId,
          tool_call_id: toolPayload.id,
          topicId: opContext.topicId ?? undefined,
        };

        const createResult = await context
          .get()
          .optimisticCreateMessage(toolMessageParams, { operationId: context.operationId });

        if (createResult) {
          log(
            '[%s][resolve_aborted_tools] Created aborted tool message: %s for %s',
            sessionLogId,
            createResult.id,
            toolName,
          );
        }
      });

      log('[%s][resolve_aborted_tools] All aborted tool messages created', sessionLogId);

      // Mark state as done since we're finishing after abort
      newState.lastModified = new Date().toISOString();
      newState.status = 'done';

      events.push({
        finalState: newState,
        reason: 'user_aborted',
        reasonDetail: 'User aborted operation with pending tool calls',
        type: 'done',
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
