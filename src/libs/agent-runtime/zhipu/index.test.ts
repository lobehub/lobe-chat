// @vitest-environment node
import { OpenAI } from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatStreamCallbacks, LobeOpenAI, LobeOpenAICompatibleRuntime } from '@/libs/agent-runtime';
import * as debugStreamModule from '@/libs/agent-runtime/utils/debugStream';

import * as authTokenModule from './authToken';
import { LobeZhipuAI } from './index';

const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';

// Mock相关依赖
vi.mock('./authToken');

describe('LobeZhipuAI', () => {
  beforeEach(() => {
    // Mock generateApiToken
    vi.spyOn(authTokenModule, 'generateApiToken').mockResolvedValue('mocked_token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('chat', () => {
    let instance: LobeOpenAICompatibleRuntime;

    beforeEach(async () => {
      instance = new LobeZhipuAI({
        apiKey: 'test_api_key',
      });

      // Mock chat.completions.create
      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
        new ReadableStream() as any,
      );
    });

    it('should return a StreamingTextResponse on successful API call', async () => {
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'glm-4',
        temperature: 0,
      });
      expect(result).toBeInstanceOf(Response);
    });

    it('should handle callback and headers correctly', async () => {
      // 模拟 chat.completions.create 方法返回一个可读流
      const mockCreateMethod = vi
        .spyOn(instance['client'].chat.completions, 'create')
        .mockResolvedValue(
          new ReadableStream({
            start(controller) {
              controller.enqueue({
                id: 'chatcmpl-8xDx5AETP8mESQN7UB30GxTN2H1SO',
                object: 'chat.completion.chunk',
                created: 1709125675,
                model: 'gpt-3.5-turbo-0125',
                system_fingerprint: 'fp_86156a94a0',
                choices: [
                  { index: 0, delta: { content: 'hello' }, logprobs: null, finish_reason: null },
                ],
              });
              controller.close();
            },
          }) as any,
        );

      // 准备 callback 和 headers
      const mockCallback: ChatStreamCallbacks = {
        onStart: vi.fn(),
        onToken: vi.fn(),
      };
      const mockHeaders = { 'Custom-Header': 'TestValue' };

      // 执行测试
      const result = await instance.chat(
        {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        },
        { callback: mockCallback, headers: mockHeaders },
      );

      // 验证 callback 被调用
      await result.text(); // 确保流被消费
      expect(mockCallback.onStart).toHaveBeenCalled();
      expect(mockCallback.onToken).toHaveBeenCalledWith('hello');

      // 验证 headers 被正确传递
      expect(result.headers.get('Custom-Header')).toEqual('TestValue');

      // 清理
      mockCreateMethod.mockRestore();
    });

    it('should transform messages correctly', async () => {
      const spyOn = vi.spyOn(instance['client'].chat.completions, 'create');

      await instance.chat({
        messages: [
          { content: 'Hello', role: 'user' },
          { content: [{ type: 'text', text: 'Hello again' }], role: 'user' },
        ],
        model: 'glm-4',
        temperature: 1.6,
        top_p: 1,
      });

      const calledWithParams = spyOn.mock.calls[0][0];

      expect(calledWithParams.messages[1].content).toEqual([{ type: 'text', text: 'Hello again' }]);
      expect(calledWithParams.temperature).toBe(0.8); // temperature should be divided by two
      expect(calledWithParams.top_p).toEqual(1);
    });

    it('should pass arameters correctly', async () => {
      const spyOn = vi.spyOn(instance['client'].chat.completions, 'create');

      await instance.chat({
        messages: [
          { content: 'Hello', role: 'user' },
          { content: [{ type: 'text', text: 'Hello again' }], role: 'user' },
        ],
        model: 'glm-4-alltools',
        temperature: 0,
        top_p: 1,
      });

      const calledWithParams = spyOn.mock.calls[0][0];

      expect(calledWithParams.messages[1].content).toEqual([{ type: 'text', text: 'Hello again' }]);
      expect(calledWithParams.temperature).toBe(0.01);
      expect(calledWithParams.top_p).toEqual(0.99);
    });

    describe('Error', () => {
      it('should return ZhipuAIBizError with an openai error response when OpenAI.APIError is thrown', async () => {
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
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://open.bigmodel.cn/api/paas/v4',
            error: {
              error: { message: 'Bad Request' },
              status: 400,
            },
            errorType: bizErrorType,
            provider: 'zhipu',
          });
        }
      });

      it('should throw AgentRuntimeError with NoOpenAIAPIKey if no apiKey is provided', async () => {
        try {
          new LobeZhipuAI({ apiKey: '' });
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
            model: 'text-davinci-003',
            temperature: 0.2,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://open.bigmodel.cn/api/paas/v4',
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider: 'zhipu',
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

        instance = new LobeZhipuAI({
          apiKey: 'test',

          baseURL: 'https://abc.com/v2',
        });

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'gpt-3.5-turbo',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://***.com/v2',
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider: 'zhipu',
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
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://open.bigmodel.cn/api/paas/v4',
            errorType: 'AgentRuntimeError',
            provider: 'zhipu',
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
      it('should call debugStream and return StreamingTextResponse when DEBUG_OPENAI_CHAT_COMPLETION is 1', async () => {
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
        const originalDebugValue = process.env.DEBUG_ZHIPU_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_ZHIPU_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        // 运行你的测试函数，确保它会在条件满足时调用 debugStream
        // 假设的测试函数调用，你可能需要根据实际情况调整
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_ZHIPU_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });
});
