// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ChatStreamCallbacks,
  ChatStreamPayload,
  LLMRoleType,
  LobeOpenAICompatibleRuntime,
  ModelProvider,
} from '@/libs/agent-runtime';

import * as debugStreamModule from '../utils/debugStream';
import { LobeDeepSeekAI } from './index';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

const provider = ModelProvider.DeepSeek;
const defaultBaseURL = 'https://api.deepseek.com/v1';

const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

const createDeepSeekAIInstance = () => new LobeDeepSeekAI({ apiKey: 'test' });

const mockSuccessfulChatCompletion = () => {
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue({
    id: 'cmpl-mock',
    object: 'chat.completion',
    created: Date.now(),
    choices: [{ index: 0, message: { role: 'assistant', content: 'Mock response' }, finish_reason: 'stop' }],
  } as any);
};

beforeEach(() => {
  instance = new LobeDeepSeekAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeDeepSeekAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeDeepSeekAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeDeepSeekAI);
      expect(instance.baseURL).toEqual(defaultBaseURL);
    });
  });

  describe('chat', () => {
    describe('Error', () => {
      it('should return OpenAIBizError with an openai error response when OpenAI.APIError is thrown', async () => {
        // Arrange
        const apiError = new OpenAI.APIError(
          400,
          {
            status: 400,
            error: {
              message: 'Bad Request',
            },
          },
          'Error message',
          {},
        );

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'deepseek-chat',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: {
              error: { message: 'Bad Request' },
              status: 400,
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw AgentRuntimeError with NoOpenAIAPIKey if no apiKey is provided', async () => {
        try {
          new LobeDeepSeekAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: invalidErrorType });
        }
      });

      it('should return OpenAIBizError with the cause when OpenAI.APIError is thrown with cause', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: {
            message: 'api is undefined',
          },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'deepseek-chat',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should return OpenAIBizError with an cause response with desensitize Url', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: { message: 'api is undefined' },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        instance = new LobeDeepSeekAI({
          apiKey: 'test',

          baseURL: 'https://api.abc.com/v1',
        });

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'deepseek-chat',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.***.com/v1',
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw an InvalidDeepSeekAPIKey error type on 401 status code', async () => {
        // Mock the API call to simulate a 401 error
        const error = new Error('Unauthorized') as any;
        error.status = 401;
        vi.mocked(instance['client'].chat.completions.create).mockRejectedValue(error);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'deepseek-chat',
            temperature: 0,
          });
        } catch (e) {
          // Expect the chat method to throw an error with InvalidDeepSeekAPIKey
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: new Error('Unauthorized'),
            errorType: invalidErrorType,
            provider,
          });
        }
      });

      it('should return AgentRuntimeError for non-OpenAI errors', async () => {
        // Arrange
        const genericError = new Error('Generic Error');

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(genericError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'deepseek-chat',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            errorType: 'AgentRuntimeError',
            provider,
            error: {
              name: genericError.name,
              cause: genericError.cause,
              message: genericError.message,
              stack: genericError.stack,
            },
          });
        }
      });
    });

    describe('DEBUG', () => {
      it('should call debugStream and return StreamingTextResponse when DEBUG_DEEPSEEK_CHAT_COMPLETION is 1', async () => {
        // Arrange
        const mockProdStream = new ReadableStream() as any; // 模拟的 prod 流
        const mockDebugStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Debug stream content');
            controller.close();
          },
        }) as any;
        mockDebugStream.toReadableStream = () => mockDebugStream; // 添加 toReadableStream 方法

        // 模拟 chat.completions.create 返回值，包括模拟的 tee 方法
        (instance['client'].chat.completions.create as Mock).mockResolvedValue({
          tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
        });

        // 保存原始环境变量值
        const originalDebugValue = process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        // 运行你的测试函数，确保它会在条件满足时调用 debugStream
        // 假设的测试函数调用，你可能需要根据实际情况调整
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'deepseek-chat',
          stream: true,
          temperature: 0,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION = originalDebugValue;
      });
    });

    describe('deepseek-reasoner', () => {
      beforeEach(() => {
        instance = createDeepSeekAIInstance();
        mockSuccessfulChatCompletion();
      });

      it('should insert a user message if the first message is from assistant', async () => {
        const payloadMessages = [{ content: 'Hello', role: 'assistant' as LLMRoleType }];
        const expectedMessages = [
          { content: '', role: 'user' },
          ...payloadMessages,
        ];

        const payload: ChatStreamPayload = {
          messages: payloadMessages,
          model: 'deepseek-reasoner',
          temperature: 0,
        };

        await instance.chat(payload);

        expect(instance['client'].chat.completions.create).toHaveBeenCalled();
        const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
        const actualMessages = actualArgs[0].messages;
        expect(actualMessages).toEqual(expectedMessages);
      });

      it('should insert a user message if the first message is from assistant (with system summary)', async () => {
        const payloadMessages = [
          { content: 'System summary', role: 'system' as LLMRoleType },
          { content: 'Hello', role: 'assistant' as LLMRoleType },
        ];
        const expectedMessages = [
          { content: 'System summary', role: 'system' },
          { content: '', role: 'user' },
          { content: 'Hello', role: 'assistant' },
        ];

        const payload: ChatStreamPayload = {
          messages: payloadMessages,
          model: 'deepseek-reasoner',
          temperature: 0,
        };

        await instance.chat(payload);

        expect(instance['client'].chat.completions.create).toHaveBeenCalled();
        const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
        const actualMessages = actualArgs[0].messages;
        expect(actualMessages).toEqual(expectedMessages);
      });

      it('should insert alternating roles if messages do not alternate', async () => {
        const payloadMessages = [
          { content: 'user1', role: 'user' as LLMRoleType },
          { content: 'user2', role: 'user' as LLMRoleType },
          { content: 'assistant1', role: 'assistant' as LLMRoleType },
          { content: 'assistant2', role: 'assistant' as LLMRoleType },
        ];
        const expectedMessages = [
          { content: 'user1', role: 'user' },
          { content: '', role: 'assistant' },
          { content: 'user2', role: 'user' },
          { content: 'assistant1', role: 'assistant' },
          { content: '', role: 'user' },
          { content: 'assistant2', role: 'assistant' },
        ];

        const payload: ChatStreamPayload = {
          messages: payloadMessages,
          model: 'deepseek-reasoner',
          temperature: 0,
        };

        await instance.chat(payload);

        expect(instance['client'].chat.completions.create).toHaveBeenCalled();
        const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
        const actualMessages = actualArgs[0].messages;
        expect(actualMessages).toEqual(expectedMessages);
      });

      it('complex condition', async () => {
        const payloadMessages = [
          { content: 'system', role: 'system' as LLMRoleType },
          { content: 'assistant', role: 'assistant' as LLMRoleType },
          { content: 'user1', role: 'user' as LLMRoleType },
          { content: 'user2', role: 'user' as LLMRoleType },
          { content: 'user3', role: 'user' as LLMRoleType },
          { content: 'assistant1', role: 'assistant' as LLMRoleType },
          { content: 'assistant2', role: 'assistant' as LLMRoleType },
        ];
        const expectedMessages = [
          { content: 'system', role: 'system' },
          { content: '', role: 'user' },
          { content: 'assistant', role: 'assistant' },
          { content: 'user1', role: 'user' },
          { content: '', role: 'assistant' },
          { content: 'user2', role: 'user' },
          { content: '', role: 'assistant' },
          { content: 'user3', role: 'user' },
          { content: 'assistant1', role: 'assistant' },
          { content: '', role: 'user' },
          { content: 'assistant2', role: 'assistant' },
        ];

        const payload: ChatStreamPayload = {
          messages: payloadMessages,
          model: 'deepseek-reasoner',
          temperature: 0,
        };

        await instance.chat(payload);

        expect(instance['client'].chat.completions.create).toHaveBeenCalled();
        const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
        const actualMessages = actualArgs[0].messages;
        expect(actualMessages).toEqual(expectedMessages);
      });
    });
  });
});
