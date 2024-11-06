// @vitest-environment node
import { AzureOpenAI } from 'openai';
import type { ChatCompletionToolChoiceOption } from 'openai/resources/chat/completions';
import type {
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
  ResponseFormatText,
} from 'openai/resources/shared';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../utils/debugStream';
import * as AzureOpenAIStreamUtils from '../utils/streams/azureOpenai';
import { LobeAzureOpenAI, convertResponseMode, convertToolChoice } from './index';

declare module './index' {
  export function convertResponseMode(
    responseMode?: 'streamText' | 'json',
  ): ResponseFormatText | ResponseFormatJSONObject | ResponseFormatJSONSchema | undefined;

  export function convertToolChoice(
    tool_choice?: string,
  ): ChatCompletionToolChoiceOption | undefined;
}

const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';
const endpoint = 'https://test.openai.azure.com/';
const apiKey = 'test_key';
const apiVersion = '2024-06-01';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('helper functions', () => {
  describe('convertResponseMode', () => {
    it('should return undefined when responseMode is not provided', () => {
      const result = convertResponseMode();

      expect(result).toBeUndefined();
    });

    it('should return text when responseMode is streamText', () => {
      const result = convertResponseMode('streamText');

      expect(result).toEqual({
        type: 'text',
      });
    });

    it('should return json_object when responseMode is json', () => {
      const result = convertResponseMode('json');

      expect(result).toEqual({
        type: 'json_object',
      });
    });
  });

  describe('convertToolChoice', () => {
    it('should return undefined when tool_choice is not provided', () => {
      const result = convertToolChoice();

      expect(result).toBeUndefined();
    });

    it('should return undefined when tool_choice is empty', () => {
      const result = convertToolChoice('');

      expect(result).toBeUndefined();
    });

    it('should return none when tool_choice is none', () => {
      const result = convertToolChoice('none');

      expect(result).toEqual('none');
    });

    it('should return auto when tool_choice is auto', () => {
      const result = convertToolChoice('auto');

      expect(result).toEqual('auto');
    });

    it('should return required when tool_choice is required', () => {
      const result = convertToolChoice('required');

      expect(result).toEqual('required');
    });

    it('should return function object when tool_choice is provided', () => {
      const result = convertToolChoice('test_function');

      expect(result).toEqual({
        function: {
          name: 'test_function',
        },
        type: 'function',
      });
    });
  });
});

describe('LobeAzureOpenAI', () => {
  let instance: LobeAzureOpenAI;

  beforeEach(() => {
    instance = new LobeAzureOpenAI(endpoint, apiKey, apiVersion);

    vi.spyOn(instance.client.chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );

    vi.spyOn(AzureOpenAIStreamUtils, 'convertToStream').mockImplementation((x) => x as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should throw InvalidAzureAPIKey error when apikey or endpoint is missing', () => {
      try {
        new LobeAzureOpenAI();
      } catch (e) {
        expect(e).toEqual({ errorType: invalidErrorType });
      }
    });

    it('should create an instance of AzureOpenAI with correct parameters', () => {
      const instance = new LobeAzureOpenAI(endpoint, apiKey, apiVersion);

      expect(instance.client).toBeInstanceOf(AzureOpenAI);
      expect(instance.baseURL).toBe(endpoint);
    });
  });

  describe('chat', () => {
    it('should return a Response on successful API call', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance.client.chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gpt-4o-mini',
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
        (instance.client.chat.completions.create as Mock).mockResolvedValue(mockStream as any);

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
    });

    describe('Error', () => {
      it('should return AzureBizError with DeploymentNotFound error', async () => {
        // Arrange
        const error = {
          code: 'DeploymentNotFound',
          message: 'Deployment not found',
        };

        (instance.client.chat.completions.create as Mock).mockRejectedValue(error);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'gpt-4o-mini',
            temperature: 0,
          });
        } catch (e) {
          // Assert
          expect(e).toEqual({
            endpoint: 'https://***.openai.azure.com/',
            error: {
              code: 'DeploymentNotFound',
              message: 'Deployment not found',
              deployId: 'gpt-4o-mini',
            },
            errorType: bizErrorType,
            provider: 'azure',
          });
        }
      });

      it('should return AgentRuntimeError for non-Azure errors', async () => {
        // Arrange
        const genericError = new Error('Generic Error');

        (instance.client.chat.completions.create as Mock).mockRejectedValue(genericError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'gpt-4o-mini',
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

        (instance.client.chat.completions.create as Mock).mockResolvedValue({
          tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
        });

        process.env.DEBUG_AZURE_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // Act
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-4o-mini',
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
    describe('maskSensitiveUrl', () => {
      it('should mask endpoint', () => {
        const url = 'https://test.openai.azure.com/';

        const maskedUrl = instance['maskSensitiveUrl'](url);

        expect(maskedUrl).toEqual('https://***.openai.azure.com/');
      });
    });
  });
});
