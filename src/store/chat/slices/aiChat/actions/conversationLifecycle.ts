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
    const tempAssistantId = get().optimisticCreateTmpMessage({
      content: LOADING_FLAT,
      role: 'assistant',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
      threadId: activeThreadId,
    });
    get().internal_toggleMessageLoading(true, tempId);

    // Create operation for send message
    const { operationId, abortController } = get().startOperation({
      type: 'sendMessage',
      context: {
        sessionId: activeId,
        topicId: activeTopicId,
        threadId: activeThreadId,
        messageId: tempId,
      },
      label: 'Send Message',
      metadata: {
        // Mark this as main window operation (not thread)
        inThread: false,
      },
    });

    // Associate temp message with operation
    get().associateMessageWithOperation(tempId, operationId);

    // Store editor state in operation metadata for cancel restoration
    const jsonState = mainInputEditor?.getJSONState();
    get().updateOperationMetadata(operationId, {
      inputEditorTempState: jsonState,
      inputSendErrorMsg: undefined,
    });

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
                title: message.slice(0, 10) || t('defaultTitle', { ns: 'topic' }),
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

        // Record the created topicId in metadata (not context)
        get().updateOperationMetadata(operationId, { createdTopicId: data.topicId });
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
      // Fail operation on error
      get().failOperation(operationId, {
        type: e instanceof Error ? e.name : 'unknown_error',
        message: e instanceof Error ? e.message : 'Unknown error',
      });

      if (e instanceof TRPCClientError) {
        const isAbort = e.message.includes('aborted') || e.name === 'AbortError';
        // Check if error is due to cancellation
        if (!isAbort) {
          get().updateOperationMetadata(operationId, { inputSendErrorMsg: e.message });
          get().mainInputEditor?.setJSONState(jsonState);
        }
      }
    } finally {
      // 创建了新topic 或者 用户 cancel 了消息（或者失败了），此时无 data
      if (data?.isCreateNewTopic || !data) {
        get().internal_dispatchMessage(
          { type: 'deleteMessages', ids: [tempId, tempAssistantId] },
          { operationId },
        );
      }
    }

    get().internal_toggleMessageLoading(false, tempId);

    // Clear editor temp state after message created
    if (data) {
      get().updateOperationMetadata(operationId, { inputEditorTempState: null });
    }

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

    // Complete sendMessage operation here - message creation is done
    // execAgentRuntime is a separate operation (child) that handles AI response generation
    get().completeOperation(operationId);

    // Get the current messages to generate AI response
    const displayMessages = displayMessageSelectors.activeDisplayMessages(get());

    try {
      await internal_execAgentRuntime({
        messages: displayMessages,
        parentMessageId: data.assistantMessageId,
        parentMessageType: 'assistant',
        sessionId: activeId,
        topicId: data.topicId ?? activeTopicId,
        parentOperationId: operationId, // Pass as parent operation
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

    const { internal_execAgentRuntime, activeThreadId, activeId, activeTopicId } = get();

    // Create regenerate operation
    const { operationId } = get().startOperation({
      type: 'regenerate',
      context: { sessionId: activeId, topicId: activeTopicId, messageId: id },
    });

    try {
      const traceId = params?.traceId ?? dbMessageSelectors.getTraceIdByDbMessageId(id)(get());

      // 切一个新的激活分支
      await get().switchMessageBranch(id, item.branch ? item.branch.count : 1);

      await internal_execAgentRuntime({
        messages: contextMessages,
        parentMessageId: id,
        parentMessageType: 'user',
        sessionId: activeId,
        topicId: activeTopicId,
        traceId,
        threadId: activeThreadId,
        parentOperationId: operationId,
      });

      // trace the regenerate message
      if (!params?.skipTrace)
        get().internal_traceMessage(id, { eventType: TraceEventType.RegenerateMessage });

      get().completeOperation(operationId);
    } catch (error) {
      get().failOperation(operationId, {
        type: 'RegenerateError',
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
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

    const { activeId, activeTopicId } = get();

    // Create continue operation
    const { operationId } = get().startOperation({
      type: 'continue',
      context: { sessionId: activeId, topicId: activeTopicId, messageId },
    });

    try {
      const chats = displayMessageSelectors.mainAIChatsWithHistoryConfig(get());

      await get().internal_execAgentRuntime({
        messages: chats,
        parentMessageId: id,
        parentMessageType: message.role as 'assistant' | 'tool' | 'user',
        sessionId: activeId,
        topicId: activeTopicId,
        parentOperationId: operationId,
      });

      get().completeOperation(operationId);
    } catch (error) {
      get().failOperation(operationId, {
        type: 'ContinueError',
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
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
