import { PluginRequestPayload, createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';
import { produce } from 'immer';
import { merge } from 'lodash-es';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { TracePayload, TraceTagType } from '@/const/trace';
import { ModelProvider } from '@/libs/agent-runtime';
import { filesSelectors, useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useToolStore } from '@/store/tool';
import { pluginSelectors, toolSelectors } from '@/store/tool/selectors';
import { ChatMessage } from '@/types/message';
import type { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';
import { UserMessageContentPart } from '@/types/openai/chat';
import {OnFinishHandler, fetchSSE, getMessageError, FetchSSEOptions} from '@/utils/fetch';
import { createTraceHeader, getTraceId } from '@/utils/trace';

import { createHeaderWithAuth } from './_auth';
import { API_ENDPOINTS } from './_url';

interface FetchOptions {
  signal?: AbortSignal | undefined;
  trace?: TracePayload;
}

interface GetChatCompletionPayload extends Partial<Omit<ChatStreamPayload, 'messages'>> {
  messages: ChatMessage[];
}

interface FetchAITaskResultParams {
  abortController?: AbortController;
  /**
   * 错误处理函数
   */
  onError?: (e: Error, rawError?: any) => void;
  onFinish?: OnFinishHandler;
  /**
   * 加载状态变化处理函数
   * @param loading - 是否处于加载状态
   */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * 消息处理函数
   * @param text - 消息内容
   */
  onMessageHandle?: (text: string) => void;
  /**
   * 请求对象
   */
  params: Partial<ChatStreamPayload>;
  trace?: TracePayload;
}

interface CreateAssistantMessageStream extends FetchSSEOptions {
  abortController?: AbortController;
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
    // ============  1. preprocess messages   ============ //

    const oaiMessages = this.processMessages({
      messages,
      model: payload.model,
      tools: enabledPlugins,
    });

    // ============  2. preprocess tools   ============ //

    const filterTools = toolSelectors.enabledSchema(enabledPlugins)(useToolStore.getState());

    // check this model can use function call
    const canUseFC = modelProviderSelectors.modelEnabledFunctionCall(payload.model)(
      useGlobalStore.getState(),
    );
    // the rule that model can use tools:
    // 1. tools is not empty
    // 2. model can use function call
    const shouldUseTools = filterTools.length > 0 && canUseFC;

    const tools = shouldUseTools ? filterTools : undefined;

    return this.getChatCompletion({ ...params, messages: oaiMessages, tools }, options);
  };

  createAssistantMessageStream = async ({
    params,
    abortController,
    onAbort,
    onMessageHandle,
    onErrorHandle,
    onFinish,
  }: CreateAssistantMessageStream) => {
    await fetchSSE(() => this.createAssistantMessage(params, { signal: abortController?.signal }), {
      onAbort,
      onErrorHandle,
      onFinish,
      onMessageHandle,
    });
  };

  getChatCompletion = async (params: Partial<ChatStreamPayload>, options?: FetchOptions) => {
    const { signal } = options ?? {};

    const { provider = ModelProvider.OpenAI, ...res } = params;
    const payload = merge(
      {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
      },
      res,
    );

    const traceHeader = createTraceHeader({
      ...options?.trace,
      userId: useGlobalStore.getState().userId,
    });

    const headers = await createHeaderWithAuth({
      headers: { 'Content-Type': 'application/json', ...traceHeader },
      provider,
    });

    return fetch(API_ENDPOINTS.chat(provider), {
      body: JSON.stringify(payload),
      headers,
      method: 'POST',
      signal,
    });
  };

  /**
   * run the plugin api to get result
   * @param params
   * @param options
   */
  runPluginApi = async (params: PluginRequestPayload, options?: FetchOptions) => {
    const s = useToolStore.getState();

    const settings = pluginSelectors.getPluginSettingsById(params.identifier)(s);
    const manifest = pluginSelectors.getPluginManifestById(params.identifier)(s);

    const traceHeader = createTraceHeader({
      ...options?.trace,
      tags: [TraceTagType.ToolCalling],
      userId: useGlobalStore.getState().userId,
    });

    const headers = await createHeaderWithAuth({
      headers: { ...createHeadersWithPluginSettings(settings),        ...traceHeader,},
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
    };

    onLoadingChange?.(true);

    const data = await fetchSSE(
      () => this.getChatCompletion(params, { signal: abortController?.signal, trace: {
          tags: [TraceTagType.SystemChain],
          ...trace,
          userId: useGlobalStore.getState().userId,
        }, }),
      {
        onErrorHandle: (error) => {
          errorHandle(new Error(error.message), error);
        },
        onFinish,
        onMessageHandle,
      },
    ).catch(errorHandle);

    onLoadingChange?.(false);

    return await data?.text();
  };

  private processMessages = ({
    messages,
    tools,
    model,
  }: {
    messages: ChatMessage[];
    model: string;
    tools?: string[];
  }): OpenAIChatMessage[] => {
    // handle content type for vision model
    // for the models with visual ability, add image url to content
    // refs: https://platform.openai.com/docs/guides/vision/quick-start
    const getContent = (m: ChatMessage) => {
      if (!m.files) return m.content;

      const imageList = filesSelectors.getImageUrlOrBase64ByList(m.files)(useFileStore.getState());

      if (imageList.length === 0) return m.content;

      const canUploadFile = modelProviderSelectors.modelEnabledUpload(model)(
        useGlobalStore.getState(),
      );

      if (!canUploadFile) {
        return m.content;
      }

      return [
        { text: m.content, type: 'text' },
        ...imageList.map(
          (i) => ({ image_url: { detail: 'auto', url: i.url }, type: 'image_url' }) as const,
        ),
      ] as UserMessageContentPart[];
    };

    const postMessages = messages.map((m): OpenAIChatMessage => {
      switch (m.role) {
        case 'user': {
          return { content: getContent(m), role: m.role };
        }

        case 'function': {
          const name = m.plugin?.identifier as string;
          return { content: m.content, name, role: m.role };
        }

        default: {
          return { content: m.content, role: m.role };
        }
      }
    });

    return produce(postMessages, (draft) => {
      if (!tools || tools.length === 0) return;
      const hasFC = modelProviderSelectors.modelEnabledFunctionCall(model)(
        useGlobalStore.getState(),
      );
      if (!hasFC) return;

      const systemMessage = draft.find((i) => i.role === 'system');

      const toolsSystemRoles = toolSelectors.enabledSystemRoles(tools)(useToolStore.getState());
      if (!toolsSystemRoles) return;

      if (systemMessage) {
        systemMessage.content = systemMessage.content + '\n\n' + toolsSystemRoles;
      } else {
        draft.unshift({
          content: toolsSystemRoles,
          role: 'system',
        });
      }
    });
  };
}

export const chatService = new ChatService();
