import { PluginRequestPayload, createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';
import { produce } from 'immer';
import { merge } from 'lodash-es';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { enableAuth } from '@/const/auth';
import { INBOX_GUIDE_SYSTEMROLE } from '@/const/guide';
import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { TracePayload, TraceTagMap } from '@/const/trace';
import { isDeprecatedEdition, isServerMode } from '@/const/version';
import {
  AgentRuntime,
  AgentRuntimeError,
  ChatCompletionErrorPayload,
  ModelProvider,
} from '@/libs/agent-runtime';
import { filesPrompts } from '@/prompts/files';
import { BuiltinSystemRolePrompts } from '@/prompts/systemRole';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { getSessionStoreState } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { getToolStoreState } from '@/store/tool';
import { pluginSelectors, toolSelectors } from '@/store/tool/selectors';
import { getUserStoreState, useUserStore } from '@/store/user';
import {
  modelConfigSelectors,
  modelProviderSelectors,
  preferenceSelectors,
  userProfileSelectors,
} from '@/store/user/selectors';
import { WebBrowsingManifest } from '@/tools/web-browsing';
import { ChatErrorType } from '@/types/fetch';
import { ChatMessage, MessageToolCall } from '@/types/message';
import type { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';
import { UserMessageContentPart } from '@/types/openai/chat';
import { createErrorResponse } from '@/utils/errorResponse';
import { FetchSSEOptions, fetchSSE, getMessageError } from '@/utils/fetch';
import { genToolCallingName } from '@/utils/toolCall';
import { createTraceHeader, getTraceId } from '@/utils/trace';

import { createHeaderWithAuth, createPayloadWithKeyVaults } from './_auth';
import { API_ENDPOINTS } from './_url';

const isCanUseFC = (model: string, provider: string) => {
  // TODO: remove isDeprecatedEdition condition in V2.0
  if (isDeprecatedEdition) {
    return modelProviderSelectors.isModelEnabledFunctionCall(model)(getUserStoreState());
  }

  return aiModelSelectors.isModelSupportToolUse(model, provider)(getAiInfraStoreState());
};

/**
 * TODO: we need to update this function to auto find deploymentName with provider setting config
 */
const findDeploymentName = (model: string, provider: string) => {
  let deploymentId = model;

  // TODO: remove isDeprecatedEdition condition in V2.0
  if (isDeprecatedEdition) {
    const chatModelCards = modelProviderSelectors.getModelCardsById(ModelProvider.Azure)(
      useUserStore.getState(),
    );

    const deploymentName = chatModelCards.find((i) => i.id === model)?.deploymentName;
    if (deploymentName) deploymentId = deploymentName;
  } else {
    // find the model by id
    const modelItem = getAiInfraStoreState().enabledAiModels?.find(
      (i) => i.id === model && i.providerId === provider,
    );

    if (modelItem && modelItem.config?.deploymentName) {
      deploymentId = modelItem.config?.deploymentName;
    }
  }

  return deploymentId;
};

const isEnableFetchOnClient = (provider: string) => {
  // TODO: remove this condition in V2.0
  if (isDeprecatedEdition) {
    return modelConfigSelectors.isProviderFetchOnClient(provider)(useUserStore.getState());
  } else {
    return aiProviderSelectors.isProviderFetchOnClient(provider)(getAiInfraStoreState());
  }
};

interface FetchOptions extends FetchSSEOptions {
  historySummary?: string;
  isWelcomeQuestion?: boolean;
  signal?: AbortSignal | undefined;
  trace?: TracePayload;
}

interface GetChatCompletionPayload extends Partial<Omit<ChatStreamPayload, 'messages'>> {
  messages: ChatMessage[];
}

interface FetchAITaskResultParams extends FetchSSEOptions {
  abortController?: AbortController;
  onError?: (e: Error, rawError?: any) => void;
  /**
   * 加载状态变化处理函数
   * @param loading - 是否处于加载状态
   */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * 请求对象
   */
  params: Partial<ChatStreamPayload>;
  trace?: TracePayload;
}

interface CreateAssistantMessageStream extends FetchSSEOptions {
  abortController?: AbortController;
  historySummary?: string;
  isWelcomeQuestion?: boolean;
  params: GetChatCompletionPayload;
  trace?: TracePayload;
}

/**
 * Initializes the AgentRuntime with the client store.
 * @param provider - The provider name.
 * @param payload - Init options
 * @returns The initialized AgentRuntime instance
 *
 * **Note**: if you try to fetch directly, use `fetchOnClient` instead.
 */
export function initializeWithClientStore(provider: string, payload: any) {
  /**
   * Since #5267, we map parameters for client-fetch in function `getProviderAuthPayload`
   * which called by `createPayloadWithKeyVaults` below.
   * @see https://github.com/lobehub/lobe-chat/pull/5267
   * @file src/services/_auth.ts
   */
  const providerAuthPayload = { ...payload, ...createPayloadWithKeyVaults(provider) };
  const commonOptions = {
    // Allow OpenAI SDK and Anthropic SDK run on browser
    dangerouslyAllowBrowser: true,
  };
  /**
   * Configuration override order:
   * payload -> providerAuthPayload -> commonOptions
   */
  return AgentRuntime.initializeWithProvider(provider, {
    ...commonOptions,
    ...providerAuthPayload,
    ...payload,
  });
}

class ChatService {
  createAssistantMessage = async (
    { plugins: enabledPlugins, messages, ...params }: GetChatCompletionPayload,
    options?: FetchOptions,
  ) => {
    const payload = merge(
      {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
      },
      params,
    );

    // =================== 0. process search =================== //
    const chatConfig = agentChatConfigSelectors.currentChatConfig(getAgentStoreState());

    const enabledSearch = chatConfig.searchMode !== 'off';
    const isModelHasBuiltinSearch = aiModelSelectors.isModelHasBuiltinSearch(
      payload.model,
      payload.provider!,
    )(getAiInfraStoreState());

    const useModelSearch = isModelHasBuiltinSearch && chatConfig.useModelBuiltinSearch;
    const useApplicationBuiltinSearchTool = enabledSearch && !useModelSearch;

    const pluginIds = [...(enabledPlugins || [])];

    if (useApplicationBuiltinSearchTool) {
      pluginIds.push(WebBrowsingManifest.identifier);
    }

    // ============  1. preprocess messages   ============ //

    const oaiMessages = this.processMessages(
      {
        messages,
        model: payload.model,
        provider: payload.provider!,
        tools: pluginIds,
      },
      options,
    );

    // ============  2. preprocess tools   ============ //

    let filterTools = toolSelectors.enabledSchema(pluginIds)(getToolStoreState());

    // check this model can use function call
    const canUseFC = isCanUseFC(payload.model, payload.provider!);

    // the rule that model can use tools:
    // 1. tools is not empty
    // 2. model can use function call
    const shouldUseTools = filterTools.length > 0 && canUseFC;

    const tools = shouldUseTools ? filterTools : undefined;

    // ============  3. process extend params   ============ //

    let extendParams: Record<string, any> = {};

    const isModelHasExtendParams = aiModelSelectors.isModelHasExtendParams(
      payload.model,
      payload.provider!,
    )(getAiInfraStoreState());

    // model
    if (isModelHasExtendParams) {
      const modelExtendParams = aiModelSelectors.modelExtendParams(
        payload.model,
        payload.provider!,
      )(getAiInfraStoreState());
      // if model has extended params, then we need to check if the model can use reasoning

      if (modelExtendParams!.includes('enableReasoning') && chatConfig.enableReasoning) {
        extendParams.thinking = {
          budget_tokens: chatConfig.reasoningBudgetToken || 1024,
          type: 'enabled',
        };
      }
      if (
        modelExtendParams!.includes('disableContextCaching') &&
        chatConfig.disableContextCaching
      ) {
        extendParams.enabledContextCaching = false;
      }
    }

    return this.getChatCompletion(
      {
        ...params,
        ...extendParams,
        enabledSearch: enabledSearch && useModelSearch ? true : undefined,
        messages: oaiMessages,
        tools,
      },
      options,
    );
  };

  createAssistantMessageStream = async ({
    params,
    abortController,
    onAbort,
    onMessageHandle,
    onErrorHandle,
    onFinish,
    trace,
    isWelcomeQuestion,
    historySummary,
  }: CreateAssistantMessageStream) => {
    await this.createAssistantMessage(params, {
      historySummary,
      isWelcomeQuestion,
      onAbort,
      onErrorHandle,
      onFinish,
      onMessageHandle,
      signal: abortController?.signal,
      trace: this.mapTrace(trace, TraceTagMap.Chat),
    });
  };

  getChatCompletion = async (params: Partial<ChatStreamPayload>, options?: FetchOptions) => {
    const { signal } = options ?? {};

    const { provider = ModelProvider.OpenAI, ...res } = params;

    // =================== process model =================== //
    // ===================================================== //
    let model = res.model || DEFAULT_AGENT_CONFIG.model;

    // if the provider is Azure, get the deployment name as the request model
    const providersWithDeploymentName = [
      ModelProvider.Azure,
      ModelProvider.Volcengine,
      ModelProvider.Doubao,
      ModelProvider.AzureAI,
    ] as string[];

    if (providersWithDeploymentName.includes(provider)) {
      model = findDeploymentName(model, provider);
    }

    const payload = merge(
      { model: DEFAULT_AGENT_CONFIG.model, stream: true, ...DEFAULT_AGENT_CONFIG.params },
      { ...res, model },
    );

    /**
     * Use browser agent runtime
     */
    let enableFetchOnClient = isEnableFetchOnClient(provider);

    let fetcher: typeof fetch | undefined = undefined;

    if (enableFetchOnClient) {
      /**
       * Notes:
       * 1. Browser agent runtime will skip auth check if a key and endpoint provided by
       *    user which will cause abuse of plugins services
       * 2. This feature will be disabled by default
       */
      fetcher = async () => {
        try {
          return await this.fetchOnClient({ payload, provider, signal });
        } catch (e) {
          const {
            errorType = ChatErrorType.BadRequest,
            error: errorContent,
            ...res
          } = e as ChatCompletionErrorPayload;

          const error = errorContent || e;
          // track the error at server side
          console.error(`Route: [${provider}] ${errorType}:`, error);

          return createErrorResponse(errorType, { error, ...res, provider });
        }
      };
    }

    const traceHeader = createTraceHeader({ ...options?.trace });

    const headers = await createHeaderWithAuth({
      headers: { 'Content-Type': 'application/json', ...traceHeader },
      provider,
    });

    const providerConfig = DEFAULT_MODEL_PROVIDER_LIST.find((item) => item.id === provider);

    let sdkType = provider;
    const isBuiltin = Object.values(ModelProvider).includes(provider as any);

    // TODO: remove `!isDeprecatedEdition` condition in V2.0
    if (!isDeprecatedEdition && !isBuiltin) {
      const providerConfig =
        aiProviderSelectors.providerConfigById(provider)(getAiInfraStoreState());

      sdkType = providerConfig?.settings.sdkType || 'openai';
    }

    return fetchSSE(API_ENDPOINTS.chat(sdkType), {
      body: JSON.stringify(payload),
      fetcher: fetcher,
      headers,
      method: 'POST',
      onAbort: options?.onAbort,
      onErrorHandle: options?.onErrorHandle,
      onFinish: options?.onFinish,
      onMessageHandle: options?.onMessageHandle,
      signal,
      smoothing:
        providerConfig?.settings?.smoothing ||
        // @deprecated in V2
        providerConfig?.smoothing ||
        // use smoothing when enable client fetch
        // https://github.com/lobehub/lobe-chat/issues/3800
        enableFetchOnClient,
    });
  };

  /**
   * run the plugin api to get result
   * @param params
   * @param options
   */
  runPluginApi = async (params: PluginRequestPayload, options?: FetchOptions) => {
    const s = getToolStoreState();

    const settings = pluginSelectors.getPluginSettingsById(params.identifier)(s);
    const manifest = pluginSelectors.getToolManifestById(params.identifier)(s);

    const traceHeader = createTraceHeader(this.mapTrace(options?.trace, TraceTagMap.ToolCalling));

    const headers = await createHeaderWithAuth({
      headers: { ...createHeadersWithPluginSettings(settings), ...traceHeader },
    });

    const gatewayURL = manifest?.gateway ?? API_ENDPOINTS.gateway;

    const res = await fetch(gatewayURL, {
      body: JSON.stringify({ ...params, manifest }),
      headers,
      method: 'POST',
      signal: options?.signal,
    });

    if (!res.ok) {
      throw await getMessageError(res);
    }

    const text = await res.text();
    return { text, traceId: getTraceId(res) };
  };

  fetchPresetTaskResult = async ({
    params,
    onMessageHandle,
    onFinish,
    onError,
    onLoadingChange,
    abortController,
    trace,
  }: FetchAITaskResultParams) => {
    const errorHandle = (error: Error, errorContent?: any) => {
      onLoadingChange?.(false);
      if (abortController?.signal.aborted) {
        return;
      }
      onError?.(error, errorContent);
      console.error(error);
    };

    onLoadingChange?.(true);

    try {
      await this.getChatCompletion(params, {
        onErrorHandle: (error) => {
          errorHandle(new Error(error.message), error);
        },
        onFinish,
        onMessageHandle,
        signal: abortController?.signal,
        trace: this.mapTrace(trace, TraceTagMap.SystemChain),
      });

      onLoadingChange?.(false);
    } catch (e) {
      errorHandle(e as Error);
    }
  };

  private processMessages = (
    {
      messages,
      tools,
      model,
      provider,
    }: {
      messages: ChatMessage[];
      model: string;
      provider: string;
      tools?: string[];
    },
    options?: FetchOptions,
  ): OpenAIChatMessage[] => {
    // handle content type for vision model
    // for the models with visual ability, add image url to content
    // refs: https://platform.openai.com/docs/guides/vision/quick-start
    const getContent = (m: ChatMessage) => {
      // only if message doesn't have images and files, then return the plain content
      if ((!m.imageList || m.imageList.length === 0) && (!m.fileList || m.fileList.length === 0))
        return m.content;

      const imageList = m.imageList || [];

      const filesContext = isServerMode ? filesPrompts({ fileList: m.fileList, imageList }) : '';
      return [
        { text: (m.content + '\n\n' + filesContext).trim(), type: 'text' },
        ...imageList.map(
          (i) => ({ image_url: { detail: 'auto', url: i.url }, type: 'image_url' }) as const,
        ),
      ] as UserMessageContentPart[];
    };

    let postMessages = messages.map((m): OpenAIChatMessage => {
      switch (m.role) {
        case 'user': {
          return { content: getContent(m), role: m.role };
        }

        case 'assistant': {
          // signature is a signal of anthropic thinking mode
          const shouldIncludeThinking = m.reasoning && !!m.reasoning?.signature;

          return {
            content: shouldIncludeThinking
              ? [
                  {
                    signature: m.reasoning!.signature,
                    thinking: m.reasoning!.content,
                    type: 'thinking',
                  } as any,
                  { text: m.content, type: 'text' },
                ]
              : m.content,
            role: m.role,
            tool_calls: m.tools?.map(
              (tool): MessageToolCall => ({
                function: {
                  arguments: tool.arguments,
                  name: genToolCallingName(tool.identifier, tool.apiName, tool.type),
                },
                id: tool.id,
                type: 'function',
              }),
            ),
          };
        }

        case 'tool': {
          return {
            content: m.content,
            name: genToolCallingName(m.plugin!.identifier, m.plugin!.apiName, m.plugin?.type),
            role: m.role,
            tool_call_id: m.tool_call_id,
          };
        }

        default: {
          return { content: m.content, role: m.role as any };
        }
      }
    });

    postMessages = produce(postMessages, (draft) => {
      // if it's a welcome question, inject InboxGuide SystemRole
      const inboxGuideSystemRole =
        options?.isWelcomeQuestion &&
        options?.trace?.sessionId === INBOX_SESSION_ID &&
        INBOX_GUIDE_SYSTEMROLE;

      // Inject Tool SystemRole
      const hasTools = tools && tools?.length > 0;
      const hasFC = hasTools && isCanUseFC(model, provider);
      const toolsSystemRoles =
        hasFC && toolSelectors.enabledSystemRoles(tools)(getToolStoreState());

      const injectSystemRoles = BuiltinSystemRolePrompts({
        historySummary: options?.historySummary,
        plugins: toolsSystemRoles as string,
        welcome: inboxGuideSystemRole as string,
      });

      if (!injectSystemRoles) return;

      const systemMessage = draft.find((i) => i.role === 'system');

      if (systemMessage) {
        systemMessage.content = [systemMessage.content, injectSystemRoles]
          .filter(Boolean)
          .join('\n\n');
      } else {
        draft.unshift({
          content: injectSystemRoles,
          role: 'system',
        });
      }
    });

    return this.reorderToolMessages(postMessages);
  };

  private mapTrace = (trace?: TracePayload, tag?: TraceTagMap): TracePayload => {
    const tags = sessionMetaSelectors.currentAgentMeta(getSessionStoreState()).tags || [];

    const enabled = preferenceSelectors.userAllowTrace(getUserStoreState());

    if (!enabled) return { ...trace, enabled: false };

    return {
      ...trace,
      enabled: true,
      tags: [tag, ...(trace?.tags || []), ...tags].filter(Boolean) as string[],
      userId: userProfileSelectors.userId(useUserStore.getState()),
    };
  };

  /**
   * Fetch chat completion on the client side.

   */
  private fetchOnClient = async (params: {
    payload: Partial<ChatStreamPayload>;
    provider: string;
    signal?: AbortSignal;
  }) => {
    const agentRuntime = await initializeWithClientStore(params.provider, params.payload);
    const data = params.payload as ChatStreamPayload;

    /**
     * if enable login and not signed in, return unauthorized error
     */
    const userStore = useUserStore.getState();
    if (enableAuth && !userStore.isSignedIn) {
      throw AgentRuntimeError.createError(ChatErrorType.InvalidAccessCode);
    }

    return agentRuntime.chat(data, { signal: params.signal });
  };

  /**
   * Reorder tool messages to ensure that tool messages are displayed in the correct order.
   * see https://github.com/lobehub/lobe-chat/pull/3155
   */
  private reorderToolMessages = (messages: OpenAIChatMessage[]): OpenAIChatMessage[] => {
    // 1. 先收集所有 assistant 消息中的有效 tool_call_id
    const validToolCallIds = new Set<string>();
    messages.forEach((message) => {
      if (message.role === 'assistant' && message.tool_calls) {
        message.tool_calls.forEach((toolCall) => {
          validToolCallIds.add(toolCall.id);
        });
      }
    });

    // 2. 收集所有有效的 tool 消息
    const toolMessages: Record<string, OpenAIChatMessage> = {};
    messages.forEach((message) => {
      if (
        message.role === 'tool' &&
        message.tool_call_id &&
        validToolCallIds.has(message.tool_call_id)
      ) {
        toolMessages[message.tool_call_id] = message;
      }
    });

    // 3. 重新排序消息
    const reorderedMessages: OpenAIChatMessage[] = [];
    messages.forEach((message) => {
      // 跳过无效的 tool 消息
      if (
        message.role === 'tool' &&
        (!message.tool_call_id || !validToolCallIds.has(message.tool_call_id))
      ) {
        return;
      }

      // 检查是否已经添加过该 tool 消息
      const hasPushed = reorderedMessages.some(
        (m) => !!message.tool_call_id && m.tool_call_id === message.tool_call_id,
      );

      if (hasPushed) return;

      reorderedMessages.push(message);

      // 如果是 assistant 消息且有 tool_calls，添加对应的 tool 消息
      if (message.role === 'assistant' && message.tool_calls) {
        message.tool_calls.forEach((toolCall) => {
          const correspondingToolMessage = toolMessages[toolCall.id];
          if (correspondingToolMessage) {
            reorderedMessages.push(correspondingToolMessage);
            delete toolMessages[toolCall.id];
          }
        });
      }
    });

    return reorderedMessages;
  };
}

export const chatService = new ChatService();
