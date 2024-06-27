/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { copyToClipboard } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import { template } from 'lodash-es';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT } from '@/const/message';
import { TraceEventType, TraceNameMap } from '@/const/trace';
import { useClientDataSWR } from '@/libs/swr';
import { chatService } from '@/services/chat';
import { CreateMessageParams, messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { traceService } from '@/services/trace';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { chatHelpers } from '@/store/chat/helpers';
import { messageMapKey } from '@/store/chat/slices/message/utils';
import { ChatStore } from '@/store/chat/store';
import { ChatMessage, ChatMessageError, MessageToolCall } from '@/types/message';
import { TraceEventPayloads } from '@/types/trace';
import { setNamespace } from '@/utils/storeDebug';
import { nanoid } from '@/utils/uuid';

import type { ChatStoreState } from '../../initialState';
import { chatSelectors, topicSelectors } from '../../selectors';
import { preventLeavingFn, toggleBooleanList } from '../../utils';
import { MessageDispatch, messagesReducer } from './reducer';

const n = setNamespace('m');

const SWR_USE_FETCH_MESSAGES = 'SWR_USE_FETCH_MESSAGES';

export interface SendMessageParams {
  message: string;
  files?: { id: string; url: string }[];
  onlyAddUserMessage?: boolean;
  /**
   *
   * https://github.com/lobehub/lobe-chat/pull/2086
   */
  isWelcomeQuestion?: boolean;
}

interface ProcessMessageParams {
  traceId?: string;
  isWelcomeQuestion?: boolean;
}

export interface ChatMessageAction {
  // create
  sendMessage: (params: SendMessageParams) => Promise<void>;
  addAIMessage: () => Promise<void>;
  /**
   * regenerate message
   * trace enabled
   * @param id
   */
  regenerateMessage: (id: string) => Promise<void>;

  // delete
  /**
   * clear message on the active session
   */
  clearMessage: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  delAndRegenerateMessage: (id: string) => Promise<void>;
  clearAllMessages: () => Promise<void>;
  // update
  updateInputMessage: (message: string) => void;
  modifyMessageContent: (id: string, content: string) => Promise<void>;
  // query
  useFetchMessages: (sessionId: string, topicId?: string) => SWRResponse<ChatMessage[]>;
  stopGenerateMessage: () => void;
  copyMessage: (id: string, content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  toggleMessageEditing: (id: string, editing: boolean) => void;

  // =========  ↓ Internal Method ↓  ========== //
  // ========================================== //
  // ========================================== //
  internal_toggleChatLoading: (
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;
  internal_toggleLoadingArrays: (
    key: keyof ChatStoreState,
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;
  internal_toggleToolCallingStreaming: (id: string, streaming: boolean[] | undefined) => void;
  internal_toggleMessageLoading: (loading: boolean, id: string) => void;
  /**
   * update message at the frontend point
   * this method will not update messages to database
   */
  internal_dispatchMessage: (payload: MessageDispatch) => void;
  /**
   * core process of the AI message (include preprocess and postprocess)
   */
  internal_coreProcessMessage: (
    messages: ChatMessage[],
    parentId: string,
    params?: ProcessMessageParams,
  ) => Promise<void>;
  /**
   * 实际获取 AI 响应
   * @param messages - 聊天消息数组
   * @param options - 获取 SSE 选项
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
   * a method used by other action
   * @param id
   * @param content
   */
  internal_updateMessageContent: (
    id: string,
    content: string,
    toolCalls?: MessageToolCall[],
  ) => Promise<void>;
  internal_updateMessageError: (id: string, error: ChatMessageError | null) => Promise<void>;
  internal_createMessage: (
    params: CreateMessageParams,
    context?: { tempMessageId?: string; skipRefresh?: boolean },
  ) => Promise<string>;
  internal_createTmpMessage: (params: CreateMessageParams) => string;
  internal_fetchMessages: () => Promise<void>;
  internal_resendMessage: (id: string, traceId?: string) => Promise<void>;
  internal_traceMessage: (id: string, payload: TraceEventPayloads) => Promise<void>;
}

const getAgentConfig = () => agentSelectors.currentAgentConfig(useAgentStore.getState());
const getAgentChatConfig = () => agentSelectors.currentAgentChatConfig(useAgentStore.getState());

export const chatMessage: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (set, get) => ({
  deleteMessage: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const deleteFn = async (id: string) => {
      get().internal_dispatchMessage({ type: 'deleteMessage', id });
      await messageService.removeMessage(id);
    };

    // if the message is a tool calls, then delete all the related messages
    // TODO: maybe we need to delete it in the DB?
    if (message.tools) {
      const pools = message.tools
        .flatMap((tool) => {
          const messages = chatSelectors
            .currentChats(get())
            .filter((m) => m.tool_call_id === tool.id);

          return messages.map((m) => m.id);
        })
        .map((i) => deleteFn(i));

      await Promise.all(pools);
    }

    await deleteFn(id);
    await get().refreshMessages();
  },
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
  clearMessage: async () => {
    const { activeId, activeTopicId, refreshMessages, refreshTopic, switchTopic } = get();

    await messageService.removeMessages(activeId, activeTopicId);

    if (activeTopicId) {
      await topicService.removeTopic(activeTopicId);
    }
    await refreshTopic();
    await refreshMessages();

    // after remove topic , go back to default topic
    switchTopic();
  },
  clearAllMessages: async () => {
    const { refreshMessages } = get();
    await messageService.removeAllMessages();
    await refreshMessages();
  },
  sendMessage: async ({ message, files, onlyAddUserMessage, isWelcomeQuestion }) => {
    const { internal_coreProcessMessage, activeTopicId, activeId } = get();
    if (!activeId) return;

    const fileIdList = files?.map((f) => f.id);

    const isNoFile = !fileIdList || fileIdList.length === 0;

    // if message is empty or no files, then stop
    if (!message && isNoFile) return;
    set({ isCreatingMessage: true }, false, 'creatingMessage/start');

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
          set({ messagesMap: newMaps }, false, 'internal_copyMessages');

          // get().internal_dispatchMessage({ type: 'deleteMessage', id: tempMessageId });
          get().internal_toggleMessageLoading(false, tempMessageId);

          // make the topic loading
          get().internal_updateTopicLoading(topicId, true);
        }
      }
    }

    const id = await get().internal_createMessage(newMessage, {
      tempMessageId,
      skipRefresh: !onlyAddUserMessage,
    });

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
    await internal_coreProcessMessage(messages, id, { isWelcomeQuestion });

    set({ isCreatingMessage: false }, false, 'creatingMessage/stop');

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
  },
  addAIMessage: async () => {
    const { internal_createMessage, updateInputMessage, activeTopicId, activeId, inputMessage } =
      get();
    if (!activeId) return;

    await internal_createMessage({
      content: inputMessage,
      role: 'assistant',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
    });

    updateInputMessage('');
  },
  copyMessage: async (id, content) => {
    await copyToClipboard(content);

    get().internal_traceMessage(id, { eventType: TraceEventType.CopyMessage });
  },
  toggleMessageEditing: (id, editing) => {
    set(
      { messageEditingIds: toggleBooleanList(get().messageEditingIds, id, editing) },
      false,
      'toggleMessageEditing',
    );
  },
  stopGenerateMessage: () => {
    const { abortController, internal_toggleChatLoading } = get();
    if (!abortController) return;

    abortController.abort();

    internal_toggleChatLoading(false, undefined, n('stopGenerateMessage') as string);
  },

  updateInputMessage: (message) => {
    if (isEqual(message, get().inputMessage)) return;

    set({ inputMessage: message }, false, n('updateInputMessage', message));
  },
  modifyMessageContent: async (id, content) => {
    // tracing the diff of update
    // due to message content will change, so we need send trace before update,or will get wrong data
    get().internal_traceMessage(id, {
      eventType: TraceEventType.ModifyMessage,
      nextContent: content,
    });

    await get().internal_updateMessageContent(id, content);
  },
  useFetchMessages: (sessionId, activeTopicId) =>
    useClientDataSWR<ChatMessage[]>(
      [SWR_USE_FETCH_MESSAGES, sessionId, activeTopicId],
      async ([, sessionId, topicId]: [string, string, string | undefined]) =>
        messageService.getMessages(sessionId, topicId),
      {
        onSuccess: (messages, key) => {
          const nextMap = {
            ...get().messagesMap,
            [messageMapKey(sessionId, activeTopicId)]: messages,
          };
          // no need to update map if the messages have been init and the map is the same
          if (get().messagesInit && isEqual(nextMap, get().messagesMap)) return;

          set(
            { messagesInit: true, messagesMap: nextMap },
            false,
            n('useFetchMessages', { messages, queryKey: key }),
          );
        },
      },
    ),
  refreshMessages: async () => {
    await mutate([SWR_USE_FETCH_MESSAGES, get().activeId, get().activeTopicId]);
  },

  // the internal process method of the AI message
  internal_coreProcessMessage: async (messages, userMessageId, params) => {
    const { internal_fetchAIChatMessage, triggerToolCalls, refreshMessages, activeTopicId } = get();

    const { model, provider } = getAgentConfig();

    // 1. Add an empty message to place the AI response
    const assistantMessage: CreateMessageParams = {
      role: 'assistant',
      content: LOADING_FLAT,
      fromModel: model,
      fromProvider: provider,

      parentId: userMessageId,
      sessionId: get().activeId,
      topicId: activeTopicId, // if there is activeTopicId，then add it to topicId
    };

    const assistantId = await get().internal_createMessage(assistantMessage);

    // 2. fetch the AI response
    const { isFunctionCall } = await internal_fetchAIChatMessage(messages, assistantId, params);

    // 3. if it's the function call message, trigger the function method
    if (isFunctionCall) {
      await refreshMessages();
      await triggerToolCalls(assistantId);
    }
  },
  internal_dispatchMessage: (payload) => {
    const { activeId } = get();

    if (!activeId) return;

    const messages = messagesReducer(chatSelectors.currentChats(get()), payload);

    const nextMap = { ...get().messagesMap, [chatSelectors.currentChatKey(get())]: messages };

    if (isEqual(nextMap, get().messagesMap)) return;

    set({ messagesMap: nextMap }, false, { type: `dispatchMessage/${payload.type}`, payload });
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
              type: 'updateMessages',
              value: { content: output },
            });
            break;
          }

          // is this message is just a tool call
          case 'tool_calls': {
            internal_toggleToolCallingStreaming(assistantId, chunk.isAnimationActives);
            internal_dispatchMessage({
              id: assistantId,
              type: 'updateMessages',
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
  internal_toggleChatLoading: (loading, id, action) => {
    return get().internal_toggleLoadingArrays('chatLoadingIds', loading, id, action);
  },
  internal_toggleMessageLoading: (loading, id) => {
    set(
      {
        messageLoadingIds: toggleBooleanList(get().messageLoadingIds, id, loading),
      },
      false,
      'internal_toggleMessageLoading',
    );
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

    const latestMsg = contextMessages.filter((s) => s.role === 'user').at(-1);

    if (!latestMsg) return;

    await internal_coreProcessMessage(contextMessages, latestMsg.id, { traceId });
  },

  internal_updateMessageError: async (id, error) => {
    get().internal_dispatchMessage({ id, type: 'updateMessages', value: { error } });
    await messageService.updateMessage(id, { error });
    await get().refreshMessages();
  },
  internal_updateMessageContent: async (id, content, toolCalls) => {
    const { internal_dispatchMessage, refreshMessages, internal_transformToolCalls } = get();

    // Due to the async update method and refresh need about 100ms
    // we need to update the message content at the frontend to avoid the update flick
    // refs: https://medium.com/@kyledeguzmanx/what-are-optimistic-updates-483662c3e171
    if (toolCalls) {
      internal_dispatchMessage({
        id,
        type: 'updateMessages',
        value: { tools: internal_transformToolCalls(toolCalls) },
      });
    } else {
      internal_dispatchMessage({ id, type: 'updateMessages', value: { content } });
    }

    await messageService.updateMessage(id, {
      content,
      tools: toolCalls ? internal_transformToolCalls(toolCalls) : undefined,
    });
    await refreshMessages();
  },

  internal_createMessage: async (message, context) => {
    const { internal_createTmpMessage, refreshMessages, internal_toggleMessageLoading } = get();
    let tempId = context?.tempMessageId;
    if (!tempId) {
      // use optimistic update to avoid the slow waiting
      tempId = internal_createTmpMessage(message);

      internal_toggleMessageLoading(true, tempId);
    }

    const id = await messageService.createMessage(message);
    if (!context?.skipRefresh) {
      await refreshMessages();
    }

    internal_toggleMessageLoading(false, tempId);
    return id;
  },

  internal_fetchMessages: async () => {
    const messages = await messageService.getMessages(get().activeId, get().activeTopicId);
    const nextMap = { ...get().messagesMap, [chatSelectors.currentChatKey(get())]: messages };
    // no need to update map if the messages have been init and the map is the same
    if (get().messagesInit && isEqual(nextMap, get().messagesMap)) return;

    set(
      { messagesInit: true, messagesMap: nextMap },
      false,
      n('internal_fetchMessages', { messages }),
    );
  },
  internal_createTmpMessage: (message) => {
    const { internal_dispatchMessage } = get();

    // use optimistic update to avoid the slow waiting
    const tempId = 'tmp_' + nanoid();
    internal_dispatchMessage({ type: 'createMessage', id: tempId, value: message });

    return tempId;
  },

  internal_traceMessage: async (id, payload) => {
    // tracing the diff of update
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const traceId = message?.traceId;
    const observationId = message?.observationId;

    if (traceId && message?.role === 'assistant') {
      traceService
        .traceEvent({ traceId, observationId, content: message.content, ...payload })
        .catch();
    }
  },

  internal_toggleLoadingArrays: (key, loading, id, action) => {
    if (loading) {
      window.addEventListener('beforeunload', preventLeavingFn);

      const abortController = new AbortController();
      set(
        {
          abortController,
          [key]: toggleBooleanList(get()[key] as string[], id!, loading),
        },
        false,
        action,
      );

      return abortController;
    } else {
      if (!id) {
        set({ abortController: undefined, [key]: [] }, false, action);
      } else
        set(
          {
            abortController: undefined,
            [key]: toggleBooleanList(get()[key] as string[], id, loading),
          },
          false,
          action,
        );

      window.removeEventListener('beforeunload', preventLeavingFn);
    }
  },
});
