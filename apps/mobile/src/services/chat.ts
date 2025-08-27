import { merge } from 'lodash-es';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { TracePayload, TraceTagMap } from '@/const/trace';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { getSessionStoreState } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { ChatImageItem, ChatMessage } from '@/types/message';
import type { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';
import { UserMessageContentPart } from '@/types/openai/chat';
import { FetchSSEOptions, fetchSSE, standardizeAnimationStyle } from '@/utils/fetch';
import { createTraceHeader } from '@/utils/trace';

import { API_ENDPOINTS } from './_url';
import { createHeaderWithAuth } from './_auth/header';
import { ModelProvider } from '@/libs/model-runtime/types/type';

const isCanUseVision = (model: string, provider: string) => {
  return aiModelSelectors.isModelSupportVision(model, provider)(getAiInfraStoreState());
};

/**
 * Find deployment name for Azure and other providers that use deployment names
 */
const findDeploymentName = (model: string, provider: string) => {
  let deploymentId = model;

  // find the model by id
  const modelItem = getAiInfraStoreState().enabledAiModels?.find(
    (i) => i.id === model && i.providerId === provider,
  );

  if (modelItem && modelItem.config?.deploymentName) {
    deploymentId = modelItem.config?.deploymentName;
  }

  return deploymentId;
};

// Mobile client-side fetch not supported yet, keeping this function for future extension
// const _isEnableFetchOnClient = (provider: string) => {
//   return aiProviderSelectors.isProviderFetchOnClient(provider)(getAiInfraStoreState());
// };

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
   * Loading state change handler function
   * @param loading - Whether in loading state
   */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * Request object
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
    { messages, ...params }: GetChatCompletionPayload,
    options?: FetchOptions,
  ) => {
    // Remove plugins field as it's not supported by most providers
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { plugins: _plugins, ...cleanParams } = params;

    const payload = merge(
      {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
      },
      cleanParams,
    );

    // ============  1. preprocess messages   ============ //
    const oaiMessages = await this.processMessages({
      messages,
      model: payload.model,
      provider: payload.provider!,
    });

    // ============  2. process extend params   ============ //
    const chatConfig = agentChatConfigSelectors.currentChatConfig(getAgentStoreState());
    const aiInfraStoreState = getAiInfraStoreState();
    let extendParams: Record<string, any> = {};

    const isModelHasExtendParams = aiModelSelectors.isModelHasExtendParams(
      payload.model,
      payload.provider!,
    )(aiInfraStoreState);

    // model reasoning parameters
    if (isModelHasExtendParams) {
      const modelExtendParams = aiModelSelectors.modelExtendParams(
        payload.model,
        payload.provider!,
      )(aiInfraStoreState);

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

      if (modelExtendParams!.includes('thinking') && chatConfig.thinking) {
        extendParams.thinking = { type: chatConfig.thinking };
      }

      if (
        modelExtendParams!.includes('thinkingBudget') &&
        chatConfig.thinkingBudget !== undefined
      ) {
        extendParams.thinkingBudget = chatConfig.thinkingBudget;
      }
    }

    return this.getChatCompletion(
      {
        ...params,
        ...extendParams,
        messages: oaiMessages,
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

    const { provider = 'openai', ...res } = params;

    // =================== process model =================== //
    let model = res.model || DEFAULT_AGENT_CONFIG.model;

    // if the provider is Azure, get the deployment name as the request model
    const providersWithDeploymentName = ['azure', 'volcengine', 'azureai', 'qwen'] as string[];

    if (providersWithDeploymentName.includes(provider)) {
      model = findDeploymentName(model, provider);
    }

    const apiMode = aiProviderSelectors.isProviderEnableResponseApi(provider)(
      getAiInfraStoreState(),
    )
      ? 'responses'
      : undefined;

    // Remove plugins field as it's not supported by most providers
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { plugins: _plugins, ...cleanRes } = res;

    const payload = merge(
      { model: DEFAULT_AGENT_CONFIG.model, stream: true, ...DEFAULT_AGENT_CONFIG.params },
      { ...cleanRes, apiMode, model },
    );

    /**
     * Use browser agent runtime for client-side fetch
     * Note: Mobile client-side fetch not supported yet, all requests go through server
     */
    // const _enableFetchOnClient = false; // Mobile端强制使用服务端

    const traceHeader = createTraceHeader({ ...options?.trace });

    const headers = await createHeaderWithAuth({
      headers: { 'Content-Type': 'application/json', ...traceHeader },
      provider,
    });
    let sdkType = provider;
    const isBuiltin = Object.values(ModelProvider).includes(provider as any);

    if (!isBuiltin) {
      const providerConfig =
        aiProviderSelectors.providerConfigById(provider)(getAiInfraStoreState());
      console.log(providerConfig, 'providerConfig');
      sdkType = providerConfig?.settings.sdkType || 'openai';
    }

    // Mobile uses smooth transition mode for typewriter effect
    const userPreferTransitionMode = { text: 'smooth' as const };

    // Response animation settings
    const mergedResponseAnimation = [userPreferTransitionMode, responseAnimation].reduce(
      (acc, cur) => merge(acc, standardizeAnimationStyle(cur)),
      {},
    );
    return fetchSSE(API_ENDPOINTS.chat(sdkType), {
      body: JSON.stringify(payload),
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
      const oaiMessages = await this.processMessages({
        messages: params.messages as any,
        model: params.model!,
        provider: params.provider!,
      });

      await this.getChatCompletion(
        { ...params, messages: oaiMessages },
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

  private processMessages = async ({
    messages = [],
    model,
    provider,
  }: {
    messages: ChatMessage[];
    model: string;
    provider: string;
  }): Promise<OpenAIChatMessage[]> => {
    // handle content type for vision model
    const getUserContent = async (m: ChatMessage) => {
      // only if message doesn't have images, return the plain content
      if (!m.imageList || m.imageList.length === 0) return m.content;

      const imageList = m.imageList || [];
      const imageContentParts = await this.processImageList({ imageList, model, provider });

      return [{ text: m.content, type: 'text' }, ...imageContentParts] as UserMessageContentPart[];
    };

    const getAssistantContent = async (m: ChatMessage) => {
      // signature is a signal of anthropic thinking mode
      const shouldIncludeThinking = m.reasoning && !!m.reasoning?.signature;

      if (shouldIncludeThinking) {
        return [
          {
            signature: m.reasoning!.signature,
            thinking: m.reasoning!.content,
            type: 'thinking',
          },
          { text: m.content, type: 'text' },
        ] as UserMessageContentPart[];
      }

      if (m.imageList && m.imageList.length > 0) {
        const imageContentParts = await this.processImageList({
          imageList: m.imageList,
          model,
          provider,
        });
        return [
          !!m.content ? { text: m.content, type: 'text' } : undefined,
          ...imageContentParts,
        ].filter(Boolean) as UserMessageContentPart[];
      }

      return m.content;
    };

    const postMessages = await Promise.all(
      messages.map(async (m): Promise<OpenAIChatMessage> => {
        switch (m.role) {
          case 'user': {
            return { content: await getUserContent(m), role: m.role };
          }

          case 'assistant': {
            const content = await getAssistantContent(m);
            return { content, role: m.role };
          }

          default: {
            return { content: m.content, role: m.role as any };
          }
        }
      }),
    );

    return postMessages;
  };

  /**
   * Process imageList: convert local URLs to base64 and format as UserMessageContentPart
   * Note: Mobile simplified implementation, does not handle local file conversion
   */
  private processImageList = async ({
    model,
    provider,
    imageList,
  }: {
    imageList: ChatImageItem[];
    model: string;
    provider: string;
  }) => {
    if (!isCanUseVision(model, provider)) {
      return [];
    }

    return imageList.map((image) => {
      return { image_url: { detail: 'auto', url: image.url }, type: 'image_url' } as const;
    });
  };

  private mapTrace = (trace?: TracePayload, tag?: TraceTagMap): TracePayload => {
    const tags = sessionMetaSelectors.currentAgentMeta(getSessionStoreState()).tags || [];

    // Mobile disables trace functionality by default
    const enabled = false;

    if (!enabled) return { ...trace, enabled: false };

    return {
      ...trace,
      enabled: true,
      tags: [tag, ...(trace?.tags || []), ...tags].filter(Boolean) as string[],
      userId: useUserStore.getState().user?.id,
    };
  };
}

export const chatService = new ChatService();
