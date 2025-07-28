// @vitest-environment node
import { AzureOpenAI } from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../utils/debugStream';
import * as openaiCompatibleFactoryModule from '../utils/openaiCompatibleFactory';
import { LobeAzureOpenAI } from './index';

const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('LobeAzureOpenAI', () => {
  let instance: LobeAzureOpenAI;

  beforeEach(() => {
    instance = new LobeAzureOpenAI({
      baseURL: 'https://test.openai.azure.com/',
      apiKey: 'test_key',
      apiVersion: '2023-03-15-preview',
    });

    // 使用 vi.spyOn 来模拟 streamChatCompletions 方法
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw InvalidAzureAPIKey error when apikey or endpoint is missing', () => {
      try {
        new LobeAzureOpenAI();
      } catch (e) {
        expect(e).toEqual({ errorType: invalidErrorType });
      }
    });

    it('should create an instance of OpenAIClient with correct parameters', () => {
      const baseURL = 'https://test.openai.azure.com/';
      const apiKey = 'test_key';
      const apiVersion = '2023-03-15-preview';

      const instance = new LobeAzureOpenAI({ baseURL, apiKey, apiVersion });

      expect(instance.client).toBeInstanceOf(AzureOpenAI);
      expect(instance.baseURL).toBe(baseURL);
    });
  });

  describe('chat', () => {
    it('should return a Response on successful API call', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    describe('streaming response', () => {
      it('should handle multiple data chunks correctly', async () => {
        const data = [
          {
            choices: [],
            created: 0,
            id: '',
            model: '',
            object: '',
            prompt_filter_results: [
              {
                prompt_index: 0,
                content_filter_results: {
                  hate: { filtered: false, severity: 'safe' },
                  self_harm: { filtered: false, severity: 'safe' },
                  sexual: { filtered: false, severity: 'safe' },
                  violence: { filtered: false, severity: 'safe' },
                },
              },
            ],
          },
          {
            choices: [
              {
                content_filter_results: {
                  hate: { filtered: false, severity: 'safe' },
                  self_harm: { filtered: false, severity: 'safe' },
                  sexual: { filtered: false, severity: 'safe' },
                  violence: { filtered: false, severity: 'safe' },
                },
                delta: { content: '你' },
                finish_reason: null,
                index: 0,
                logprobs: null,
              },
            ],
            created: 1715516381,
            id: 'chatcmpl-9O2SzeGv5xy6yz0TcQNA1DHHLJ8N1',
            model: 'gpt-35-turbo-16k',
            object: 'chat.completion.chunk',
            system_fingerprint: null,
          },
          {
            choices: [
              {
                content_filter_results: {
                  hate: { filtered: false, severity: 'safe' },
                  self_harm: { filtered: false, severity: 'safe' },
                  sexual: { filtered: false, severity: 'safe' },
                  violence: { filtered: false, severity: 'safe' },
                },
                delta: { content: '好' },
                finish_reason: null,
                index: 0,
                logprobs: null,
              },
            ],
            created: 1715516381,
            id: 'chatcmpl-9O2SzeGv5xy6yz0TcQNA1DHHLJ8N1',
            model: 'gpt-35-turbo-16k',
            object: 'chat.completion.chunk',
            system_fingerprint: null,
          },
          {
            choices: [
              {
                content_filter_results: {
                  hate: { filtered: false, severity: 'safe' },
                  self_harm: { filtered: false, severity: 'safe' },
                  sexual: { filtered: false, severity: 'safe' },
                  violence: { filtered: false, severity: 'safe' },
                },
                delta: { content: '！' },
                finish_reason: null,
                index: 0,
                logprobs: null,
              },
            ],
            created: 1715516381,
            id: 'chatcmpl-9O2SzeGv5xy6yz0TcQNA1DHHLJ8N1',
            model: 'gpt-35-turbo-16k',
            object: 'chat.completion.chunk',
            system_fingerprint: null,
          },
        ];

        const mockStream = new ReadableStream({
          start(controller) {
            data.forEach((chunk) => controller.enqueue(chunk));
            controller.close();
          },
        });
        vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
          mockStream as any,
        );

        const result = await instance.chat({
          stream: true,
          max_tokens: 2048,
          temperature: 0.6,
          top_p: 1,
          model: 'gpt-35-turbo-16k',
          presence_penalty: 0,
          frequency_penalty: 0,
          messages: [{ role: 'user', content: '你好' }],
        });

        const decoder = new TextDecoder();
        const reader = result.body!.getReader();
        const stream: string[] = [];

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          stream.push(decoder.decode(value));
        }

        expect(stream).toEqual(
          [
            'id: ',
            'event: data',
            'data: {"choices":[],"created":0,"id":"","model":"","object":"","prompt_filter_results":[{"prompt_index":0,"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}}}]}\n',
            'id: chatcmpl-9O2SzeGv5xy6yz0TcQNA1DHHLJ8N1',
            'event: text',
            'data: "你"\n',
            'id: chatcmpl-9O2SzeGv5xy6yz0TcQNA1DHHLJ8N1',
            'event: text',
            'data: "好"\n',
            'id: chatcmpl-9O2SzeGv5xy6yz0TcQNA1DHHLJ8N1',
            'event: text',
            'data: "！"\n',
          ].map((item) => `${item}\n`),
        );
      });

      it('should handle non-streaming response', async () => {
        vi.spyOn(openaiCompatibleFactoryModule, 'transformResponseToStream').mockImplementation(
          () => {
            return new ReadableStream();
          },
        );
        // Act
        await instance.chat({
          stream: false,
          temperature: 0.6,
          model: 'gpt-35-turbo-16k',
          messages: [{ role: 'user', content: '你好' }],
        });

        // Assert
        expect(openaiCompatibleFactoryModule.transformResponseToStream).toHaveBeenCalled();
      });
    });

    it('should handle o1 series models without streaming', async () => {
      vi.spyOn(openaiCompatibleFactoryModule, 'transformResponseToStream').mockImplementation(
        () => {
          return new ReadableStream();
        },
      );

      // Act
      await instance.chat({
        temperature: 0.6,
        model: 'o1-preview',
        messages: [{ role: 'user', content: '你好' }],
      });

      // Assert
      expect(openaiCompatibleFactoryModule.transformResponseToStream).toHaveBeenCalled();
    });

    describe('Error', () => {
      it('should return AzureBizError with DeploymentNotFound error', async () => {
        // Arrange
        const error = {
          code: 'DeploymentNotFound',
          message: 'Deployment not found',
        };

        (instance['client'].chat.completions.create as Mock).mockRejectedValue(error);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          // Assert
          expect(e).toEqual({
            endpoint: 'https://***.openai.azure.com/',
            error: {
              code: 'DeploymentNotFound',
              message: 'Deployment not found',
              deployId: 'text-davinci-003',
            },
            errorType: bizErrorType,
            provider: 'azure',
          });
        }
      });

      it('should return AgentRuntimeError for non-Azure errors', async () => {
        // Arrange
        const genericError = new Error('Generic Error');

        (instance['client'].chat.completions.create as Mock).mockRejectedValue(genericError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          // Assert
          expect(e).toEqual({
            endpoint: 'https://***.openai.azure.com/',
            errorType: 'AgentRuntimeError',
            provider: 'azure',
            error: {
              name: genericError.name,
              cause: genericError.cause,
              message: genericError.message,
            },
          });
        }
      });
    });

    describe('DEBUG', () => {
      it('should call debugStream when DEBUG_CHAT_COMPLETION is 1', async () => {
        // Arrange
        const mockProdStream = new ReadableStream() as any;
        const mockDebugStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Debug stream content');
            controller.close();
          },
        }) as any;
        mockDebugStream.toReadableStream = () => mockDebugStream;

        (instance['client'].chat.completions.create as Mock).mockResolvedValue({
          tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
        });

        process.env.DEBUG_AZURE_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // Act
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        });

        // Assert
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // Restore
        delete process.env.DEBUG_AZURE_CHAT_COMPLETION;
      });
    });
  });

  describe('private method', () => {
    describe('tocamelCase', () => {
      it('should convert string to camel case', () => {
        const key = 'image_url';

        const camelCaseKey = instance['tocamelCase'](key);

        expect(camelCaseKey).toEqual('imageUrl');
      });
    });

    describe('camelCaseKeys', () => {
      it('should convert object keys to camel case', () => {
        const obj = {
          frequency_penalty: 0,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: '<image URL>',
                  },
                },
              ],
            },
          ],
        };

        const newObj = instance['camelCaseKeys'](obj);

        expect(newObj).toEqual({
          frequencyPenalty: 0,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  imageUrl: {
                    url: '<image URL>',
                  },
                },
              ],
            },
          ],
        });
      });
    });
  });
});
