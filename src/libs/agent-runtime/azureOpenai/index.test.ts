// @vitest-environment node
import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../utils/debugStream';
import { LobeAzureOpenAI } from './index';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('LobeAzureOpenAI', () => {
  let instance: LobeAzureOpenAI;

  beforeEach(() => {
    instance = new LobeAzureOpenAI(
      'https://test.openai.azure.com/',
      'test_key',
      '2023-03-15-preview',
    );

    // 使用 vi.spyOn 来模拟 streamChatCompletions 方法
    vi.spyOn(instance['client'], 'streamChatCompletions').mockResolvedValue(
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
        expect(e).toEqual({ errorType: 'InvalidAzureAPIKey' });
      }
    });

    it('should create an instance of OpenAIClient with correct parameters', () => {
      const endpoint = 'https://test.openai.azure.com/';
      const apikey = 'test_key';
      const apiVersion = '2023-03-15-preview';

      const instance = new LobeAzureOpenAI(endpoint, apikey, apiVersion);

      expect(instance.client).toBeInstanceOf(OpenAIClient);
      expect(instance.baseURL).toBe(endpoint);
    });
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance['client'].streamChatCompletions as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    describe('Error', () => {
      it('should return AzureBizError with DeploymentNotFound error', async () => {
        // Arrange
        const error = {
          code: 'DeploymentNotFound',
          message: 'Deployment not found',
        };

        (instance['client'].streamChatCompletions as Mock).mockRejectedValue(error);

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
            endpoint: 'https://test.openai.azure.com/',
            error: {
              code: 'DeploymentNotFound',
              message: 'Deployment not found',
              deployId: 'text-davinci-003',
            },
            errorType: 'AzureBizError',
            provider: 'azure',
          });
        }
      });

      it('should return AgentRuntimeError for non-Azure errors', async () => {
        // Arrange
        const genericError = new Error('Generic Error');

        (instance['client'].streamChatCompletions as Mock).mockRejectedValue(genericError);

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
            endpoint: 'https://test.openai.azure.com/',
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

        (instance['client'].streamChatCompletions as Mock).mockResolvedValue({
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
          "frequency_penalty": 0,
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "image_url",
                  "image_url": {
                    "url": "<image URL>"
                  }
                }
              ]
            }
          ]
        };

        const newObj = instance['camelCaseKeys'](obj);

        expect(newObj).toEqual({
          "frequencyPenalty": 0,
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "image_url",
                  "imageUrl": {
                    "url": "<image URL>"
                  }
                }
              ]
            }
          ]
        });
      });
    });
  })
});
