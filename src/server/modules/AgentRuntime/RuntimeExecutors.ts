import {
  AgentEvent,
  AgentInstruction,
  CallLLMPayload,
  InstructionExecutor,
  UsageCounter,
} from '@lobechat/agent-runtime';
import { ToolNameResolver } from '@lobechat/context-engine';
import { consumeStreamUntilDone } from '@lobechat/model-runtime';
import { ChatToolPayload, ClientSecretPayload, MessageToolCall } from '@lobechat/types';
import debug from 'debug';

import { MessageModel } from '@/database/models/message';
import { GeneralAgentLLMResultPayload } from '@/server/modules/AgentRuntime/GeneralAgent';
import { initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';
import { ToolExecutionService } from '@/server/services/toolExecution';

import { StreamEventManager } from './StreamEventManager';

const log = debug('lobe-server:agent-runtime:streaming-executors');

// Tool pricing configuration (USD per call)
const TOOL_PRICING: Record<string, number> = {
  'lobe-web-browsing/craw': 0.002,
  'lobe-web-browsing/search': 0.001,
};

export interface RuntimeExecutorContext {
  fileService?: any;
  messageModel: MessageModel;
  sessionId: string;
  stepIndex: number;
  streamManager: StreamEventManager;
  toolExecutionService: ToolExecutionService;
  userId?: string;
  userPayload?: ClientSecretPayload;
}

export const createRuntimeExecutors = (
  ctx: RuntimeExecutorContext,
): Partial<Record<AgentInstruction['type'], InstructionExecutor>> => ({
  /**
   * 创建流式 LLM 执行器
   * 集成 Agent Runtime 和流式事件发布
   */
  call_llm: async (instruction, state) => {
    const { payload } = instruction as Extract<AgentInstruction, { type: 'call_llm' }>;
    const llmPayload = payload as CallLLMPayload;
    const { sessionId, stepIndex, streamManager } = ctx;
    const events: AgentEvent[] = [];

    // 类型断言确保 payload 的正确性
    const sessionLogId = `${sessionId}:${stepIndex}`;

    const stagePrefix = `[${sessionLogId}][call_llm]`;

    log(`${stagePrefix} Starting session`);

    // create assistant message
    const assistantMessageItem = await ctx.messageModel.create({
      content: '',
      fromModel: llmPayload.model,
      fromProvider: llmPayload.provider,
      role: 'assistant',
      sessionId: state.metadata!.sessionId!,
      threadId: state.metadata?.threadId,
      topicId: state.metadata?.topicId,
    });

    // 发布流式开始事件
    await streamManager.publishStreamEvent(sessionId, {
      data: {
        assistantMessage: assistantMessageItem,
        model: llmPayload.model,
        provider: llmPayload.provider,
      },
      stepIndex,
      type: 'stream_start',
    });

    try {
      let content = '';
      let toolsCalling: ChatToolPayload[] = [];
      let tool_calls: MessageToolCall[] = [];
      let thinkingContent = '';
      let imageList: any[] = [];
      let grounding: any = null;
      let currentStepUsage: any = undefined;

      // 初始化 ModelRuntime
      const modelRuntime = initModelRuntimeWithUserPayload(
        llmPayload.provider,
        ctx.userPayload || {},
      );

      // 构造 ChatStreamPayload
      const chatPayload = {
        messages: llmPayload.messages,
        model: llmPayload.model,
        tools: llmPayload.tools,
      };

      log(
        `${stagePrefix} calling model-runtime chat (model: %s, messages: %d, tools: %d)`,
        llmPayload.model,
        llmPayload.messages.length,
        llmPayload.tools?.length ?? 0,
      );

      // Buffer：累积 text 和 reasoning，每 50ms 发送一次
      const BUFFER_INTERVAL = 50;
      let textBuffer = '';
      let reasoningBuffer = '';
      // eslint-disable-next-line no-undef
      let textBufferTimer: NodeJS.Timeout | null = null;
      // eslint-disable-next-line no-undef
      let reasoningBufferTimer: NodeJS.Timeout | null = null;

      const flushTextBuffer = async () => {
        const delta = textBuffer;
        textBuffer = '';

        if (!!delta) {
          log(`[${sessionLogId}] flushTextBuffer:`, delta);

          // 构建标准 Agent Runtime 事件
          events.push({
            chunk: { text: delta, type: 'text' },
            type: 'llm_stream',
          });

          await streamManager.publishStreamChunk(sessionId, stepIndex, {
            chunkType: 'text',
            content: delta,
          });
        }
      };

      const flushReasoningBuffer = async () => {
        const delta = reasoningBuffer;

        reasoningBuffer = '';

        if (!!delta) {
          log(`[${sessionLogId}] flushReasoningBuffer:`, delta);

          events.push({
            chunk: { text: delta, type: 'reasoning' },
            type: 'llm_stream',
          });

          await streamManager.publishStreamChunk(sessionId, stepIndex, {
            chunkType: 'reasoning',
            reasoning: delta,
          });
        }
      };

      // 调用 model-runtime chat
      const response = await modelRuntime.chat(chatPayload, {
        callback: {
          onCompletion: async (data) => {
            // 捕获 usage (可能包含 cost，也可能不包含)
            if (data.usage) {
              currentStepUsage = data.usage;
            }
          },
          onText: async (text) => {
            // log(`[${sessionLogId}][text]`, text);
            content += text;

            textBuffer += text;

            // 如果没有定时器，创建一个
            if (!textBufferTimer) {
              textBufferTimer = setTimeout(async () => {
                await flushTextBuffer();
                textBufferTimer = null;
              }, BUFFER_INTERVAL);
            }
          },
          onThinking: async (reasoning) => {
            // log(`[${sessionLogId}][reasoning]`, reasoning);
            thinkingContent += reasoning;

            // Buffer reasoning 内容
            reasoningBuffer += reasoning;

            // 如果没有定时器，创建一个
            if (!reasoningBufferTimer) {
              reasoningBufferTimer = setTimeout(async () => {
                await flushReasoningBuffer();
                reasoningBufferTimer = null;
              }, BUFFER_INTERVAL);
            }
          },
          onToolsCalling: async ({ toolsCalling: raw }) => {
            const payload = new ToolNameResolver().resolve(raw, state.toolManifestMap);
            // log(`[${sessionLogId}][toolsCalling]`, payload);
            toolsCalling = payload;
            tool_calls = raw;

            // 如果有 textBuffer,先推一次
            if (!!textBuffer) {
              await flushTextBuffer();
            }

            await streamManager.publishStreamChunk(sessionId, stepIndex, {
              chunkType: 'tools_calling',
              toolsCalling: payload,
            });
          },
        },
        user: ctx.userId,
      });

      // 消费流确保所有回调执行完成
      await consumeStreamUntilDone(response);

      await flushTextBuffer();
      await flushReasoningBuffer();

      // 清理定时器并 flush 剩余 buffer
      if (textBufferTimer) {
        clearTimeout(textBufferTimer);
        textBufferTimer = null;
      }

      if (reasoningBufferTimer) {
        clearTimeout(reasoningBufferTimer);
        reasoningBufferTimer = null;
      }

      log(`[${sessionLogId}] finish model-runtime calling`);

      if (thinkingContent) {
        log(`[${sessionLogId}][reasoning]`, thinkingContent);
      }
      if (content) {
        log(`[${sessionLogId}][content]`, content);
      }
      if (toolsCalling.length > 0) {
        log(`[${sessionLogId}][toolsCalling] `, toolsCalling);
      }

      // 日志输出 usage
      if (currentStepUsage) {
        log(`[${sessionLogId}][usage] %O`, currentStepUsage);
      }

      // 添加一个完整的 llm_stream 事件（包含所有流式块）
      events.push({
        result: { content, reasoning: thinkingContent, tool_calls, usage: currentStepUsage },
        type: 'llm_result',
      });

      // 发布流式结束事件
      await streamManager.publishStreamEvent(sessionId, {
        data: {
          finalContent: content,
          grounding: grounding,
          imageList: imageList.length > 0 ? imageList : undefined,
          reasoning: thinkingContent || undefined,
          toolsCalling: toolsCalling,
          usage: currentStepUsage,
        },
        stepIndex,
        type: 'stream_end',
      });

      log('[%s:%d] call_llm completed', sessionId, stepIndex);

      // ===== 1. 先保存原始 usage 到 message.metadata =====
      try {
        await ctx.messageModel.update(assistantMessageItem.id, {
          content,
          // 保存原始 usage，不做任何修改
          metadata: currentStepUsage,
          reasoning: {
            content: thinkingContent,
          },
          search: grounding,
          tools: toolsCalling.length > 0 ? toolsCalling : undefined,
        });
      } catch (error) {
        console.error('[call_llm] Failed to update message:', error);
      }

      // ===== 2. 然后累加到 AgentState =====
      let newState = structuredClone(state);

      newState.messages.push({
        content,
        role: 'assistant',
        tool_calls: tool_calls.length > 0 ? tool_calls : undefined,
      });

      if (currentStepUsage) {
        // 使用 UsageCounter 统一累加 usage 和 cost
        const { usage, cost } = UsageCounter.accumulateLLM({
          cost: newState.cost,
          model: llmPayload.model,
          modelUsage: currentStepUsage,
          provider: llmPayload.provider,
          usage: newState.usage,
        });

        newState.usage = usage;
        if (cost) newState.cost = cost;
      }

      return {
        events,
        newState,
        nextContext: {
          payload: {
            hasToolsCalling: toolsCalling.length > 0,
            result: { content, tool_calls },
            toolsCalling: toolsCalling,
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            eventCount: events.length,
            messageCount: newState.messages.length,
            sessionId: state.sessionId,
            status: 'running',
            stepCount: state.stepCount + 1,
          },
          stepUsage: currentStepUsage,
        },
      };
    } catch (error) {
      // 发布错误事件
      await streamManager.publishStreamEvent(sessionId, {
        data: {
          error: (error as Error).message,
          phase: 'llm_execution',
        },
        stepIndex,
        type: 'error',
      });

      console.error(
        `[StreamingLLMExecutor][${sessionId}:${stepIndex}] LLM execution failed:`,
        error,
      );
      throw error;
    }
  },
  /**
   * 工具执行
   */
  call_tool: async (instruction, state) => {
    const { payload } = instruction as Extract<AgentInstruction, { type: 'call_tool' }>;
    const { sessionId, stepIndex, streamManager, toolExecutionService } = ctx;
    const events: AgentEvent[] = [];

    const sessionLogId = `${sessionId}:${stepIndex}`;
    log(`[${sessionLogId}] payload: %O`, payload);

    // 发布工具执行开始事件
    await streamManager.publishStreamEvent(sessionId, {
      data: payload,
      stepIndex,
      type: 'tool_start',
    });

    try {
      // Convert CallingToolPayload to ChatToolPayload for ToolExecutionService
      const chatToolPayload: ChatToolPayload = {
        apiName: payload.apiName,
        arguments: payload.arguments,
        id: payload.id,
        identifier: payload.identifier,
        type: payload.type as any, // CallingToolPayload.type is compatible
      };

      const toolName = `${chatToolPayload.identifier}/${chatToolPayload.apiName}`;
      // Execute tool using ToolExecutionService
      log(`[${sessionLogId}] Executing tool ${toolName} ...`);
      const executionResult = await toolExecutionService.executeTool(chatToolPayload, {
        toolManifestMap: state.toolManifestMap,
        userId: ctx.userId,
        userPayload: ctx.userPayload,
      });

      const executionTime = executionResult.executionTime;
      const isSuccess = executionResult.success;
      log(
        `[${sessionLogId}] Executing ${toolName} in ${executionTime}ms, result: %O`,
        executionResult,
      );

      // 发布工具执行结果事件
      await streamManager.publishStreamEvent(sessionId, {
        data: {
          executionTime,
          isSuccess,
          payload,
          phase: 'tool_execution',
          result: executionResult,
        },
        stepIndex,
        type: 'tool_end',
      });

      // 最终更新数据库
      try {
        await ctx.messageModel.create({
          content: executionResult.content,
          plugin: payload as any,
          pluginError: executionResult.error,
          pluginState: executionResult.state,
          role: 'tool',
          sessionId: state.metadata!.sessionId!,
          threadId: state.metadata?.threadId,
          tool_call_id: payload.id,
          topicId: state.metadata?.topicId,
        });
      } catch (error) {
        console.error('[StreamingToolExecutor] Failed to create tool message: %O', error);
      }

      const newState = structuredClone(state);

      newState.messages.push({
        content: executionResult.content,
        role: 'tool',
        tool_call_id: payload.id,
      });

      events.push({ id: payload.id, result: executionResult, type: 'tool_result' });

      // 获取工具单价
      const toolCost = TOOL_PRICING[toolName] || 0;

      // 使用 UsageCounter 统一累加 tool usage
      const { usage, cost } = UsageCounter.accumulateTool({
        cost: newState.cost,
        executionTime,
        success: isSuccess,
        toolCost,
        toolName,
        usage: newState.usage,
      });

      newState.usage = usage;
      if (cost) newState.cost = cost;

      // 查找当前工具的统计信息
      const currentToolStats = usage.tools.byTool.find((t) => t.name === toolName);

      // 日志输出 usage
      log(
        `[${sessionLogId}][tool usage] %s: calls=%d, time=%dms, success=%s, cost=$%s`,
        toolName,
        currentToolStats?.calls || 0,
        executionTime,
        isSuccess,
        toolCost.toFixed(4),
      );

      log('[%s:%d] Tool execution completed', sessionId, stepIndex);

      return {
        events,
        newState,
        nextContext: {
          payload: {
            data: executionResult,
            executionTime,
            isSuccess,
            toolCall: payload,
            toolCallId: payload.id,
          },
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
        },
      };
    } catch (error) {
      // 发布工具执行错误事件
      await streamManager.publishStreamEvent(sessionId, {
        data: {
          error: (error as Error).message,
          phase: 'tool_execution',
        },
        stepIndex,
        type: 'error',
      });

      events.push({
        error: error,
        type: 'error',
      });

      console.error(
        `[StreamingToolExecutor] Tool execution failed for session ${sessionId}:${stepIndex}:`,
        error,
      );

      return {
        events,
        newState: state, // 状态不变
      };
    }
  },
  /**
   * 完成 runtime 运行
   */
  finish: async (instruction, state) => {
    const { reason, reasonDetail } = instruction as Extract<AgentInstruction, { type: 'finish' }>;
    const { sessionId, stepIndex, streamManager } = ctx;

    log('[%s:%d] Finishing execution: (%s)', sessionId, stepIndex, reason);

    // 发布执行完成事件
    await streamManager.publishStreamEvent(sessionId, {
      data: {
        finalState: { ...state, status: 'done' },
        phase: 'execution_complete',
        reason,
        reasonDetail,
      },
      stepIndex,
      type: 'step_complete',
    });

    const newState = structuredClone(state);
    newState.lastModified = new Date().toISOString();
    newState.status = 'done';

    const events: AgentEvent[] = [
      {
        finalState: newState,
        reason,
        reasonDetail,
        type: 'done',
      },
    ];

    return { events, newState };
  },

  /**
   * 人工审批
   */
  request_human_approve: async (instruction, state) => {
    const { pendingToolsCalling } = instruction as Extract<
      AgentInstruction,
      { type: 'request_human_approve' }
    >;
    const { sessionId, stepIndex, streamManager } = ctx;

    log('[%s:%d] Requesting human approval for %O', sessionId, stepIndex, pendingToolsCalling);

    // 发布人工审批请求事件
    await streamManager.publishStreamEvent(sessionId, {
      data: {
        pendingToolsCalling,
        phase: 'human_approval',
        requiresApproval: true,
      },
      stepIndex,
      type: 'step_start',
    });

    const newState = structuredClone(state);
    newState.lastModified = new Date().toISOString();
    newState.status = 'waiting_for_human';
    newState.pendingToolsCalling = pendingToolsCalling;

    // 通过流式系统通知前端显示审批 UI
    await streamManager.publishStreamChunk(sessionId, stepIndex, {
      // 使用 sessionId 作为 messageId
      chunkType: 'tools_calling',
      toolsCalling: pendingToolsCalling as any,
    });

    const events: AgentEvent[] = [
      {
        pendingToolsCalling,
        sessionId: newState.sessionId,
        type: 'human_approve_required',
      },
      {
        toolCalls: pendingToolsCalling,
        type: 'tool_pending',
      },
    ];

    log('Human approval requested for session %s:%d', sessionId, stepIndex);

    return {
      events,
      newState,
      // 不提供 nextContext，因为需要等待人工干预
    };
  },
});
