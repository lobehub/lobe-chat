/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { AgentRuntime, type AgentRuntimeContext } from '@lobechat/agent-runtime';
import { DEFAULT_AGENT_CHAT_CONFIG, INBOX_SESSION_ID, isDesktop } from '@lobechat/const';
import { knowledgeBaseQAPrompts } from '@lobechat/prompts';
import {
  ChatImageItem,
  ChatTopic,
  ChatVideoItem,
  SendMessageParams,
  SendMessageServerResponse,
  UIChatMessage,
} from '@lobechat/types';
import type { MessageSemanticSearchChunk } from '@lobechat/types';
import { TRPCClientError } from '@trpc/client';
import debug from 'debug';
import { t } from 'i18next';
import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { aiChatService } from '@/services/aiChat';
import { messageService } from '@/services/message';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/slices/chat';
import { GeneralChatAgent } from '@/store/chat/agents/GeneralChatAgent';
import { createAgentExecutors } from '@/store/chat/agents/createAgentExecutors';
import { MainSendMessageOperation } from '@/store/chat/slices/aiChat/initialState';
import type { ChatStore } from '@/store/chat/store';
import { getFileStoreState } from '@/store/file/store';
import { getSessionStoreState } from '@/store/session';
import { setNamespace } from '@/utils/storeDebug';

import { dbMessageSelectors, displayMessageSelectors, topicSelectors } from '../../../selectors';
import { messageMapKey } from '../../../utils/messageMapKey';

const n = setNamespace('ai');
const log = debug('lobe-store:ai-chat-v2');

export interface AIGenerateV2Action {
  /**
   * Sends a new message to the AI chat system
   */
  sendMessage: (params: SendMessageParams) => Promise<void>;
  /**
   * Cancels sendMessage operation for a specific topic/session
   */
  cancelSendMessageInServer: (topicId?: string) => void;
  clearSendMessageError: () => void;
  internal_refreshAiChat: (params: {
    topics?: ChatTopic[];
    messages: UIChatMessage[];
    sessionId: string;
    topicId?: string;
  }) => void;
  /**
   * Executes the core processing logic for AI messages
   * including preprocessing and postprocessing steps
   */
  internal_execAgentRuntime: (params: {
    messages: UIChatMessage[];
    parentMessageId: string;
    parentMessageType: 'user' | 'assistant';
    inSearchWorkflow?: boolean;
    /**
     * the RAG query content, should be embedding and used in the semantic search
     */
    ragQuery?: string;
    threadId?: string;
    inPortalThread?: boolean;
    traceId?: string;
    ragMetadata?: { ragQueryId: string; fileChunks: MessageSemanticSearchChunk[] };
  }) => Promise<void>;
  /**
   * Toggle sendMessage operation state
   */
  internal_toggleSendMessageOperation: (
    key: string | { sessionId: string; topicId?: string | null },
    loading: boolean,
    cancelReason?: string,
  ) => AbortController | undefined;
  internal_updateSendMessageOperation: (
    key: string | { sessionId: string; topicId?: string | null },
    value: Partial<MainSendMessageOperation> | null,
    actionName?: any,
  ) => void;
}

export const generateAIChatV2: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  AIGenerateV2Action
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
    const tempId = get().internal_createTmpMessage({
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

  cancelSendMessageInServer: (topicId?: string) => {
    const { activeId, activeTopicId } = get();

    // Determine which operation to cancel
    const targetTopicId = topicId ?? activeTopicId;
    const operationKey = messageMapKey(activeId, targetTopicId);

    // Cancel the specific operation
    get().internal_toggleSendMessageOperation(
      operationKey,
      false,
      'User cancelled sendMessage operation',
    );

    // Only clear creating message state if it's the active session
    if (operationKey === messageMapKey(activeId, activeTopicId)) {
      const editorTempState = get().mainSendMessageOperations[operationKey]?.inputEditorTempState;

      if (editorTempState) get().mainInputEditor?.setJSONState(editorTempState);
    }
  },
  clearSendMessageError: () => {
    get().internal_updateSendMessageOperation(
      { sessionId: get().activeId, topicId: get().activeTopicId },
      null,
      'clearSendMessageError',
    );
  },
  internal_refreshAiChat: ({ topics, messages, sessionId }) => {
    get().replaceMessages(messages);
    set(
      { topicMaps: topics ? { ...get().topicMaps, [sessionId]: topics } : get().topicMaps },
      false,
      'refreshAiChat',
    );
  },

  internal_execAgentRuntime: async (params) => {
    const { messages: originalMessages, parentMessageId, parentMessageType } = params;

    log(
      '[internal_execAgentRuntime] start, parentMessageId: %s,parentMessageType: %s, messages count: %d',
      parentMessageId,
      parentMessageType,
      originalMessages.length,
    );

    const { activeId, activeTopicId } = get();
    const messageKey = messageMapKey(activeId, activeTopicId);

    // Create a new array to avoid modifying the original messages
    let messages = [...originalMessages];

    const agentStoreState = getAgentStoreState();
    const agentConfigData = agentSelectors.currentAgentConfig(agentStoreState);
    const { chatConfig } = agentConfigData;

    // Use current agent config
    const model = agentConfigData.model;
    const provider = agentConfigData.provider;

    // ===========================================
    // Step 1: RAG Preprocessing (if enabled)
    // ===========================================
    if (params.ragQuery && parentMessageType === 'user') {
      const userMessageId = parentMessageId;
      log('[internal_execAgentRuntime] RAG preprocessing start');

      // Get relevant chunks from semantic search
      const {
        chunks,
        queryId: ragQueryId,
        rewriteQuery,
      } = await get().internal_retrieveChunks(
        userMessageId,
        params.ragQuery,
        // Skip the last message content when building context
        messages.map((m) => m.content).slice(0, messages.length - 1),
      );

      log('[internal_execAgentRuntime] RAG chunks retrieved: %d chunks', chunks.length);

      const lastMsg = messages.pop() as UIChatMessage;

      // Build RAG context and append to user query
      const knowledgeBaseQAContext = knowledgeBaseQAPrompts({
        chunks,
        userQuery: lastMsg.content,
        rewriteQuery,
        knowledge: agentSelectors.currentEnabledKnowledge(agentStoreState),
      });

      messages.push({
        ...lastMsg,
        content: (lastMsg.content + '\n\n' + knowledgeBaseQAContext).trim(),
      });

      // Update assistant message with RAG metadata
      const fileChunks: MessageSemanticSearchChunk[] = chunks.map((c) => ({
        id: c.id,
        similarity: c.similarity,
      }));

      if (fileChunks.length > 0) {
        // Note: RAG metadata will be updated after assistant message is created by call_llm executor
        // Store RAG data temporarily in params for later use
        params.ragMetadata = { ragQueryId: ragQueryId!, fileChunks };
      }

      log('[internal_execAgentRuntime] RAG preprocessing completed');
    }

    // ===========================================
    // Step 3: Create and Execute Agent Runtime
    // ===========================================
    log('[internal_execAgentRuntime] Creating agent runtime');

    const agent = new GeneralChatAgent({
      agentConfig: { maxSteps: 1000 },
      sessionId: `${messageKey}/${params.parentMessageId}`,
      modelRuntimeConfig: {
        model,
        provider: provider!,
      },
    });
    const runtime = new AgentRuntime(agent, {
      executors: createAgentExecutors({
        get,
        messageKey,
        parentId: params.parentMessageId,
        parentMessageType,
        params,
      }),
    });

    // Create initial state
    let state = AgentRuntime.createInitialState({
      sessionId: activeId,
      messages,
      maxSteps: 20, // Prevent infinite loops
      metadata: {
        sessionId: activeId,
        topicId: activeTopicId,
        threadId: params.threadId,
      },
    });

    // Initial context - use 'init' phase since state already contains messages
    let nextContext: AgentRuntimeContext = {
      phase: 'init',
      payload: {},
      session: {
        sessionId: activeId,
        messageCount: messages.length,
        status: state.status,
        stepCount: 0,
      },
    };

    log(
      '[internal_execAgentRuntime] Agent runtime loop start, initial phase: %s',
      nextContext.phase,
    );

    // Execute the agent runtime loop
    let stepCount = 0;
    while (state.status !== 'done' && state.status !== 'error') {
      stepCount++;
      log(
        '[internal_execAgentRuntime][step-%d]: phase=%s, status=%s',
        stepCount,
        nextContext.phase,
        state.status,
      );

      const result = await runtime.step(state, nextContext);

      log(
        '[internal_execAgentRuntime] Step %d completed, events: %d, newStatus=%s',
        stepCount,
        result.events.length,
        result.newState.status,
      );

      // Handle completion and error events
      for (const event of result.events) {
        if (event.type === 'done') {
          log('[internal_execAgentRuntime] Received done event, syncing to database');
          // Sync final state to database
          const finalMessages = get().messagesMap[messageKey] || [];
          get().replaceMessages(finalMessages);
        }

        if (event.type === 'error') {
          log('[internal_execAgentRuntime] Received error event: %o', event.error);
          // Find the assistant message to update error
          const currentMessages = get().messagesMap[messageKey] || [];
          const assistantMessage = currentMessages.findLast((m) => m.role === 'assistant');
          if (assistantMessage) {
            await messageService.updateMessageError(assistantMessage.id, event.error);
          }
          const finalMessages = get().messagesMap[messageKey] || [];
          get().replaceMessages(finalMessages);
        }
      }

      state = result.newState;

      // If no nextContext, stop execution
      if (!result.nextContext) {
        log('[internal_execAgentRuntime] No next context, stopping loop');
        break;
      }

      nextContext = result.nextContext;
    }

    log(
      '[internal_execAgentRuntime] Agent runtime loop finished, final status: %s, total steps: %d',
      state.status,
      stepCount,
    );

    // Update RAG metadata if available
    if (params.ragMetadata) {
      const finalMessages = get().messagesMap[messageKey] || [];
      const assistantMessage = finalMessages.findLast((m) => m.role === 'assistant');
      if (assistantMessage) {
        await get().internal_updateMessageRAG(assistantMessage.id, params.ragMetadata);
        log('[internal_execAgentRuntime] RAG metadata updated for assistant message');
      }
    }

    log('[internal_execAgentRuntime] completed');

    // Desktop notification (if not in tools calling mode)
    if (isDesktop) {
      try {
        const messageKey = `${activeId}_${activeTopicId ?? null}`;
        const finalMessages = get().messagesMap[messageKey] || [];
        const lastAssistant = finalMessages.findLast((m) => m.role === 'assistant');

        // Only show notification if there's content and no tools
        if (lastAssistant?.content && !lastAssistant?.tools) {
          const { desktopNotificationService } = await import(
            '@/services/electron/desktopNotification'
          );

          await desktopNotificationService.showNotification({
            body: lastAssistant.content,
            title: t('notification.finishChatGeneration', { ns: 'electron' }),
          });
        }
      } catch (error) {
        console.error('Desktop notification error:', error);
      }
    }

    // Summary history if context messages is larger than historyCount
    const historyCount = agentChatConfigSelectors.historyCount(agentStoreState);

    if (
      agentChatConfigSelectors.enableHistoryCount(agentStoreState) &&
      chatConfig.enableCompressHistory &&
      messages.length > historyCount
    ) {
      // after generation: [u1,a1,u2,a2,u3,a3]
      // but the `messages` is still: [u1,a1,u2,a2,u3]
      // So if historyCount=2, we need to summary [u1,a1,u2,a2]
      // because user find UI is [u1,a1,u2,a2 | u3,a3]
      const historyMessages = messages.slice(0, -historyCount + 1);

      await get().internal_summaryHistory(historyMessages);
    }
  },

  internal_updateSendMessageOperation: (key, value, actionName) => {
    const operationKey = typeof key === 'string' ? key : messageMapKey(key.sessionId, key.topicId);

    set(
      produce((draft) => {
        if (!draft.mainSendMessageOperations[operationKey])
          draft.mainSendMessageOperations[operationKey] = value;
        else {
          if (value === null) {
            delete draft.mainSendMessageOperations[operationKey];
          } else {
            draft.mainSendMessageOperations[operationKey] = {
              ...draft.mainSendMessageOperations[operationKey],
              ...value,
            };
          }
        }
      }),
      false,
      actionName ?? n('updateSendMessageOperation', { operationKey, value }),
    );
  },
  internal_toggleSendMessageOperation: (key, loading: boolean, cancelReason?: string) => {
    if (loading) {
      const abortController = new AbortController();

      get().internal_updateSendMessageOperation(
        key,
        { isLoading: true, abortController },
        n('toggleSendMessageOperation(start)', { key }),
      );

      return abortController;
    } else {
      const operationKey =
        typeof key === 'string' ? key : messageMapKey(key.sessionId, key.topicId);

      const operation = get().mainSendMessageOperations[operationKey];

      // If cancelReason is provided, abort the operation first
      if (cancelReason && operation?.isLoading) {
        operation.abortController?.abort(cancelReason);
      }

      get().internal_updateSendMessageOperation(
        key,
        { isLoading: false, abortController: null },
        n('toggleSendMessageOperation(stop)', { key, cancelReason }),
      );

      return undefined;
    }
  },
});
