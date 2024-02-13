// @vitest-environment edge-runtime
import { describe, expect, it, vi } from 'vitest';

import { JWTPayload } from '@/const/auth';
import { TraceNameMap } from '@/const/trace';
import {
  ChatStreamPayload,
  LobeAzureOpenAI,
  LobeBedrockAI,
  LobeGoogleAI,
  LobeMoonshotAI,
  LobeOllamaAI,
  LobeOpenAI,
  LobePerplexityAI,
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
          useAzure: true,
        };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.OpenAI,
          jwtPayload,
        );

        expect(runtime).toBeInstanceOf(AgentRuntime);
        expect(runtime['_runtime']).toBeInstanceOf(LobeOpenAI);
        expect(runtime['_runtime'].baseURL).toBe('user-azure-endpoint');
      });
      it('should initialize with azureOpenAIParams correctly', async () => {
        const jwtPayload: JWTPayload = { apiKey: 'user-openai-key', endpoint: 'user-endpoint' };
        const azureOpenAIParams = {
          apiVersion: 'custom-version',
          model: 'custom-model',
          useAzure: true,
        };
        const runtime = await AgentRuntime.initializeWithUserPayload(
          ModelProvider.OpenAI,
          jwtPayload,
          azureOpenAIParams,
        );

        expect(runtime).toBeInstanceOf(AgentRuntime);
        const openAIRuntime = runtime['_runtime'] as LobeOpenAI;
        expect(openAIRuntime).toBeInstanceOf(LobeOpenAI);
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
  });
});
