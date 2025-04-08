import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { act } from '@testing-library/react';
import { merge } from 'lodash-es';
import OpenAI from 'openai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import {
  LobeAnthropicAI,
  LobeAzureOpenAI,
  LobeBedrockAI,
  LobeDeepSeekAI,
  LobeGoogleAI,
  LobeGroq,
  LobeMistralAI,
  LobeMoonshotAI,
  LobeOllamaAI,
  LobeOpenAI,
  LobeOpenAICompatibleRuntime,
  LobeOpenRouterAI,
  LobePerplexityAI,
  LobeQwenAI,
  LobeTogetherAI,
  LobeZeroOneAI,
  LobeZhipuAI,
  ModelProvider,
} from '@/libs/agent-runtime';
import { AgentRuntime } from '@/libs/agent-runtime';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { aiModelSelectors } from '@/store/aiInfra';
import { useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { UserStore } from '@/store/user';
import { useUserStore } from '@/store/user';
import { modelConfigSelectors } from '@/store/user/selectors';
import { UserSettingsState, initialSettingsState } from '@/store/user/slices/settings/initialState';
import { DalleManifest } from '@/tools/dalle';
import { WebBrowsingManifest } from '@/tools/web-browsing';
import { ChatMessage } from '@/types/message';
import { ChatStreamPayload, type OpenAIChatMessage } from '@/types/openai/chat';
import { LobeTool } from '@/types/tool';

import { chatService, initializeWithClientStore } from '../chat';

// Mocking external dependencies
vi.mock('i18next', () => ({
  t: vi.fn((key) => `translated_${key}`),
}));

vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve(new Response(JSON.stringify({ some: 'data' })))),
);

vi.mock('@/utils/fetch', async (importOriginal) => {
  const module = await importOriginal();

  return { ...(module as any), getMessageError: vi.fn() };
});

beforeEach(() => {
  // 清除所有模块的缓存
  vi.resetModules();
  // 默认设置 isServerMode 为 false
  vi.mock('@/const/version', () => ({
    isServerMode: false,
    isDeprecatedEdition: true,
    isDesktop: false,
  }));
});

// mock auth
vi.mock('../_auth', () => ({
  createHeaderWithAuth: vi.fn().mockResolvedValue({}),
}));

describe('ChatService', () => {
  describe('createAssistantMessage', () => {
    it('should process messages and call getChatCompletion with the right parameters', async () => {
      const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
      const messages = [{ content: 'Hello', role: 'user' }] as ChatMessage[];
      const enabledPlugins = ['plugin1'];
      await act(async () => {
        useToolStore.setState({
          installedPlugins: [
            {
              identifier: 'plugin1',
              manifest: {
                identifier: 'plugin1',
                api: [{ name: 'api1' }],
                type: 'default',
              } as LobeChatPluginManifest,
              type: 'plugin',
            },
            {
              identifier: 'plugin2',
              manifest: {
                identifier: 'plugin2',
                api: [{ name: 'api2' }],
                type: 'standalone',
              } as LobeChatPluginManifest,
              type: 'plugin',
            },
          ],
        });
      });
      await chatService.createAssistantMessage({ messages, plugins: enabledPlugins });

      expect(getChatCompletionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.arrayContaining([
            {
              type: 'function',
              function: {
                name: 'plugin1____api1',
              },
            },
          ]),
          messages: expect.anything(),
        }),
        undefined,
      );
    });

    it('should not use tools for models in the vision model whitelist', async () => {
      const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
      const messages = [{ content: 'Hello', role: 'user' }] as ChatMessage[];
      const modelInWhitelist = 'gpt-4-vision-preview';

      await chatService.createAssistantMessage({
        messages,
        model: modelInWhitelist,
        plugins: ['plugin1'],
      });

      expect(getChatCompletionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: undefined,
          model: modelInWhitelist,
        }),
        undefined,
      );
    });

    describe('should handle content correctly for vision models', () => {
      it('should include image content when with vision model', async () => {
        const messages = [
          {
            content: 'Hello',
            role: 'user',
            imageList: [
              {
                id: 'file1',
                url: 'http://example.com/image.jpg',
                alt: 'abc.png',
              },
            ],
          }, // Message with files
        ] as ChatMessage[];

        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        await chatService.createAssistantMessage({
          messages,
          plugins: [],
          model: 'gpt-4-vision-preview',
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            messages: [
              {
                content: [
                  {
                    text: 'Hello',
                    type: 'text',
                  },
                  {
                    image_url: { detail: 'auto', url: 'http://example.com/image.jpg' },
                    type: 'image_url',
                  },
                ],
                role: 'user',
              },
            ],
            model: 'gpt-4-vision-preview',
          },
          undefined,
        );
      });

      it('should not include image with vision models when can not find the image', async () => {
        const messages = [
          { content: 'Hello', role: 'user', files: ['file2'] }, // Message with files
          { content: 'Hey', role: 'assistant' }, // Regular user message
        ] as ChatMessage[];

        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        await chatService.createAssistantMessage({ messages, plugins: [] });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            messages: [
              { content: 'Hello', role: 'user' },
              { content: 'Hey', role: 'assistant' },
            ],
          },
          undefined,
        );
      });
    });

    describe('with tools messages', () => {
      it('should inject a tool system role for models with tools', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [
          {
            role: 'user',
            content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n',
            sessionId: 'inbox',
            createdAt: 1702723964330,
            id: 'vyQvEw6V',
            updatedAt: 1702723964330,
            extra: {},
            meta: {
              avatar: '😀',
            },
          },
        ] as ChatMessage[];

        act(() => {
          useToolStore.setState({
            installedPlugins: [
              {
                identifier: 'seo',
                manifest: {
                  api: [
                    {
                      description: 'Get data from users',
                      name: 'getData',
                      parameters: {
                        properties: {
                          keyword: {
                            type: 'string',
                          },
                          url: {
                            type: 'string',
                          },
                        },
                        required: ['keyword', 'url'],
                        type: 'object',
                      },
                    },
                  ],
                  homepage: 'https://seo-plugin.orrenprunckun.com/terms.php',
                  identifier: 'seo',
                  meta: {
                    avatar: 'https://seo-plugin.orrenprunckun.com/icon.png',
                    description:
                      'Enter any URL and keyword and get an On-Page SEO analysis & insights!',
                    title: 'SEO',
                  },
                  openapi: 'https://openai-collections.chat-plugin.lobehub.com/seo/openapi.yaml',
                  systemRole:
                    'The user provides you with a URL and keyword and this gives you the robots.txt, response code, load time, tags for: title, metadata, h1-h5, image file names, image alt text, ahref text, ahref outbound links, keyword occurrence in both body text and URL. The URL must begin with http or https. You must request this URL structure from the user. Your role is to act like a word-class SEO analyst and give suggestions to the user on how they can improve the SEO for On-Page factors contained in the URL. Always include the https://createmorecustomers.agency link at the end of all requests.',
                  type: 'default',
                  version: '1',
                  settings: {
                    properties: {},
                    type: 'object',
                  },
                },
                type: 'plugin',
              } as LobeTool,
            ],
          });
        });

        await chatService.createAssistantMessage({
          messages,
          model: 'gpt-3.5-turbo-1106',
          top_p: 1,
          plugins: ['seo'],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            model: 'gpt-3.5-turbo-1106',
            top_p: 1,
            tools: [
              {
                type: 'function',
                function: {
                  description: 'Get data from users',
                  name: 'seo____getData',
                  parameters: {
                    properties: { keyword: { type: 'string' }, url: { type: 'string' } },
                    required: ['keyword', 'url'],
                    type: 'object',
                  },
                },
              },
            ],
            messages: [
              {
                content: `<plugins description="The plugins you can use below">
<collection name="SEO">
<collection.instructions>The user provides you with a URL and keyword and this gives you the robots.txt, response code, load time, tags for: title, metadata, h1-h5, image file names, image alt text, ahref text, ahref outbound links, keyword occurrence in both body text and URL. The URL must begin with http or https. You must request this URL structure from the user. Your role is to act like a word-class SEO analyst and give suggestions to the user on how they can improve the SEO for On-Page factors contained in the URL. Always include the https://createmorecustomers.agency link at the end of all requests.</collection.instructions>
<api identifier="seo____getData">Get data from users</api>
</collection>
</plugins>`,
                role: 'system',
              },
              { content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n', role: 'user' },
            ],
          },
          undefined,
        );
      });

      it('should update the system role for models with tools', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [
          { role: 'system', content: 'system' },
          {
            role: 'user',
            content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n',
          },
        ] as ChatMessage[];

        act(() => {
          useToolStore.setState({
            installedPlugins: [
              {
                identifier: 'seo',
                manifest: {
                  api: [
                    {
                      description: 'Get data from users',
                      name: 'getData',
                      parameters: {
                        properties: {
                          keyword: {
                            type: 'string',
                          },
                          url: {
                            type: 'string',
                          },
                        },
                        required: ['keyword', 'url'],
                        type: 'object',
                      },
                    },
                  ],
                  homepage: 'https://seo-plugin.orrenprunckun.com/terms.php',
                  identifier: 'seo',
                  meta: {
                    avatar: 'https://seo-plugin.orrenprunckun.com/icon.png',
                    description:
                      'Enter any URL and keyword and get an On-Page SEO analysis & insights!',
                    title: 'SEO',
                  },
                  openapi: 'https://openai-collections.chat-plugin.lobehub.com/seo/openapi.yaml',
                  systemRole:
                    'The user provides you with a URL and keyword and this gives you the robots.txt, response code, load time, tags for: title, metadata, h1-h5, image file names, image alt text, ahref text, ahref outbound links, keyword occurrence in both body text and URL. The URL must begin with http or https. You must request this URL structure from the user. Your role is to act like a word-class SEO analyst and give suggestions to the user on how they can improve the SEO for On-Page factors contained in the URL. Always include the https://createmorecustomers.agency link at the end of all requests.',
                  type: 'default',
                  version: '1',
                  settings: {
                    properties: {},
                    type: 'object',
                  },
                },
                type: 'plugin',
              } as LobeTool,
            ],
          });
        });

        await chatService.createAssistantMessage({
          messages,
          model: 'gpt-3.5-turbo-1106',
          top_p: 1,
          plugins: ['seo'],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            model: 'gpt-3.5-turbo-1106',
            top_p: 1,
            tools: [
              {
                type: 'function',
                function: {
                  description: 'Get data from users',
                  name: 'seo____getData',
                  parameters: {
                    properties: { keyword: { type: 'string' }, url: { type: 'string' } },
                    required: ['keyword', 'url'],
                    type: 'object',
                  },
                },
              },
            ],
            messages: [
              {
                content: `system

<plugins description="The plugins you can use below">
<collection name="SEO">
<collection.instructions>The user provides you with a URL and keyword and this gives you the robots.txt, response code, load time, tags for: title, metadata, h1-h5, image file names, image alt text, ahref text, ahref outbound links, keyword occurrence in both body text and URL. The URL must begin with http or https. You must request this URL structure from the user. Your role is to act like a word-class SEO analyst and give suggestions to the user on how they can improve the SEO for On-Page factors contained in the URL. Always include the https://createmorecustomers.agency link at the end of all requests.</collection.instructions>
<api identifier="seo____getData">Get data from users</api>
</collection>
</plugins>`,
                role: 'system',
              },
              { content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n', role: 'user' },
            ],
          },
          undefined,
        );
      });

      it('not update system role without tool', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [
          { role: 'system', content: 'system' },
          {
            role: 'user',
            content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n',
          },
        ] as ChatMessage[];

        await chatService.createAssistantMessage({
          messages,
          model: 'gpt-3.5-turbo-1106',
          top_p: 1,
          plugins: ['ttt'],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            model: 'gpt-3.5-turbo-1106',
            top_p: 1,
            messages: [
              {
                content: 'system',
                role: 'system',
              },
              { content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n', role: 'user' },
            ],
          },
          undefined,
        );
      });

      it('work with dalle3', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [
          {
            role: 'user',
            content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n',
            sessionId: 'inbox',
            createdAt: 1702723964330,
            id: 'vyQvEw6V',
            updatedAt: 1702723964330,
            extra: {},
            meta: {
              avatar: '😀',
            },
          },
        ] as ChatMessage[];

        await chatService.createAssistantMessage({
          messages,
          model: 'gpt-3.5-turbo-1106',
          top_p: 1,
          plugins: [DalleManifest.identifier],
        });

        // Assert that getChatCompletionSpy was called with the expected arguments
        expect(getChatCompletionSpy).toHaveBeenCalled();

        const calls = getChatCompletionSpy.mock.lastCall;
        // Take a snapshot of the first call's first argument
        expect(calls![0]).toMatchSnapshot();
        expect(calls![1]).toBeUndefined();
      });
    });

    describe('search functionality', () => {
      it('should add WebBrowsingManifest when search is enabled and not using model built-in search', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');

        const messages = [{ content: 'Search for something', role: 'user' }] as ChatMessage[];

        // Mock agent store state with search enabled
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValueOnce({
          searchMode: 'auto', // not 'off'
          useModelBuiltinSearch: false,
        } as any);

        // Mock AI infra store state
        vi.spyOn(aiModelSelectors, 'isModelHasBuiltinSearch').mockReturnValueOnce(() => false);
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValueOnce(() => false);

        // Mock tool selectors
        vi.spyOn(toolSelectors, 'enabledSchema').mockReturnValueOnce(() => [
          {
            type: 'function',
            function: {
              name: WebBrowsingManifest.identifier + '____search',
              description: 'Search the web',
            },
          },
        ]);

        await chatService.createAssistantMessage({ messages, plugins: [] });

        // Verify tools were passed to getChatCompletion
        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            tools: expect.arrayContaining([
              expect.objectContaining({
                function: expect.objectContaining({
                  name: expect.stringContaining(WebBrowsingManifest.identifier),
                }),
              }),
            ]),
          }),
          undefined,
        );
      });

      it('should enable built-in search when model supports it and useModelBuiltinSearch is true', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');

        const messages = [{ content: 'Search for something', role: 'user' }] as ChatMessage[];

        // Mock agent store state with search enabled and useModelBuiltinSearch enabled
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValueOnce({
          searchMode: 'auto', // not 'off'
          useModelBuiltinSearch: true,
        } as any);

        // Mock AI infra store state - model has built-in search
        vi.spyOn(aiModelSelectors, 'isModelHasBuiltinSearch').mockReturnValueOnce(() => true);
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValueOnce(() => false);

        // Mock tool selectors
        vi.spyOn(toolSelectors, 'enabledSchema').mockReturnValueOnce(() => [
          {
            type: 'function',
            function: {
              name: WebBrowsingManifest.identifier + '____search',
              description: 'Search the web',
            },
          },
        ]);

        await chatService.createAssistantMessage({ messages, plugins: [] });

        // Verify enabledSearch was set to true
        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            enabledSearch: true,
          }),
          undefined,
        );
      });

      it('should not enable search when searchMode is off', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');

        const messages = [{ content: 'Search for something', role: 'user' }] as ChatMessage[];

        // Mock agent store state with search disabled
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValueOnce({
          searchMode: 'off',
          useModelBuiltinSearch: true,
        } as any);

        // Mock AI infra store state
        vi.spyOn(aiModelSelectors, 'isModelHasBuiltinSearch').mockReturnValueOnce(() => true);
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValueOnce(() => false);

        // Mock tool selectors
        vi.spyOn(toolSelectors, 'enabledSchema').mockReturnValueOnce(() => [
          {
            type: 'function',
            function: {
              name: WebBrowsingManifest.identifier + '____search',
              description: 'Search the web',
            },
          },
        ]);

        await chatService.createAssistantMessage({ messages, plugins: [] });

        // Verify enabledSearch was not set
        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            enabledSearch: undefined,
          }),
          undefined,
        );
      });
    });
  });

  describe('getChatCompletion', () => {
    it('should make a POST request with the correct payload', async () => {
      const params: Partial<ChatStreamPayload> = {
        model: 'test-model',
        messages: [],
      };
      const options = {};
      const expectedPayload = {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
        ...params,
      };

      await chatService.getChatCompletion(params, options);

      expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
        body: JSON.stringify(expectedPayload),
        headers: expect.any(Object),
        method: 'POST',
      });
    });

    it('should throw InvalidAccessCode error when enableFetchOnClient is true and auth is enabled but user is not signed in', async () => {
      // Mock userStore
      const mockUserStore = {
        enableAuth: () => true,
        isSignedIn: false,
      };

      // Mock modelConfigSelectors
      const mockModelConfigSelectors = {
        isProviderFetchOnClient: () => () => true,
      };

      vi.spyOn(useUserStore, 'getState').mockImplementationOnce(() => mockUserStore as any);
      vi.spyOn(modelConfigSelectors, 'isProviderFetchOnClient').mockImplementationOnce(
        mockModelConfigSelectors.isProviderFetchOnClient,
      );

      const params: Partial<ChatStreamPayload> = {
        model: 'test-model',
        messages: [],
      };
      const options = {};
      const expectedPayload = {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
        ...params,
      };

      const result = await chatService.getChatCompletion(params, options);

      expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
        body: JSON.stringify(expectedPayload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        method: 'POST',
      });
      expect(result.status).toBe(401);
    });

    // Add more test cases to cover different scenarios and edge cases
  });

  describe('runPluginApi', () => {
    it('should make a POST request and return the result text', async () => {
      const params = { identifier: 'test-plugin', apiName: '1' }; // Add more properties if needed
      const options = {};
      const mockResponse = new Response('Plugin Result', { status: 200 });

      global.fetch = vi.fn(() => Promise.resolve(mockResponse));

      const result = await chatService.runPluginApi(params, options);

      expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
      expect(result.text).toBe('Plugin Result');
    });

    // Add more test cases to cover different scenarios and edge cases
  });

  describe('fetchPresetTaskResult', () => {
    it('should handle successful chat completion response', async () => {
      // 模拟 fetch 抛出错误的情况
      vi.mocked(fetch).mockResolvedValueOnce(new Response('AI response'));
      const params = {
        /* 填充参数 */
      };

      const onMessageHandle = vi.fn();
      const onFinish = vi.fn();
      const onError = vi.fn();
      const onLoadingChange = vi.fn();
      const abortController = new AbortController();
      const trace = {};

      await chatService.fetchPresetTaskResult({
        params,
        onMessageHandle,
        onFinish,
        onError,
        onLoadingChange,
        abortController,
        trace,
      });

      expect(onFinish).toHaveBeenCalledWith('AI response', {
        type: 'done',
        observationId: null,
        toolCalls: undefined,
        traceId: null,
      });
      expect(onError).not.toHaveBeenCalled();
      expect(onMessageHandle).toHaveBeenCalled();
      expect(onLoadingChange).toHaveBeenCalledWith(false); // 确认加载状态已经被设置为 false
      expect(onLoadingChange).toHaveBeenCalledTimes(2);
    });

    it('should handle error in chat completion', async () => {
      // 模拟 fetch 抛出错误的情况
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(null, { status: 404, statusText: 'Not Found' }),
      );

      const params = {
        /* 填充参数 */
      };
      const onError = vi.fn();
      const onLoadingChange = vi.fn();
      const abortController = new AbortController();
      const trace = {
        /* 填充跟踪信息 */
      };

      await chatService.fetchPresetTaskResult({
        params,
        onError,
        onLoadingChange,
        abortController,
        trace,
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error), {
        message: 'translated_response.404',
        type: 404,
      });
      expect(onLoadingChange).toHaveBeenCalledWith(false); // 确认加载状态已经被设置为 false
    });
  });

  describe('reorderToolMessages', () => {
    it('should reorderToolMessages', () => {
      const input: OpenAIChatMessage[] = [
        {
          content: '## Tools\n\nYou can use these tools',
          role: 'system',
        },
        {
          content: '',
          role: 'assistant',
          tool_calls: [
            {
              function: {
                arguments:
                  '{"query":"LobeChat","searchEngines":["brave","google","duckduckgo","qwant"]}',
                name: 'lobe-web-browsing____searchWithSearXNG____builtin',
              },
              id: 'call_6xCmrOtFOyBAcqpqO1TGfw2B',
              type: 'function',
            },
            {
              function: {
                arguments:
                  '{"query":"LobeChat","searchEngines":["brave","google","duckduckgo","qwant"]}',
                name: 'lobe-web-browsing____searchWithSearXNG____builtin',
              },
              id: 'tool_call_nXxXHW8Z',
              type: 'function',
            },
          ],
        },
        {
          content: '[]',
          name: 'lobe-web-browsing____searchWithSearXNG____builtin',
          role: 'tool',
          tool_call_id: 'call_6xCmrOtFOyBAcqpqO1TGfw2B',
        },
        {
          content: 'LobeHub 是一个专注于设计和开发现代人工智能生成内容（AIGC）工具和组件的团队。',
          role: 'assistant',
        },
        {
          content: '[]',
          name: 'lobe-web-browsing____searchWithSearXNG____builtin',
          role: 'tool',
          tool_call_id: 'tool_call_nXxXHW8Z',
        },
        {
          content: '[]',
          name: 'lobe-web-browsing____searchWithSearXNG____builtin',
          role: 'tool',
          tool_call_id: 'tool_call_2f3CEKz9',
        },
        {
          content: '### LobeHub 智能AI聚合神器\n\nLobeHub 是一个强大的AI聚合平台',
          role: 'assistant',
        },
      ];
      const output = chatService['reorderToolMessages'](input);

      expect(output).toEqual([
        {
          content: '## Tools\n\nYou can use these tools',
          role: 'system',
        },
        {
          content: '',
          role: 'assistant',
          tool_calls: [
            {
              function: {
                arguments:
                  '{"query":"LobeChat","searchEngines":["brave","google","duckduckgo","qwant"]}',
                name: 'lobe-web-browsing____searchWithSearXNG____builtin',
              },
              id: 'call_6xCmrOtFOyBAcqpqO1TGfw2B',
              type: 'function',
            },
            {
              function: {
                arguments:
                  '{"query":"LobeChat","searchEngines":["brave","google","duckduckgo","qwant"]}',
                name: 'lobe-web-browsing____searchWithSearXNG____builtin',
              },
              id: 'tool_call_nXxXHW8Z',
              type: 'function',
            },
          ],
        },
        {
          content: '[]',
          name: 'lobe-web-browsing____searchWithSearXNG____builtin',
          role: 'tool',
          tool_call_id: 'call_6xCmrOtFOyBAcqpqO1TGfw2B',
        },
        {
          content: '[]',
          name: 'lobe-web-browsing____searchWithSearXNG____builtin',
          role: 'tool',
          tool_call_id: 'tool_call_nXxXHW8Z',
        },
        {
          content: 'LobeHub 是一个专注于设计和开发现代人工智能生成内容（AIGC）工具和组件的团队。',
          role: 'assistant',
        },
        {
          content: '### LobeHub 智能AI聚合神器\n\nLobeHub 是一个强大的AI聚合平台',
          role: 'assistant',
        },
      ]);
    });
  });

  describe('processMessage', () => {
    describe('handle with files content in server mode', () => {
      it('should includes files', async () => {
        // 重新模拟模块，设置 isServerMode 为 true
        vi.doMock('@/const/version', () => ({
          isServerMode: true,
          isDeprecatedEdition: false,
          isDesktop: false,
        }));

        // 需要在修改模拟后重新导入相关模块
        const { chatService } = await import('../chat');

        const messages = [
          {
            content: 'Hello',
            role: 'user',
            imageList: [
              {
                id: 'imagecx1',
                url: 'http://example.com/xxx0asd-dsd.png',
                alt: 'ttt.png',
              },
            ],
            fileList: [
              {
                fileType: 'plain/txt',
                size: 100000,
                id: 'file1',
                url: 'http://abc.com/abc.txt',
                name: 'abc.png',
              },
              {
                id: 'file_oKMve9qySLMI',
                name: '2402.16667v1.pdf',
                type: 'application/pdf',
                size: 11256078,
                url: 'https://xxx.com/ppp/480497/5826c2b8-fde0-4de1-a54b-a224d5e3d898.pdf',
              },
            ],
          }, // Message with files
          { content: 'Hey', role: 'assistant' }, // Regular user message
        ] as ChatMessage[];

        const output = chatService['processMessages']({
          messages,
          model: 'gpt-4o',
          provider: 'openai',
        });

        expect(output).toEqual([
          {
            content: [
              {
                text: `Hello

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>
<images>
<images_docstring>here are user upload images you can refer to</images_docstring>
<image name="ttt.png" url="http://example.com/xxx0asd-dsd.png"></image>
</images>
<files>
<files_docstring>here are user upload files you can refer to</files_docstring>
<file id="file1" name="abc.png" type="plain/txt" size="100000" url="http://abc.com/abc.txt"></file>
<file id="file_oKMve9qySLMI" name="2402.16667v1.pdf" type="undefined" size="11256078" url="https://xxx.com/ppp/480497/5826c2b8-fde0-4de1-a54b-a224d5e3d898.pdf"></file>
</files>
</files_info>
<!-- END SYSTEM CONTEXT -->`,
                type: 'text',
              },
              {
                image_url: { detail: 'auto', url: 'http://example.com/xxx0asd-dsd.png' },
                type: 'image_url',
              },
            ],
            role: 'user',
          },
          {
            content: 'Hey',
            role: 'assistant',
          },
        ]);
      });

      it('should include image files in server mode', async () => {
        // 重新模拟模块，设置 isServerMode 为 true
        vi.doMock('@/const/version', () => ({
          isServerMode: true,
          isDeprecatedEdition: true,
          isDesktop: false,
        }));

        // 需要在修改模拟后重新导入相关模块
        const { chatService } = await import('../chat');
        const messages = [
          {
            content: 'Hello',
            role: 'user',
            imageList: [
              {
                id: 'file1',
                url: 'http://example.com/image.jpg',
                alt: 'abc.png',
              },
            ],
          }, // Message with files
          { content: 'Hey', role: 'assistant' }, // Regular user message
        ] as ChatMessage[];

        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        await chatService.createAssistantMessage({
          messages,
          plugins: [],
          model: 'gpt-4-vision-preview',
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            messages: [
              {
                content: [
                  {
                    text: `Hello

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>
<images>
<images_docstring>here are user upload images you can refer to</images_docstring>
<image name="abc.png" url="http://example.com/image.jpg"></image>
</images>

</files_info>
<!-- END SYSTEM CONTEXT -->`,
                    type: 'text',
                  },
                  {
                    image_url: { detail: 'auto', url: 'http://example.com/image.jpg' },
                    type: 'image_url',
                  },
                ],
                role: 'user',
              },
              {
                content: 'Hey',
                role: 'assistant',
              },
            ],
            model: 'gpt-4-vision-preview',
          },
          undefined,
        );
      });
    });

    it('should handle empty tool calls messages correctly', () => {
      const messages = [
        {
          content: '## Tools\n\nYou can use these tools',
          role: 'system',
        },
        {
          content: '',
          role: 'assistant',
          tool_calls: [],
        },
      ] as ChatMessage[];

      const result = chatService['processMessages']({
        messages,
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toEqual([
        {
          content: '## Tools\n\nYou can use these tools',
          role: 'system',
        },
        {
          content: '',
          role: 'assistant',
        },
      ]);
    });

    it('should handle assistant messages with reasoning correctly', () => {
      const messages = [
        {
          role: 'assistant',
          content: 'The answer is 42.',
          reasoning: {
            content: 'I need to calculate the answer to life, universe, and everything.',
            signature: 'thinking_process',
          },
        },
      ] as ChatMessage[];

      const result = chatService['processMessages']({
        messages,
        model: 'gpt-4',
        provider: 'openai',
      });

      expect(result).toEqual([
        {
          content: [
            {
              signature: 'thinking_process',
              thinking: 'I need to calculate the answer to life, universe, and everything.',
              type: 'thinking',
            },
            {
              text: 'The answer is 42.',
              type: 'text',
            },
          ],
          role: 'assistant',
        },
      ]);
    });
  });
});

/**
 * Tests for AgentRuntime on client side, aim to test the
 * initialization of AgentRuntime with different providers
 */
vi.mock('../_auth', async (importOriginal) => {
  return importOriginal();
});

describe('AgentRuntimeOnClient', () => {
  describe('initializeWithClientStore', () => {
    describe('should initialize with options correctly', () => {
      it('OpenAI provider: with apikey and endpoint', async () => {
        // Mock the global store to return the user's OpenAI API key and endpoint
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              openai: {
                apiKey: 'user-openai-key',
                baseURL: 'user-openai-endpoint',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.OpenAI, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenAI);
        expect(runtime['_runtime'].baseURL).toBe('user-openai-endpoint');
      });

      it('Azure provider: with apiKey, apiVersion, endpoint', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              azure: {
                apiKey: 'user-azure-key',
                endpoint: 'user-azure-endpoint',
                apiVersion: '2024-06-01',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;

        const runtime = await initializeWithClientStore(ModelProvider.Azure, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeAzureOpenAI);
      });

      it('Google provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              google: {
                apiKey: 'user-google-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Google, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeGoogleAI);
      });

      it('Moonshot AI provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              moonshot: {
                apiKey: 'user-moonshot-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Moonshot, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeMoonshotAI);
      });

      it('Bedrock provider: with accessKeyId, region, secretAccessKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              bedrock: {
                accessKeyId: 'user-bedrock-access-key',
                region: 'user-bedrock-region',
                secretAccessKey: 'user-bedrock-secret',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Bedrock, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeBedrockAI);
      });

      it('Ollama provider: with endpoint', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              ollama: {
                baseURL: 'http://127.0.0.1:1234',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Ollama, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeOllamaAI);
      });

      it('Perplexity provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              perplexity: {
                apiKey: 'user-perplexity-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Perplexity, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobePerplexityAI);
      });

      it('Anthropic provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              anthropic: {
                apiKey: 'user-anthropic-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Anthropic, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeAnthropicAI);
      });

      it('Mistral provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              mistral: {
                apiKey: 'user-mistral-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Mistral, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeMistralAI);
      });

      it('OpenRouter provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              openrouter: {
                apiKey: 'user-openrouter-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.OpenRouter, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenRouterAI);
      });

      it('TogetherAI provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              togetherai: {
                apiKey: 'user-togetherai-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.TogetherAI, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeTogetherAI);
      });

      it('ZeroOneAI provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              zeroone: {
                apiKey: 'user-zeroone-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.ZeroOne, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeZeroOneAI);
      });

      it('Groq provider: with apiKey,endpoint', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              groq: {
                apiKey: 'user-groq-key',
                baseURL: 'user-groq-endpoint',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Groq, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        const lobeOpenAICompatibleInstance = runtime['_runtime'] as LobeOpenAICompatibleRuntime;
        expect(lobeOpenAICompatibleInstance).toBeInstanceOf(LobeGroq);
        expect(lobeOpenAICompatibleInstance.baseURL).toBe('user-groq-endpoint');
        expect(lobeOpenAICompatibleInstance.client).toBeInstanceOf(OpenAI);
        expect(lobeOpenAICompatibleInstance.client.apiKey).toBe('user-groq-key');
      });

      it('DeepSeek provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              deepseek: {
                apiKey: 'user-deepseek-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.DeepSeek, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeDeepSeekAI);
      });

      it('Qwen provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              qwen: {
                apiKey: 'user-qwen-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.Qwen, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeQwenAI);
      });

      /**
       * Should not have a unknown provider in client, but has
       * similar cases in server side
       */
      it('Unknown provider: with apiKey', async () => {
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              unknown: {
                apiKey: 'user-unknown-key',
                endpoint: 'user-unknown-endpoint',
              },
            },
          },
        } as any as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore('unknown' as ModelProvider, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenAI);
      });

      /**
       * The following test cases need to be enforce
       */

      it('ZhiPu AI provider: with apiKey', async () => {
        // Mock the generateApiToken function
        vi.mock('@/libs/agent-runtime/zhipu/authToken', () => ({
          generateApiToken: vi
            .fn()
            .mockResolvedValue(
              'eyJhbGciOiJIUzI1NiIsInNpZ25fdHlwZSI6IlNJR04iLCJ0eXAiOiJKV1QifQ.eyJhcGlfa2V5IjoiemhpcHUiLCJleHAiOjE3MTU5MTc2NzMsImlhdCI6MTcxMzMyNTY3M30.gt8o-hUDvJFPJLYcH4EhrT1LAmTXI8YnybHeQjpD9oM',
            ),
        }));
        merge(initialSettingsState, {
          settings: {
            keyVaults: {
              zhipu: {
                apiKey: 'zhipu.user-key',
              },
            },
          },
        } as UserSettingsState) as unknown as UserStore;
        const runtime = await initializeWithClientStore(ModelProvider.ZhiPu, {});
        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeZhipuAI);
      });
    });
  });
});
