// @vitest-environment edge-runtime
const mockFetch = vi.hoisted(() => vi.fn());

import { AzureOpenAI } from 'openai';
import type { ChatCompletionToolChoiceOption } from 'openai/resources/chat/completions';
import type {
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
  ResponseFormatText,
} from 'openai/resources/shared';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../utils/debugStream';
import { LobeAzureAI, convertResponseMode } from './index';
import { AgentRuntimeErrorType } from '../error';
import { ModelProvider, OpenAIChatMessage } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import * as CreateErrorUtils from '../utils/createError';
import * as AzureAI from '@azure-rest/ai-inference';
import createClient from '@azure-rest/ai-inference';
import { StreamingResponse } from '../utils/response';
import * as ResponseUtils from '../utils/response';
import { OpenAIStream } from '../utils/streams';
import * as StreamUtils from '../utils/streams';
import { transformResponseToStream } from '../utils/openaiCompatibleFactory';
import * as OpenAIFactory from '../utils/openaiCompatibleFactory';

declare module './index' {
  export function convertResponseMode(
    responseMode?: 'streamText' | 'json',
  ): ResponseFormatText | ResponseFormatJSONObject | ResponseFormatJSONSchema | undefined;
}

const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';
const endpoint = 'https://test.cognitiveservices.azure.com/';
const apiKey = 'test_key';
const apiVersion = '2024-06-01';

const testStreamData = [
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

//// Mock dependencies
//vi.mock('@azure-rest/ai-inference', () => ({
//  default: vi.fn(),
//}));
//
//vi.mock('../utils/response', () => ({
//  StreamingResponse: vi.fn(),
//}));
//
//vi.mock('../utils/streams', () => ({
//  OpenAIStream: vi.fn(),
//  createSSEDataExtractor: vi.fn(() => ({ transform: vi.fn() })),
//}));
//
//vi.mock('../utils/openaiCompatibleFactory', () => ({
//  transformResponseToStream: vi.fn(),
//}));
//
//vi.mock('../utils/debugStream', () => ({
//  debugStream: vi.fn(),
//}));
//
//vi.mock('@/const/models', () => ({
//  systemToUserModels: ['gpt-4-turbo'],
//}));

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
});

describe('LobeAzureAI', () => {
  const mockClient = {
    path: vi.fn(() => ({
      post: vi.fn(),
    })),
  };

  beforeEach(() => {
    //vi.mock('../utils/createError', () => ({
    //  AgentRuntimeError: {
    //    createError: vi.fn(),
    //    chat: vi.fn(),
    //  },
    //}));
    vi.spyOn(CreateErrorUtils.AgentRuntimeError, 'createError');
    vi.spyOn(CreateErrorUtils.AgentRuntimeError, 'chat');
  })

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    beforeEach(() => {
      vi.spyOn(AzureAI, 'default');
    });

    it('should throw InvalidAzureAPIKey error when apikey or endpoint is missing', () => {
      (AgentRuntimeError.createError as Mock).mockReturnValue(new Error('API key missing'));

      expect(() => new LobeAzureAI()).toThrow();
      expect(AgentRuntimeError.createError).toHaveBeenCalledWith(
        AgentRuntimeErrorType.InvalidProviderAPIKey
      );
    });

    it('should throw an error when baseURL is missing', () => {
      (AgentRuntimeError.createError as Mock).mockReturnValue(new Error('Base URL missing'));

      expect(() => new LobeAzureAI({ apiKey: 'test-key' })).toThrow();
      expect(AgentRuntimeError.createError).toHaveBeenCalledWith(
        AgentRuntimeErrorType.InvalidProviderAPIKey
      );
    });

    it('should create a client with the provided parameters', () => {
      const azureAI = new LobeAzureAI({
        apiKey,
        apiVersion,
        baseURL: endpoint,
      });

      expect(createClient).toHaveBeenCalled();
      expect(azureAI.baseURL).toBe(endpoint);
    });
  });

  describe('methods', () => {
    let instance: LobeAzureAI;
    const mockPost = vi.fn();

    beforeEach(() => {
      // vi.mock('@azure-rest/ai-inference', () => ({
      //   default: vi.fn(),
      // }));
      vi.spyOn(AzureAI, 'default');
      mockClient.path.mockReturnValue({ post: mockPost });
      (createClient as Mock).mockReturnValue(mockClient);

      vi.spyOn(StreamUtils, 'OpenAIStream');

      instance = new LobeAzureAI({
        apiKey,
        apiVersion,
        baseURL: endpoint,
      });

      expect(instance.client).toBe(mockClient);
    });

//    it('should return a Response on successful API call', async () => {
//      // Arrange
//      const messages: OpenAIChatMessage[] = [{ content: 'Hello', role: 'user' }];
//      const model = 'gpt-4o-mini';
//      const temperature = 0;
//
//      const mockStream = new ReadableStream();
//      const mockResponse = Promise.resolve(mockStream);
//      mockPost.mockResolvedValue(mockResponse);
//
//      // Act
//      const result = await instance.chat({
//        messages,
//        model,
//        temperature,
//      });
//
//      // Assert
//      expect(mockPost).toHaveBeenCalledWith(expect.objectContaining({
//        body: expect.objectContaining({
//          messages,
//          model,
//          temperature,
//        }),
//      }));
//      expect(result).toBeInstanceOf(Response);
//    });

    describe('chat', () => {
      const nonStreamResponseData: AzureAI.GetChatCompletions200Response = {
        body: {
          choices: [],
          id: '',
          model: '',
          created: 0,
          usage: {
            completion_tokens: 0,
            prompt_tokens: 0,
            total_tokens: 0,
          }
        },
        request: null as any, // not used.
        headers: null as any, // not used.
        status: '200',
      };

      describe('system role conversion', () => {
        const messages: OpenAIChatMessage[] = [{ role: 'system', content: 'You are an assistant' }];
        const expectedUserMessages = [{ role: 'user', content: 'You are an assistant' }];
        const expectedDeveloperMessages = [{ role: 'developer', content: 'You are an assistant' }];

        const models = ['gpt-4-turbo', 'gpt-4o'];
        const convertToUserModels = ['o1-mini', 'o1-preview'];
        const convertToDeveloperModels = ['o1', 'o3-mini'];

        for (const model of models) {
          it(`should not convert system role for ${model}.`, async () => {
            // Arrange
            mockPost.mockResolvedValue(nonStreamResponseData);
            //transformResponseToStream.mockReturnValue({ /* mock stream */ });

            // Act
            await instance.chat({
              messages,
              model,
              stream: false,
              temperature: 0,
            });

            // Assert
            expect(mockPost).toHaveBeenCalledWith(expect.objectContaining({
              body: expect.objectContaining({
                messages,
              }),
            }));
          });
        }

        for (const model of convertToUserModels) {
          it(`should convert system role to user for ${model}.`, async () => {
            // Arrange
            mockPost.mockResolvedValue(nonStreamResponseData);
            //transformResponseToStream.mockReturnValue({ /* mock stream */ });

            // Act
            await instance.chat({
              messages,
              model,
              stream: false,
              temperature: 0,
            });

            // Assert
            expect(mockPost).toHaveBeenCalledWith(expect.objectContaining({
              body: expect.objectContaining({
                messages: expectedUserMessages,
              }),
            }));
          });
        }

        for (const model of convertToDeveloperModels) {
          it(`should convert system role to developer for ${model}.`, async () => {
            // Arrange
            mockPost.mockResolvedValue(nonStreamResponseData);
            // transformResponseToStream.mockReturnValue({ /* mock stream */ });

            // Act
            await instance.chat({
              messages,
              model,
              stream: false,
              temperature: 0,
            });

            // Assert
            expect(mockPost).toHaveBeenCalledWith(expect.objectContaining({
              body: expect.objectContaining({
                messages: expectedDeveloperMessages,
              }),
            }));
          });
        }
      });

      describe('stream off for o1 models', () => {
        const models = ['o1-mini', 'o1-preview', 'o1'];

        for (const model of models) {
          it(`should force streaming off for ${model}.`, async () => {
            // Arrange
            mockPost.mockResolvedValue(nonStreamResponseData);
            //transformResponseToStream.mockReturnValue({ /* mock stream */ });

            // Act
            await instance.chat({
              messages: [],
              model,
              stream: true, // Should be forced to false
              temperature: 0,
            });

            // Assert
            expect(mockPost).toHaveBeenCalledWith(expect.objectContaining({
              body: expect.objectContaining({
                stream: false,
              }),
            }));
          });
        }
      });

      it('should handle streaming responses', async () => {
        // Arrange
        //vi.mock('../utils/response', () => ({
        //  StreamingResponse: vi.fn(),
        //}));

        //vi.mock('../utils/streams', () => ({
        //  OpenAIStream: vi.fn(),
        //  createSSEDataExtractor: vi.fn(() => ({ transform: vi.fn() })),
        //}));

        const mockStream = new ReadableStream({
          start(controller) {
            testStreamData.forEach((data) => {
              const encoder = new TextEncoder();
              const encodedData = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
              controller.enqueue(encodedData);
            });
            controller.close();
          },
        });
        // const mockResponse = Promise.resolve(mockStream);
        // mockPost.mockResolvedValue(mockStream);

        // const mockTee = vi.fn(() => ['mockProd', 'mockDebug']);
        // const mockStream = { body: { tee: mockTee } };
        mockPost.mockReturnValue({ asBrowserStream: vi.fn().mockResolvedValue({ body: mockStream }) });
        //(OpenAIStream as Mock).mockReturnValue('openai-stream');
        //(StreamingResponse as Mock).mockReturnValue('stream-response');

        // Act
        const result = await instance.chat({
          messages: [],
          model: 'gpt-35-turbo',
          stream: true,
          temperature: 0,
        });

        // Assert
        expect(result).toBeInstanceOf(Response);
        expect(result.body).toBeDefined();
        expect(result.body).toBeInstanceOf(ReadableStream);

        const decoder = new TextDecoder();
        const reader = result.body!.getReader();
        const chunks: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(decoder.decode(value));
        }

        expect(chunks).toEqual(
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
        )
        // expect(OpenAIStream).toHaveBeenCalledWith('mockProd', expect.anything());
        // expect(StreamingResponse).toHaveBeenCalledWith('openai-stream', expect.anything());
      });

      it('should handle non-streaming responses', async () => {
        // Arrange

        const responseData = nonStreamResponseData;
        responseData.body.id = 'test-id';
        mockPost.mockResolvedValue(responseData);
        vi.spyOn(OpenAIFactory, 'transformResponseToStream').mockReturnValue('transformed-stream' as any);
        vi.spyOn(ResponseUtils, 'StreamingResponse').mockReturnValue('stream-response' as any);
        vi.spyOn(StreamUtils, 'OpenAIStream').mockReturnValue('openai-stream' as any);

        // Act
        const result = await instance.chat({
          messages: [],
          model: 'gpt-35-turbo',
          stream: false,
          temperature: 0,
        });

        // Assert
        expect(result).toBe('stream-response');
        expect(transformResponseToStream).toHaveBeenCalledWith(expect.objectContaining({
          id: 'test-id',
        }));
      });

      it('should call debugStream when DEBUG_CHAT_COMPLETION is 1', async () => {
      // Arrange
      const mockProdStream = new ReadableStream();
      const mockDebugStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Debug stream content');
          controller.close();
        },
      });
      //mockDebugStream.toReadableStream = () => mockDebugStream;

      mockPost.mockReturnValue({ asBrowserStream: vi.fn().mockResolvedValue({
        body: mockProdStream,
        tee: () => [mockProdStream, mockDebugStream ],
      }) });
      //mockPost.mockResolvedValue({
      //  tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
      //});

      const env = process.env;
      vi.spyOn(process, 'env', 'get').mockImplementation(() => {
        return { ...env, DEBUG_AZURE_AI_CHAT_COMPLETION: '1' };
      });
      vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

      // Act
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gpt-4o-mini',
        temperature: 0,
      });

      // Assert
      expect(debugStreamModule.debugStream).toHaveBeenCalled();
    });

      describe('Error handling', () => {
        it('should handle errors with code and message in streaming mode', async () => {
          // Arrange
          const model = 'model1';
          const error = { code: 'unknown_model', message: 'Unknown model: model1' };
          const errorResponse = vi.fn(() => Promise.reject(error));
          //mockPost.mockRejectedValue(error);
          mockPost.mockReturnValue({ asBrowserStream: errorResponse });
          (AgentRuntimeError.chat as Mock).mockImplementation(() => {
            throw new Error('Deployment not found');
          });

          // Act & Assert
          await expect(instance.chat({
            messages: [],
            model,
            stream: true,
            temperature: 0,
          })).rejects.toThrow('Deployment not found');

          expect(AgentRuntimeError.chat).toHaveBeenCalledWith(expect.objectContaining({
            errorType: AgentRuntimeErrorType.ProviderBizError,
            provider: ModelProvider.Azure,
            error: expect.objectContaining({
              code: error.code,
              message: error.message,
            }),
          }));
        });

        it('should handle errors with code and message in non-streaming mode', async () => {
          // Arrange
          const model = 'model1';
          const error = { code: 'unknown_model', message: 'Unknown model: model1' };
          mockPost.mockRejectedValue(error);
          (AgentRuntimeError.chat as Mock).mockImplementation(() => {
            throw new Error('Deployment not found');
          });

          // Act & Assert
          await expect(instance.chat({
            messages: [],
            model,
            stream: false,
            temperature: 0,
          })).rejects.toThrow('Deployment not found');

          expect(AgentRuntimeError.chat).toHaveBeenCalledWith(expect.objectContaining({
            errorType: AgentRuntimeErrorType.ProviderBizError,
            provider: ModelProvider.Azure,
            error: expect.objectContaining({
              code: error.code,
              message: error.message,
            }),
          }));
        });


        it('should handle general errors', async () => {
          // Arrange
          const error = new Error('Network error');
          mockPost.mockRejectedValue(error);
          (AgentRuntimeError.chat as Mock).mockImplementation(() => {
            throw error;
          });

          // Act & Assert
          await expect(instance.chat({
            messages: [],
            model: 'gpt-35-turbo',
            stream: false,
            temperature: 0,
          })).rejects.toThrow(error);

          expect(AgentRuntimeError.chat).toHaveBeenCalledWith(expect.objectContaining({
            errorType: AgentRuntimeErrorType.AgentRuntimeError,
            provider: ModelProvider.Azure,
          }));
        });
      });
    });

    describe('Utils', () => {
      describe('maskSensitiveUrl', () => {
        type Endpoint = {
          description: string;
          endpoint: string;
        }
        const endpoints: Endpoint[] = [
          {
            description: 'Inference style endpoint',
            endpoint: 'https://test.services.ai.azure.com/',
          },
          {
            description: 'OpenAI style endpoint',
            endpoint: 'https://test.openai.azure.com/',
          },
          {
            description: 'Cognitive style endpoint',
            endpoint: 'https://test.cognitiveservices.azure.com/',
          },
          {
            description: 'Inference style endpoint without trailing slash',
            endpoint: 'https://test.services.ai.azure.com',
          },
        ]

        for (const { description, endpoint } of endpoints) {
          it(`should mask ${description}`, () => {
            // Act
            const result = instance['maskSensitiveUrl'](endpoint);

            // Assert
            expect(result).toBe(endpoint.replace('test', '***'));
          });
        }

//        it('should mask cognitive style endpoint', async () => {
//          //const instance = new LobeAzureAI({
//          //  apiKey,
//          //  apiVersion,
//          //  baseURL: endpoint,
//          //});
//          // Arrange
//          instance.baseURL = 'https://test.cognitiveservices.azure.com/';
//
//          // Testing indirectly through error handling
//          mockClient.path().post.mockRejectedValue(new Error('Test error'));
//
//          // Act
//          const promise = instance.chat({
//            messages: [],
//            model: 'gpt-35-turbo',
//            stream: false,
//            temperature: 0,
//          });
//
//          // Assert
//          await expect(promise).rejects.toThrow();
//          expect(AgentRuntimeError.chat).toHaveBeenCalledWith(expect.objectContaining({
//            endpoint: 'https://***.cognitiveservices.azure.com/',
//          }));
//        });
      });
    });
  });

//  describe('Integrational tests', () => {
//    let instance: LobeAzureAI;
//    let originalFetch: typeof fetch;
//    const mockFetch = vi.fn();
//
//    beforeAll(() => {
//      //originalFetch = global.fetch;
//    });
//
//    beforeEach(() => {
//      instance = new LobeAzureAI({
//        apiKey,
//        apiVersion,
//        baseURL: endpoint,
//      });
//      expect(instance.client).toBeDefined();
//      expect(instance.client).not.toBe(mockClient);
//
//      vi.spyOn(global, 'fetch').mockImplementation(mockFetch);
//      // vi.stubGlobal('fetch', mockFetch);
//    });
//
//    afterEach(() => {
//      //vi.stubGlobal('fetch', originalFetch);
//      //vi.clearAllMocks();
//      vi.restoreAllMocks();
//    });
//
//    it('should handle non-streaming responses', async () => {
//      // Arrange
//      const messages: OpenAIChatMessage[] = [{ content: 'What is the capital of France?', role: 'user' }];
//      const model = 'o1-mini';
//      const temperature = 0;
//
//      const responseData = {
//        "choices": [
//          {
//            "content_filter_results": {
//              "hate": {
//                "filtered": false,
//                "severity": "safe"
//              },
//              "protected_material_code": {
//                "filtered": false,
//                "detected": false
//              },
//              "protected_material_text": {
//                "filtered": false,
//                "detected": false
//              },
//              "self_harm": {
//                "filtered": false,
//                "severity": "safe"
//              },
//              "sexual": {
//                "filtered": false,
//                "severity": "safe"
//              },
//              "violence": {
//                "filtered": false,
//                "severity": "safe"
//              }
//            },
//            "finish_reason": "stop",
//            "index": 0,
//            "message": {
//              "content": "Paris is the capital of France.",
//              "refusal": null,
//              "role": "assistant"
//            }
//          }
//        ],
//        "created": 1741748227,
//        "id": "chatcmpl-BA6ZHQ4Q0fsyOaJ6rO8F3QocxfUAR",
//        "model": "o1-mini-2024-09-12",
//        "object": "chat.completion",
//        "prompt_filter_results": [
//          {
//            "prompt_index": 0,
//            "content_filter_results": {
//              "hate": {
//                "filtered": false,
//                "severity": "safe"
//              },
//              "jailbreak": {
//                "filtered": false,
//                "detected": false
//              },
//              "self_harm": {
//                "filtered": false,
//                "severity": "safe"
//              },
//              "sexual": {
//                "filtered": false,
//                "severity": "safe"
//              },
//              "violence": {
//                "filtered": false,
//                "severity": "safe"
//              }
//            }
//          }
//        ],
//        "system_fingerprint": "fp_f6ff3bb326",
//        "usage": {
//          "completion_tokens": 338,
//          "completion_tokens_details": {
//            "accepted_prediction_tokens": 0,
//            "audio_tokens": 0,
//            "reasoning_tokens": 320,
//            "rejected_prediction_tokens": 0
//          },
//          "prompt_tokens": 14,
//          "prompt_tokens_details": {
//            "audio_tokens": 0,
//            "cached_tokens": 0
//          },
//          "total_tokens": 352
//        }
//      }
//
//      const mockResponse = new Response(JSON.stringify(responseData));
//      mockFetch.mockResolvedValue(mockResponse);
//
//      // Act
//      const result = await instance.chat({
//        messages,
//        model,
//        stream: false,
//        temperature,
//      });
//
//      // Assert
//      expect(global.fetch as Mock).toHaveBeenCalledWith(
//        `${endpoint}?api-version=${apiVersion}`,
//        expect.objectContaining({
//          method: 'POST',
//          headers: expect.objectContaining({
//            'Content-Type': 'application/json',
//            'Authorization': `Bearer ${apiKey}`,
//          }),
//          body: expect.any(String),
//        }),
//      );
//
//      const requestBody = JSON.parse((global.fetch as Mock).mock.calls[0][1].body);
//      expect(requestBody).toEqual(expect.objectContaining({
//        messages,
//        model,
//      }));
//
//      expect(result).toBeInstanceOf(Response);
//      
//      const response = await result.json();
//      expect(response).toEqual(responseData);
//    });
//  });
});
