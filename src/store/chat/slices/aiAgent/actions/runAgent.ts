import { LOADING_FLAT, isDesktop } from '@lobechat/const';
import { ChatToolPayload, CreateMessageParams, SendMessageParams } from '@lobechat/types';
import debug from 'debug';
import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { StreamEvent, agentRuntimeClient, agentRuntimeService } from '@/services/agentRuntime';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { setNamespace } from '@/utils/storeDebug';

const log = debug('store:chat:ai-agent:runAgent');
const n = setNamespace('agent');

interface StreamingContext {
  assistantId: string;
  content: string;
  reasoning: string;
  tmpAssistantId: string;
  toolsCalling?: ChatToolPayload[];
}
export interface AgentAction {
  internal_cleanupAgentSession: (assistantId: string) => void;
  internal_handleAgentError: (assistantId: string, error: string) => void;
  /**
   * Agent Runtime 相关方法
   */
  internal_handleAgentStreamEvent: (
    sessionId: string,
    event: StreamEvent,
    context: StreamingContext,
  ) => Promise<void>;
  internal_handleHumanIntervention: (
    assistantId: string,
    action: string,
    data?: any,
  ) => Promise<void>;
  /**
   * Sends a message through the agent runtime workflow
   */
  sendAgentMessage: (params: SendMessageParams) => Promise<void>;
}

export const agentSlice: StateCreator<ChatStore, [['zustand/devtools', never]], [], AgentAction> = (
  set,
  get,
) => ({
  internal_cleanupAgentSession: (assistantId: string) => {
    const session = get().agentSessions[assistantId];
    if (!session) return;

    log(`Cleaning up agent session for ${assistantId}`);

    // 关闭 EventSource 连接
    if (session.eventSource) {
      session.eventSource.close();
    }

    // 删除会话信息
    set(
      produce((draft) => {
        delete draft.agentSessions[assistantId];
      }),
      false,
      n('cleanupAgentSession', { assistantId }),
    );

    // 如果有错误，删除服务端会话
    if (session.sessionId && session.status === 'error') {
      agentRuntimeService.deleteSession(session.sessionId).catch((error: Error) => {
        console.warn(
          `[Agent Runtime] Failed to delete server session ${session.sessionId}:`,
          error,
        );
      });
    }
  },

  internal_handleAgentError: (assistantId: string, errorMessage: string) => {
    log(`Agent error for ${assistantId}: ${errorMessage}`);

    // 更新会话错误状态
    set(
      produce((draft) => {
        if (draft.agentSessions[assistantId]) {
          draft.agentSessions[assistantId].status = 'error';
          draft.agentSessions[assistantId].error = errorMessage;
        }
      }),
      false,
      n('setAgentError', { assistantId, errorMessage }),
    );

    // 更新消息错误状态
    messageService.updateMessageError(assistantId, {
      message: errorMessage,
      type: 'UnknownError' as any,
    });
    get().refreshMessages();

    // 停止 loading 状态
    get().internal_toggleChatLoading(false, assistantId);

    // 清理会话
    get().internal_cleanupAgentSession(assistantId);
  },

  // ======== Agent Runtime 相关方法 ========
  internal_handleAgentStreamEvent: async (sessionId, event, context) => {
    const { internal_dispatchMessage } = get();
    const session = get().agentSessions[sessionId];
    if (!session) {
      log(`No session found for ${sessionId}, ignoring event ${event.type}`);
      return;
    }

    // 更新会话状态
    set(
      produce((draft) => {
        if (draft.agentSessions[sessionId]) {
          draft.agentSessions[sessionId].lastEventId = event.timestamp.toString();
          if (event.stepIndex !== undefined) {
            draft.agentSessions[sessionId].stepCount = event.stepIndex;
          }
        }
      }),
      false,
      n('updateAgentSessionFromEvent', { eventType: event.type }),
    );
    const assistantId = context.assistantId || context.tmpAssistantId;
    log(`assistantMessageId: ${assistantId}`);

    switch (event.type) {
      case 'connected': {
        log(`Agent stream connected for ${assistantId}`);
        break;
      }

      case 'heartbeat': {
        // 心跳事件，保持连接活跃
        break;
      }

      case 'stream_start': {
        log(`Stream started for ${assistantId}:`, event.data);
        internal_dispatchMessage({
          id: context.tmpAssistantId,
          type: 'deleteMessage',
        });

        context.assistantId = event.data.assistantMessage.id;

        internal_dispatchMessage({
          id: context.assistantId,
          type: 'createMessage',
          value: event.data.assistantMessage,
        });

        break;
      }

      case 'stream_chunk': {
        // 处理流式内容块
        const { chunkType } = event.data || {};

        switch (chunkType) {
          case 'text': {
            // 更新文本内容
            context.content += event.data.content;
            log(`Stream(${event.sessionId}) chunk type=${chunkType}: `, event.data.content);

            internal_dispatchMessage({
              id: assistantId,
              type: 'updateMessage',
              value: { content: context.content },
            });
            break;
          }

          case 'reasoning': {
            // 更新文本内容
            context.reasoning += event.data.reasoning;
            log(`Stream(${event.sessionId}) chunk type=${chunkType}: `, event.data.reasoning);

            internal_dispatchMessage({
              id: assistantId,
              type: 'updateMessage',
              value: { reasoning: { content: context.reasoning } },
            });
            break;
          }

          case 'tools_calling': {
            context.toolsCalling = event.data.toolsCalling;

            internal_dispatchMessage({
              id: assistantId,
              type: 'updateMessage',
              value: { tools: context.toolsCalling },
            });
            break;
          }
        }

        break;
      }

      case 'stream_end': {
        // 流式结束，更新最终内容
        const { finalContent, toolCalls, reasoning, imageList, grounding } = event.data || {};
        log(`Stream ended for ${assistantId}:`, {
          hasFinalContent: !!finalContent,
          hasGrounding: !!grounding,
          hasImageList: !!(imageList && imageList.length > 0),
          hasReasoning: !!reasoning,
          hasToolCalls: !!(toolCalls && toolCalls.length > 0),
        });

        if (finalContent !== undefined) {
          await get().internal_updateMessageContent(assistantId, finalContent, {
            ...(toolCalls && toolCalls.length > 0 ? { toolCalls } : {}),
            ...(reasoning ? { reasoning } : {}),
            ...(imageList && imageList.length > 0 ? { imageList } : {}),
            ...(grounding ? { search: grounding } : {}),
          });
        }

        // 停止 loading 状态
        log(`Stopping loading for ${assistantId}`);
        get().internal_toggleChatLoading(false, assistantId);

        // 显示桌面通知
        if (isDesktop) {
          try {
            const { desktopNotificationService } = await import(
              '@/services/electron/desktopNotification'
            );
            await desktopNotificationService.showNotification({
              body: 'AI 回复生成完成',
              title: 'AI 回复完成', // TODO: 使用 i18n
            });
          } catch (error) {
            console.error('Desktop notification error:', error);
          }
        }
        break;
      }

      case 'step_start': {
        const { phase, toolCall, pendingToolsCalling, requiresApproval } = event.data || {};

        if (phase === 'human_approval' && requiresApproval) {
          // 需要人工批准
          log(`Human approval required for ${assistantId}:`, pendingToolsCalling);
          set(
            produce((draft) => {
              if (draft.agentSessions[assistantId]) {
                draft.agentSessions[assistantId].needsHumanInput = true;
                draft.agentSessions[assistantId].pendingApproval = pendingToolsCalling;
              }
            }),
            false,
            n('setHumanApprovalNeeded', { assistantId }),
          );

          // 停止 loading 状态，等待人工干预
          log(`Stopping loading for human approval: ${assistantId}`);
          get().internal_toggleChatLoading(false, assistantId);
        } else if (phase === 'tool_execution' && toolCall) {
          log(`Tool execution started for ${assistantId}: ${toolCall.function?.name}`);
        }
        break;
      }

      case 'step_complete': {
        const { phase, result, executionTime, finalState } = event.data || {};

        if (phase === 'tool_execution' && result) {
          log(`Tool execution completed for ${assistantId} in ${executionTime}ms:`, result);
          // 刷新消息以显示工具结果
          await get().refreshMessages();
        } else if (phase === 'execution_complete' && finalState) {
          // Agent 执行完成
          log(`Agent execution completed for ${assistantId}:`, finalState);
          set(
            produce((draft) => {
              if (draft.agentSessions[assistantId]) {
                draft.agentSessions[assistantId].status = finalState.status;
              }
            }),
            false,
            n('updateAgentFinalStatus', { assistantId, status: finalState.status }),
          );

          log(`Stopping loading for completed agent: ${assistantId}`);
          get().internal_toggleChatLoading(false, assistantId);
        }
        break;
      }

      case 'error': {
        const { error, message, phase } = event.data || {};
        log(`Error in ${phase} for ${assistantId}:`, error);
        get().internal_handleAgentError(assistantId, message || error || 'Unknown agent error');
        break;
      }

      default: {
        log(`Handling event ${event.type} for ${assistantId}:`, event);
        break;
      }
    }
  },

  internal_handleHumanIntervention: async (assistantId: string, action: string, data?: any) => {
    const session = get().agentSessions[assistantId];
    if (!session || !session.needsHumanInput) {
      log(`No human intervention needed for ${assistantId}`);
      return;
    }

    try {
      log(`Handling human intervention ${action} for ${assistantId}:`, data);

      // 发送人工干预请求
      await agentRuntimeService.handleHumanIntervention({
        action: action as any,
        data,
        sessionId: session.sessionId,
      });

      // 重新开始 loading 状态
      get().internal_toggleChatLoading(true, assistantId);

      // 清除人工干预状态
      set(
        produce((draft) => {
          if (draft.agentSessions[assistantId]) {
            draft.agentSessions[assistantId].needsHumanInput = false;
            draft.agentSessions[assistantId].pendingApproval = undefined;
            draft.agentSessions[assistantId].pendingPrompt = undefined;
            draft.agentSessions[assistantId].pendingSelect = undefined;
          }
        }),
        false,
        n('clearHumanIntervention', { action, assistantId }),
      );

      log(`Human intervention ${action} processed for ${assistantId}`);
    } catch (error) {
      log(`Failed to handle human intervention for ${assistantId}:`, error);
      get().internal_handleAgentError(
        assistantId,
        `Human intervention failed: ${(error as Error).message}`,
      );
    }
  },

  sendAgentMessage: async ({
    message,
    files,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isWelcomeQuestion: _isWelcomeQuestion,
  }: SendMessageParams) => {
    const { activeTopicId, activeId, activeThreadId } = get();
    if (!activeId) {
      log('No active session ID, cannot send agent message');
      return;
    }

    log(`Starting agent message for session ${activeId}:`, {
      fileCount: files?.length || 0,
      message,
    });

    set({ isCreatingMessage: true }, false, n('creatingMessage/start(agent)'));

    const fileIdList = files?.map((f: any) => f.id);

    // First add the user message
    const newMessage: CreateMessageParams = {
      content: message,
      files: fileIdList,
      role: 'user',
      sessionId: activeId,
      threadId: activeThreadId,
      topicId: activeTopicId,
    };

    const tmpUserMessageId = get().internal_createTmpMessage(newMessage);

    // Create message in server (for persistence)
    let userMessageId: string | undefined;

    try {
      userMessageId = await get().internal_createMessage(newMessage, {
        tempMessageId: tmpUserMessageId,
      });
    } catch (error) {
      console.error('Failed to create user message:', error);
      get().internal_dispatchMessage({ id: tmpUserMessageId, type: 'deleteMessage' });
      set({ isCreatingMessage: false }, false, n('creatingMessage/error'));
    }

    set({ isCreatingMessage: false }, false, n('creatingMessage/end'));

    if (!userMessageId) return;
    const messages = chatSelectors.activeBaseChats(get());

    // Create a placeholder AI message for the agent response
    const agentMessageId = get().internal_createTmpMessage({
      content: LOADING_FLAT,
      role: 'assistant',
      sessionId: activeId,
      threadId: activeThreadId,
      topicId: activeTopicId,
    });

    // Start durable agent runtime processing
    try {
      set({ isCreatingMessage: true }, false, n('agentWorkflow/start'));
      get().internal_toggleChatLoading(true, agentMessageId, n('sendAgentMessage/start') as string);

      // 创建 Agent 会话

      const sessionResponse = await agentRuntimeService.createSession({
        agentSessionId: activeId,
        autoStart: true,
        messages,
        threadId: activeThreadId,
        topicId: activeTopicId,
        userMessageId,
      });

      log(`Created session ${sessionResponse.sessionId}:`, sessionResponse);

      // 存储 Agent 会话信息
      set(
        produce((draft) => {
          draft.agentSessions[sessionResponse.sessionId] = {
            lastEventId: '0',
            sessionId: sessionResponse.sessionId,
            status: 'created', // 使用后端返回的实际状态
            stepCount: 0,
            totalCost: 0,
          };
        }),
        false,
        n('createAgentSession', {
          assistantId: agentMessageId,
          sessionId: sessionResponse.sessionId,
        }),
      );

      // 创建流式连接
      log(`[StreamConnection] Creating stream connection for session ${sessionResponse.sessionId}`);

      const context: StreamingContext = {
        assistantId: '',
        content: '',
        reasoning: '',
        tmpAssistantId: agentMessageId,
      };

      const eventSource = agentRuntimeClient.createStreamConnection(sessionResponse.sessionId, {
        includeHistory: false,
        onConnect: () => {
          log(`Stream connected to ${sessionResponse.sessionId}`);
        },
        onDisconnect: () => {
          log(`Stream disconnected to ${sessionResponse.sessionId}`);
          get().internal_cleanupAgentSession(agentMessageId);
        },
        onError: (error: Error) => {
          log(`Stream error for ${sessionResponse.sessionId}:`, error);
          get().internal_handleAgentError(agentMessageId, error.message);
        },
        onEvent: async (event: StreamEvent) => {
          await get().internal_handleAgentStreamEvent(sessionResponse.sessionId, event, context);
        },
      });

      // 保存 EventSource 引用
      set(
        produce((draft) => {
          if (draft.agentSessions[agentMessageId]) {
            draft.agentSessions[agentMessageId].eventSource = eventSource;
          }
        }),
        false,
        n('saveAgentEventSource', { assistantId: agentMessageId }),
      );
    } catch (error) {
      log(`Failed to start agent session for ${agentMessageId}:`, error);

      // 更新错误状态
      await messageService.updateMessageError(agentMessageId, {
        message: (error as Error).message,
        type: 'UnknownError' as any,
      });
      await get().refreshMessages();

      get().internal_toggleChatLoading(
        false,
        agentMessageId,
        n('generateMessage(error)', { error, messageId: agentMessageId }),
      );

      throw error;
    } finally {
      set({ isCreatingMessage: false }, false, n('agentWorkflow/end'));
    }
  },
});
