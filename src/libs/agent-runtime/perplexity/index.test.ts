// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime, ModelProvider } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobePerplexityAI } from './index';

testProvider({
  Runtime: LobePerplexityAI,
  provider: ModelProvider.Perplexity,
  defaultBaseURL: 'https://api.perplexity.ai',
  chatDebugEnv: 'DEBUG_PERPLEXITY_CHAT_COMPLETION',
  chatModel: 'sonar',
});

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobePerplexityAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

describe('LobePerplexityAI', () => {
  describe('chat', () => {
    it('should call chat method with temperature', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 1.5,
      });

      expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array),
          model: 'text-davinci-003',
          temperature: 1.5,
        }),
        expect.any(Object),
      );
    });

    it('should be undefined when temperature >= 2', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 2,
      });

      expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array),
          model: 'text-davinci-003',
          temperature: undefined,
        }),
        expect.any(Object),
      );
    });

    it('should with search citations', async () => {
      const data = [
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896615,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 3,
            total_tokens: 7,
            citation_tokens: 2217,
            num_search_queries: 1,
          },
          citations: [
            'https://www.weather.com.cn/weather/101210101.shtml',
            'https://tianqi.moji.com/weather/china/zhejiang/hangzhou',
            'https://weather.cma.cn/web/weather/58457.html',
            'https://tianqi.so.com/weather/101210101',
            'https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832',
            'https://www.hzqx.com',
            'https://www.hzqx.com/pc/hztq/',
          ],
          object: 'chat.completion',
          choices: [
            {
              index: 0,
              finish_reason: null,
              message: {
                role: 'assistant',
                content: '杭州今',
              },
              delta: {
                role: 'assist',
                content: '杭州今',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896615,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 9,
            total_tokens: 13,
            citation_tokens: 2217,
            num_search_queries: 1,
          },
          citations: [
            'https://www.weather.com.cn/weather/101210101.shtml',
            'https://tianqi.moji.com/weather/china/zhejiang/hangzhou',
            'https://weather.cma.cn/web/weather/58457.html',
            'https://tianqi.so.com/weather/101210101',
            'https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832',
            'https://www.hzqx.com',
            'https://www.hzqx.com/pc/hztq/',
          ],
          object: 'chat.completion',
          choices: [
            {
              index: 0,
              finish_reason: null,
              message: {
                role: 'assistant',
                content: '杭州今天和未来几天的',
              },
              delta: {
                role: 'assistant',
                content: '天和未来几天的',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896615,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 14,
            total_tokens: 18,
            citation_tokens: 2217,
            num_search_queries: 1,
          },
          citations: [
            'https://www.weather.com.cn/weather/101210101.shtml',
            'https://tianqi.moji.com/weather/china/zhejiang/hangzhou',
            'https://weather.cma.cn/web/weather/58457.html',
            'https://tianqi.so.com/weather/101210101',
            'https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832',
            'https://www.hzqx.com',
            'https://www.hzqx.com/pc/hztq/',
          ],
          object: 'chat.completion',
          choices: [
            {
              index: 0,
              finish_reason: null,
              message: {
                role: 'assistant',
                content: '杭州今天和未来几天的天气预报如',
              },
            },
          ],
        },
      ];

      const mockStream = new ReadableStream({
        start(controller) {
          data.forEach((chunk) => {
            controller.enqueue(chunk);
          });

          controller.close();
        },
      });

      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(mockStream as any);

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'mistralai/mistral-7b-instruct:free',
        temperature: 0,
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
          'id: 506d64fb-e7f2-4d94-b80f-158369e9446d',
          'event: grounding',
          'data: {"citations":[{"title":"https://www.weather.com.cn/weather/101210101.shtml","url":"https://www.weather.com.cn/weather/101210101.shtml"},{"title":"https://tianqi.moji.com/weather/china/zhejiang/hangzhou","url":"https://tianqi.moji.com/weather/china/zhejiang/hangzhou"},{"title":"https://weather.cma.cn/web/weather/58457.html","url":"https://weather.cma.cn/web/weather/58457.html"},{"title":"https://tianqi.so.com/weather/101210101","url":"https://tianqi.so.com/weather/101210101"},{"title":"https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832","url":"https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832"},{"title":"https://www.hzqx.com","url":"https://www.hzqx.com"},{"title":"https://www.hzqx.com/pc/hztq/","url":"https://www.hzqx.com/pc/hztq/"}]}\n',
          'id: 506d64fb-e7f2-4d94-b80f-158369e9446d',
          'event: text',
          'data: "杭州今"\n',
          'id: 506d64fb-e7f2-4d94-b80f-158369e9446d',
          'event: text',
          'data: "天和未来几天的"\n',
          'id: 506d64fb-e7f2-4d94-b80f-158369e9446d',
          'event: data',
          'data: {"id":"506d64fb-e7f2-4d94-b80f-158369e9446d","index":0}\n',
        ].map((line) => `${line}\n`),
      );

      expect((await reader.read()).done).toBe(true);
    });
  });
});
