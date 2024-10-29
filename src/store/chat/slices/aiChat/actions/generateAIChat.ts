/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { produce } from 'immer';
import { template } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { chainAnswerWithContext } from '@/chains/answerWithContext';
import { LOADING_FLAT, MESSAGE_CANCEL_FLAT } from '@/const/message';
import { TraceEventType, TraceNameMap } from '@/const/trace';
import { isServerMode } from '@/const/version';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { chatHelpers } from '@/store/chat/helpers';
import { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useSessionStore } from '@/store/session';
import { ChatMessage, CreateMessageParams, SendMessageParams } from '@/types/message';
import { MessageSemanticSearchChunk } from '@/types/rag';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors, topicSelectors } from '../../../selectors';

const n = setNamespace('ai');

interface ProcessMessageParams {
  traceId?: string;
  isWelcomeQuestion?: boolean;
  /**
   * the RAG query content, should be embedding and used in the semantic search
   */
  ragQuery?: string;
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
    assistantMessageId: string,
    params?: ProcessMessageParams,
  ) => Promise<{
    isFunctionCall: boolean;
    traceId?: string;
  }>;
  /**
   * Resends a specific message, optionally using a trace ID for tracking
   */
  internal_resendMessage: (id: string, traceId?: string) => Promise<void>;
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
}

const getAgentConfig = () => agentSelectors.currentAgentConfig(useAgentStore.getState());
const getAgentChatConfig = () => agentSelectors.currentAgentChatConfig(useAgentStore.getState());
const getAgentKnowledge = () => agentSelectors.currentEnabledKnowledge(useAgentStore.getState());

export const generateAIChat: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  AIGenerateAction
> = (set, get) => ({
  delAndRegenerateMessage: async (id) => {
    const traceId = chatSelectors.getTraceIdByMessageId(id)(get());
    get().internal_resendMessage(id, traceId);
    get().deleteMessage(id);

    // trace the delete and regenerate message
    get().internal_traceMessage(id, { eventType: TraceEventType.DeleteAndRegenerateMessage });
  },
  regenerateMessage: async (id: string) => {
    const traceId = chatSelectors.getTraceIdByMessageId(id)(get());
    await get().internal_resendMessage(id, traceId);

    // trace the delete and regenerate message
    get().internal_traceMessage(id, { eventType: TraceEventType.RegenerateMessage });
  },

  sendMessage: async ({ message, files, onlyAddUserMessage, isWelcomeQuestion }) => {
    const { internal_coreProcessMessage, activeTopicId, activeId } = get();
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
    };

    const agentConfig = getAgentChatConfig();

    let tempMessageId: string | undefined = undefined;
    let newTopicId: string | undefined = undefined;

    // it should be the default topic, then
    // if autoCreateTopic is enabled, check to whether we need to create a topic
    if (!onlyAddUserMessage && !activeTopicId && agentConfig.enableAutoCreateTopic) {
      // check activeTopic and then auto create topic
      const chats = chatSelectors.currentChats(get());

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
    const messages = chatSelectors.currentChats(get());
    const userFiles = chatSelectors.currentUserFiles(get()).map((f) => f.id);

    await internal_coreProcessMessage(messages, id, {
      isWelcomeQuestion,
      ragQuery: get().internal_shouldUseRAG() ? message : undefined,
    });

    set({ isCreatingMessage: false }, false, n('creatingMessage/stop'));

    const summaryTitle = async () => {
      // if autoCreateTopic is false, then stop
      if (!agentConfig.enableAutoCreateTopic) return;

      // check activeTopic and then auto update topic title
      if (newTopicId) {
        const chats = chatSelectors.currentChats(get());
        await get().summaryTopicTitle(newTopicId, chats);
        return;
      }

      const topic = topicSelectors.currentActiveTopic(get());

      if (topic && !topic.title) {
        const chats = chatSelectors.currentChats(get());
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

    const { model, provider } = getAgentConfig();

    let fileChunks: MessageSemanticSearchChunk[] | undefined;
    let ragQueryId;
    // go into RAG flow if there is ragQuery flag
    if (params?.ragQuery) {
      // 1. get the relative chunks from semantic search
      const { chunks, queryId } = await get().internal_retrieveChunks(
        userMessageId,
        params?.ragQuery,
        // should skip the last content
        messages.map((m) => m.content).slice(0, messages.length - 1),
      );

      ragQueryId = queryId;

      // 2. build the retrieve context messages
      const retrieveContext = chainAnswerWithContext({
        context: chunks.map((c) => c.text as string),
        question: params?.ragQuery,
        knowledge: getAgentKnowledge().map((knowledge) => knowledge.name),
      });

      // 3. add the retrieve context messages to the messages history
      if (retrieveContext.messages && retrieveContext.messages?.length > 0) {
        // remove the last message due to the query is in the retrieveContext
        messages.pop();
        retrieveContext.messages?.forEach((m) => messages.push(m as ChatMessage));
      }

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
      fileChunks,
      ragQueryId,
    };

    const assistantId = await get().internal_createMessage(assistantMessage);

    // 3. fetch the AI response
    const { isFunctionCall } = await internal_fetchAIChatMessage(messages, assistantId, params);

    // 4. if it's the function call message, trigger the function method
    if (isFunctionCall) {
      await refreshMessages();
      await triggerToolCalls(assistantId);
    }
  },
  internal_fetchAIChatMessage: async (messages, assistantId, params) => {
    const {
      internal_toggleChatLoading,
      refreshMessages,
      internal_updateMessageContent,
      internal_dispatchMessage,
      internal_toggleToolCallingStreaming,
    } = get();

    const abortController = internal_toggleChatLoading(
      true,
      assistantId,
      n('generateMessage(start)', { assistantId, messages }) as string,
    );

    const agentConfig = getAgentConfig();
    const chatConfig = agentConfig.chatConfig;

    const compiler = template(chatConfig.inputTemplate, { interpolate: /{{([\S\s]+?)}}/g });

    // ================================== //
    //   messages uniformly preprocess    //
    // ================================== //

    // 1. slice messages with config
    let preprocessMsgs = chatHelpers.getSlicedMessagesWithConfig(messages, chatConfig);

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

    // 5. handle config for the vision model
    // Due to the gpt-4-vision-preview model's default max_tokens is very small
    // we need to set the max_tokens a larger one.
    if (agentConfig.model === 'gpt-4-vision-preview') {
      /* eslint-disable unicorn/no-lonely-if */
      if (!agentConfig.params.max_tokens)
        // refs: https://github.com/lobehub/lobe-chat/issues/837
        agentConfig.params.max_tokens = 2048;
    }

    let isFunctionCall = false;
    let msgTraceId: string | undefined;
    let output = '';

    await chatService.createAssistantMessageStream({
      abortController,
      params: {
        messages: preprocessMsgs,
        model: agentConfig.model,
        provider: agentConfig.provider,
        ...agentConfig.params,
        plugins: agentConfig.plugins,
      },
      trace: {
        traceId: params?.traceId,
        sessionId: get().activeId,
        topicId: get().activeTopicId,
        traceName: TraceNameMap.Conversation,
      },
      isWelcomeQuestion: params?.isWelcomeQuestion,
      onErrorHandle: async (error) => {
        await messageService.updateMessageError(assistantId, error);
        await refreshMessages();
      },
      onFinish: async (content, { traceId, observationId, toolCalls }) => {
        // if there is traceId, update it
        if (traceId) {
          msgTraceId = traceId;
          await messageService.updateMessage(assistantId, {
            traceId,
            observationId: observationId ?? undefined,
          });
        }

        if (toolCalls && toolCalls.length > 0) {
          internal_toggleToolCallingStreaming(assistantId, undefined);
        }

        // update the content after fetch result
        await internal_updateMessageContent(assistantId, content, toolCalls);
      },
      onMessageHandle: async (chunk) => {
        switch (chunk.type) {
          case 'text': {
            output += chunk.text;
            internal_dispatchMessage({
              id: assistantId,
              type: 'updateMessage',
              value: { content: output },
            });
            break;
          }

          // is this message is just a tool call
          case 'tool_calls': {
            internal_toggleToolCallingStreaming(assistantId, chunk.isAnimationActives);
            internal_dispatchMessage({
              id: assistantId,
              type: 'updateMessage',
              value: { tools: get().internal_transformToolCalls(chunk.tool_calls) },
            });
            isFunctionCall = true;
          }
        }
      },
    });

    internal_toggleChatLoading(false, assistantId, n('generateMessage(end)') as string);

    return {
      isFunctionCall,
      traceId: msgTraceId,
    };
  },

  internal_resendMessage: async (messageId, traceId) => {
    // 1. 构造所有相关的历史记录
    const chats = chatSelectors.currentChats(get());

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

    const { internal_coreProcessMessage } = get();

    const latestMsg = contextMessages.findLast((s) => s.role === 'user');

    if (!latestMsg) return;

    await internal_coreProcessMessage(contextMessages, latestMsg.id, {
      traceId,
      ragQuery: get().internal_shouldUseRAG() ? currentMessage.content : undefined,
    });
  },

  // ----- Loading ------- //
  internal_toggleChatLoading: (loading, id, action) => {
    return get().internal_toggleLoadingArrays('chatLoadingIds', loading, id, action);
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
