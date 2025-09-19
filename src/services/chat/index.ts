import {
  AgentRuntimeError,
  ChatCompletionErrorPayload,
  ModelProvider,
} from '@lobechat/model-runtime';
import { ChatErrorType, TracePayload, TraceTagMap } from '@lobechat/types';
import { PluginRequestPayload, createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';
import { merge } from 'lodash-es';

import { enableAuth } from '@/const/auth';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { isDeprecatedEdition, isDesktop } from '@/const/version';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { getSessionStoreState } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { getToolStoreState } from '@/store/tool';
import { pluginSelectors, toolSelectors } from '@/store/tool/selectors';
import { getUserStoreState, useUserStore } from '@/store/user';
import {
  preferenceSelectors,
  userGeneralSettingsSelectors,
  userProfileSelectors,
} from '@/store/user/selectors';
import { WebBrowsingManifest } from '@/tools/web-browsing';
import { WorkingModel } from '@/types/agent';
import { ChatMessage } from '@/types/message';
import type { ChatStreamPayload } from '@/types/openai/chat';
import { fetchWithInvokeStream } from '@/utils/electron/desktopRemoteRPCFetch';
import { createErrorResponse } from '@/utils/errorResponse';
import {
  FetchSSEOptions,
  fetchSSE,
  getMessageError,
  standardizeAnimationStyle,
} from '@/utils/fetch';
import { createTraceHeader, getTraceId } from '@/utils/trace';

import { createHeaderWithAuth } from '../_auth';
import { API_ENDPOINTS } from '../_url';
import { initializeWithClientStore } from './clientModelRuntime';
import { contextEngineering } from './contextEngineering';
import { findDeploymentName, isCanUseFC, isEnableFetchOnClient } from './helper';
import { FetchOptions } from './types';

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
    const aiInfraStoreState = getAiInfraStoreState();
    const enabledSearch = chatConfig.searchMode !== 'off';
    const isProviderHasBuiltinSearch = aiProviderSelectors.isProviderHasBuiltinSearch(
      payload.provider!,
    )(aiInfraStoreState);
    const isModelHasBuiltinSearch = aiModelSelectors.isModelHasBuiltinSearch(
      payload.model,
      payload.provider!,
    )(aiInfraStoreState);
    const isModelBuiltinSearchInternal = aiModelSelectors.isModelBuiltinSearchInternal(
      payload.model,
      payload.provider!,
    )(aiInfraStoreState);

    const useModelSearch =
      ((isProviderHasBuiltinSearch || isModelHasBuiltinSearch) && chatConfig.useModelBuiltinSearch) || isModelBuiltinSearchInternal;

    const useApplicationBuiltinSearchTool = enabledSearch && !useModelSearch;

    const pluginIds = [...(enabledPlugins || [])];

    if (useApplicationBuiltinSearchTool) {
      pluginIds.push(WebBrowsingManifest.identifier);
    }

    // ============  1. preprocess messages   ============ //

    const agentStoreState = getAgentStoreState();
    const agentConfig = agentSelectors.currentAgentConfig(agentStoreState);

    // Apply context engineering with preprocessing configuration
    const oaiMessages = await contextEngineering(
      {
        enableHistoryCount: agentChatConfigSelectors.enableHistoryCount(agentStoreState),
        // include user messages
        historyCount: agentChatConfigSelectors.historyCount(agentStoreState) + 2,
        inputTemplate: chatConfig.inputTemplate,
        messages,
        model: payload.model,
        provider: payload.provider!,
        systemRole: agentConfig.systemRole,
        tools: pluginIds,
      },
      options,
    );

    // ============  2. preprocess tools   ============ //

    const tools = this.prepareTools(pluginIds, {
      model: payload.model,
      provider: payload.provider!,
    });

    // ============  3. process extend params   ============ //

    let extendParams: Record<string, any> = {};

    const isModelHasExtendParams = aiModelSelectors.isModelHasExtendParams(
      payload.model,
      payload.provider!,
    )(aiInfraStoreState);

    // model
    if (isModelHasExtendParams) {
      const modelExtendParams = aiModelSelectors.modelExtendParams(
        payload.model,
        payload.provider!,
      )(aiInfraStoreState);
      // if model has extended params, then we need to check if the model can use reasoning

      if (modelExtendParams!.includes('enableReasoning')) {
        if (chatConfig.enableReasoning) {
          extendParams.thinking = {
            budget_tokens: chatConfig.reasoningBudgetToken || 1024,
            type: 'enabled',
          };
        } else {
          extendParams.thinking = {
            budget_tokens: 0,
            type: 'disabled',
          };
        }
      } else if (modelExtendParams!.includes('reasoningBudgetToken')) {
        // For models that only have reasoningBudgetToken without enableReasoning
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

      if (modelExtendParams!.includes('reasoningEffort') && chatConfig.reasoningEffort) {
        extendParams.reasoning_effort = chatConfig.reasoningEffort;
      }

      if (modelExtendParams!.includes('gpt5ReasoningEffort') && chatConfig.gpt5ReasoningEffort) {
        extendParams.reasoning_effort = chatConfig.gpt5ReasoningEffort;
      }

      if (modelExtendParams!.includes('textVerbosity') && chatConfig.textVerbosity) {
        extendParams.verbosity = chatConfig.textVerbosity;
      }

      if (modelExtendParams!.includes('thinking') && chatConfig.thinking) {
        extendParams.thinking = { type: chatConfig.thinking };
      }

      if (
        modelExtendParams!.includes('thinkingBudget') &&
        chatConfig.thinkingBudget !== undefined
      ) {
        extendParams.thinkingBudget = chatConfig.thinkingBudget;
      }

      if (modelExtendParams!.includes('urlContext') && chatConfig.urlContext) {
        extendParams.urlContext = chatConfig.urlContext;
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

    const apiMode = aiProviderSelectors.isProviderEnableResponseApi(provider)(
      getAiInfraStoreState(),
    )
      ? 'responses'
      : undefined;

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

    const { DEFAULT_MODEL_PROVIDER_LIST } = await import('@/config/modelProviders');
    const providerConfig = DEFAULT_MODEL_PROVIDER_LIST.find((item) => item.id === provider);

    let sdkType = provider;
    const isBuiltin = Object.values(ModelProvider).includes(provider as any);

    // TODO: remove `!isDeprecatedEdition` condition in V2.0
    if (!isDeprecatedEdition && !isBuiltin) {
      const providerConfig =
        aiProviderSelectors.providerConfigById(provider)(getAiInfraStoreState());

      sdkType = providerConfig?.settings.sdkType || 'openai';
    }

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
      const oaiMessages = await contextEngineering({
        messages: params.messages as any,
        model: params.model!,
        provider: params.provider!,
        tools: params.plugins,
      });
      const tools = this.prepareTools(params.plugins || [], {
        model: params.model!,
        provider: params.provider!,
      });

      // remove plugins
      delete params.plugins;
      await this.getChatCompletion(
        { ...params, messages: oaiMessages, tools },
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
    /**
     * if enable login and not signed in, return unauthorized error
     */
    const userStore = useUserStore.getState();
    if (enableAuth && !userStore.isSignedIn) {
      throw AgentRuntimeError.createError(ChatErrorType.InvalidAccessCode);
    }

    const agentRuntime = await initializeWithClientStore(params.provider, params.payload);
    const data = params.payload as ChatStreamPayload;

    return agentRuntime.chat(data, { signal: params.signal });
  };

  private prepareTools = (pluginIds: string[], { model, provider }: WorkingModel) => {
    let filterTools = toolSelectors.enabledSchema(pluginIds)(getToolStoreState());

    // check this model can use function call
    const canUseFC = isCanUseFC(model, provider!);

    // the rule that model can use tools:
    // 1. tools is not empty
    // 2. model can use function call
    const shouldUseTools = filterTools.length > 0 && canUseFC;

    return shouldUseTools ? filterTools : undefined;
  };
}

export const chatService = new ChatService();
