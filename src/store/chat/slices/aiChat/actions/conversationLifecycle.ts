/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { DEFAULT_AGENT_CHAT_CONFIG, INBOX_SESSION_ID, LOADING_FLAT } from '@lobechat/const';
import {
  ChatImageItem,
  ChatVideoItem,
  SendMessageParams,
  SendMessageServerResponse,
  TraceEventType,
} from '@lobechat/types';
import { TRPCClientError } from '@trpc/client';
import { t } from 'i18next';
import { StateCreator } from 'zustand/vanilla';

import { aiChatService } from '@/services/aiChat';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/slices/chat';
import { ChatStore } from '@/store/chat/store';
import { getFileStoreState } from '@/store/file/store';
import { getSessionStoreState } from '@/store/session';

import {
  dbMessageSelectors,
  displayMessageSelectors,
  messageStateSelectors,
  topicSelectors,
} from '../../../selectors';
import { messageMapKey } from '../../../utils/messageMapKey';

/**
 * Actions managing the complete lifecycle of conversations including sending,
 * regenerating, and resending messages
 */
export interface ConversationLifecycleAction {
  /**
   * Sends a new message to the AI chat system
   */
  sendMessage: (params: SendMessageParams) => Promise<void>;
  regenerateUserMessage: (
    id: string,
    params?: { skipTrace?: boolean; traceId?: string },
  ) => Promise<void>;
  regenerateAssistantMessage: (
    id: string,
    params?: { skipTrace?: boolean; traceId?: string },
  ) => Promise<void>;
  /**
   * Continue generating from current assistant message
   */
  continueGenerationMessage: (lastBlockId: string, messageId: string) => Promise<void>;
  /**
   * Deletes an existing message and generates a new one in its place
   */
  delAndRegenerateMessage: (id: string) => Promise<void>;
}

export const conversationLifecycle: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ConversationLifecycleAction
> = (set, get) => ({
  sendMessage: async ({ message, files, onlyAddUserMessage }) => {
    const { activeTopicId, activeId, activeThreadId, internal_execAgentRuntime, mainInputEditor } =
      get();
    if (!activeId) return;

    const fileIdList = files?.map((f) => f.id);

    const hasFile = !!fileIdList && fileIdList.length > 0;

    // if message is empty or no files, then stop
    if (!message && !hasFile) return;

    if (onlyAddUserMessage) {
      await get().addUserMessage({ message, fileList: fileIdList });

      return;
    }

    const messages = displayMessageSelectors.activeDisplayMessages(get());
    const lastDisplayMessageId = displayMessageSelectors.lastDisplayMessageId(get());

    let parentId: string | undefined;
    if (lastDisplayMessageId) {
      parentId = displayMessageSelectors.findLastMessageId(lastDisplayMessageId)(get());
    }

    const chatConfig = agentChatConfigSelectors.currentChatConfig(getAgentStoreState());
    const autoCreateThreshold =
      chatConfig.autoCreateTopicThreshold ?? DEFAULT_AGENT_CHAT_CONFIG.autoCreateTopicThreshold;
    const shouldCreateNewTopic =
      !activeTopicId &&
      !!chatConfig.enableAutoCreateTopic &&
      messages.length + 2 >= autoCreateThreshold;

    // 构造服务端模式临时消息的本地媒体预览（优先使用 S3 URL）
    const filesInStore = getFileStoreState().chatUploadFileList;
    const tempImages: ChatImageItem[] = filesInStore
      .filter((f) => f.file?.type?.startsWith('image'))
      .map((f) => ({
        id: f.id,
        url: f.fileUrl || f.base64Url || f.previewUrl || '',
        alt: f.file?.name || f.id,
      }));
    const tempVideos: ChatVideoItem[] = filesInStore
      .filter((f) => f.file?.type?.startsWith('video'))
      .map((f) => ({
        id: f.id,
        url: f.fileUrl || f.base64Url || f.previewUrl || '',
        alt: f.file?.name || f.id,
      }));

    // use optimistic update to avoid the slow waiting
    const tempId = get().optimisticCreateTmpMessage({
      content: message,
      // if message has attached with files, then add files to message and the agent
      files: fileIdList,
      role: 'user',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
      threadId: activeThreadId,
      imageList: tempImages.length > 0 ? tempImages : undefined,
      videoList: tempVideos.length > 0 ? tempVideos : undefined,
    });
    get().optimisticCreateTmpMessage({
      content: LOADING_FLAT,
      role: 'assistant',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
      threadId: activeThreadId,
    });
    get().internal_toggleMessageLoading(true, tempId);

    const operationKey = messageMapKey(activeId, activeTopicId);

    // Start tracking sendMessage operation with AbortController
    const abortController = get().internal_toggleSendMessageOperation(operationKey, true)!;

    const jsonState = mainInputEditor?.getJSONState();
    get().internal_updateSendMessageOperation(
      operationKey,
      { inputSendErrorMsg: undefined, inputEditorTempState: jsonState },
      'creatingMessage/start',
    );

    let data: SendMessageServerResponse | undefined;
    try {
      const { model, provider } = agentSelectors.currentAgentConfig(getAgentStoreState());

      data = await aiChatService.sendMessageInServer(
        {
          newUserMessage: { content: message, files: fileIdList, parentId },
          // if there is activeTopicId，then add topicId to message
          topicId: activeTopicId,
          threadId: activeThreadId,
          newTopic: shouldCreateNewTopic
            ? {
                topicMessageIds: messages.map((m) => m.id),
                title: t('defaultTitle', { ns: 'topic' }),
              }
            : undefined,
          sessionId: activeId === INBOX_SESSION_ID ? undefined : activeId,
          newAssistantMessage: { model, provider: provider! },
        },
        abortController,
      );
      let topicId = activeTopicId;
      // refresh the total data
      if (data?.topics) {
        get().internal_dispatchTopic({ type: 'updateTopics', value: data.topics });
        topicId = data.topicId;
      }

      get().replaceMessages(data.messages, {
        sessionId: activeId,
        topicId: topicId,
        action: 'sendMessage/serverResponse',
      });

      if (data.isCreateNewTopic && data.topicId) {
        await get().switchTopic(data.topicId, true);
      }
    } catch (e) {
      if (e instanceof TRPCClientError) {
        const isAbort = e.message.includes('aborted') || e.name === 'AbortError';
        // Check if error is due to cancellation
        if (!isAbort) {
          get().internal_updateSendMessageOperation(operationKey, { inputSendErrorMsg: e.message });
          get().mainInputEditor?.setJSONState(jsonState);
        }
      }
    } finally {
      // Stop tracking sendMessage operation
      get().internal_toggleSendMessageOperation(operationKey, false);
    }

    // remove temporally message
    if (data?.isCreateNewTopic) {
      get().internal_dispatchMessage(
        { type: 'deleteMessage', id: tempId },
        { topicId: activeTopicId, sessionId: activeId },
      );
    }

    get().internal_toggleMessageLoading(false, tempId);
    get().internal_updateSendMessageOperation(
      operationKey,
      { inputEditorTempState: null },
      'creatingMessage/finished',
    );

    if (!data) return;

    //  update assistant update to make it rerank
    getSessionStoreState().triggerSessionUpdate(get().activeId);

    if (data.topicId) get().internal_updateTopicLoading(data.topicId, true);

    const summaryTitle = async () => {
      // check activeTopic and then auto update topic title
      if (data.isCreateNewTopic) {
        await get().summaryTopicTitle(data.topicId, data.messages);
        return;
      }

      if (!data.topicId) return;

      const topic = topicSelectors.getTopicById(data.topicId)(get());

      if (topic && !topic.title) {
        const chats = displayMessageSelectors
          .getDisplayMessagesByKey(messageMapKey(activeId, topic.id))(get())
          .filter((item) => item.id !== data.assistantMessageId);

        await get().summaryTopicTitle(topic.id, chats);
      }
    };

    summaryTitle().catch(console.error);

    // Get the current messages to generate AI response
    const displayMessages = displayMessageSelectors.activeDisplayMessages(get());

    try {
      await internal_execAgentRuntime({
        messages: displayMessages,
        parentMessageId: data.assistantMessageId,
        parentMessageType: 'assistant',
        sessionId: activeId,
        topicId: data.topicId ?? activeTopicId,
        ragQuery: get().internal_shouldUseRAG() ? message : undefined,
        threadId: activeThreadId,
        skipCreateFirstMessage: true,
      });

      //
      // // if there is relative files, then add files to agent
      // // only available in server mode
      const userFiles = dbMessageSelectors
        .dbUserFiles(get())
        .map((f) => f?.id)
        .filter(Boolean) as string[];

      if (userFiles.length > 0) {
        await getAgentStoreState().addFilesToAgent(userFiles, false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (data.topicId) get().internal_updateTopicLoading(data.topicId, false);
    }
  },

  regenerateUserMessage: async (id, params) => {
    const isRegenerating = messageStateSelectors.isMessageRegenerating(id)(get());
    if (isRegenerating) return;

    const item = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!item) return;

    const chats = displayMessageSelectors.mainAIChats(get());

    const currentIndex = chats.findIndex((c) => c.id === id);
    const contextMessages = chats.slice(0, currentIndex + 1);

    if (contextMessages.length <= 0) return;

    try {
      const { internal_execAgentRuntime, activeThreadId } = get();

      // Mark message as regenerating
      set(
        { regeneratingIds: [...get().regeneratingIds, id] },
        false,
        'regenerateUserMessage/start',
      );

      const traceId = params?.traceId ?? dbMessageSelectors.getTraceIdByDbMessageId(id)(get());

      // 切一个新的激活分支
      await get().switchMessageBranch(id, item.branch ? item.branch.count : 1);

      await internal_execAgentRuntime({
        messages: contextMessages,
        parentMessageId: id,
        parentMessageType: 'user',
        sessionId: get().activeId,
        topicId: get().activeTopicId,
        traceId,
        ragQuery: get().internal_shouldUseRAG() ? item.content : undefined,
        threadId: activeThreadId,
      });

      // trace the regenerate message
      if (!params?.skipTrace)
        get().internal_traceMessage(id, { eventType: TraceEventType.RegenerateMessage });
    } finally {
      // Remove message from regenerating state
      set(
        { regeneratingIds: get().regeneratingIds.filter((msgId) => msgId !== id) },
        false,
        'regenerateUserMessage/end',
      );
    }
  },

  regenerateAssistantMessage: async (id, params) => {
    const isRegenerating = messageStateSelectors.isMessageRegenerating(id)(get());
    if (isRegenerating) return;

    const chats = displayMessageSelectors.mainAIChats(get());
    const currentIndex = chats.findIndex((c) => c.id === id);
    const currentMessage = chats[currentIndex];

    // 消息是 AI 发出的因此需要找到它的 user 消息
    const userId = currentMessage.parentId;
    const userIndex = chats.findIndex((c) => c.id === userId);
    // 如果消息没有 parentId，那么同 user 模式
    const contextMessages = chats.slice(0, userIndex < 0 ? currentIndex + 1 : userIndex + 1);

    if (contextMessages.length <= 0 || !userId) return;

    await get().regenerateUserMessage(userId, params);
  },

  continueGenerationMessage: async (id, messageId) => {
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message) return;

    try {
      // Mark message as continuing
      set(
        { continuingIds: [...get().continuingIds, messageId] },
        false,
        'continueGenerationMessage/start',
      );

      const chats = displayMessageSelectors.mainAIChatsWithHistoryConfig(get());

      await get().internal_execAgentRuntime({
        messages: chats,
        parentMessageId: id,
        parentMessageType: message.role as 'assistant' | 'tool' | 'user',
        sessionId: get().activeId,
        topicId: get().activeTopicId,
      });
    } finally {
      // Remove message from continuing state
      set(
        { continuingIds: get().continuingIds.filter((msgId) => msgId !== messageId) },
        false,
        'continueGenerationMessage/end',
      );
    }
  },

  delAndRegenerateMessage: async (id) => {
    const traceId = dbMessageSelectors.getTraceIdByDbMessageId(id)(get());
    get().regenerateAssistantMessage(id, { skipTrace: true, traceId });
    get().deleteMessage(id);

    // trace the delete and regenerate message
    get().internal_traceMessage(id, { eventType: TraceEventType.DeleteAndRegenerateMessage });
  },
});
