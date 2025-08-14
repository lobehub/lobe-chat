/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT } from '@/const/message';
import { chatService } from '@/services/chat';
import { getAgentStoreState } from '@/store/agent/store';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { ChatMessage, CreateMessageParams, SendMessageParams } from '@/types/message';
import { Action, setNamespace } from '@/utils/storeDebug';

import { toggleBooleanList } from '../../../utils';

const n = setNamespace('ai');

interface ProcessMessageParams {
  traceId?: string;
  isWelcomeQuestion?: boolean;
  inSearchWorkflow?: boolean;
  ragQuery?: string;
  threadId?: string;
  inPortalThread?: boolean;
}

export interface AIGenerateAction {
  /**
   * Sends a new message to the AI chat system
   */
  sendMessage: (params: SendMessageParams) => Promise<void>;
  /**
   * Regenerates a specific message in the chat
   */
  regenerateMessage: (id: string) => Promise<void>;
  /**
   * Deletes an existing message and generates a new one in its place
   */
  delAndRegenerateMessage: (id: string) => Promise<void>;
  /**
   * Interrupts the ongoing ai message generation process
   */
  stopGenerateMessage: () => void;

  // =========  ↓ Internal Method ↓  ========== //
  // ========================================== //
  // ========================================== //

  /**
   * Executes the core processing logic for AI messages
   * including preprocessing and postprocessing steps
   */
  internal_coreProcessMessage: (
    messages: ChatMessage[],
    parentId: string,
    params?: ProcessMessageParams,
  ) => Promise<void>;
  /**
   * Retrieves an AI-generated chat message from the backend service
   */
  internal_fetchAIChatMessage: (input: {
    messages: ChatMessage[];
    messageId: string;
    params?: ProcessMessageParams;
    model: string;
    provider: string;
  }) => Promise<{
    isFunctionCall: boolean;
    content: string;
    traceId?: string;
  }>;
  /**
   * Resends a specific message, optionally using a trace ID for tracking
   */
  internal_resendMessage: (
    id: string,
    params?: {
      traceId?: string;
      messages?: ChatMessage[];
      threadId?: string;
      inPortalThread?: boolean;
    },
  ) => Promise<void>;
  /**
   * Toggles the loading state for AI message generation, managing the UI feedback
   */
  internal_toggleChatLoading: (
    loading: boolean,
    id?: string,
    action?: Action,
  ) => AbortController | undefined;
  internal_toggleMessageInToolsCalling: (
    loading: boolean,
    id?: string,
    action?: Action,
  ) => AbortController | undefined;
  /**
   * Controls the streaming state of tool calling processes, updating the UI accordingly
   */
  internal_toggleToolCallingStreaming: (id: string, streaming: boolean[] | undefined) => void;
  /**
   * Toggles the loading state for AI message reasoning, managing the UI feedback
   */
  internal_toggleChatReasoning: (
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;

  internal_toggleSearchWorkflow: (loading: boolean, id?: string) => void;

  // ========== 未实现的功能（注释状态）========== //
  // internal_onRagQueryFinish: (messages: ChatMessage[], ragQuery: string) => Promise<void>;
  // runPluginApi: (id: string, payload: any) => Promise<void>;
}

export const generateAIChat: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  AIGenerateAction
> = (set, get) => ({
  sendMessage: async ({ message, onlyAddUserMessage }) => {
    const { activeId, activeTopicId } = get();

    // 1. Add user message
    const userMessage: CreateMessageParams = {
      content: message,
      role: 'user',
      sessionId: activeId,
      topicId: activeTopicId,
    };

    const userMessageId = await get().internal_createMessage(userMessage);

    // 如果只添加用户消息，直接返回
    if (onlyAddUserMessage) return;

    // 2. Add AI message placeholder
    const assistantMessage: CreateMessageParams = {
      content: LOADING_FLAT,
      role: 'assistant',
      sessionId: activeId,
      topicId: activeTopicId,
      parentId: userMessageId,
    };

    const assistantMessageId = await get().internal_createMessage(assistantMessage);

    // 3. Generate AI response
    try {
      const messagesMap = get().messagesMap;
      const key = activeTopicId ? `${activeId}${activeTopicId}` : activeId;
      const messages = messagesMap[key] || [];
      if (userMessageId && assistantMessageId) {
        // 直接传递正式的assistantMessageId，参考web端实现
        get().internal_toggleChatLoading(true, assistantMessageId);
        try {
          await get().internal_fetchAIChatMessage({
            messages: messages.filter(
              (m) => m.role !== 'assistant' || m.parentId !== userMessageId,
            ),
            messageId: assistantMessageId, // 使用正式ID
            model: agentSelectors.currentAgentModel(getAgentStoreState()),
            provider: agentSelectors.currentAgentModelProvider(getAgentStoreState()),
            params: {},
          });
        } finally {
          get().internal_toggleChatLoading(false, assistantMessageId);
        }
      }
    } catch (error) {
      console.error('Send message failed:', error);
      if (assistantMessageId) {
        await get().internal_updateMessageError(assistantMessageId, {
          message: 'AI响应失败，请重试',
          type: 'BadRequest',
        });
      }
    }
  },

  regenerateMessage: async (id) => {
    await get().internal_resendMessage(id);
  },

  delAndRegenerateMessage: async (id) => {
    await get().internal_resendMessage(id);
    await get().deleteMessage(id);
  },

  stopGenerateMessage: () => {
    const { chatLoadingIdsAbortController } = get();
    if (chatLoadingIdsAbortController) {
      chatLoadingIdsAbortController.abort();
    }

    set(
      {
        chatLoadingIds: [],
        chatLoadingIdsAbortController: undefined,
      },
      false,
      n('stopGenerateMessage'),
    );
  },

  // ============ 内部方法实现 ============

  internal_coreProcessMessage: async (messages, parentId, params = {}) => {
    // 获取当前Agent配置
    const agentState = getAgentStoreState();
    const model = agentSelectors.currentAgentModel(agentState);
    const provider = agentSelectors.currentAgentModelProvider(agentState);

    // 找到需要生成回复的消息
    const assistantMessage = messages.find(
      (m) => m.parentId === parentId && m.role === 'assistant',
    );
    if (!assistantMessage) return;

    // 开始生成
    get().internal_toggleChatLoading(true, assistantMessage.id);

    try {
      await get().internal_fetchAIChatMessage({
        messages: messages.filter((m) => m.id !== assistantMessage.id), // 排除占位消息
        messageId: assistantMessage.id,
        model,
        provider,
        params,
      });

      // 内容更新已在 onFinish 回调中处理，无需重复更新
    } catch (error) {
      console.error('Core process message failed:', error);
      await get().internal_updateMessageError(assistantMessage.id, {
        message: error instanceof Error ? error.message : '生成回复失败',
        type: 'BadRequest',
      });
    } finally {
      get().internal_toggleChatLoading(false, assistantMessage.id);
    }
  },

  internal_fetchAIChatMessage: async ({ messages, messageId, model, provider }) => {
    const { internal_toggleChatLoading, internal_updateMessageContent, internal_dispatchMessage } =
      get();
    const abortController = internal_toggleChatLoading(true, messageId);

    // 更新abort controller
    set(
      { chatLoadingIdsAbortController: abortController },
      false,
      n('internal_fetchAIChatMessage(start)'),
    );

    let fullContent = '';

    try {
      await chatService.createAssistantMessageStream({
        abortController,
        params: {
          messages,
          model,
          provider,
        },
        onMessageHandle: (chunk) => {
          switch (chunk.type) {
            case 'text': {
              fullContent += chunk.text;
              internal_dispatchMessage({
                id: messageId,
                type: 'updateMessage',
                value: { content: fullContent },
              });
              break;
            }
            // Mobile端暂不处理其他类型的消息
          }
        },
        onFinish: async (content, { grounding, usage, speed }) => {
          // if there is traceId, update it
          // if (traceId) {
          //   msgTraceId = traceId;
          //   await messageService.updateMessage(messageId, {
          //     traceId,
          //     observationId: observationId ?? undefined,
          //   });
          // }

          // 等待所有图片上传完成
          /*          let finalImages: ChatImageItem[] = [];

          if (uploadTasks.size > 0) {
            try {
              // 等待所有上传任务完成
              const uploadResults = await Promise.all(uploadTasks.values());

              // 使用上传后的 S3 URL 替换原始图像数据
              finalImages = uploadResults.filter((i) => !!i.url) as ChatImageItem[];
            } catch (error) {
              console.error('Error waiting for image uploads:', error);
            }
          }*/

          /*          let parsedToolCalls = toolCalls;
          if (parsedToolCalls && parsedToolCalls.length > 0) {
            internal_toggleToolCallingStreaming(messageId, undefined);
            parsedToolCalls = parsedToolCalls.map((item) => ({
              ...item,
              function: {
                ...item.function,
                arguments: !!item.function.arguments ? item.function.arguments : '{}',
              },
            }));
            isFunctionCall = true;
          }*/

          // update the content after fetch result
          fullContent = content;
          await internal_updateMessageContent(messageId, content, {
            // toolCalls: parsedToolCalls,
            // reasoning: !!reasoning ? { ...reasoning, duration } : undefined,
            search: !!grounding?.citations ? grounding : undefined,
            // imageList: finalImages.length > 0 ? finalImages : undefined,
            metadata: speed ? { ...usage, ...speed } : usage,
          });
        },
        onErrorHandle: (error) => {
          console.error('AI message generation error:', error);
          // get().internal_updateMessageError(messageId, {
          //   message: error.message || '生成回复失败',
          //   type: 'BadRequest',
          // });
        },
      });

      return {
        content: fullContent,
        isFunctionCall: false,
      };
    } catch (error) {
      console.error('Fetch AI chat message failed:', error);
      throw error;
    }
  },

  internal_resendMessage: async (id) => {
    const { activeId, activeTopicId } = get();
    const key = messageMapKey(activeId, activeTopicId);
    const messages = get().messagesMap[key] || [];

    // 找到要重新发送的消息
    const targetMessage = messages.find((m) => m.id === id);
    if (!targetMessage) return;

    // 如果是用户消息，找到其对应的AI回复
    let messageToRegenerate = targetMessage;
    if (targetMessage.role === 'user') {
      const aiReply = messages.find((m) => m.parentId === id && m.role === 'assistant');
      if (aiReply) {
        messageToRegenerate = aiReply;
      }
    }

    // 重置消息内容
    await get().internal_updateMessageContent(messageToRegenerate.id, LOADING_FLAT);

    try {
      await get().internal_coreProcessMessage(
        messages,
        targetMessage.role === 'user' ? id : targetMessage.parentId || '',
      );
    } catch (error) {
      console.error('Resend message failed:', error);
      await get().internal_updateMessageError(messageToRegenerate.id, {
        message: '重新生成失败，请重试',
        type: 'BadRequest',
      });
    }
  },

  internal_toggleChatLoading: (loading, id) => {
    set(
      (state) => ({
        ...state,
        chatLoadingIds: id
          ? toggleBooleanList(state.chatLoadingIds, id, loading)
          : state.chatLoadingIds,
      }),
      false,
      n('toggleChatLoading'),
    );

    if (loading) {
      const abortController = new AbortController();
      set({ chatLoadingIdsAbortController: abortController });
      return abortController;
    }

    return undefined;
  },

  internal_toggleMessageInToolsCalling: (loading, id) => {
    // Mobile端暂不支持工具调用
    console.log('Tool calling not supported in mobile:', { loading, id });
    return undefined;
  },

  internal_toggleToolCallingStreaming: (id, streaming) => {
    // Mobile端暂不支持工具调用流
    console.log('Tool calling streaming not supported in mobile:', { id, streaming });
  },

  internal_toggleChatReasoning: (loading, id) => {
    set(
      (state) => ({
        ...state,
        reasoningLoadingIds: id
          ? toggleBooleanList(state.reasoningLoadingIds, id, loading)
          : state.reasoningLoadingIds,
      }),
      false,
      n('toggleChatReasoning'),
    );

    if (loading) {
      const abortController = new AbortController();
      return abortController;
    }

    return undefined;
  },

  internal_toggleSearchWorkflow: (loading, id) => {
    set(
      (state) => ({
        ...state,
        searchWorkflowLoadingIds: id
          ? toggleBooleanList(state.searchWorkflowLoadingIds, id, loading)
          : state.searchWorkflowLoadingIds,
      }),
      false,
      n('toggleSearchWorkflow'),
    );
  },

  // ============ 未实现功能（抛出错误）============

  // internal_onRagQueryFinish: async (messages, ragQuery) => {
  //   throw new Error('RAG feature not implemented in mobile version');
  // },

  // runPluginApi: async (id, payload) => {
  //   throw new Error('Plugin API not implemented in mobile version');
  // },
});
