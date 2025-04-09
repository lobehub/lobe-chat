// @vitest-environment edge-runtime
import * as AzureAI from '@azure-rest/ai-inference';
import createClient from '@azure-rest/ai-inference';
import * as AzureCoreUtil from '@azure/core-util';
import { isBrowser, isNodeLike } from '@azure/core-util';
import * as NodeHttp from 'node:http';
import { AzureOpenAI } from 'openai';
import type { ChatCompletionToolChoiceOption } from 'openai/resources/chat/completions';
import type {
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
  ResponseFormatText,
} from 'openai/resources/shared';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider, OpenAIChatMessage } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import * as CreateErrorUtils from '../utils/createError';
import * as debugStreamModule from '../utils/debugStream';
import { transformResponseToStream } from '../utils/openaiCompatibleFactory';
import { StreamingResponse } from '../utils/response';
import { OpenAIStream } from '../utils/streams';
import * as StreamUtils from '../utils/streams';
import { LobeAzureAI, convertResponseMode } from './index';

vi.mock('node:http', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    request: vi.fn().mockImplementation(() => {
      throw Error('node:http');
      return undefined as any;
    }),
    // 保留其他需要的 http 模块方法
  };
});

vi.mock('node:https', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    // your mocked methods
    request: vi.fn().mockImplementation(() => {
      throw Error('node:https');
      return undefined as any;
    }),
  };
});

//vi.mock('@azure/core-util', async (importOriginal) => {
//  const actual: any = await importOriginal()
//  return {
//    ...actual,
//    isNodeLike: false,
//  }
//});

vi.hoisted(() => {
  vi.spyOn(process.versions, 'node', 'get').mockImplementation(() => {
    return undefined as any;
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';
const endpoint = 'https://test.cognitiveservices.azure.com';
const chatCompletionPath = '/chat/completions';
const apiKey = 'test_key';
const apiVersion = '2024-05-01-preview';

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

describe('Environment checks', () => {
  it('should be edge runtime', () => {
    expect((globalThis as any).EdgeRuntime).toBeDefined();
  });

  it('should have fetch defined', () => {
    expect(global.fetch).toBeDefined();
  });

  it('should not be browser environment', () => {
    expect(isBrowser).toBe(false);
  });

  it('should not be node-like environment', () => {
    expect(isNodeLike).toBe(false);
  });
});

describe('LobeAzureAI', () => {
  describe('Integrational tests', () => {
    let instance: LobeAzureAI;
    // let originalFetch: typeof fetch;
    const mockFetch = vi.fn();

    beforeAll(() => {
      // originalFetch = global.fetch;
      // vi.mock('@azure/core-util/checkEnvironment')
      //vi.spyOn(process, 'version', 'get').mockImplementation(() => {
      //  return undefined as any;
      //});
    });

    beforeEach(() => {
      //vi.spyOn(process, 'version').mockReturnValue('test');
      //vi.spyOn(NodeHttp, 'request').mockImplementation(() => {
      //  return null as any;
      //})
      // vi.spyOn(global, 'process', 'get').mockReturnValue({ env: {}, version: '' });
      //vi.spyOn(process, 'version', 'get').mockImplementation(() => {
      //  return undefined as any;
      //});
      //vi.spyOn(AzureCoreUtil, 'isNodeLike', 'get').mockImplementation(() => {
      //  return false;
      //})
      //vi.mock('@azure/core-util', () => {
      //  const originalModule = requireActual('@azure/core-util');
      //})

      expect(isNodeLike).toBe(false);

      instance = new LobeAzureAI({
        apiKey,
        apiVersion,
        baseURL: endpoint,
      });
      expect(instance.client).toBeDefined();
      // expect(instance.client).not.toBe(mockClient);

      vi.spyOn(global, 'fetch').mockImplementation(mockFetch);
      // vi.stubGlobal('fetch', mockFetch);
    });

    afterEach(() => {
      // vi.stubGlobal('fetch', originalFetch);
      // vi.clearAllMocks();
      vi.restoreAllMocks();
    });

    it('should handle non-streaming responses', async () => {
      // Arrange
      const messages: OpenAIChatMessage[] = [
        { content: 'What is the capital of France?', role: 'user' },
      ];
      const model = 'o1-mini';
      const temperature = 0;

      const responseData = {
        choices: [
          {
            content_filter_results: {
              hate: {
                filtered: false,
                severity: 'safe',
              },
              protected_material_code: {
                filtered: false,
                detected: false,
              },
              protected_material_text: {
                filtered: false,
                detected: false,
              },
              self_harm: {
                filtered: false,
                severity: 'safe',
              },
              sexual: {
                filtered: false,
                severity: 'safe',
              },
              violence: {
                filtered: false,
                severity: 'safe',
              },
            },
            finish_reason: 'stop',
            index: 0,
            message: {
              content: 'Paris is the capital of France.',
              refusal: null,
              role: 'assistant',
            },
          },
        ],
        created: 1741748227,
        id: 'chatcmpl-BA6ZHQ4Q0fsyOaJ6rO8F3QocxfUAR',
        model: 'o1-mini-2024-09-12',
        object: 'chat.completion',
        prompt_filter_results: [
          {
            prompt_index: 0,
            content_filter_results: {
              hate: {
                filtered: false,
                severity: 'safe',
              },
              jailbreak: {
                filtered: false,
                detected: false,
              },
              self_harm: {
                filtered: false,
                severity: 'safe',
              },
              sexual: {
                filtered: false,
                severity: 'safe',
              },
              violence: {
                filtered: false,
                severity: 'safe',
              },
            },
          },
        ],
        system_fingerprint: 'fp_f6ff3bb326',
        usage: {
          completion_tokens: 338,
          completion_tokens_details: {
            accepted_prediction_tokens: 0,
            audio_tokens: 0,
            reasoning_tokens: 320,
            rejected_prediction_tokens: 0,
          },
          prompt_tokens: 14,
          prompt_tokens_details: {
            audio_tokens: 0,
            cached_tokens: 0,
          },
          total_tokens: 352,
        },
      };

      const mockResponse = new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages,
        model,
        stream: false,
        temperature,
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `${endpoint}${chatCompletionPath}?api-version=${apiVersion}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.anything(),
          body: expect.any(String),
        }),
      );
      const call = mockFetch.mock.calls[0];
      const [_url, options] = call;
      const headers = options.headers as Headers;
      const contentTypeHeader = headers.get('Content-Type');
      expect(contentTypeHeader).toBe('application/json');
      const authorizationHeader = headers.get('Authorization');
      expect(authorizationHeader).toBe(`Bearer ${apiKey}`);

      const requestBody = JSON.parse(options.body);
      expect(requestBody).toEqual(
        expect.objectContaining({
          messages,
          model,
        }),
      );

      expect(result).toBeInstanceOf(Response);
      expect(result.body).toBeDefined();

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
          'id: chatcmpl-BA6ZHQ4Q0fsyOaJ6rO8F3QocxfUAR',
          'event: text',
          'data: "Paris is the capital of France."\n',
          'id: chatcmpl-BA6ZHQ4Q0fsyOaJ6rO8F3QocxfUAR',
          'event: stop',
          'data: "stop"\n',
        ].map((s) => s + '\n'),
      );
    });

    it('should handle streaming responses', async () => {
      // Arrange
      const messages: OpenAIChatMessage[] = [
        { content: 'What is the capital of France?', role: 'user' },
      ];
      const model = 'gpt-4o';
      const temperature = 0;

      const responseData = `data: {"choices":[],"created":0,"id":"","model":"","object":"","prompt_filter_results":[{"prompt_index":0,"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"jailbreak":{"filtered":false,"detected":false},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}}}]}

data: {"choices":[{"content_filter_results":{},"delta":{"content":"","refusal":null,"role":"assistant"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":"The"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":" capital"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":" of"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":" France"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":" is"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":" **"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":"Paris"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":"**"},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":"."},"finish_reason":null,"index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: {"choices":[{"content_filter_results":{},"delta":{},"finish_reason":"stop","index":0,"logprobs":null}],"created":1742460935,"id":"chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5","model":"gpt-4o-2024-11-20","object":"chat.completion.chunk","system_fingerprint":"fp_ded0d14823"}

data: [DONE]

`;
      const mockResponse = new Response(responseData, {
        headers: {
          'Content-Type': 'text/event-stream',
        },
      });
      mockFetch.mockResolvedValue(mockResponse);
      // Act
      const result = await instance.chat({
        messages,
        model,
        stream: true,
        temperature,
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `${endpoint}${chatCompletionPath}?api-version=${apiVersion}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.anything(),
          body: expect.any(String),
        }),
      );
      const call = mockFetch.mock.calls[0];
      const [_url, options] = call;
      const headers = options.headers as Headers;
      const contentTypeHeader = headers.get('Content-Type');
      expect(contentTypeHeader).toBe('application/json');
      const authorizationHeader = headers.get('Authorization');
      expect(authorizationHeader).toBe(`Bearer ${apiKey}`);

      const requestBody = JSON.parse(options.body);
      expect(requestBody).toEqual(
        expect.objectContaining({
          messages,
          model,
        }),
      );

      expect(result).toBeInstanceOf(Response);
      expect(result.body).toBeDefined();

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
          'data: {"choices":[],"created":0,"id":"","model":"","object":"","prompt_filter_results":[{"prompt_index":0,"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"jailbreak":{"filtered":false,"detected":false},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}}}]}\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: ""\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: "The"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: " capital"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: " of"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: " France"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: " is"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: " **"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: "Paris"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: "**"\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: text',
          'data: "."\n',
          'id: chatcmpl-BD5yZBfhSLLcuDtRtF48KwOywtED5',
          'event: stop',
          'data: "stop"\n',
        ].map((s) => s + '\n'),
      );
    });

    it('should handle error in non-streaming request', async () => {
      // Arrange
      const messages: OpenAIChatMessage[] = [
        { content: 'What is the capital of France?', role: 'user' },
      ];
      const model = 'gpt-4o1';
      const temperature = 0;

      // This is an error response from GitHub, Azure AI Foundry may have different behavior
      const responseData = `{"error":{"code":"unknown_model","message":"Unknown model: gpt-4o1","details":"Unknown model: gpt-4o1"}}`;

      const mockResponse = new Response(responseData, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        status: 400,
      });
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const promise = instance.chat({
        messages,
        model,
        stream: true,
        temperature,
      });

      // Assert
      await expect(promise).rejects.toThrowError(
        expect.objectContaining({
          endpoint: 'https://***.cognitiveservices.azure.com',
          error: expect.objectContaining({
            code: 'unknown_model',
            message: 'Unknown model: gpt-4o1',
            details: 'Unknown model: gpt-4o1',
          }),
          errorType: AgentRuntimeErrorType.ProviderBizError,
          provider: 'azure', // We don't use ModelProvider.Azure here.
        }),
      );
    });
  });
});
