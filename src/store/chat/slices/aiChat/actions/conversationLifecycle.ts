/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { DEFAULT_AGENT_CHAT_CONFIG, LOADING_FLAT } from '@lobechat/const';
import {
  ChatImageItem,
  ChatVideoItem,
  ConversationContext,
  SendMessageParams,
  SendMessageServerResponse,
} from '@lobechat/types';
import { nanoid } from '@lobechat/utils';
import { TRPCClientError } from '@trpc/client';
import { t } from 'i18next';
import { StateCreator } from 'zustand/vanilla';

import { aiChatService } from '@/services/aiChat';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { ChatStore } from '@/store/chat/store';
import { getFileStoreState } from '@/store/file/store';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { getSessionStoreState } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserMemoryStore } from '@/store/userMemory';

import {
  dbMessageSelectors,
  displayMessageSelectors,
  messageStateSelectors,
  topicSelectors,
} from '../../../selectors';
import { messageMapKey } from '../../../utils/messageMapKey';

/**
 * Extended params for sendMessage with context
 */
export interface SendMessageWithContextParams extends SendMessageParams {
  /**
   * Conversation context (required for cross-store usage)
   * Contains sessionId, topicId, and threadId
   */
  context: ConversationContext;
}

/**
 * Result returned from sendMessage
 */
export interface SendMessageResult {
  /** The created assistant message ID */
  assistantMessageId: string;
  /** The created thread ID (if a new thread was created) */
  createdThreadId?: string;
  /** The created user message ID */
  userMessageId: string;
}

/**
 * Actions managing the complete lifecycle of conversations including sending,
 * regenerating, and resending messages
 */
export interface ConversationLifecycleAction {
  /**
   * Sends a new message to the AI chat system
   * @param params - Message params with required context
   * @returns Result containing message IDs and created thread ID if applicable
   */
  sendMessage: (params: SendMessageWithContextParams) => Promise<SendMessageResult | undefined>;
  /**
   * @deprecated Use ConversationStore.regenerateUserMessage instead.
   * This method uses global state which doesn't work in Group Chat scenarios.
   */
  regenerateUserMessage: (id: string) => Promise<void>;
  /**
   * @deprecated Use ConversationStore.regenerateAssistantMessage instead.
   * This method uses global state which doesn't work in Group Chat scenarios.
   */
  regenerateAssistantMessage: (id: string) => Promise<void>;
  /**
   * Continue generating from current assistant message
   */
  continueGenerationMessage: (lastBlockId: string, messageId: string) => Promise<void>;
}

export const conversationLifecycle: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ConversationLifecycleAction
> = (set, get) => ({
  sendMessage: async ({
    message,
    files,
    onlyAddUserMessage,
    context,
    messages: inputMessages,
    parentId: inputParentId,
  }) => {
    const { internal_execAgentRuntime, mainInputEditor } = get();

    // Use context from params (required)
    const { agentId } = context;
    // If creating new thread (isNew + scope='thread'), threadId will be created by server
    const isCreatingNewThread = context.isNew && context.scope === 'thread';
    // Build newThread params for server from new context format
    // Only create newThread if we have both sourceMessageId and threadType
    const newThread =
      isCreatingNewThread && context.sourceMessageId && context.threadType
        ? { sourceMessageId: context.sourceMessageId, type: context.threadType }
        : undefined;

    if (!agentId) return;

    // When creating new thread, override threadId to undefined (server will create it)
    const operationContext = isCreatingNewThread ? { ...context, threadId: undefined } : context;

    const fileIdList = files?.map((f) => f.id);

    const hasFile = !!fileIdList && fileIdList.length > 0;

    // if message is empty or no files, then stop
    if (!message && !hasFile) return;

    if (onlyAddUserMessage) {
      await get().addUserMessage({ message, fileList: fileIdList });

      return;
    }

    // Use provided messages or query from store
    const contextKey = messageMapKey(context);
    const messages =
      inputMessages ?? displayMessageSelectors.getDisplayMessagesByKey(contextKey)(get());
    const lastMessage = messages.at(-1);

    useUserMemoryStore.getState().setActiveMemoryContext({
      session: sessionSelectors.currentSession(getSessionStoreState()),
      topic: topicSelectors.currentActiveTopic(get()),
      latestUserMessage: lastMessage?.content,
      sendingMessage: message,
    });

    // Use provided parentId or calculate from messages
    let parentId: string | undefined = inputParentId;
    if (!parentId && lastMessage) {
      parentId = displayMessageSelectors.findLastMessageId(lastMessage.id)(get());
    }

    const chatConfig = agentChatConfigSelectors.currentChatConfig(getAgentStoreState());
    const autoCreateThreshold =
      chatConfig.autoCreateTopicThreshold ?? DEFAULT_AGENT_CHAT_CONFIG.autoCreateTopicThreshold;
    const shouldCreateNewTopic =
      !context.topicId &&
      !!chatConfig.enableAutoCreateTopic &&
      messages.length + 2 >= autoCreateThreshold;

    // Create operation for send message first, so we can use operationId for optimistic updates
    const tempId = 'tmp_' + nanoid();
    const tempAssistantId = 'tmp_' + nanoid();
    const { operationId, abortController } = get().startOperation({
      type: 'sendMessage',
      context: { ...operationContext, messageId: tempId },
      label: 'Send Message',
      metadata: {
        // Mark this as thread operation if threadId exists
        inThread: !!operationContext.threadId,
      },
    });

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

    // use optimistic update to avoid the slow waiting (now with operationId for correct context)
    get().optimisticCreateTmpMessage(
      {
        content: message,
        // if message has attached with files, then add files to message and the agent
        files: fileIdList,
        role: 'user',
        agentId: operationContext.agentId,
        // if there is topicId，then add topicId to message
        topicId: operationContext.topicId ?? undefined,
        threadId: operationContext.threadId ?? undefined,
        imageList: tempImages.length > 0 ? tempImages : undefined,
        videoList: tempVideos.length > 0 ? tempVideos : undefined,
      },
      { operationId, tempMessageId: tempId },
    );
    get().optimisticCreateTmpMessage(
      {
        content: LOADING_FLAT,
        role: 'assistant',
        agentId: operationContext.agentId,
        // if there is topicId，then add topicId to message
        topicId: operationContext.topicId ?? undefined,
        threadId: operationContext.threadId ?? undefined,
      },
      { operationId, tempMessageId: tempAssistantId },
    );
    get().internal_toggleMessageLoading(true, tempId);

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
          // if there is topicId，then add topicId to message
          topicId: operationContext.topicId ?? undefined,
          threadId: operationContext.threadId ?? undefined,
          // Support creating new thread along with message
          newThread: newThread
            ? {
                sourceMessageId: newThread.sourceMessageId,
                type: newThread.type,
              }
            : undefined,
          newTopic: shouldCreateNewTopic
            ? {
                topicMessageIds: messages.map((m) => m.id),
                title: message.slice(0, 10) || t('defaultTitle', { ns: 'topic' }),
              }
            : undefined,
          agentId: operationContext.agentId,
          newAssistantMessage: { model, provider: provider! },
        },
        abortController,
      );
      // Use created topicId/threadId if available, otherwise use original from context
      let finalTopicId = operationContext.topicId;
      const finalThreadId = data.createdThreadId ?? operationContext.threadId;

      // refresh the total data
      if (data?.topics) {
        const pageSize = systemStatusSelectors.topicPageSize(useGlobalStore.getState());
        get().internal_updateTopics(operationContext.agentId, {
          items: data.topics.items,
          pageSize,
          total: data.topics.total,
        });
        finalTopicId = data.topicId;

        // Record the created topicId in metadata (not context)
        get().updateOperationMetadata(operationId, { createdTopicId: data.topicId });
      }

      // Record created threadId in operation metadata
      if (data.createdThreadId) {
        get().updateOperationMetadata(operationId, { createdThreadId: data.createdThreadId });
      }

      // Create final context with updated topicId/threadId from server response
      const finalContext = { ...operationContext, topicId: finalTopicId, threadId: finalThreadId };
      get().replaceMessages(data.messages, {
        context: finalContext,
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
          .getDisplayMessagesByKey(messageMapKey({ agentId, topicId: topic.id }))(get())
          .filter((item) => item.id !== data.assistantMessageId);

        await get().summaryTopicTitle(topic.id, chats);
      }
    };

    summaryTitle().catch(console.error);

    // Complete sendMessage operation here - message creation is done
    // execAgentRuntime is a separate operation (child) that handles AI response generation
    get().completeOperation(operationId);

    // Create final context for AI execution (with updated topicId/threadId from server)
    const execContext = {
      ...operationContext,
      topicId: data.topicId ?? operationContext.topicId,
      threadId: data.createdThreadId ?? operationContext.threadId,
    };

    // Get the current messages to generate AI response
    const displayMessages = displayMessageSelectors.getDisplayMessagesByKey(
      messageMapKey(execContext),
    )(get());

    try {
      await internal_execAgentRuntime({
        context: execContext,
        messages: displayMessages,
        parentMessageId: data.assistantMessageId,
        parentMessageType: 'assistant',
        parentOperationId: operationId, // Pass as parent operation
        // If a new thread was created, mark as inPortalThread for consistent behavior
        inPortalThread: !!data.createdThreadId,
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

    // Return result for callers who need message IDs
    return {
      assistantMessageId: data.assistantMessageId,
      createdThreadId: data.createdThreadId,
      userMessageId: data.userMessageId,
    };
  },

  /**
   * @deprecated Use ConversationStore.regenerateUserMessage instead
   */
  regenerateUserMessage: async (id) => {
    const isRegenerating = messageStateSelectors.isMessageRegenerating(id)(get());
    if (isRegenerating) return;

    const item = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!item) return;

    const chats = displayMessageSelectors.mainAIChats(get());

    const currentIndex = chats.findIndex((c) => c.id === id);
    const contextMessages = chats.slice(0, currentIndex + 1);

    if (contextMessages.length <= 0) return;

    const { internal_execAgentRuntime, activeThreadId, activeAgentId, activeTopicId } = get();

    // Create base context for regeneration (using global state)
    const regenContext = {
      agentId: activeAgentId,
      topicId: activeTopicId,
      threadId: activeThreadId ?? undefined,
    };

    // Create regenerate operation
    const { operationId } = get().startOperation({
      type: 'regenerate',
      context: { ...regenContext, messageId: id },
    });

    try {
      // 切一个新的激活分支
      await get().switchMessageBranch(id, item.branch ? item.branch.count : 1);

      await internal_execAgentRuntime({
        context: regenContext,
        messages: contextMessages,
        parentMessageId: id,
        parentMessageType: 'user',
        parentOperationId: operationId,
      });

      get().completeOperation(operationId);
    } catch (error) {
      get().failOperation(operationId, {
        type: 'RegenerateError',
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * @deprecated Use ConversationStore.regenerateAssistantMessage instead
   */
  regenerateAssistantMessage: async (id) => {
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

    await get().regenerateUserMessage(userId);
  },

  continueGenerationMessage: async (id, messageId) => {
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message) return;

    const { activeAgentId, activeTopicId, activeThreadId } = get();

    // Create base context for continue operation (using global state)
    const continueContext = {
      agentId: activeAgentId,
      topicId: activeTopicId,
      threadId: activeThreadId ?? undefined,
    };

    // Create continue operation
    const { operationId } = get().startOperation({
      type: 'continue',
      context: { ...continueContext, messageId },
    });

    try {
      const chats = displayMessageSelectors.mainAIChatsWithHistoryConfig(get());

      await get().internal_execAgentRuntime({
        context: continueContext,
        messages: chats,
        parentMessageId: id,
        parentMessageType: message.role as 'assistant' | 'tool' | 'user',
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
});
