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
} from '@lobechat/model-runtime';
import { ModelRuntime } from '@lobechat/model-runtime';
import { ChatErrorType } from '@lobechat/types';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { act } from '@testing-library/react';
import { merge } from 'lodash-es';
import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_USER_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { aiModelSelectors } from '@/store/aiInfra';
import { useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { UserStore } from '@/store/user';
import { UserSettingsState, initialSettingsState } from '@/store/user/slices/settings/initialState';
import { DalleManifest } from '@/tools/dalle';
import { WebBrowsingManifest } from '@/tools/web-browsing';
import { ChatImageItem, ChatMessage } from '@/types/message';
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

// Mock image processing utilities
vi.mock('@/utils/url', () => ({
  isLocalUrl: vi.fn(),
}));

vi.mock('@/utils/imageToBase64', () => ({
  imageUrlToBase64: vi.fn(),
}));

vi.mock('@/libs/model-runtime/utils/uriParser', () => ({
  parseDataUri: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(async () => {
  // 清除所有模块的缓存
  vi.resetModules();

  // 默认设置 isServerMode 为 false
  vi.mock('@/const/version', () => ({
    isServerMode: false,
    isDeprecatedEdition: true,
    isDesktop: false,
  }));

  // Reset all mocks
  vi.clearAllMocks();

  // Set default mock return values for image processing utilities
  const { isLocalUrl } = await import('@/utils/url');
  const { imageUrlToBase64 } = await import('@/utils/imageToBase64');
  const { parseDataUri } = await import('@/libs/model-runtime/utils/uriParser');

  vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });
  vi.mocked(isLocalUrl).mockReturnValue(false);
  vi.mocked(imageUrlToBase64).mockResolvedValue({
    base64: 'mock-base64',
    mimeType: 'image/jpeg',
  });
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

    describe('extendParams functionality', () => {
      it('should add reasoning parameters when model supports enableReasoning and user enables it', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [{ content: 'Test reasoning', role: 'user' }] as ChatMessage[];

        // Mock aiModelSelectors for extend params support
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
        vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => ['enableReasoning']);

        // Mock agent chat config with reasoning enabled
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
          enableReasoning: true,
          reasoningBudgetToken: 2048,
          searchMode: 'off',
        } as any);

        await chatService.createAssistantMessage({
          messages,
          model: 'deepseek-reasoner',
          provider: 'deepseek',
          plugins: [],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            thinking: {
              budget_tokens: 2048,
              type: 'enabled',
            },
          }),
          undefined,
        );
      });

      it('should disable reasoning when model supports enableReasoning but user disables it', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [{ content: 'Test no reasoning', role: 'user' }] as ChatMessage[];

        // Mock aiModelSelectors for extend params support
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
        vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => ['enableReasoning']);

        // Mock agent chat config with reasoning disabled
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
          enableReasoning: false,
          searchMode: 'off',
        } as any);

        await chatService.createAssistantMessage({
          messages,
          model: 'deepseek-reasoner',
          provider: 'deepseek',
          plugins: [],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            thinking: {
              budget_tokens: 0,
              type: 'disabled',
            },
          }),
          undefined,
        );
      });

      it('should use default budget when reasoningBudgetToken is not set', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [{ content: 'Test default budget', role: 'user' }] as ChatMessage[];

        // Mock aiModelSelectors for extend params support
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
        vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => ['enableReasoning']);

        // Mock agent chat config with reasoning enabled but no custom budget
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
          enableReasoning: true,
          // reasoningBudgetToken is undefined
          searchMode: 'off',
        } as any);

        await chatService.createAssistantMessage({
          messages,
          model: 'deepseek-reasoner',
          provider: 'deepseek',
          plugins: [],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            thinking: {
              budget_tokens: 1024, // default value
              type: 'enabled',
            },
          }),
          undefined,
        );
      });

      it('should set reasoning_effort when model supports reasoningEffort and user configures it', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [{ content: 'Test reasoning effort', role: 'user' }] as ChatMessage[];

        // Mock aiModelSelectors for extend params support
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
        vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => ['reasoningEffort']);

        // Mock agent chat config with reasoning effort set
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
          reasoningEffort: 'high',
          searchMode: 'off',
        } as any);

        await chatService.createAssistantMessage({
          messages,
          model: 'test-model',
          provider: 'test-provider',
          plugins: [],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            reasoning_effort: 'high',
          }),
          undefined,
        );
      });

      it('should set thinkingBudget when model supports thinkingBudget and user configures it', async () => {
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        const messages = [{ content: 'Test thinking budget', role: 'user' }] as ChatMessage[];

        // Mock aiModelSelectors for extend params support
        vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
        vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => ['thinkingBudget']);

        // Mock agent chat config with thinking budget set
        vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
          thinkingBudget: 5000,
          searchMode: 'off',
        } as any);

        await chatService.createAssistantMessage({
          messages,
          model: 'test-model',
          provider: 'test-provider',
          plugins: [],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            thinkingBudget: 5000,
          }),
          undefined,
        );
      });
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

    describe('local image URL conversion', () => {
      it('should convert local image URLs to base64 and call processImageList', async () => {
        const { isLocalUrl } = await import('@/utils/url');
        const { imageUrlToBase64 } = await import('@/utils/imageToBase64');
        const { parseDataUri } = await import('@/libs/model-runtime/utils/uriParser');

        // Mock for local URL
        vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });
        vi.mocked(isLocalUrl).mockReturnValue(true); // This is a local URL
        vi.mocked(imageUrlToBase64).mockResolvedValue({
          base64: 'converted-base64-content',
          mimeType: 'image/png',
        });

        const messages = [
          {
            content: 'Hello',
            role: 'user',
            imageList: [
              {
                id: 'file1',
                url: 'http://127.0.0.1:3000/uploads/image.png', // Real local URL
                alt: 'local-image.png',
              },
            ],
            createdAt: Date.now(),
            id: 'test-id',
            meta: {},
            updatedAt: Date.now(),
          },
        ] as ChatMessage[];

        // Spy on processImageList method
        const processImageListSpy = vi.spyOn(chatService as any, 'processImageList');
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');

        await chatService.createAssistantMessage({
          messages,
          plugins: [],
          model: 'gpt-4-vision-preview',
        });

        // Verify processImageList was called with correct arguments
        expect(processImageListSpy).toHaveBeenCalledWith({
          imageList: [
            {
              id: 'file1',
              url: 'http://127.0.0.1:3000/uploads/image.png',
              alt: 'local-image.png',
            },
          ],
          model: 'gpt-4-vision-preview',
          provider: undefined,
        });

        // Verify the utility functions were called
        expect(parseDataUri).toHaveBeenCalledWith('http://127.0.0.1:3000/uploads/image.png');
        expect(isLocalUrl).toHaveBeenCalledWith('http://127.0.0.1:3000/uploads/image.png');
        expect(imageUrlToBase64).toHaveBeenCalledWith('http://127.0.0.1:3000/uploads/image.png');

        // Verify the final result contains base64 converted URL
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
                    image_url: {
                      detail: 'auto',
                      url: 'data:image/png;base64,converted-base64-content',
                    },
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

      it('should not convert remote URLs to base64 and call processImageList', async () => {
        const { isLocalUrl } = await import('@/utils/url');
        const { imageUrlToBase64 } = await import('@/utils/imageToBase64');
        const { parseDataUri } = await import('@/libs/model-runtime/utils/uriParser');

        // Mock for remote URL
        vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });
        vi.mocked(isLocalUrl).mockReturnValue(false); // This is NOT a local URL
        vi.mocked(imageUrlToBase64).mockClear(); // Clear to ensure it's not called

        const messages = [
          {
            content: 'Hello',
            role: 'user',
            imageList: [
              {
                id: 'file1',
                url: 'https://example.com/remote-image.jpg', // Remote URL
                alt: 'remote-image.jpg',
              },
            ],
            createdAt: Date.now(),
            id: 'test-id-2',
            meta: {},
            updatedAt: Date.now(),
          },
        ] as ChatMessage[];

        // Spy on processImageList method
        const processImageListSpy = vi.spyOn(chatService as any, 'processImageList');
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');

        await chatService.createAssistantMessage({
          messages,
          plugins: [],
          model: 'gpt-4-vision-preview',
        });

        // Verify processImageList was called
        expect(processImageListSpy).toHaveBeenCalledWith({
          imageList: [
            {
              id: 'file1',
              url: 'https://example.com/remote-image.jpg',
              alt: 'remote-image.jpg',
            },
          ],
          model: 'gpt-4-vision-preview',
          provider: undefined,
        });

        // Verify the utility functions were called
        expect(parseDataUri).toHaveBeenCalledWith('https://example.com/remote-image.jpg');
        expect(isLocalUrl).toHaveBeenCalledWith('https://example.com/remote-image.jpg');
        expect(imageUrlToBase64).not.toHaveBeenCalled(); // Should NOT be called for remote URLs

        // Verify the final result preserves original URL
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
                    image_url: { detail: 'auto', url: 'https://example.com/remote-image.jpg' },
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

      it('should handle mixed local and remote URLs correctly', async () => {
        const { isLocalUrl } = await import('@/utils/url');
        const { imageUrlToBase64 } = await import('@/utils/imageToBase64');
        const { parseDataUri } = await import('@/libs/model-runtime/utils/uriParser');

        // Mock parseDataUri to always return url type
        vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });

        // Mock isLocalUrl to return true only for 127.0.0.1 URLs
        vi.mocked(isLocalUrl).mockImplementation((url: string) => {
          return new URL(url).hostname === '127.0.0.1';
        });

        // Mock imageUrlToBase64 for conversion
        vi.mocked(imageUrlToBase64).mockResolvedValue({
          base64: 'local-file-base64',
          mimeType: 'image/jpeg',
        });

        const messages = [
          {
            content: 'Multiple images',
            role: 'user',
            imageList: [
              {
                id: 'local1',
                url: 'http://127.0.0.1:3000/local1.jpg', // Local URL
                alt: 'local1.jpg',
              },
              {
                id: 'remote1',
                url: 'https://example.com/remote1.png', // Remote URL
                alt: 'remote1.png',
              },
              {
                id: 'local2',
                url: 'http://127.0.0.1:8080/local2.gif', // Another local URL
                alt: 'local2.gif',
              },
            ],
            createdAt: Date.now(),
            id: 'test-id-3',
            meta: {},
            updatedAt: Date.now(),
          },
        ] as ChatMessage[];

        const processImageListSpy = vi.spyOn(chatService as any, 'processImageList');
        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');

        await chatService.createAssistantMessage({
          messages,
          plugins: [],
          model: 'gpt-4-vision-preview',
        });

        // Verify processImageList was called
        expect(processImageListSpy).toHaveBeenCalledWith({
          imageList: [
            { id: 'local1', url: 'http://127.0.0.1:3000/local1.jpg', alt: 'local1.jpg' },
            { id: 'remote1', url: 'https://example.com/remote1.png', alt: 'remote1.png' },
            { id: 'local2', url: 'http://127.0.0.1:8080/local2.gif', alt: 'local2.gif' },
          ],
          model: 'gpt-4-vision-preview',
          provider: undefined,
        });

        // Verify isLocalUrl was called for each image
        expect(isLocalUrl).toHaveBeenCalledWith('http://127.0.0.1:3000/local1.jpg');
        expect(isLocalUrl).toHaveBeenCalledWith('https://example.com/remote1.png');
        expect(isLocalUrl).toHaveBeenCalledWith('http://127.0.0.1:8080/local2.gif');

        // Verify imageUrlToBase64 was called only for local URLs
        expect(imageUrlToBase64).toHaveBeenCalledWith('http://127.0.0.1:3000/local1.jpg');
        expect(imageUrlToBase64).toHaveBeenCalledWith('http://127.0.0.1:8080/local2.gif');
        expect(imageUrlToBase64).toHaveBeenCalledTimes(2); // Only for local URLs

        // Verify the final result has correct URLs
        const callArgs = getChatCompletionSpy.mock.calls[0][0];
        const imageContent = (callArgs.messages?.[0].content as any[])?.filter(
          (c) => c.type === 'image_url',
        );

        expect(imageContent).toHaveLength(3);
        expect(imageContent[0].image_url.url).toBe('data:image/jpeg;base64,local-file-base64'); // Local converted
        expect(imageContent[1].image_url.url).toBe('https://example.com/remote1.png'); // Remote preserved
        expect(imageContent[2].image_url.url).toBe('data:image/jpeg;base64,local-file-base64'); // Local converted
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
              avatar: DEFAULT_USER_AVATAR,
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
              avatar: DEFAULT_USER_AVATAR,
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
    let mockFetchSSE: any;

    beforeEach(async () => {
      // Setup common fetchSSE mock for getChatCompletion tests
      const { fetchSSE } = await import('@/utils/fetch');
      mockFetchSSE = vi.fn().mockResolvedValue(new Response('mock response'));
      vi.mocked(fetchSSE).mockImplementation(mockFetchSSE);
    });

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

      expect(mockFetchSSE).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(expectedPayload),
          headers: expect.any(Object),
          method: 'POST',
        }),
      );
    });

    it('should make a POST request without response in non-openai provider payload', async () => {
      const params: Partial<ChatStreamPayload> = {
        model: 'deepseek-reasoner',
        provider: 'deepseek',
        messages: [],
      };

      const options = {};

      const expectedPayload = {
        model: 'deepseek-reasoner',
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
        messages: [],
        provider: undefined,
      };

      await chatService.getChatCompletion(params, options);

      expect(mockFetchSSE).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(expectedPayload),
          headers: expect.any(Object),
          method: 'POST',
        }),
      );
    });

    it('should return InvalidAccessCode error when enableFetchOnClient is true and auth is enabled but user is not signed in', async () => {
      // Mock fetchSSE to call onErrorHandle with the error
      const { fetchSSE } = await import('@/utils/fetch');

      const mockFetchSSEWithError = vi.fn().mockImplementation((url, options) => {
        // Simulate the error being caught and passed to onErrorHandle
        if (options.onErrorHandle) {
          const error = {
            errorType: ChatErrorType.InvalidAccessCode,
            error: new Error('InvalidAccessCode'),
          };
          options.onErrorHandle(error, { errorType: ChatErrorType.InvalidAccessCode });
        }
        return Promise.resolve(new Response(''));
      });

      vi.mocked(fetchSSE).mockImplementation(mockFetchSSEWithError);

      const params: Partial<ChatStreamPayload> = {
        model: 'test-model',
        messages: [],
        provider: 'openai',
      };

      let errorHandled = false;
      const onErrorHandle = vi.fn((error: any) => {
        errorHandled = true;
        expect(error.errorType).toBe(ChatErrorType.InvalidAccessCode);
      });

      // Call getChatCompletion with onErrorHandle to catch the error
      await chatService.getChatCompletion(params, { onErrorHandle });

      // Verify that the error was handled
      expect(errorHandled).toBe(true);
      expect(onErrorHandle).toHaveBeenCalled();
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
      // Mock getChatCompletion to simulate successful completion
      const getChatCompletionSpy = vi
        .spyOn(chatService, 'getChatCompletion')
        .mockImplementation(async (params, options) => {
          // Simulate successful response
          if (options?.onFinish) {
            options.onFinish('AI response', {
              type: 'done',
              observationId: null,
              toolCalls: undefined,
              traceId: null,
            });
          }
          if (options?.onMessageHandle) {
            options.onMessageHandle({ type: 'text', text: 'AI response' });
          }
          return Promise.resolve(new Response(''));
        });

      const params = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'gpt-4',
        provider: 'openai',
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
      expect(onLoadingChange).toHaveBeenCalledWith(false); // Confirm loading state is set to false
      expect(onLoadingChange).toHaveBeenCalledTimes(2);
    });

    it('should handle error in chat completion', async () => {
      // Mock getChatCompletion to simulate error
      const getChatCompletionSpy = vi
        .spyOn(chatService, 'getChatCompletion')
        .mockImplementation(async (params, options) => {
          // Simulate error response
          if (options?.onErrorHandle) {
            options.onErrorHandle({ message: 'translated_response.404', type: 404 });
          }
          return Promise.resolve(new Response(''));
        });

      const params = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'gpt-4',
        provider: 'openai',
      };
      const onError = vi.fn();
      const onLoadingChange = vi.fn();
      const abortController = new AbortController();
      const trace = {};

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
      expect(onLoadingChange).toHaveBeenCalledWith(false); // Confirm loading state is set to false
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

        // Mock processImageList to return expected image content
        const processImageListSpy = vi.spyOn(chatService as any, 'processImageList');
        processImageListSpy.mockImplementation(async () => {
          // Mock the expected return value for an image
          return [
            {
              image_url: { detail: 'auto', url: 'http://example.com/xxx0asd-dsd.png' },
              type: 'image_url',
            },
          ];
        });

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

        const output = await chatService['processMessages']({
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

    it('should handle empty tool calls messages correctly', async () => {
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

      const result = await chatService['processMessages']({
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

    it('should handle assistant messages with reasoning correctly', async () => {
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

      const result = await chatService['processMessages']({
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

    it('should inject INBOX_GUIDE_SYSTEMROLE for welcome questions in inbox session', async () => {
      // Don't mock INBOX_GUIDE_SYSTEMROLE, use the real one
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Hello, this is my first question',
          createdAt: Date.now(),
          id: 'test-welcome',
          meta: {},
          updatedAt: Date.now(),
        },
      ];

      const result = await chatService['processMessages'](
        {
          messages,
          model: 'gpt-4',
          provider: 'openai',
        },
        {
          isWelcomeQuestion: true,
          trace: { sessionId: 'inbox' },
        },
      );

      // Should have system message with inbox guide content
      const systemMessage = result.find((msg) => msg.role === 'system');
      expect(systemMessage).toBeDefined();
      // Check for characteristic content of the actual INBOX_GUIDE_SYSTEMROLE
      expect(systemMessage!.content).toContain('LobeChat Support Assistant');
      expect(systemMessage!.content).toContain('LobeHub');
    });

    it('should inject historySummary into system message when provided', async () => {
      const historySummary = 'Previous conversation summary: User discussed AI topics.';

      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Continue our discussion',
          createdAt: Date.now(),
          id: 'test-history',
          meta: {},
          updatedAt: Date.now(),
        },
      ];

      const result = await chatService['processMessages'](
        {
          messages,
          model: 'gpt-4',
          provider: 'openai',
        },
        {
          historySummary,
        },
      );

      // Should have system message with history summary
      const systemMessage = result.find((msg) => msg.role === 'system');
      expect(systemMessage).toBeDefined();
      expect(systemMessage!.content).toContain(historySummary);
    });
  });
});

/**
 * Tests for ModelRuntime on client side, aim to test the
 * initialization of ModelRuntime with different providers
 */
vi.mock('../_auth', async (importOriginal) => {
  return importOriginal();
});

describe('ChatService private methods', () => {
  describe('processImageList', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return empty array if model cannot use vision (non-deprecated)', async () => {
      vi.doMock('@/const/version', () => ({
        isServerMode: false,
        isDeprecatedEdition: false,
        isDesktop: false,
      }));
      const { aiModelSelectors } = await import('@/store/aiInfra');
      vi.spyOn(aiModelSelectors, 'isModelSupportVision').mockReturnValue(() => false);

      const { chatService } = await import('../chat');
      const result = await chatService['processImageList']({
        imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
        model: 'any-model',
        provider: 'any-provider',
      });
      expect(result).toEqual([]);
    });

    it('should process images if model can use vision (non-deprecated)', async () => {
      vi.doMock('@/const/version', () => ({
        isServerMode: false,
        isDeprecatedEdition: false,
        isDesktop: false,
      }));
      const { aiModelSelectors } = await import('@/store/aiInfra');
      vi.spyOn(aiModelSelectors, 'isModelSupportVision').mockReturnValue(() => true);

      const { chatService } = await import('../chat');
      const result = await chatService['processImageList']({
        imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
        model: 'any-model',
        provider: 'any-provider',
      });
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('image_url');
    });

    it('should return empty array when vision disabled in deprecated edition', async () => {
      vi.doMock('@/const/version', () => ({
        isServerMode: false,
        isDeprecatedEdition: true,
        isDesktop: false,
      }));

      const { modelProviderSelectors } = await import('@/store/user/selectors');
      const spy = vi
        .spyOn(modelProviderSelectors, 'isModelEnabledVision')
        .mockReturnValue(() => false);

      const { chatService } = await import('../chat');
      const result = await chatService['processImageList']({
        imageList: [{ url: 'image_url', alt: '', id: 'test' } as ChatImageItem],
        model: 'any-model',
        provider: 'any-provider',
      });

      expect(spy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should process images when vision enabled in deprecated edition', async () => {
      vi.doMock('@/const/version', () => ({
        isServerMode: false,
        isDeprecatedEdition: true,
        isDesktop: false,
      }));

      const { modelProviderSelectors } = await import('@/store/user/selectors');
      const spy = vi
        .spyOn(modelProviderSelectors, 'isModelEnabledVision')
        .mockReturnValue(() => true);

      const { chatService } = await import('../chat');
      const result = await chatService['processImageList']({
        imageList: [{ url: 'image_url' } as ChatImageItem],
        model: 'any-model',
        provider: 'any-provider',
      });

      expect(spy).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('image_url');
    });
  });

  describe('processMessages', () => {
    describe('getAssistantContent', () => {
      it('should handle assistant message with imageList and content', async () => {
        const messages: ChatMessage[] = [
          {
            role: 'assistant',
            content: 'Here is an image.',
            imageList: [{ id: 'img1', url: 'http://example.com/image.png', alt: 'test.png' }],
            createdAt: Date.now(),
            id: 'test-id',
            meta: {},
            updatedAt: Date.now(),
          },
        ];
        const result = await chatService['processMessages']({
          messages,
          model: 'gpt-4-vision-preview',
          provider: 'openai',
        });

        expect(result[0].content).toEqual([
          { text: 'Here is an image.', type: 'text' },
          { image_url: { detail: 'auto', url: 'http://example.com/image.png' }, type: 'image_url' },
        ]);
      });

      it('should handle assistant message with imageList but no content', async () => {
        const messages: ChatMessage[] = [
          {
            role: 'assistant',
            content: '',
            imageList: [{ id: 'img1', url: 'http://example.com/image.png', alt: 'test.png' }],
            createdAt: Date.now(),
            id: 'test-id-2',
            meta: {},
            updatedAt: Date.now(),
          },
        ];
        const result = await chatService['processMessages']({
          messages,
          model: 'gpt-4-vision-preview',
          provider: 'openai',
        });

        expect(result[0].content).toEqual([
          { image_url: { detail: 'auto', url: 'http://example.com/image.png' }, type: 'image_url' },
        ]);
      });
    });

    it('should not include tool_calls for assistant message if model does not support tools', async () => {
      // Mock isCanUseFC to return false
      vi.spyOn(
        (await import('@/store/aiInfra')).aiModelSelectors,
        'isModelSupportToolUse',
      ).mockReturnValue(() => false);

      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: 'I have a tool call.',
          tools: [
            {
              id: 'tool_123',
              type: 'default',
              apiName: 'testApi',
              arguments: '{}',
              identifier: 'test-plugin',
            },
          ],
          createdAt: Date.now(),
          id: 'test-id-3',
          meta: {},
          updatedAt: Date.now(),
        },
      ];

      const result = await chatService['processMessages']({
        messages,
        model: 'some-model-without-fc',
        provider: 'openai',
      });

      expect(result[0].tool_calls).toBeUndefined();
      expect(result[0].content).toBe('I have a tool call.');
    });
  });

  describe('reorderToolMessages', () => {
    it('should correctly reorder when a tool message appears before the assistant message', () => {
      const input: OpenAIChatMessage[] = [
        {
          role: 'system',
          content: 'System message',
        },
        {
          role: 'tool',
          tool_call_id: 'tool_call_1',
          name: 'test-plugin____testApi',
          content: 'Tool result',
        },
        {
          role: 'assistant',
          content: '',
          tool_calls: [
            { id: 'tool_call_1', type: 'function', function: { name: 'testApi', arguments: '{}' } },
          ],
        },
      ];

      const output = chatService['reorderToolMessages'](input);

      // Verify reordering logic works and covers line 688 hasPushed check
      // In this test, tool messages are duplicated but the second occurrence is skipped
      expect(output.length).toBe(4); // Original has 3, assistant will add corresponding tool message again
      expect(output[0].role).toBe('system');
      expect(output[1].role).toBe('tool');
      expect(output[2].role).toBe('assistant');
      expect(output[3].role).toBe('tool'); // Tool message added by assistant's tool_calls
    });
  });

  describe('getChatCompletion', () => {
    it('should merge responseAnimation styles correctly', async () => {
      const { fetchSSE } = await import('@/utils/fetch');
      vi.mock('@/utils/fetch', async (importOriginal) => {
        const module = await importOriginal();
        return {
          ...(module as any),
          fetchSSE: vi.fn(),
        };
      });

      // Mock provider config
      const { aiProviderSelectors } = await import('@/store/aiInfra');
      vi.spyOn(aiProviderSelectors, 'providerConfigById').mockReturnValue({
        id: 'openai',
        settings: {
          responseAnimation: 'slow',
        },
      } as any);

      // Mock user preference
      const { userGeneralSettingsSelectors } = await import('@/store/user/selectors');
      vi.spyOn(userGeneralSettingsSelectors, 'transitionMode').mockReturnValue('smooth');

      await chatService.getChatCompletion(
        { provider: 'openai', messages: [] },
        { responseAnimation: { speed: 20 } },
      );

      expect(fetchSSE).toHaveBeenCalled();
      const fetchSSEOptions = (fetchSSE as any).mock.calls[0][1];

      expect(fetchSSEOptions.responseAnimation).toEqual({
        speed: 20,
        text: 'fadeIn',
        toolsCalling: 'fadeIn',
      });
    });
  });

  describe('extendParams', () => {
    it('should set enabledContextCaching to false when model supports disableContextCaching and user enables it', async () => {
      const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
      const messages = [{ content: 'Test context caching', role: 'user' }] as ChatMessage[];

      // Mock aiModelSelectors for extend params support
      vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
      vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => [
        'disableContextCaching',
      ]);

      // Mock agent chat config with context caching disabled
      vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
        disableContextCaching: true,
        searchMode: 'off',
      } as any);

      await chatService.createAssistantMessage({
        messages,
        model: 'test-model',
        provider: 'test-provider',
        plugins: [],
      });

      expect(getChatCompletionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          enabledContextCaching: false,
        }),
        undefined,
      );
    });

    it('should not set enabledContextCaching when disableContextCaching is false', async () => {
      const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
      const messages = [{ content: 'Test context caching enabled', role: 'user' }] as ChatMessage[];

      // Mock aiModelSelectors for extend params support
      vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
      vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => [
        'disableContextCaching',
      ]);

      // Mock agent chat config with context caching enabled (default)
      vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
        disableContextCaching: false,
        searchMode: 'off',
      } as any);

      await chatService.createAssistantMessage({
        messages,
        model: 'test-model',
        provider: 'test-provider',
        plugins: [],
      });

      // enabledContextCaching should not be present in the call
      const callArgs = getChatCompletionSpy.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('enabledContextCaching');
    });

    it('should set reasoning_effort when model supports reasoningEffort and user configures it', async () => {
      const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
      const messages = [{ content: 'Test reasoning effort', role: 'user' }] as ChatMessage[];

      // Mock aiModelSelectors for extend params support
      vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
      vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => ['reasoningEffort']);

      // Mock agent chat config with reasoning effort set
      vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
        reasoningEffort: 'high',
        searchMode: 'off',
      } as any);

      await chatService.createAssistantMessage({
        messages,
        model: 'test-model',
        provider: 'test-provider',
        plugins: [],
      });

      expect(getChatCompletionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning_effort: 'high',
        }),
        undefined,
      );
    });

    it('should set thinkingBudget when model supports thinkingBudget and user configures it', async () => {
      const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
      const messages = [{ content: 'Test thinking budget', role: 'user' }] as ChatMessage[];

      // Mock aiModelSelectors for extend params support
      vi.spyOn(aiModelSelectors, 'isModelHasExtendParams').mockReturnValue(() => true);
      vi.spyOn(aiModelSelectors, 'modelExtendParams').mockReturnValue(() => ['thinkingBudget']);

      // Mock agent chat config with thinking budget set
      vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockReturnValue({
        thinkingBudget: 5000,
        searchMode: 'off',
      } as any);

      await chatService.createAssistantMessage({
        messages,
        model: 'test-model',
        provider: 'test-provider',
        plugins: [],
      });

      expect(getChatCompletionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          thinkingBudget: 5000,
        }),
        undefined,
      );
    });
  });
});

describe('ModelRuntimeOnClient', () => {
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenAI);
      });

      /**
       * The following test cases need to be enforce
       */

      it('ZhiPu AI provider: with apiKey', async () => {
        // Mock the generateApiToken function
        vi.mock('@/libs/model-runtime/zhipu/authToken', () => ({
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
        expect(runtime).toBeInstanceOf(ModelRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeZhipuAI);
      });
    });
  });
});
