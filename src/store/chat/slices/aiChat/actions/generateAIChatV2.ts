/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import {
  DEFAULT_AGENT_CHAT_CONFIG,
  INBOX_SESSION_ID,
  LOADING_FLAT,
  isDesktop,
} from '@lobechat/const';
import { knowledgeBaseQAPrompts } from '@lobechat/prompts';
import {
  ChatImageItem,
  ChatTopic,
  ChatVideoItem,
  CreateNewMessageParams,
  MessageSemanticSearchChunk,
  SendMessageParams,
  SendMessageServerResponse,
  TraceNameMap,
  UIChatMessage,
} from '@lobechat/types';
import { TRPCClientError } from '@trpc/client';
import debug from 'debug';
import { t } from 'i18next';
import { produce } from 'immer';
import pMap from 'p-map';
import { StateCreator } from 'zustand/vanilla';

import { aiChatService } from '@/services/aiChat';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/slices/chat';
import { aiModelSelectors, aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { MainSendMessageOperation } from '@/store/chat/slices/aiChat/initialState';
import type { ChatStore } from '@/store/chat/store';
import { getFileStoreState } from '@/store/file/store';
import { getSessionStoreState } from '@/store/session';
import { WebBrowsingManifest } from '@/tools/web-browsing';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors, threadSelectors, topicSelectors } from '../../../selectors';
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
  /**
   */
  triggerToolsCalling: (
    id: string,
    params?: { threadId?: string; inPortalThread?: boolean; inSearchWorkflow?: boolean },
  ) => Promise<void>;
  callToolFollowAssistantMessage: (params: {
    parentId: string;
    traceId?: string;
    threadId?: string;
    inPortalThread?: boolean;
    inSearchWorkflow?: boolean;
  }) => Promise<void>;

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
    userMessageId?: string;
    assistantMessageId: string;
    isWelcomeQuestion?: boolean;
    inSearchWorkflow?: boolean;
    /**
     * the RAG query content, should be embedding and used in the semantic search
     */
    ragQuery?: string;
    threadId?: string;
    inPortalThread?: boolean;
    traceId?: string;
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
  sendMessage: async ({ message, files, onlyAddUserMessage, isWelcomeQuestion }) => {
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

    const messages = chatSelectors.activeBaseChats(get());
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

    // Get the current messages to generate AI response
    // remove the latest assistant message id
    const baseMessages = chatSelectors
      .activeBaseChats(get())
      .filter((item) => item.id !== data.assistantMessageId);

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
        const chats = chatSelectors.getBaseChatsByKey(messageMapKey(activeId, topic.id))(get());
        await get().summaryTopicTitle(topic.id, chats);
      }
    };

    summaryTitle().catch(console.error);

    try {
      await internal_execAgentRuntime({
        messages: baseMessages,
        userMessageId: data.userMessageId,
        assistantMessageId: data.assistantMessageId,
        isWelcomeQuestion,
        ragQuery: get().internal_shouldUseRAG() ? message : undefined,
        threadId: activeThreadId,
      });

      //
      // // if there is relative files, then add files to agent
      // // only available in server mode
      const userFiles = chatSelectors.currentUserFiles(get()).map((f) => f.id);

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
  internal_refreshAiChat: ({ topics, messages, sessionId, topicId }) => {
    set(
      {
        topicMaps: topics ? { ...get().topicMaps, [sessionId]: topics } : get().topicMaps,
        messagesMap: { ...get().messagesMap, [messageMapKey(sessionId, topicId)]: messages },
      },
      false,
      'refreshAiChat',
    );
  },

  internal_execAgentRuntime: async (params) => {
    const {
      assistantMessageId: assistantId,
      userMessageId,
      ragQuery,
      messages: originalMessages,
    } = params;

    log(
      '[internal_execAgentRuntime] start, assistantId: %s, messages count: %d',
      assistantId,
      originalMessages.length,
    );

    const {
      internal_fetchAIChatMessage,
      triggerToolsCalling,
      refreshMessages,
      internal_updateMessageRAG,
    } = get();

    // create a new array to avoid the original messages array change
    const messages = [...originalMessages];

    const agentStoreState = getAgentStoreState();
    const { model, provider, chatConfig } = agentSelectors.currentAgentConfig(agentStoreState);

    log('[internal_execAgentRuntime] Agent config: model=%s, provider=%s', model, provider);

    let fileChunks: MessageSemanticSearchChunk[] | undefined;
    let ragQueryId;

    // go into RAG flow if there is ragQuery flag
    if (ragQuery && userMessageId) {
      log('[internal_execAgentRuntime] Entering RAG flow with query: %s', ragQuery);
      // 1. get the relative chunks from semantic search
      const { chunks, queryId, rewriteQuery } = await get().internal_retrieveChunks(
        userMessageId,
        ragQuery,
        // should skip the last content
        messages.map((m) => m.content).slice(0, messages.length - 1),
      );

      ragQueryId = queryId;

      const lastMsg = messages.pop() as UIChatMessage;

      // 2. build the retrieve context messages
      const knowledgeBaseQAContext = knowledgeBaseQAPrompts({
        chunks,
        userQuery: lastMsg.content,
        rewriteQuery,
        knowledge: agentSelectors.currentEnabledKnowledge(agentStoreState),
      });

      // 3. add the retrieve context messages to the messages history
      messages.push({
        ...lastMsg,
        content: (lastMsg.content + '\n\n' + knowledgeBaseQAContext).trim(),
      });

      fileChunks = chunks.map((c) => ({ id: c.id, similarity: c.similarity }));

      if (fileChunks.length > 0) {
        await internal_updateMessageRAG(assistantId, { ragQueryId, fileChunks });
      }
    }

    // 3. place a search with the search working model if this model is not support tool use
    const aiInfraStoreState = getAiInfraStoreState();
    const isModelSupportToolUse = aiModelSelectors.isModelSupportToolUse(
      model,
      provider!,
    )(aiInfraStoreState);
    const isProviderHasBuiltinSearch = aiProviderSelectors.isProviderHasBuiltinSearch(provider!)(
      aiInfraStoreState,
    );
    const isModelHasBuiltinSearch = aiModelSelectors.isModelHasBuiltinSearch(
      model,
      provider!,
    )(aiInfraStoreState);
    const isModelBuiltinSearchInternal = aiModelSelectors.isModelBuiltinSearchInternal(
      model,
      provider!,
    )(aiInfraStoreState);
    const useModelBuiltinSearch = agentChatConfigSelectors.useModelBuiltinSearch(agentStoreState);
    const useModelSearch =
      ((isProviderHasBuiltinSearch || isModelHasBuiltinSearch) && useModelBuiltinSearch) ||
      isModelBuiltinSearchInternal;
    const isAgentEnableSearch = agentChatConfigSelectors.isAgentEnableSearch(agentStoreState);

    if (isAgentEnableSearch && !useModelSearch && !isModelSupportToolUse) {
      const { model, provider } = agentChatConfigSelectors.searchFCModel(agentStoreState);

      let isToolsCalling = false;
      let isError = false;

      const abortController = get().internal_toggleChatLoading(
        true,
        assistantId,
        n('generateMessage(start)', { messageId: assistantId, messages }),
      );

      get().internal_toggleSearchWorkflow(true, assistantId);
      await chatService.fetchPresetTaskResult({
        params: { messages, model, provider, plugins: [WebBrowsingManifest.identifier] },
        onFinish: async (_, { toolCalls, usage }) => {
          if (toolCalls && toolCalls.length > 0) {
            get().internal_toggleToolCallingStreaming(assistantId, undefined);
            // update tools calling
            await get().internal_updateMessageContent(assistantId, '', {
              toolCalls,
              metadata: usage,
              model,
              provider,
            });
          }
        },
        trace: {
          traceId: params.traceId,
          sessionId: get().activeId,
          topicId: get().activeTopicId,
          traceName: TraceNameMap.SearchIntentRecognition,
        },
        abortController,
        onMessageHandle: async (chunk) => {
          if (chunk.type === 'tool_calls') {
            get().internal_toggleSearchWorkflow(false, assistantId);
            get().internal_toggleToolCallingStreaming(assistantId, chunk.isAnimationActives);
            get().internal_dispatchMessage({
              id: assistantId,
              type: 'updateMessage',
              value: { tools: get().internal_transformToolCalls(chunk.tool_calls) },
            });
            isToolsCalling = true;
          }

          if (chunk.type === 'text') {
            abortController!.abort('not fc');
          }
        },
        onErrorHandle: async (error) => {
          isError = true;
          await messageService.updateMessageError(assistantId, error);
          await refreshMessages();
        },
      });

      get().internal_toggleChatLoading(
        false,
        assistantId,
        n('generateMessage(start)', { messageId: assistantId, messages }),
      );
      get().internal_toggleSearchWorkflow(false, assistantId);

      // if there is error, then stop
      if (isError) return;

      // if it's the function call message, trigger the function method
      if (isToolsCalling) {
        get().internal_toggleMessageInToolsCalling(true, assistantId);
        await refreshMessages();
        await triggerToolsCalling(assistantId, {
          threadId: params?.threadId,
          inPortalThread: params?.inPortalThread,
        });

        // then story the workflow
        return;
      }
    }

    // 4. fetch the AI response
    log('[internal_execAgentRuntime] Fetching AI response for assistantId: %s', assistantId);
    const { isFunctionCall, content } = await internal_fetchAIChatMessage({
      messages,
      messageId: assistantId,
      params,
      model,
      provider: provider!,
    });

    // 5. if it's the function call message, trigger the function method
    if (isFunctionCall) {
      log('[internal_execAgentRuntime] AI response is function call, triggering tools calling');
      get().internal_toggleMessageInToolsCalling(true, assistantId);
      await refreshMessages();
      await triggerToolsCalling(assistantId, {
        threadId: params?.threadId,
        inPortalThread: params?.inPortalThread,
      });
    } else {
      log(
        '[internal_execAgentRuntime] AI response completed, content length: %d',
        content?.length || 0,
      );
      // 显示桌面通知（仅在桌面端且窗口隐藏时）
      if (isDesktop) {
        try {
          // 动态导入桌面通知服务，避免在非桌面端环境中导入
          const { desktopNotificationService } = await import(
            '@/services/electron/desktopNotification'
          );

          await desktopNotificationService.showNotification({
            body: content,
            title: t('notification.finishChatGeneration', { ns: 'electron' }),
          });
        } catch (error) {
          // 静默处理错误，不影响正常流程
          console.error('Desktop notification error:', error);
        }
      }
    }

    // 6. summary history if context messages is larger than historyCount
    const historyCount = agentChatConfigSelectors.historyCount(agentStoreState);

    if (
      agentChatConfigSelectors.enableHistoryCount(agentStoreState) &&
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
  triggerToolsCalling: async (assistantId, { threadId, inPortalThread, inSearchWorkflow } = {}) => {
    log('[triggerToolsCalling] start, assistantId (block ID): %s', assistantId);

    const foundMessage = chatSelectors.getMessageById(assistantId)(get());
    if (!foundMessage) {
      log('[triggerToolsCalling] Message not found, returning');
      return;
    }

    // Determine if this is a group message or a block
    let groupMessage: UIChatMessage;
    let latestBlock: UIChatMessage;

    if (foundMessage.role === 'group') {
      // Case 1: assistantId matches a group message ID directly
      // Find the block within children that matches assistantId
      groupMessage = foundMessage;
      const block = foundMessage.children?.find((item) => item.id === assistantId);

      if (!block) {
        log(
          '[triggerToolsCalling] Block with id %s not found in group message children, returning',
          assistantId,
        );
        return;
      }
      latestBlock = block as UIChatMessage;
    } else if (foundMessage.parentId) {
      // Case 2: assistantId is a block ID, need to get parent group message
      const parentMsg = chatSelectors.getMessageById(foundMessage.parentId)(get());
      if (!parentMsg || parentMsg.role !== 'group') {
        log('[triggerToolsCalling] Parent group message not found, returning');
        return;
      }
      groupMessage = parentMsg;
      latestBlock = foundMessage;
    } else {
      log(
        '[triggerToolsCalling] Message is neither a group message nor a block with parentId, returning',
      );
      return;
    }

    log('[triggerToolsCalling] Found group message: %O', {
      id: groupMessage.id,
      groupId: groupMessage.groupId,
      childrenCount: groupMessage.children?.length,
      latestBlockId: latestBlock.id,
    });

    if (!latestBlock.tools) {
      log('[triggerToolsCalling] Latest block has no tools, returning');
      return;
    }

    log(
      '[triggerToolsCalling] Latest block found with %d tools: %O',
      latestBlock.tools.length,
      latestBlock.tools.map((t) => ({ id: t.id, type: t.type, identifier: t.identifier })),
    );

    let shouldCreateMessage = false;
    let latestToolId = '';

    await pMap(
      latestBlock.tools,
      async (payload) => {
        log(
          '[triggerToolsCalling] Processing tool: %s (type: %s)',
          payload.identifier,
          payload.type,
        );

        // 2. 使用 createMessage 创建 tool 消息
        const toolMessage: CreateNewMessageParams = {
          content: '',
          parentId: assistantId,
          plugin: payload,
          role: 'tool',
          sessionId: get().activeId,
          tool_call_id: payload.id,
          threadId,
          topicId: get().activeTopicId, // if there is activeTopicId，then add it to topicId
          groupId: groupMessage.groupId, // Propagate groupId from parent message for group chat
        };

        const result = await get().internal_createMessage(toolMessage);

        if (!result) {
          log('[triggerToolsCalling] Failed to create tool message for %s', payload.identifier);
          return;
        }

        log('[triggerToolsCalling] Tool message created: %s', result.id);

        // 3. 执行 tool（这时 tool 消息已经创建，且 UI 已更新）
        const data = await get().internal_invokeDifferentTypePlugin(result.id, payload);

        if (data && !['markdown', 'standalone'].includes(payload.type)) {
          shouldCreateMessage = true;
          latestToolId = result.id;
          log(
            '[triggerToolsCalling] Tool %s requires follow-up assistant message',
            payload.identifier,
          );
        } else {
          log('[triggerToolsCalling] Tool %s completed without follow-up', payload.identifier);
        }
      },
      { concurrency: 5 },
    );

    await get().internal_toggleMessageInToolsCalling(false, assistantId);

    if (!shouldCreateMessage) {
      log('[triggerToolsCalling] No follow-up message needed, completed');
      return;
    }

    const traceId = chatSelectors.getTraceIdByMessageId(latestToolId)(get());
    log(
      '[triggerToolsCalling] Calling follow-up assistant message with latestToolId: %s',
      latestToolId,
    );

    await get().callToolFollowAssistantMessage({
      traceId,
      threadId,
      inPortalThread,
      inSearchWorkflow,
      parentId: latestToolId,
    });
    log('[triggerToolsCalling] completed');
  },

  callToolFollowAssistantMessage: async ({
    parentId,
    traceId,
    threadId,
    inPortalThread,
    inSearchWorkflow,
  }) => {
    log('[callToolFollowAssistantMessage] start, parentId: %s', parentId);

    const chats = inPortalThread
      ? threadSelectors.portalAIChatsWithHistoryConfig(get())
      : chatSelectors.mainAIChatsWithHistoryConfig(get());

    let assistantMessageId: string;

    // 获取 agent 配置
    const agentStoreState = getAgentStoreState();
    const { model, provider } = agentSelectors.currentAgentConfig(agentStoreState);

    // 查找包含 parentId 的 group message
    // parentId 是 tool result message 的 id，它存储在 assistant block 的 tools[].result_msg_id 中
    let groupMessageId: string | undefined;

    // 遍历所有 group messages，找到包含该 tool result 的那个
    for (const msg of chats) {
      if (msg.role === 'group' && msg.children) {
        for (const child of msg.children) {
          // 检查 child 的 tools 中是否有 result_msg_id === parentId
          if (child.tools?.some((tool) => tool.result_msg_id === parentId)) {
            groupMessageId = msg.id;
            log('[callToolFollowAssistantMessage] Found group message: %s', groupMessageId);
            break;
          }
        }
        if (groupMessageId) break;
      }
    }

    // 创建新的 assistant message，作为 group message 的新 block
    const assistantMessage: CreateNewMessageParams = {
      role: 'assistant',
      content: LOADING_FLAT,
      parentId,
      sessionId: get().activeId,
      topicId: get().activeTopicId,
      threadId,
      traceId,
      model,
      provider,
    };

    log('[callToolFollowAssistantMessage] Creating new assistant message block with params: %O', {
      parentId,
      groupMessageId,
      model,
      provider,
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });

    const result = await get().internal_createMessage(assistantMessage, { groupMessageId });

    if (!result) {
      log('[callToolFollowAssistantMessage] Failed to create assistant message');
      return;
    }

    assistantMessageId = result.id;
    log(
      '[callToolFollowAssistantMessage] Assistant message created successfully, id: %s',
      assistantMessageId,
    );

    log('[callToolFollowAssistantMessage] Starting agent runtime with %d messages', chats.length);
    await get().internal_execAgentRuntime({
      messages: chats,
      assistantMessageId,
      traceId,
      threadId,
      inPortalThread,
      inSearchWorkflow,
    });
    log('[callToolFollowAssistantMessage] completed');
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
