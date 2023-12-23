import { PluginRequestPayload, createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';
import { produce } from 'immer';
import { merge } from 'lodash-es';

import { VISION_MODEL_WHITE_LIST } from '@/const/llm';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { filesSelectors, useFileStore } from '@/store/file';
import { useToolStore } from '@/store/tool';
import { pluginSelectors, toolSelectors } from '@/store/tool/selectors';
import { ChatMessage } from '@/types/message';
import type { OpenAIChatMessage, OpenAIChatStreamPayload } from '@/types/openai/chat';
import { UserMessageContentPart } from '@/types/openai/chat';
import { fetchAIFactory, getMessageError } from '@/utils/fetch';

import { createHeaderWithOpenAI } from './_header';
import { OPENAI_URLS, URLS } from './_url';

const isVisionModel = (model?: string) => model && VISION_MODEL_WHITE_LIST.includes(model);

interface FetchOptions {
  signal?: AbortSignal | undefined;
}

interface GetChatCompletionPayload extends Partial<Omit<OpenAIChatStreamPayload, 'messages'>> {
  messages: ChatMessage[];
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

    // the rule that model can use tools:
    // 1. tools is not empty
    // 2. model is not in vision white list, because vision model can't use tools
    // TODO: we need to find some method to let vision model use tools
    const shouldUseTools = filterTools.length > 0 && !isVisionModel(payload.model);

    const functions = shouldUseTools ? filterTools : undefined;

    return this.getChatCompletion({ ...params, functions, messages: oaiMessages }, options);
  };

  getChatCompletion = (params: Partial<OpenAIChatStreamPayload>, options?: FetchOptions) => {
    const payload = merge(
      {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
      },
      params,
    );

    return fetch(OPENAI_URLS.chat, {
      body: JSON.stringify(payload),
      headers: createHeaderWithOpenAI({ 'Content-Type': 'application/json' }),
      method: 'POST',
      signal: options?.signal,
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

    const gatewayURL = manifest?.gateway;

    const res = await fetch(gatewayURL ?? URLS.plugins, {
      body: JSON.stringify({ ...params, manifest }),
      headers: createHeadersWithPluginSettings(settings),
      method: 'POST',
      signal: options?.signal,
    });

    if (!res.ok) {
      throw await getMessageError(res);
    }

    return await res.text();
  };

  fetchPresetTaskResult = fetchAIFactory(this.getChatCompletion);

  private processMessages = ({
    messages,
    tools,
    model,
  }: {
    messages: ChatMessage[];
    model?: string;
    tools?: string[];
  }): OpenAIChatMessage[] => {
    // handle content type for vision model
    // for the models with visual ability, add image url to content
    // refs: https://platform.openai.com/docs/guides/vision/quick-start
    const getContent = (m: ChatMessage) => {
      if (!m.files) return m.content;

      const imageList = filesSelectors.getImageUrlOrBase64ByList(m.files)(useFileStore.getState());

      if (imageList.length === 0) return m.content;

      if (!isVisionModel(model)) {
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
