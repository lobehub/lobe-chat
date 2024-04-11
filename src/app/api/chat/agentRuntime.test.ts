// @vitest-environment node
import { Langfuse } from 'langfuse';
import { LangfuseGenerationClient, LangfuseTraceClient } from 'langfuse-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getServerConfig } from '@/config/server';
import { JWTPayload } from '@/const/auth';
import { TraceNameMap } from '@/const/trace';
import {
  ChatStreamPayload,
  LobeAnthropicAI,
  LobeAzureOpenAI,
  LobeBedrockAI,
  LobeGoogleAI,
  LobeMistralAI,
  LobeMoonshotAI,
  LobeOllamaAI,
  LobeOpenAI,
  LobeOpenRouterAI,
  LobePerplexityAI,
  LobeRuntimeAI,
  LobeTogetherAI,
  LobeZhipuAI,
  ModelProvider,
} from '@/libs/agent-runtime';

import AgentRuntime, { AgentChatOptions } from './agentRuntime';

// 模拟依赖项
vi.mock('@/config/server', () => ({
  getServerConfig: vi.fn(() => ({
    // 确保为每个provider提供必要的配置信息
    OPENAI_API_KEY: 'test-openai-key',
    GOOGLE_API_KEY: 'test-google-key',

    AZURE_API_KEY: 'test-azure-key',
    AZURE_ENDPOINT: 'endpoint',

    ZHIPU_API_KEY: 'test.zhipu-key',
    MOONSHOT_API_KEY: 'test-moonshot-key',
    AWS_SECRET_ACCESS_KEY: 'test-aws-secret',
    AWS_ACCESS_KEY_ID: 'test-aws-id',
    AWS_REGION: 'test-aws-region',
    OLLAMA_PROXY_URL: 'test-ollama-url',
    PERPLEXITY_API_KEY: 'test-perplexity-key',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    MISTRAL_API_KEY: 'test-mistral-key',
    OPENROUTER_API_KEY: 'test-openrouter-key',
    TOGETHERAI_API_KEY: 'test-togetherai-key',
  })),
}));

describe('AgentRuntime', () => {
  describe('should initialize with various providers', () => {
    describe('OpenAI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-openai-key', endpoint: 'user-endpoint' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.OpenAI,
          jwtPayload,
        );

        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenAI);
        expect(runtime['_runtime'].baseURL).toBe('user-endpoint');
      });
    });

    describe('Azure OpenAI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = {
          apiKey: 'user-azure-key',
          endpoint: 'user-azure-endpoint',
          azureApiVersion: '2024-02-01',
        };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Azure,
          jwtPayload,
        );

        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeAzureOpenAI);
        expect(runtime['_runtime'].baseURL).toBe('user-azure-endpoint');
      });
      it('should initialize with azureOpenAIParams correctly', async () => {
        const jwtPayload: JWTPayload = {
          apiKey: 'user-openai-key',
          endpoint: 'user-endpoint',
          azureApiVersion: 'custom-version',
        };

        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Azure,
          jwtPayload,
        );

        expect(runtime).toBeInstanceOf(AgentRuntime);
        const openAIRuntime = runtime['_runtime'] as LobeRuntimeAI;
        expect(openAIRuntime).toBeInstanceOf(LobeAzureOpenAI);
      });

      it('should initialize with AzureAI correctly', async () => {
        const jwtPayload: JWTPayload = {
          apiKey: 'user-azure-key',
          endpoint: 'user-azure-endpoint',
        };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Azure,
          jwtPayload,
        );

        expect(runtime['_runtime']).toBeInstanceOf(LobeAzureOpenAI);
      });
      it('should initialize AzureAI correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Azure,
          jwtPayload,
        );

        expect(runtime['_runtime']).toBeInstanceOf(LobeAzureOpenAI);
      });
    });

    describe('ZhiPu AI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'zhipu.user-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.ZhiPu,
          jwtPayload,
        );

        // 假设 LobeZhipuAI 是 ZhiPu 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeZhipuAI);
      });
      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.ZhiPu,
          jwtPayload,
        );

        // 假设 LobeZhipuAI 是 ZhiPu 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeZhipuAI);
      });
    });

    describe('Google provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-google-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Google,
          jwtPayload,
        );

        // 假设 LobeGoogleAI 是 Google 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeGoogleAI);
      });

      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Google,
          jwtPayload,
        );

        // 假设 LobeGoogleAI 是 Google 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeGoogleAI);
      });
    });

    describe('Moonshot AI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-moonshot-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Moonshot,
          jwtPayload,
        );

        // 假设 LobeMoonshotAI 是 Moonshot 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeMoonshotAI);
      });
      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Moonshot,
          jwtPayload,
        );

        // 假设 LobeMoonshotAI 是 Moonshot 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeMoonshotAI);
      });
    });

    describe('Bedrock AI provider', () => {
      it('should initialize correctly with payload apiKey', async () => {
        const jwtPayload: JWTPayload = {
          apiKey: 'user-bedrock-key',
          awsAccessKeyId: 'user-aws-id',
          awsSecretAccessKey: 'user-aws-secret',
          awsRegion: 'user-aws-region',
        };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Bedrock,
          jwtPayload,
        );

        // 假设 LobeBedrockAI 是 Bedrock 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeBedrockAI);
      });

      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Bedrock,
          jwtPayload,
        );

        // 假设 LobeBedrockAI 是 Bedrock 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeBedrockAI);
      });
    });

    describe('Ollama provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { endpoint: 'user-ollama-url' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Ollama,
          jwtPayload,
        );

        // 假设 LobeOllamaAI 是 Ollama 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeOllamaAI);
      });

      it('should initialize correctly without endpoint', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Ollama,
          jwtPayload,
        );

        // 假设 LobeOllamaAI 是 Ollama 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeOllamaAI);
      });
    });

    describe('Perplexity AI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-perplexity-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Perplexity,
          jwtPayload,
        );

        // 假设 LobePerplexityAI 是 Perplexity 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobePerplexityAI);
      });

      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Perplexity,
          jwtPayload,
        );

        // 假设 LobePerplexityAI 是 Perplexity 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobePerplexityAI);
      });
    });

    describe('Anthropic AI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-anthropic-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Anthropic,
          jwtPayload,
        );

        // 假设 LobeAnthropicAI 是 Anthropic 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeAnthropicAI);
      });

      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Anthropic,
          jwtPayload,
        );

        // 假设 LobeAnthropicAI 是 Anthropic 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeAnthropicAI);
      });
    });

    describe('Mistral AI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-mistral-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Mistral,
          jwtPayload,
        );

        // 假设 LobeMistralAI 是 Mistral 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeMistralAI);
      });

      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.Mistral,
          jwtPayload,
        );

        // 假设 LobeMistralAI 是 Mistral 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeMistralAI);
      });
    });

    describe('OpenRouter AI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-openrouter-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.OpenRouter,
          jwtPayload,
        );

        // 假设 LobeOpenRouterAI 是 OpenRouter 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenRouterAI);
      });

      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.OpenRouter,
          jwtPayload,
        );

        // 假设 LobeOpenRouterAI 是 OpenRouter 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenRouterAI);
      });
    });

    describe('Together AI provider', () => {
      it('should initialize correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-togetherai-key' };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.TogetherAI,
          jwtPayload,
        );

        // 假设 LobeTogetherAI 是 TogetherAI 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeTogetherAI);
      });

      it('should initialize correctly without apiKey', async () => {
        const jwtPayload: JWTPayload = {};
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.TogetherAI,
          jwtPayload,
        );

        // 假设 LobeTogetherAI 是 TogetherAI 提供者的实现类
        expect(runtime['_runtime']).toBeInstanceOf(LobeTogetherAI);
      });
    });

    it('should handle unknown provider gracefully', async () => {
      const jwtPayload: JWTPayload = {};
      const runtime = await AgentRuntime.initializeWithUserPayload('unknown', jwtPayload);

      // 根据实际实现，你可能需要检查是否返回了默认的 runtime 实例，或者是否抛出了异常
      // 例如，如果默认使用 OpenAI:
      expect(runtime['_runtime']).toBeInstanceOf(LobeOpenAI);
    });
  });

  describe('AgentRuntime chat method', () => {
    it('should run correctly', async () => {
      const jwtPayload: JWTPayload = { apiKey: 'user-openai-key', endpoint: 'user-endpoint' };
      const runtime = await AgentRuntime.initializeWithUserPayload(
        ModelProvider.OpenAI,
        jwtPayload,
      );

      const payload: ChatStreamPayload = {
        messages: [{ role: 'user', content: 'Hello, world!' }],
        model: 'text-davinci-002',
        temperature: 0,
      };

      vi.spyOn(LobeOpenAI.prototype, 'chat').mockResolvedValue(new Response(''));

      await runtime.chat(payload, { provider: 'openai' });
    });
    it('should handle options correctly', async () => {
      const jwtPayload: JWTPayload = { apiKey: 'user-openai-key', endpoint: 'user-endpoint' };
      const runtime = await AgentRuntime.initializeWithUserPayload(
        ModelProvider.OpenAI,
        jwtPayload,
      );

      const payload: ChatStreamPayload = {
        messages: [{ role: 'user', content: 'Hello, world!' }],
        model: 'text-davinci-002',
        temperature: 0,
      };

      const options: AgentChatOptions = {
        provider: 'openai',
        trace: {
          traceId: 'test-trace-id',
          traceName: TraceNameMap.Conversation,
          sessionId: 'test-session-id',
          topicId: 'test-topic-id',
          tags: [],
          userId: 'test-user-id',
        },
      };

      vi.spyOn(LobeOpenAI.prototype, 'chat').mockResolvedValue(new Response(''));

      await runtime.chat(payload, options);
    });

    describe('callback', async () => {
      const jwtPayload: JWTPayload = { apiKey: 'user-openai-key', endpoint: 'user-endpoint' };
      const runtime = await AgentRuntime.initializeWithUserPayload(
        ModelProvider.OpenAI,
        jwtPayload,
      );

      const payload: ChatStreamPayload = {
        messages: [{ role: 'user', content: 'Hello, world!' }],
        model: 'text-davinci-002',
        temperature: 0,
      };

      const options: AgentChatOptions = {
        provider: 'openai',
        trace: {
          traceId: 'test-trace-id',
          traceName: TraceNameMap.Conversation,
          sessionId: 'test-session-id',
          topicId: 'test-topic-id',
          tags: [],
          userId: 'test-user-id',
        },
        enableTrace: true,
      };

      const updateMock = vi.fn();
      beforeEach(() => {
        vi.mocked(getServerConfig).mockReturnValue({
          ENABLE_LANGFUSE: true,
          LANGFUSE_PUBLIC_KEY: 'abc',
          LANGFUSE_SECRET_KEY: 'DDD',
        } as any);
      });

      it('should call experimental_onToolCall correctly', async () => {
        // 使用 spyOn 模拟 chat 方法
        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            // 模拟 experimental_onToolCall 回调的触发
            if (callback?.experimental_onToolCall) {
              await callback.experimental_onToolCall();
            }
            return new Response('abc');
          },
        );
        vi.spyOn(LangfuseTraceClient.prototype, 'update').mockImplementation(updateMock);

        await runtime.chat(payload, options);

        expect(updateMock).toHaveBeenCalledWith({ tags: ['Tools Call'] });
      });
      it('should call onStart correctly', async () => {
        vi.spyOn(LangfuseGenerationClient.prototype, 'update').mockImplementation(updateMock);
        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            if (callback?.onStart) {
              callback.onStart();
            }
            return new Response('Success');
          },
        );

        await runtime.chat(payload, options);

        // Verify onStart was called
        expect(updateMock).toHaveBeenCalledWith({ completionStartTime: expect.any(Date) });
      });

      it('should call onCompletion correctly', async () => {
        // Spy on the chat method and trigger onCompletion callback
        vi.spyOn(LangfuseGenerationClient.prototype, 'update').mockImplementation(updateMock);
        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            if (callback?.onCompletion) {
              await callback.onCompletion('Test completion');
            }
            return new Response('Success');
          },
        );

        await runtime.chat(payload, options);

        // Verify onCompletion was called with expected output
        expect(updateMock).toHaveBeenCalledWith({
          endTime: expect.any(Date),
          metadata: {
            provider: 'openai',
            tools: undefined,
          },
          output: 'Test completion',
        });
      });
      it('should call onFinal correctly', async () => {
        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            if (callback?.onFinal) {
              await callback.onFinal('Test completion');
            }
            return new Response('Success');
          },
        );
        const shutdownAsyncMock = vi.fn();
        vi.spyOn(Langfuse.prototype, 'shutdownAsync').mockImplementation(shutdownAsyncMock);

        await runtime.chat(payload, options);

        // Verify onCompletion was called with expected output
        expect(shutdownAsyncMock).toHaveBeenCalled();
      });
    });
  });
});
