/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { DEFAULT_AGENT_CHAT_CONFIG, INBOX_SESSION_ID } from '@lobechat/const';
import {
  ChatImageItem,
  ChatTopic,
  ChatVideoItem,
  SendMessageParams,
  SendMessageServerResponse,
  TraceEventType,
  UIChatMessage,
} from '@lobechat/types';
import { TRPCClientError } from '@trpc/client';
import { t } from 'i18next';
import { StateCreator } from 'zustand/vanilla';

import { aiChatService } from '@/services/aiChat';
import { messageService } from '@/services/message';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/slices/chat';
import { ChatStore } from '@/store/chat/store';
import { getFileStoreState } from '@/store/file/store';
import { getSessionStoreState } from '@/store/session';

import {
  chatSelectors,
  dbMessageSelectors,
  displayMessageSelectors,
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
  /**
   * Regenerates a specific message in the chat
   */
  regenerateMessage: (id: string) => Promise<void>;
  /**
   * Deletes an existing message and generates a new one in its place
   */
  delAndRegenerateMessage: (id: string) => Promise<void>;
  /**
   * Resends a specific message, optionally using a trace ID for tracking
   */
  internal_resendMessage: (
    id: string,
    params?: {
      traceId?: string;
      messages?: UIChatMessage[];
      threadId?: string;
      inPortalThread?: boolean;
    },
  ) => Promise<void>;
  /**
   * Refreshes the AI chat state with new data
   */
  internal_refreshAiChat: (params: {
    topics?: ChatTopic[];
    messages: UIChatMessage[];
    sessionId: string;
    topicId?: string;
  }) => void;
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
          newUserMessage: {
            content: message,
            files: fileIdList,
            parentId: messages.at(-1)?.id,
          },
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
      // refresh the total data
      get().internal_refreshAiChat({
        messages: data.messages,
        topics: data.topics,
        sessionId: activeId,
        topicId: data.topicId,
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
        ragQuery: get().internal_shouldUseRAG() ? message : undefined,
        threadId: activeThreadId,
      });

      //
      // // if there is relative files, then add files to agent
      // // only available in server mode
      const userFiles = dbMessageSelectors
        .dbUserFiles(get())
        .map((f) => f?.id)
        .filter(Boolean) as string[];

      await getAgentStoreState().addFilesToAgent(userFiles, false);
    } catch (e) {
      console.error(e);
    } finally {
      if (data.topicId) get().internal_updateTopicLoading(data.topicId, false);
    }
  },

  regenerateMessage: async (id) => {
    const traceId = dbMessageSelectors.getTraceIdByDbMessageId(id)(get());
    await get().internal_resendMessage(id, { traceId });

    // trace the delete and regenerate message
    get().internal_traceMessage(id, { eventType: TraceEventType.RegenerateMessage });
  },

  delAndRegenerateMessage: async (id) => {
    const traceId = chatSelectors.getTraceIdByMessageId(id)(get());
    get().internal_resendMessage(id, { traceId });
    get().deleteMessage(id);

    // trace the delete and regenerate message
    get().internal_traceMessage(id, { eventType: TraceEventType.DeleteAndRegenerateMessage });
  },

  internal_resendMessage: async (
    messageId,
    { traceId, messages: outChats, threadId: outThreadId, inPortalThread } = {},
  ) => {
    // 1. 构造所有相关的历史记录
    const chats = outChats ?? displayMessageSelectors.mainAIChats(get());

    const item = displayMessageSelectors.getDisplayMessageById(messageId)(get());
    if (!item) return;
    const currentIndex = chats.findIndex((c) => c.id === messageId);

    const currentMessage = chats[currentIndex];

    let contextMessages: UIChatMessage[] = [];

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

    const { internal_execAgentRuntime, activeThreadId } = get();

    const latestMsg = contextMessages.findLast((s) => s.role === 'user');

    if (!latestMsg) return;

    const threadId = outThreadId ?? activeThreadId;

    const result = await messageService.updateMessageMetadata(
      messageId,
      {
        activeBranchIndex: item.metadata?.activeBranchIndex
          ? item.metadata?.activeBranchIndex + 1
          : 1,
      },
      { sessionId: get().activeId, topicId: get().activeTopicId },
    );
    if (!result.success || !result.messages) return;

    get().replaceMessages(result.messages);

    await internal_execAgentRuntime({
      messages: contextMessages,
      parentMessageId: messageId,
      parentMessageType: 'user',
      traceId,
      ragQuery: get().internal_shouldUseRAG() ? latestMsg.content : undefined,
      threadId,
      inPortalThread,
    });
  },

  internal_refreshAiChat: ({ topics, messages, sessionId }) => {
    get().replaceMessages(messages);
    set(
      { topicMaps: topics ? { ...get().topicMaps, [sessionId]: topics } : get().topicMaps },
      false,
      'refreshAiChat',
    );
  },
});
