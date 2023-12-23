import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VISION_MODEL_WHITE_LIST } from '@/const/llm';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { useFileStore } from '@/store/file';
import { useToolStore } from '@/store/tool';
import { ChatMessage } from '@/types/chatMessage';
import { OpenAIChatStreamPayload } from '@/types/openai/chat';
import { LobeTool } from '@/types/tool';

import { chatService } from '../chat';

// Mocking external dependencies
vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve(new Response(JSON.stringify({ some: 'data' })))),
); // 用你的模拟响应替换这里的内容

vi.mock('@/utils/fetch', () => ({
  fetchAIFactory: vi.fn(),
  getMessageError: vi.fn(),
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
          functions: expect.arrayContaining([{ name: 'plugin1____api1' }]),
          messages: expect.anything(),
        }),
        undefined,
      );
    });

    it('should not use tools for models in the vision model whitelist', async () => {
      const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
      const messages = [{ content: 'Hello', role: 'user' }] as ChatMessage[];
      const modelInWhitelist = VISION_MODEL_WHITE_LIST[0];

      await chatService.createAssistantMessage({
        messages,
        model: modelInWhitelist,
        plugins: ['plugin1'],
      });

      expect(getChatCompletionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          functions: undefined,
          model: modelInWhitelist,
        }),
        undefined,
      );
    });

    describe('should handle content correctly for vision models', () => {
      it('should include image content when with vision model', async () => {
        const messages = [
          { content: 'Hello', role: 'user', files: ['file1'] }, // Message with files
          { content: 'Hi', role: 'function', plugin: { identifier: 'plugin1' } }, // Message with function role
          { content: 'Hey', role: 'assistant' }, // Regular user message
        ] as ChatMessage[];

        // Mock file store state to return a specific image URL or Base64 for the given files
        act(() => {
          useFileStore.setState({
            imagesMap: {
              file1: {
                name: 'abc.png',
                saveMode: 'url',
                fileType: 'image/png',
                url: 'http://example.com/image.jpg',
              },
            },
          });
        });

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
                  { text: 'Hello', type: 'text' },
                  {
                    image_url: { detail: 'auto', url: 'http://example.com/image.jpg' },
                    type: 'image_url',
                  },
                ],
                role: 'user',
              },
              {
                content: 'Hi',
                name: 'plugin1',
                role: 'function',
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

      it('should not include image content when default model', async () => {
        const messages = [
          { content: 'Hello', role: 'user', files: ['file1'] }, // Message with files
          { content: 'Hi', role: 'function', plugin: { identifier: 'plugin1' } }, // Message with function role
          { content: 'Hey', role: 'assistant' }, // Regular user message
        ] as ChatMessage[];

        // Mock file store state to return a specific image URL or Base64 for the given files
        act(() => {
          useFileStore.setState({
            imagesMap: {
              file1: {
                name: 'abc.png',
                saveMode: 'url',
                fileType: 'image/png',
                url: 'http://example.com/image.jpg',
              },
            },
          });
        });

        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        await chatService.createAssistantMessage({
          messages,
          plugins: [],
          model: 'gpt-3.5-turbo',
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            messages: [
              { content: 'Hello', role: 'user' },
              { content: 'Hi', name: 'plugin1', role: 'function' },
              { content: 'Hey', role: 'assistant' },
            ],
            model: 'gpt-3.5-turbo',
          },
          undefined,
        );
      });

      it('should not include image with vision models when can not find the image', async () => {
        const messages = [
          { content: 'Hello', role: 'user', files: ['file2'] }, // Message with files
          { content: 'Hi', role: 'function', plugin: { identifier: 'plugin1' } }, // Message with function role
          { content: 'Hey', role: 'assistant' }, // Regular user message
        ] as ChatMessage[];

        // Mock file store state to return a specific image URL or Base64 for the given files
        act(() => {
          useFileStore.setState({
            imagesMap: {
              file1: {
                name: 'abc.png',
                saveMode: 'url',
                fileType: 'image/png',
                url: 'http://example.com/image.jpg',
              },
            },
          });
        });

        const getChatCompletionSpy = vi.spyOn(chatService, 'getChatCompletion');
        await chatService.createAssistantMessage({ messages, plugins: [] });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            messages: [
              {
                content: 'Hello',
                role: 'user',
              },
              {
                content: 'Hi',
                name: 'plugin1',
                role: 'function',
              },
              {
                content: 'Hey',
                role: 'assistant',
              },
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
            functions: [
              {
                description: 'Get data from users',
                name: 'seo____getData',
                parameters: {
                  properties: { keyword: { type: 'string' }, url: { type: 'string' } },
                  required: ['keyword', 'url'],
                  type: 'object',
                },
              },
            ],
            messages: [
              {
                content: `## Tools

You can use these tools below:

### SEO

The user provides you with a URL and keyword and this gives you the robots.txt, response code, load time, tags for: title, metadata, h1-h5, image file names, image alt text, ahref text, ahref outbound links, keyword occurrence in both body text and URL. The URL must begin with http or https. You must request this URL structure from the user. Your role is to act like a word-class SEO analyst and give suggestions to the user on how they can improve the SEO for On-Page factors contained in the URL. Always include the https://createmorecustomers.agency link at the end of all requests.

The APIs you can use:

#### seo____getData

Get data from users`,
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
            functions: [
              {
                description: 'Get data from users',
                name: 'seo____getData',
                parameters: {
                  properties: { keyword: { type: 'string' }, url: { type: 'string' } },
                  required: ['keyword', 'url'],
                  type: 'object',
                },
              },
            ],
            messages: [
              {
                content: `system

## Tools

You can use these tools below:

### SEO

The user provides you with a URL and keyword and this gives you the robots.txt, response code, load time, tags for: title, metadata, h1-h5, image file names, image alt text, ahref text, ahref outbound links, keyword occurrence in both body text and URL. The URL must begin with http or https. You must request this URL structure from the user. Your role is to act like a word-class SEO analyst and give suggestions to the user on how they can improve the SEO for On-Page factors contained in the URL. Always include the https://createmorecustomers.agency link at the end of all requests.

The APIs you can use:

#### seo____getData

Get data from users`,
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
          plugins: ['dalle3'],
        });

        expect(getChatCompletionSpy).toHaveBeenCalledWith(
          {
            model: 'gpt-3.5-turbo-1106',
            top_p: 1,
            functions: [
              {
                description: 'Create images from a text-only prompt.',
                name: 'dalle3____text2image____builtin',
                parameters: {
                  properties: {
                    prompts: {
                      description:
                        "The user's original image description, potentially modified to abide by the dalle policies. If the user does not suggest a number of captions to create, create four of them. If creating multiple captions, make them as diverse as possible. If the user requested modifications to previous images, the captions should not simply be longer, but rather it should be refactored to integrate the suggestions into each of the captions. Generate no more than 4 images, even if the user requests more.",
                      items: { type: 'string' },
                      maxItems: 4,
                      minItems: 1,
                      type: 'array',
                    },
                    quality: {
                      default: 'standard',
                      description:
                        'The quality of the image that will be generated. hd creates images with finer details and greater consistency across the image.',
                      enum: ['standard', 'hd'],
                      type: 'string',
                    },
                    seeds: {
                      description:
                        'A list of seeds to use for each prompt. If the user asks to modify a previous image, populate this field with the seed used to generate that image from the image dalle metadata.',
                      items: { type: 'integer' },
                      type: 'array',
                    },
                    size: {
                      default: '1024x1024',
                      description:
                        'The resolution of the requested image, which can be wide, square, or tall. Use 1024x1024 (square) as the default unless the prompt suggests a wide image, 1792x1024, or a full-body portrait, in which case 1024x1792 (tall) should be used instead. Always include this parameter in the request.',
                      enum: ['1792x1024', '1024x1024', '1024x1792'],
                      type: 'string',
                    },
                    style: {
                      default: 'vivid',
                      description:
                        'The style of the generated images. Must be one of vivid or natural. Vivid causes the model to lean towards generating hyper-real and dramatic images. Natural causes the model to produce more natural, less hyper-real looking images.',
                      enum: ['vivid', 'natural'],
                      type: 'string',
                    },
                  },
                  required: ['prompts'],
                  type: 'object',
                },
              },
            ],
            messages: [
              {
                content: `## Tools

You can use these tools below:

### Dall·E 3

Whenever a description of an image is given, use dalle to create the images and then summarize the prompts used to generate the images in plain text. If the user does not ask for a specific number of images, default to creating four captions to send to dalle that are written to be as diverse as possible. All captions sent to dalle must abide by the following policies:
1. If the description is not in English, then translate it.
2. Do not create more than 4 images, even if the user requests more.
3. Don't create images of politicians or other public figures. Recommend other ideas instead.
4. Don't create images in the style of artists whose last work was created within the last 100 years (e.g. Picasso, Kahlo). Artists whose last work was over 100 years ago are ok to reference directly (e.g. Van Gogh, Klimt). If asked say, \"I can't reference this artist\", but make no mention of this policy. Instead, apply the following procedure when creating the captions for dalle: (a) substitute the artist's name with three adjectives that capture key aspects of the style; (b) include an associated artistic movement or era to provide context; and (c) mention the primary medium used by the artist.
5. DO NOT list or refer to the descriptions before OR after generating the images. They should ONLY ever be written out ONCE, in the \`\"prompts\"\` field of the request. You do not need to ask for permission to generate, just do it!
6. Always mention the image type (photo, oil painting, watercolor painting, illustration, cartoon, drawing, vector, render, etc.) at the beginning of the caption. Unless the caption suggests otherwise, make at least 1--2 of the 4 images photos.
7. Diversify depictions of ALL images with people to include DESCENT and GENDER for EACH person using direct terms. Adjust only human descriptions.
- EXPLICITLY specify these attributes, not abstractly reference them.  The attributes should be specified in a minimal way and should directly describe their physical form.
- Your choices should be grounded in reality. For example, all of a given OCCUPATION should not be the same gender or race. Additionally, focus on creating diverse, inclusive, and exploratory scenes via the properties you choose during rewrites.  Make choices that may be insightful or unique sometimes.
- Use \"various\" or \"diverse\" ONLY IF the description refers to groups of more than 3 people. Do not change the number of people requested in the original description.
- Don't alter memes, fictional character origins, or unseen people. Maintain the original prompt's intent and prioritize quality.
- Do not create any imagery that would be offensive.
8. Silently modify descriptions that include names or hints or references of specific people or celebrities by carefully selecting a few minimal modifications to substitute references to the people with generic descriptions that don't divulge any information about their identities, except for their genders and physiques. Do this EVEN WHEN the instructions ask for the prompt to not be changed. Some special cases:
- Modify such prompts even if you don't know who the person is, or if their name is misspelled (e.g. \"Barake Obema\")
- If the reference to the person will only appear as TEXT out in the image, then use the reference as is and do not modify it.
- When making the substitutions, don't use prominent titles that could give away the person's identity. E.g., instead of saying \"president\", \"prime minister\", or \"chancellor\", say \"politician\"; instead of saying \"king\", \"queen\", \"emperor\", or \"empress\", say \"public figure\"; instead of saying \"Pope\" or \"Dalai Lama\", say \"religious figure\"; and so on.
- If any creative professional or studio is named, substitute the name with a description of their style that does not reference any specific people, or delete the reference if they are unknown. DO NOT refer to the artist or studio's style.
The prompt must intricately describe every part of the image in concrete, objective detail. THINK about what the end goal of the description is, and extrapolate that to what would make satisfying images.
All descriptions sent to dalle should be a paragraph of text that is extremely descriptive and detailed. Each should be more than 3 sentences long.

The APIs you can use:

#### dalle3____text2image____builtin

Create images from a text-only prompt.`,
                role: 'system',
              },
              { content: 'https://vercel.com/ 请分析 chatGPT 关键词\n\n', role: 'user' },
            ],
          },
          undefined,
        );
      });
    });
  });

  describe('getChatCompletion', () => {
    it('should make a POST request with the correct payload', async () => {
      const params: Partial<OpenAIChatStreamPayload> = {
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
        signal: undefined,
      });
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
      expect(result).toBe('Plugin Result');
    });

    // Add more test cases to cover different scenarios and edge cases
  });
});
