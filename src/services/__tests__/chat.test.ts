import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VISION_MODEL_WHITE_LIST } from '@/const/llm';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { useFileStore } from '@/store/file';
import { useToolStore } from '@/store/tool';
import { ChatMessage } from '@/types/chatMessage';
import { OpenAIChatStreamPayload } from '@/types/openai/chat';
import { fetchAIFactory } from '@/utils/fetch';

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
          functions: expect.arrayContaining([{ name: 'plugin1____api1____default' }]),
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

    // New test case for processMessages
    it('should correctly process messages and handle content for vision models', async () => {
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
      await chatService.createAssistantMessage({ messages, plugins: [] });

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
        },
        undefined,
      );
    });

    it('should correctly process messages and handle content for vision models', async () => {
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
