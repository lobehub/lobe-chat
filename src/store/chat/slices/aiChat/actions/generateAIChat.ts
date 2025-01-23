/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { produce } from 'immer';
import { template } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT, MESSAGE_CANCEL_FLAT } from '@/const/message';
import { DEFAULT_AGENT_CHAT_CONFIG } from '@/const/settings';
import { TraceEventType, TraceNameMap } from '@/const/trace';
import { isServerMode } from '@/const/version';
import { knowledgeBaseQAPrompts } from '@/prompts/knowledgeBaseQA';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { useAgentStore } from '@/store/agent';
import { chatHelpers } from '@/store/chat/helpers';
import { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useSessionStore } from '@/store/session';
import { ChatMessage, CreateMessageParams, SendMessageParams } from '@/types/message';
import { MessageSemanticSearchChunk } from '@/types/rag';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors, topicSelectors } from '../../../selectors';
import { getAgentChatConfig, getAgentConfig, getAgentKnowledge } from './helpers';

const n = setNamespace('ai');

interface ProcessMessageParams {
  traceId?: string;
  isWelcomeQuestion?: boolean;
  /**
   * the RAG query content, should be embedding and used in the semantic search
   */
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
  internal_fetchAIChatMessage: (
    messages: ChatMessage[],
    messageId: string,
    params?: ProcessMessageParams,
  ) => Promise<{
    isFunctionCall: boolean;
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
    action?: string,
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
}

export const generateAIChat: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  AIGenerateAction
> = (set, get) => ({
  delAndRegenerateMessage: async (id) => {
    const traceId = chatSelectors.getTraceIdByMessageId(id)(get());
    get().internal_resendMessage(id, { traceId });
    get().deleteMessage(id);

    // trace the delete and regenerate message
    get().internal_traceMessage(id, { eventType: TraceEventType.DeleteAndRegenerateMessage });
  },
  regenerateMessage: async (id) => {
    const traceId = chatSelectors.getTraceIdByMessageId(id)(get());
    await get().internal_resendMessage(id, { traceId });

    // trace the delete and regenerate message
    get().internal_traceMessage(id, { eventType: TraceEventType.RegenerateMessage });
  },

  sendMessage: async ({ message, files, onlyAddUserMessage, isWelcomeQuestion }) => {
    const { internal_coreProcessMessage, activeTopicId, activeId, activeThreadId } = get();
    if (!activeId) return;

    const fileIdList = files?.map((f) => f.id);

    const hasFile = !!fileIdList && fileIdList.length > 0;

    // if message is empty or no files, then stop
    if (!message && !hasFile) return;

    set({ isCreatingMessage: true }, false, n('creatingMessage/start'));

    const newMessage: CreateMessageParams = {
      content: message,
      // if message has attached with files, then add files to message and the agent
      files: fileIdList,
      role: 'user',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
      threadId: activeThreadId,
    };

    const agentConfig = getAgentChatConfig();

    let tempMessageId: string | undefined = undefined;
    let newTopicId: string | undefined = undefined;

    // it should be the default topic, then
    // if autoCreateTopic is enabled, check to whether we need to create a topic
    if (!onlyAddUserMessage && !activeTopicId && agentConfig.enableAutoCreateTopic) {
      // check activeTopic and then auto create topic
      const chats = chatSelectors.activeBaseChats(get());

      // we will add two messages (user and assistant), so the finial length should +2
      const featureLength = chats.length + 2;

      // if there is no activeTopicId and the feature length is greater than the threshold
      // then create a new topic and active it
      if (!get().activeTopicId && featureLength >= agentConfig.autoCreateTopicThreshold) {
        // we need to create a temp message for optimistic update
        tempMessageId = get().internal_createTmpMessage(newMessage);
        get().internal_toggleMessageLoading(true, tempMessageId);

        const topicId = await get().createTopic();

        if (topicId) {
          newTopicId = topicId;
          newMessage.topicId = topicId;

          // we need to copy the messages to the new topic or the message will disappear
          const mapKey = chatSelectors.currentChatKey(get());
          const newMaps = {
            ...get().messagesMap,
            [messageMapKey(activeId, topicId)]: get().messagesMap[mapKey],
          };
          set({ messagesMap: newMaps }, false, n('moveMessagesToNewTopic'));

          // make the topic loading
          get().internal_updateTopicLoading(topicId, true);
        }
      }
    }
    //  update assistant update to make it rerank
    useSessionStore.getState().triggerSessionUpdate(get().activeId);

    const id = await get().internal_createMessage(newMessage, {
      tempMessageId,
      skipRefresh: !onlyAddUserMessage && newMessage.fileList?.length === 0,
    });

    if (tempMessageId) get().internal_toggleMessageLoading(false, tempMessageId);

    // switch to the new topic if create the new topic
    if (!!newTopicId) {
      await get().switchTopic(newTopicId, true);
      await get().internal_fetchMessages();

      // delete previous messages
      // remove the temp message map
      const newMaps = { ...get().messagesMap, [messageMapKey(activeId, null)]: [] };
      set({ messagesMap: newMaps }, false, 'internal_copyMessages');
    }

    // if only add user message, then stop
    if (onlyAddUserMessage) {
      set({ isCreatingMessage: false }, false, 'creatingMessage/start');
      return;
    }

    // Get the current messages to generate AI response
    const messages = chatSelectors.activeBaseChats(get());
    const userFiles = chatSelectors.currentUserFiles(get()).map((f) => f.id);

    await internal_coreProcessMessage(messages, id, {
      isWelcomeQuestion,
      ragQuery: get().internal_shouldUseRAG() ? message : undefined,
      threadId: activeThreadId,
    });

    set({ isCreatingMessage: false }, false, n('creatingMessage/stop'));

    const summaryTitle = async () => {
      // if autoCreateTopic is false, then stop
      if (!agentConfig.enableAutoCreateTopic) return;

      // check activeTopic and then auto update topic title
      if (newTopicId) {
        const chats = chatSelectors.activeBaseChats(get());
        await get().summaryTopicTitle(newTopicId, chats);
        return;
      }

      const topic = topicSelectors.currentActiveTopic(get());

      if (topic && !topic.title) {
        const chats = chatSelectors.activeBaseChats(get());
        await get().summaryTopicTitle(topic.id, chats);
      }
    };

    // if there is relative files, then add files to agent
    // only available in server mode
    const addFilesToAgent = async () => {
      if (userFiles.length === 0 || !isServerMode) return;

      await useAgentStore.getState().addFilesToAgent(userFiles, false);
    };

    await Promise.all([summaryTitle(), addFilesToAgent()]);
  },
  stopGenerateMessage: () => {
    const { abortController, internal_toggleChatLoading } = get();
    if (!abortController) return;

    abortController.abort(MESSAGE_CANCEL_FLAT);

    internal_toggleChatLoading(false, undefined, n('stopGenerateMessage') as string);
  },

  // the internal process method of the AI message
  internal_coreProcessMessage: async (originalMessages, userMessageId, params) => {
    const { internal_fetchAIChatMessage, triggerToolCalls, refreshMessages, activeTopicId } = get();

    // create a new array to avoid the original messages array change
    const messages = [...originalMessages];

    const { model, provider, chatConfig } = getAgentConfig();

    let fileChunks: MessageSemanticSearchChunk[] | undefined;
    let ragQueryId;

    // go into RAG flow if there is ragQuery flag
    if (params?.ragQuery) {
      // 1. get the relative chunks from semantic search
      const { chunks, queryId, rewriteQuery } = await get().internal_retrieveChunks(
        userMessageId,
        params?.ragQuery,
        // should skip the last content
        messages.map((m) => m.content).slice(0, messages.length - 1),
      );

      ragQueryId = queryId;

      const lastMsg = messages.pop() as ChatMessage;

      // 2. build the retrieve context messages
      const knowledgeBaseQAContext = knowledgeBaseQAPrompts({
        chunks,
        userQuery: lastMsg.content,
        rewriteQuery,
        knowledge: getAgentKnowledge(),
      });

      // 3. add the retrieve context messages to the messages history
      messages.push({
        ...lastMsg,
        content: (lastMsg.content + '\n\n' + knowledgeBaseQAContext).trim(),
      });

      fileChunks = chunks.map((c) => ({ id: c.id, similarity: c.similarity }));
    }

    // 2. Add an empty message to place the AI response
    const assistantMessage: CreateMessageParams = {
      role: 'assistant',
      content: LOADING_FLAT,
      fromModel: model,
      fromProvider: provider,

      parentId: userMessageId,
      sessionId: get().activeId,
      topicId: activeTopicId, // if there is activeTopicId，then add it to topicId
      threadId: params?.threadId,
      fileChunks,
      ragQueryId,
    };

    const assistantId = await get().internal_createMessage(assistantMessage);

    // 3. fetch the AI response
    const { isFunctionCall } = await internal_fetchAIChatMessage(messages, assistantId, params);

    // 4. if it's the function call message, trigger the function method
    if (isFunctionCall) {
      await refreshMessages();
      await triggerToolCalls(assistantId, {
        threadId: params?.threadId,
        inPortalThread: params?.inPortalThread,
      });
    }

    // 5. summary history if context messages is larger than historyCount
    const historyCount =
      chatConfig.historyCount || (DEFAULT_AGENT_CHAT_CONFIG.historyCount as number);

    if (
      chatConfig.enableHistoryCount &&
      chatConfig.enableCompressHistory &&
      originalMessages.length > historyCount
    ) {
      // after generation: [u1,a1,u2,a2,u3,a3]
      // but the `originalMessages` is still: [u1,a1,u2,a2,u3]
      // So if historyCount=2, we need to summary [u1,a1,u2,a2]
      // because user find UI is [u1,a1,u2,a2 | u3,a3]
      const historyMessages = originalMessages.slice(0, -historyCount + 1);

      await get().internal_summaryHistory(historyMessages);
    }
  },
  internal_fetchAIChatMessage: async (messages, messageId, params) => {
    const {
      internal_toggleChatLoading,
      refreshMessages,
      internal_updateMessageContent,
      internal_dispatchMessage,
      internal_toggleToolCallingStreaming,
      internal_toggleChatReasoning,
    } = get();

    const abortController = internal_toggleChatLoading(
      true,
      messageId,
      n('generateMessage(start)', { messageId, messages }) as string,
    );

    const agentConfig = getAgentConfig();
    const chatConfig = agentConfig.chatConfig;

    const compiler = template(chatConfig.inputTemplate, { interpolate: /{{([\S\s]+?)}}/g });

    // ================================== //
    //   messages uniformly preprocess    //
    // ================================== //

    // 1. slice messages with config
    let preprocessMsgs = chatHelpers.getSlicedMessagesWithConfig(messages, chatConfig, true);

    // 2. replace inputMessage template
    preprocessMsgs = !chatConfig.inputTemplate
      ? preprocessMsgs
      : preprocessMsgs.map((m) => {
          if (m.role === 'user') {
            try {
              return { ...m, content: compiler({ text: m.content }) };
            } catch (error) {
              console.error(error);

              return m;
            }
          }

          return m;
        });

    // 3. add systemRole
    if (agentConfig.systemRole) {
      preprocessMsgs.unshift({ content: agentConfig.systemRole, role: 'system' } as ChatMessage);
    }

    // 4. handle max_tokens
    agentConfig.params.max_tokens = chatConfig.enableMaxTokens
      ? agentConfig.params.max_tokens
      : undefined;

    let isFunctionCall = false;
    let msgTraceId: string | undefined;
    let output = '';
    let thinking = '';
    let thinkingStartAt: number;
    let duration: number;

    const historySummary = topicSelectors.currentActiveTopicSummary(get());
    await chatService.createAssistantMessageStream({
      abortController,
      params: {
        messages: preprocessMsgs,
        model: agentConfig.model,
        provider: agentConfig.provider,
        ...agentConfig.params,
        plugins: agentConfig.plugins,
      },
      historySummary: historySummary?.content,
      trace: {
        traceId: params?.traceId,
        sessionId: get().activeId,
        topicId: get().activeTopicId,
        traceName: TraceNameMap.Conversation,
      },
      isWelcomeQuestion: params?.isWelcomeQuestion,
      onErrorHandle: async (error) => {
        await messageService.updateMessageError(messageId, error);
        await refreshMessages();
      },
      onFinish: async (content, { traceId, observationId, toolCalls, reasoning }) => {
        // if there is traceId, update it
        if (traceId) {
          msgTraceId = traceId;
          await messageService.updateMessage(messageId, {
            traceId,
            observationId: observationId ?? undefined,
          });
        }

        if (toolCalls && toolCalls.length > 0) {
          internal_toggleToolCallingStreaming(messageId, undefined);
        }

        // update the content after fetch result
        await internal_updateMessageContent(
          messageId,
          content,
          toolCalls,
          !!reasoning ? { content: reasoning, duration } : undefined,
        );
      },
      onMessageHandle: async (chunk) => {
        switch (chunk.type) {
          case 'text': {
            output += chunk.text;

            // if there is no duration, it means the end of reasoning
            if (!duration) {
              duration = Date.now() - thinkingStartAt;
              internal_toggleChatReasoning(false, messageId, n('generateMessage(end)') as string);
            }

            internal_dispatchMessage({
              id: messageId,
              type: 'updateMessage',
              value: {
                content: output,
                reasoning: !!thinking ? { content: thinking, duration } : undefined,
              },
            });
            break;
          }
          case 'reasoning': {
            // if there is no thinkingStartAt, it means the start of reasoning
            if (!thinkingStartAt) {
              thinkingStartAt = Date.now();
              internal_toggleChatReasoning(true, messageId, n('generateMessage(end)') as string);
            }

            thinking += chunk.text;

            internal_dispatchMessage({
              id: messageId,
              type: 'updateMessage',
              value: { reasoning: { content: thinking } },
            });
            break;
          }

          // is this message is just a tool call
          case 'tool_calls': {
            internal_toggleToolCallingStreaming(messageId, chunk.isAnimationActives);
            internal_dispatchMessage({
              id: messageId,
              type: 'updateMessage',
              value: { tools: get().internal_transformToolCalls(chunk.tool_calls) },
            });
            isFunctionCall = true;
          }
        }
      },
    });

    internal_toggleChatLoading(false, messageId, n('generateMessage(end)') as string);

    return {
      isFunctionCall,
      traceId: msgTraceId,
    };
  },

  internal_resendMessage: async (
    messageId,
    { traceId, messages: outChats, threadId: outThreadId, inPortalThread } = {},
  ) => {
    // 1. 构造所有相关的历史记录
    const chats = outChats ?? chatSelectors.mainAIChats(get());

    const currentIndex = chats.findIndex((c) => c.id === messageId);
    if (currentIndex < 0) return;

    const currentMessage = chats[currentIndex];

    let contextMessages: ChatMessage[] = [];

    switch (currentMessage.role) {
      case 'tool':
      case 'user': {
        contextMessages = chats.slice(0, currentIndex + 1);
        break;
      }
      case 'assistant': {
        // 消息是 AI 发出的因此需要找到它的 user 消息
        const userId = currentMessage.parentId;
        const userIndex = chats.findIndex((c) => c.id === userId);
        // 如果消息没有 parentId，那么同 user/function 模式
        contextMessages = chats.slice(0, userIndex < 0 ? currentIndex + 1 : userIndex + 1);
        break;
      }
    }

    if (contextMessages.length <= 0) return;

    const { internal_coreProcessMessage, activeThreadId } = get();

    const latestMsg = contextMessages.findLast((s) => s.role === 'user');

    if (!latestMsg) return;

    const threadId = outThreadId ?? activeThreadId;

    await internal_coreProcessMessage(contextMessages, latestMsg.id, {
      traceId,
      ragQuery: get().internal_shouldUseRAG() ? latestMsg.content : undefined,
      threadId,
      inPortalThread,
    });
  },

  // ----- Loading ------- //
  internal_toggleChatLoading: (loading, id, action) => {
    return get().internal_toggleLoadingArrays('chatLoadingIds', loading, id, action);
  },
  internal_toggleChatReasoning: (loading, id, action) => {
    return get().internal_toggleLoadingArrays('reasoningLoadingIds', loading, id, action);
  },
  internal_toggleToolCallingStreaming: (id, streaming) => {
    set(
      {
        toolCallingStreamIds: produce(get().toolCallingStreamIds, (draft) => {
          if (!!streaming) {
            draft[id] = streaming;
          } else {
            delete draft[id];
          }
        }),
      },

      false,
      'toggleToolCallingStreaming',
    );
  },
});
