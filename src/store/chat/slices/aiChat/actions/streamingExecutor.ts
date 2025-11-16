/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { AgentRuntime, type AgentRuntimeContext, type AgentState } from '@lobechat/agent-runtime';
import { isDesktop } from '@lobechat/const';
import { knowledgeBaseQAPrompts } from '@lobechat/prompts';
import {
  ChatImageItem,
  ChatToolPayload,
  MessageToolCall,
  ModelUsage,
  TraceNameMap,
  UIChatMessage,
} from '@lobechat/types';
import type { MessageSemanticSearchChunk } from '@lobechat/types';
import debug from 'debug';
import { t } from 'i18next';
import { throttle } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { getAgentStoreState } from '@/store/agent/store';
import { GeneralChatAgent } from '@/store/chat/agents/GeneralChatAgent';
import { createAgentExecutors } from '@/store/chat/agents/createAgentExecutors';
import { createAgentToolsEngine } from '@/store/chat/agents/createToolEngine';
import { ChatStore } from '@/store/chat/store';
import { getFileStoreState } from '@/store/file/store';
import { toolInterventionSelectors } from '@/store/user/selectors';
import { getUserStoreState } from '@/store/user/store';
import { setNamespace } from '@/utils/storeDebug';

import { topicSelectors } from '../../../selectors';
import { messageMapKey } from '../../../utils/messageMapKey';

const n = setNamespace('ai');
const log = debug('lobe-store:streaming-executor');

interface ProcessMessageParams {
  traceId?: string;
  isWelcomeQuestion?: boolean;
  inSearchWorkflow?: boolean;
  /**
   * the RAG query content, should be embedding and used in the semantic search
   */
  ragQuery?: string;
  threadId?: string;
  inPortalThread?: boolean;

  groupId?: string;
  agentId?: string;
  agentConfig?: any; // Agent configuration for group chat agents

  /**
   * Explicit sessionId for this execution (avoids using global activeId)
   */
  sessionId?: string;
  /**
   * Explicit topicId for this execution (avoids using global activeTopicId)
   */
  topicId?: string | null;
}

/**
 * Core streaming execution actions for AI chat
 */
export interface StreamingExecutorAction {
  /**
   * Creates initial agent state and context with user intervention config
   */
  internal_createAgentState: (params: {
    messages: UIChatMessage[];
    parentMessageId: string;
    /**
     * Explicit sessionId for this execution (avoids using global activeId)
     */
    sessionId?: string;
    /**
     * Explicit topicId for this execution (avoids using global activeTopicId)
     */
    topicId?: string | null;
    threadId?: string;
    initialState?: AgentState;
    initialContext?: AgentRuntimeContext;
  }) => {
    state: AgentState;
    context: AgentRuntimeContext;
  };
  /**
   * Retrieves an AI-generated chat message from the backend service with streaming
   */
  internal_fetchAIChatMessage: (input: {
    messages: UIChatMessage[];
    messageId: string;
    params?: ProcessMessageParams;
    model: string;
    provider: string;
  }) => Promise<{
    isFunctionCall: boolean;
    tools?: ChatToolPayload[];
    tool_calls?: MessageToolCall[];
    content: string;
    traceId?: string;
    usage?: ModelUsage;
  }>;
  /**
   * Executes the core processing logic for AI messages
   * including preprocessing and postprocessing steps
   */
  internal_execAgentRuntime: (params: {
    messages: UIChatMessage[];
    parentMessageId: string;
    parentMessageType: 'user' | 'assistant' | 'tool';
    /**
     * Explicit sessionId for this execution (avoids using global activeId)
     */
    sessionId?: string;
    /**
     * Explicit topicId for this execution (avoids using global activeTopicId)
     */
    topicId?: string | null;
    inSearchWorkflow?: boolean;
    /**
     * the RAG query content, should be embedding and used in the semantic search
     */
    ragQuery?: string;
    threadId?: string;
    inPortalThread?: boolean;
    skipCreateFirstMessage?: boolean;
    traceId?: string;
    ragMetadata?: { ragQueryId: string; fileChunks: MessageSemanticSearchChunk[] };
    /**
     * Initial agent state (for resuming execution from a specific point)
     */
    initialState?: AgentState;
    /**
     * Initial agent runtime context (for resuming execution from a specific phase)
     */
    initialContext?: AgentRuntimeContext;
  }) => Promise<void>;
}

export const streamingExecutor: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  StreamingExecutorAction
> = (set, get) => ({
  internal_createAgentState: ({
    messages,
    parentMessageId,
    sessionId: paramSessionId,
    topicId: paramTopicId,
    threadId,
    initialState,
    initialContext,
  }) => {
    // Use provided sessionId/topicId or fallback to global state
    const { activeId, activeTopicId } = get();
    const sessionId = paramSessionId ?? activeId;
    const topicId = paramTopicId !== undefined ? paramTopicId : activeTopicId;

    const agentStoreState = getAgentStoreState();
    const agentConfigData = agentSelectors.currentAgentConfig(agentStoreState);

    // Get tools manifest map
    const toolsEngine = createAgentToolsEngine({
      model: agentConfigData.model,
      provider: agentConfigData.provider!,
    });
    const { enabledToolIds } = toolsEngine.generateToolsDetailed({
      model: agentConfigData.model,
      provider: agentConfigData.provider!,
      toolIds: agentConfigData.plugins,
    });
    const toolManifestMap = Object.fromEntries(
      toolsEngine.getEnabledPluginManifests(enabledToolIds).entries(),
    );

    // Get user intervention config
    const userStore = getUserStoreState();
    const userInterventionConfig = {
      approvalMode: toolInterventionSelectors.approvalMode(userStore),
      allowList: toolInterventionSelectors.allowList(userStore),
    };

    // Create initial state or use provided state
    const state =
      initialState ||
      AgentRuntime.createInitialState({
        sessionId,
        messages,
        maxSteps: 400,
        metadata: {
          sessionId,
          topicId,
          threadId,
        },
        toolManifestMap,
        userInterventionConfig,
      });

    // Create initial context or use provided context
    const context: AgentRuntimeContext = initialContext || {
      phase: 'init',
      payload: {
        model: agentConfigData.model,
        provider: agentConfigData.provider,
        parentMessageId,
      },
      session: {
        sessionId,
        messageCount: messages.length,
        status: state.status,
        stepCount: 0,
      },
    };

    return { state, context };
  },

  internal_fetchAIChatMessage: async ({ messages, messageId, params, provider, model }) => {
    const {
      internal_toggleChatLoading,
      refreshMessages,
      optimisticUpdateMessageContent,
      internal_dispatchMessage,
      internal_toggleToolCallingStreaming,
      internal_toggleChatReasoning,
    } = get();

    const abortController = internal_toggleChatLoading(
      true,
      messageId,
      n('generateMessage(start)', { messageId, messages }),
    );

    const agentConfig =
      params?.agentConfig || agentSelectors.currentAgentConfig(getAgentStoreState());
    const chatConfig = agentChatConfigSelectors.currentChatConfig(getAgentStoreState());

    // ================================== //
    //   messages uniformly preprocess    //
    // ================================== //
    // 4. handle max_tokens
    agentConfig.params.max_tokens = chatConfig.enableMaxTokens
      ? agentConfig.params.max_tokens
      : undefined;

    // 5. handle reasoning_effort
    agentConfig.params.reasoning_effort = chatConfig.enableReasoningEffort
      ? agentConfig.params.reasoning_effort
      : undefined;

    let isFunctionCall = false;
    let tools: ChatToolPayload[] | undefined;
    let tool_calls: MessageToolCall[] | undefined;
    let finalUsage;
    let msgTraceId: string | undefined;
    let output = '';
    let thinking = '';
    let thinkingStartAt: number;
    let duration: number | undefined;
    // to upload image
    const uploadTasks: Map<string, Promise<{ id?: string; url?: string }>> = new Map();

    // Throttle tool_calls updates to prevent excessive re-renders (max once per 300ms)
    const throttledUpdateToolCalls = throttle(
      (toolCalls: any[]) => {
        internal_dispatchMessage({
          id: messageId,
          type: 'updateMessage',
          value: { tools: get().internal_transformToolCalls(toolCalls) },
        });
      },
      300,
      { leading: true, trailing: true },
    );

    const historySummary = chatConfig.enableCompressHistory
      ? topicSelectors.currentActiveTopicSummary(get())
      : undefined;
    await chatService.createAssistantMessageStream({
      abortController,
      params: {
        messages,
        model,
        provider,
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
      onErrorHandle: async (error) => {
        await messageService.updateMessageError(messageId, error);
        await refreshMessages();
      },
      onFinish: async (
        content,
        { traceId, observationId, toolCalls, reasoning, grounding, usage, speed },
      ) => {
        // if there is traceId, update it
        if (traceId) {
          msgTraceId = traceId;
          messageService.updateMessage(messageId, {
            traceId,
            observationId: observationId ?? undefined,
          });
        }

        // 等待所有图片上传完成
        let finalImages: ChatImageItem[] = [];

        if (uploadTasks.size > 0) {
          try {
            // 等待所有上传任务完成
            const uploadResults = await Promise.all(uploadTasks.values());

            // 使用上传后的 S3 URL 替换原始图像数据
            finalImages = uploadResults.filter((i) => !!i.url) as ChatImageItem[];
          } catch (error) {
            console.error('Error waiting for image uploads:', error);
          }
        }

        let parsedToolCalls = toolCalls;
        if (parsedToolCalls && parsedToolCalls.length > 0) {
          // Flush any pending throttled updates before finalizing
          throttledUpdateToolCalls.flush();
          internal_toggleToolCallingStreaming(messageId, undefined);

          tools = get().internal_transformToolCalls(parsedToolCalls);
          tool_calls = toolCalls;

          parsedToolCalls = parsedToolCalls.map((item) => ({
            ...item,
            function: {
              ...item.function,
              arguments: !!item.function.arguments ? item.function.arguments : '{}',
            },
          }));

          isFunctionCall = true;
        }

        finalUsage = usage;
        internal_toggleChatReasoning(false, messageId, n('toggleChatReasoning/false') as string);

        // update the content after fetch result
        await optimisticUpdateMessageContent(messageId, content, {
          toolCalls: parsedToolCalls,
          reasoning: !!reasoning
            ? { ...reasoning, duration: duration && !isNaN(duration) ? duration : undefined }
            : undefined,
          search: !!grounding?.citations ? grounding : undefined,
          imageList: finalImages.length > 0 ? finalImages : undefined,
          metadata: speed ? { ...usage, ...speed } : usage,
        });
      },
      onMessageHandle: async (chunk) => {
        switch (chunk.type) {
          case 'grounding': {
            // if there is no citations, then stop
            if (
              !chunk.grounding ||
              !chunk.grounding.citations ||
              chunk.grounding.citations.length <= 0
            )
              return;

            internal_dispatchMessage({
              id: messageId,
              type: 'updateMessage',
              value: {
                search: {
                  citations: chunk.grounding.citations,
                  searchQueries: chunk.grounding.searchQueries,
                },
              },
            });
            break;
          }

          case 'base64_image': {
            internal_dispatchMessage({
              id: messageId,
              type: 'updateMessage',
              value: {
                imageList: chunk.images.map((i) => ({ id: i.id, url: i.data, alt: i.id })),
              },
            });
            const image = chunk.image;

            const task = getFileStoreState()
              .uploadBase64FileWithProgress(image.data)
              .then((value) => ({
                id: value?.id,
                url: value?.url,
                alt: value?.filename || value?.id,
              }));

            uploadTasks.set(image.id, task);

            break;
          }

          case 'text': {
            output += chunk.text;

            // if there is no duration, it means the end of reasoning
            if (!duration) {
              duration = Date.now() - thinkingStartAt;

              const isInChatReasoning = get().reasoningLoadingIds.includes(messageId);
              if (isInChatReasoning) {
                internal_toggleChatReasoning(
                  false,
                  messageId,
                  n('toggleChatReasoning/false') as string,
                );
              }
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
              internal_toggleChatReasoning(
                true,
                messageId,
                n('toggleChatReasoning/true') as string,
              );
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
            throttledUpdateToolCalls(chunk.tool_calls);
            isFunctionCall = true;
            const isInChatReasoning = get().reasoningLoadingIds.includes(messageId);
            if (isInChatReasoning) {
              if (!duration) {
                duration = Date.now() - thinkingStartAt;
              }

              internal_toggleChatReasoning(
                false,
                messageId,
                n('toggleChatReasoning/false') as string,
              );
            }
          }
        }
      },
    });

    internal_toggleChatLoading(false, messageId, n('generateMessage(end)') as string);

    return {
      isFunctionCall,
      traceId: msgTraceId,
      content: output,
      tools,
      usage: finalUsage,
      tool_calls,
    };
  },

  internal_execAgentRuntime: async (params) => {
    const {
      messages: originalMessages,
      parentMessageId,
      parentMessageType,
      sessionId: paramSessionId,
      topicId: paramTopicId,
    } = params;

    // Use provided sessionId/topicId or fallback to global state
    const { activeId, activeTopicId } = get();
    const sessionId = paramSessionId ?? activeId;
    const topicId = paramTopicId !== undefined ? paramTopicId : activeTopicId;
    const messageKey = messageMapKey(sessionId, topicId);

    log(
      '[internal_execAgentRuntime] start, sessionId: %s, topicId: %s, messageKey: %s, parentMessageId: %s, parentMessageType: %s, messages count: %d',
      sessionId,
      topicId,
      messageKey,
      parentMessageId,
      parentMessageType,
      originalMessages.length,
    );

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
    // Skip RAG preprocessing if initialState is provided (messages already preprocessed)
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
        params,
        skipCreateFirstMessage: params.skipCreateFirstMessage,
      }),
    });

    // Create agent state and context with user intervention config
    const { state: initialAgentState, context: initialAgentContext } =
      get().internal_createAgentState({
        messages,
        parentMessageId: params.parentMessageId,
        sessionId,
        topicId,
        threadId: params.threadId,
        initialState: params.initialState,
        initialContext: params.initialContext,
      });

    let state = initialAgentState;
    let nextContext = initialAgentContext;

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
        switch (event.type) {
          case 'done': {
            log('[internal_execAgentRuntime] Received done event');
            break;
          }

          case 'error': {
            log('[internal_execAgentRuntime] Received error event: %o', event.error);
            // Find the assistant message to update error
            const currentMessages = get().messagesMap[messageKey] || [];
            const assistantMessage = currentMessages.findLast((m) => m.role === 'assistant');
            if (assistantMessage) {
              await messageService.updateMessageError(assistantMessage.id, event.error);
            }
            const finalMessages = get().messagesMap[messageKey] || [];
            get().replaceMessages(finalMessages);
            break;
          }
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
        await get().optimisticUpdateMessageRAG(assistantMessage.id, params.ragMetadata);
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
});
