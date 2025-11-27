import {
  FetchSSEOptions,
  fetchSSE,
  getMessageError,
  standardizeAnimationStyle,
} from '@lobechat/fetch-sse';
import { AgentRuntimeError, ChatCompletionErrorPayload } from '@lobechat/model-runtime';
import { ChatErrorType, TracePayload, TraceTagMap, UIChatMessage } from '@lobechat/types';
import { PluginRequestPayload, createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';
import { merge } from 'lodash-es';
import { ModelProvider } from 'model-bank';

import { enableAuth } from '@/const/auth';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { isDesktop } from '@/const/version';
import { getSearchConfig } from '@/helpers/getSearchConfig';
import { createAgentToolsEngine, createToolsEngine } from '@/helpers/toolEngineering';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { getToolStoreState } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { getUserStoreState, useUserStore } from '@/store/user';
import {
  preferenceSelectors,
  userGeneralSettingsSelectors,
  userProfileSelectors,
} from '@/store/user/selectors';
import { MemoryManifest } from '@/tools/memory';
import type { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';
import { fetchWithInvokeStream } from '@/utils/electron/desktopRemoteRPCFetch';
import { createErrorResponse } from '@/utils/errorResponse';
import { createTraceHeader, getTraceId } from '@/utils/trace';

import { createHeaderWithAuth } from '../_auth';
import { API_ENDPOINTS } from '../_url';
import { findDeploymentName, isEnableFetchOnClient, resolveRuntimeProvider } from './helper';
import {
  contextEngineering,
  getTargetAgentId,
  initializeWithClientStore,
  resolveAgentConfig,
  resolveModelExtendParams,
  resolveUserMemories,
} from './mecha';
import { FetchOptions } from './types';

interface GetChatCompletionPayload extends Partial<Omit<ChatStreamPayload, 'messages'>> {
  agentId?: string;
  messages: UIChatMessage[];
}

type ChatStreamInputParams = Partial<Omit<ChatStreamPayload, 'messages'>> & {
  messages?: (UIChatMessage | OpenAIChatMessage)[];
};

interface FetchAITaskResultParams extends FetchSSEOptions {
  abortController?: AbortController;
  onError?: (e: Error, rawError?: any) => void;
  /**
   * Loading state change handler function
   * @param loading - Whether in loading state
   */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * Request object
   */
  params: ChatStreamInputParams;
  trace?: TracePayload;
}

interface CreateAssistantMessageStream extends FetchSSEOptions {
  abortController?: AbortController;
  historySummary?: string;
  params: GetChatCompletionPayload;
  trace?: TracePayload;
}

class ChatService {
  createAssistantMessage = async (
    { plugins: enabledPlugins, messages, agentId, ...params }: GetChatCompletionPayload,
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

    // =================== 1. resolve agent config =================== //

    const targetAgentId = getTargetAgentId(agentId);

    // Resolve agent config with builtin agent runtime config merged
    const { agentConfig, chatConfig } = resolveAgentConfig({
      agentId: targetAgentId,
      model: payload.model,
      provider: payload.provider,
    });

    // Get search config with agentId for agent-specific settings
    const searchConfig = getSearchConfig(payload.model, payload.provider!, targetAgentId);
    const pluginIds =
      enabledPlugins && enabledPlugins.length > 0
        ? [...enabledPlugins]
        : [...(agentConfig.plugins ?? [])];

    const toolsEngine = createAgentToolsEngine({
      model: payload.model,
      provider: payload.provider!,
    });

    const { tools, enabledToolIds } = toolsEngine.generateToolsDetailed({
      model: payload.model,
      provider: payload.provider!,
      toolIds: pluginIds,
    });

    // =================== 1.1 process user memories =================== //

    const isMemoryPluginEnabled =
      pluginIds.includes(MemoryManifest.identifier) ||
      enabledToolIds.includes(MemoryManifest.identifier);

    const userMemories = await resolveUserMemories({
      isMemoryPluginEnabled,
      messages,
    });

    // Apply context engineering with preprocessing configuration
    // Note: agentConfig.systemRole is already resolved by resolveAgentConfig for builtin agents
    const modelMessages = await contextEngineering({
      enableHistoryCount:
        agentChatConfigSelectors.getEnableHistoryCountById(targetAgentId)(getAgentStoreState()),
      historyCount:
        agentChatConfigSelectors.getHistoryCountById(targetAgentId)(getAgentStoreState()) + 2,
      inputTemplate: chatConfig.inputTemplate,
      messages,
      model: payload.model,
      provider: payload.provider!,
      sessionId: options?.trace?.sessionId,
      systemRole: agentConfig.systemRole,
      tools: enabledToolIds,
      userMemories,
    });

    // ============  3. process extend params   ============ //

    const extendParams = resolveModelExtendParams({
      chatConfig,
      model: payload.model,
      provider: payload.provider!,
    });

    return this.getChatCompletion(
      {
        ...params,
        ...extendParams,
        enabledSearch: searchConfig.enabledSearch && searchConfig.useModelSearch ? true : undefined,
        messages: modelMessages,
        // Use the chatConfig from the target agent for streaming preference
        stream: chatConfig.enableStreaming !== false,
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
    historySummary,
  }: CreateAssistantMessageStream) => {
    await this.createAssistantMessage(params, {
      historySummary,
      onAbort,
      onErrorHandle,
      onFinish,
      onMessageHandle,
      signal: abortController?.signal,
      trace: this.mapTrace(trace, TraceTagMap.Chat),
    });
  };

  getChatCompletion = async (params: Partial<ChatStreamPayload>, options?: FetchOptions) => {
    const { signal, responseAnimation } = options ?? {};

    const { provider = ModelProvider.OpenAI, ...res } = params;

    // =================== process model =================== //
    // ===================================================== //
    let model = res.model || DEFAULT_AGENT_CONFIG.model;

    // if the provider is Azure, get the deployment name as the request model
    const providersWithDeploymentName = [
      ModelProvider.Azure,
      ModelProvider.Volcengine,
      ModelProvider.AzureAI,
      ModelProvider.Qwen,
    ] as string[];

    if (providersWithDeploymentName.includes(provider)) {
      model = findDeploymentName(model, provider);
    }

    // When user explicitly disables Responses API, set apiMode to 'chatCompletion'
    // This ensures the user's preference takes priority over provider's useResponseModels config
    // When user enables Responses API, set to 'responses' to force use Responses API
    const apiMode: 'responses' | 'chatCompletion' = aiProviderSelectors.isProviderEnableResponseApi(
      provider,
    )(getAiInfraStoreState())
      ? 'responses'
      : 'chatCompletion';

    // Get the chat config to check streaming preference
    const chatConfig = agentChatConfigSelectors.currentChatConfig(getAgentStoreState());

    const payload = merge(
      {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: chatConfig.enableStreaming !== false, // Default to true if not set
        ...DEFAULT_AGENT_CONFIG.params,
      },
      { ...res, apiMode, model },
    );

    // Convert null to undefined for model params to prevent sending null values to API
    if (payload.temperature === null) payload.temperature = undefined;
    if (payload.top_p === null) payload.top_p = undefined;
    if (payload.presence_penalty === null) payload.presence_penalty = undefined;
    if (payload.frequency_penalty === null) payload.frequency_penalty = undefined;

    const sdkType = resolveRuntimeProvider(provider);

    /**
     * Use browser agent runtime
     */
    let enableFetchOnClient = isEnableFetchOnClient(provider);

    let fetcher: typeof fetch | undefined = undefined;

    // Add desktop remote RPC fetch support
    if (isDesktop) {
      fetcher = fetchWithInvokeStream;
    } else if (enableFetchOnClient) {
      /**
       * Notes:
       * 1. Browser agent runtime will skip auth check if a key and endpoint provided by
       *    user which will cause abuse of plugins services
       * 2. This feature will be disabled by default
       */
      fetcher = async () => {
        try {
          return await this.fetchOnClient({ payload, provider, runtimeProvider: sdkType, signal });
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

    const { DEFAULT_MODEL_PROVIDER_LIST } = await import('@/config/modelProviders');
    const providerConfig = DEFAULT_MODEL_PROVIDER_LIST.find((item) => item.id === provider);

    const userPreferTransitionMode =
      userGeneralSettingsSelectors.transitionMode(getUserStoreState());

    // The order of the array is very important.
    const mergedResponseAnimation = [
      providerConfig?.settings?.responseAnimation || {},
      userPreferTransitionMode,
      responseAnimation,
    ].reduce((acc, cur) => merge(acc, standardizeAnimationStyle(cur)), {});

    return fetchSSE(API_ENDPOINTS.chat(sdkType), {
      body: JSON.stringify(payload),
      fetcher: fetcher,
      headers,
      method: 'POST',
      onAbort: options?.onAbort,
      onErrorHandle: options?.onErrorHandle,
      onFinish: options?.onFinish,
      onMessageHandle: options?.onMessageHandle,
      responseAnimation: mergedResponseAnimation,
      signal,
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
      const llmMessages = await contextEngineering({
        messages: params.messages as any,
        model: params.model!,
        provider: params.provider!,
        tools: params.plugins,
      });
      // Use simple tools engine without complex search logic
      const toolsEngine = createToolsEngine();
      const tools = toolsEngine.generateTools({
        model: params.model!,
        provider: params.provider!,
        toolIds: params.plugins,
      });

      // remove plugins
      delete params.plugins;
      await this.getChatCompletion(
        { ...params, messages: llmMessages, tools },
        {
          onErrorHandle: (error) => {
            errorHandle(new Error(error.message), error);
          },
          onFinish,
          onMessageHandle,
          signal: abortController?.signal,
          trace: this.mapTrace(trace, TraceTagMap.SystemChain),
        },
      );

      onLoadingChange?.(false);
    } catch (e) {
      errorHandle(e as Error);
    }
  };

  private mapTrace = (trace?: TracePayload, tag?: TraceTagMap): TracePayload => {
    const tags = agentSelectors.currentAgentMeta(getAgentStoreState()).tags || [];

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
    runtimeProvider: string;
    signal?: AbortSignal;
  }) => {
    /**
     * if enable login and not signed in, return unauthorized error
     */
    const userStore = useUserStore.getState();
    if (enableAuth && !userStore.isSignedIn) {
      throw AgentRuntimeError.createError(ChatErrorType.InvalidAccessCode);
    }

    const agentRuntime = await initializeWithClientStore({
      payload: params.payload,
      provider: params.provider,
      runtimeProvider: params.runtimeProvider,
    });
    const data = params.payload as ChatStreamPayload;

    return agentRuntime.chat(data, { signal: params.signal });
  };
}

export const chatService = new ChatService();
