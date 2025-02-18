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

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobePerplexityAI', () => {
  describe('chat', () => {
    it('should call chat method with temperature', async () => {
      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
        new ReadableStream() as any,
      );

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
      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
        new ReadableStream() as any,
      );

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

    it('should with search citations', () => {
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
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896615,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 17,
            total_tokens: 21,
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
                content: '杭州今天和未来几天的天气预报如下：\n\n今天',
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
            completion_tokens: 21,
            total_tokens: 25,
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
                content: '杭州今天和未来几天的天气预报如（2月18\n          ',
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
            completion_tokens: 27,
            total_tokens: 31,
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
                content: '杭州今天和未来几天的天气预报如）多云，气',
              },
              delta: {
                role: 'assistant',
                content: '日）多云，气',
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
            completion_tokens: 32,
            total_tokens: 36,
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
                content: '杭州今天和未来几天的天气预报如）多云，气温在4-12',
              },
              delta: {
                role: 'assistant',
                content: '温在4-12',
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
            completion_tokens: 41,
            total_tokens: 45,
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
                content: '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白',
              },
              delta: {
                role: 'assistant',
                content: '℃之间[2][3]。白',
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
            completion_tokens: 45,
            total_tokens: 49,
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
                content: '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，',
              },
              delta: {
                role: 'assistant',
                content: '天多云，',
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
            completion_tokens: 49,
            total_tokens: 53,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴',
              },
              delta: {
                role: 'assistant',
                content: '夜间转阴',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 54,
            total_tokens: 58,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风',
              },
              delta: {
                role: 'assistant',
                content: '[7]。风',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 58,
            total_tokens: 62,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上',
              },
              delta: {
                role: 'assistant',
                content: '力较大，上',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 65,
            total_tokens: 69,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-',
              },
              delta: {
                role: 'assistant',
                content: '午为偏东风2-',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 70,
            total_tokens: 74,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍',
              },
              delta: {
                role: 'assistant',
                content: '3级，傍',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 74,
            total_tokens: 78,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到',
              },
              delta: {
                role: 'assistant',
                content: '晚增大到',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 82,
            total_tokens: 86,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几',
              },
              delta: {
                role: 'assistant',
                content: '4级[7]。\n\n未来几',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 87,
            total_tokens: 91,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：',
              },
              delta: {
                role: 'assistant',
                content: '天天气概况：',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 95,
            total_tokens: 99,
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
                content:
                  '杭州今天和未来几天的天气预报如）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（',
              },
              delta: {
                role: 'assistant',
                content: '\n- 2月19日（',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 98,
            total_tokens: 102,
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
                content:
                  '杭州今天和未来几天的天气预报日）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（明天）：',
              },
              delta: {
                role: 'assistant',
                content: '明天）：',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 101,
            total_tokens: 105,
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
                content:
                  '杭州今天和未来几天的天气预报8日）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（明天）：阴天，有',
              },
              delta: {
                role: 'assistant',
                content: '阴天，有',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896616,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 104,
            total_tokens: 108,
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
                content:
                  '杭州今天和未来几天的天气预报8日）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（明天）：阴天，有小雨，',
              },
              delta: {
                role: 'assistant',
                content: '小雨，',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896617,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 109,
            total_tokens: 113,
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
                content:
                  '杭州今天和未来几天的天气预报8日）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（明天）：阴天，有小雨，气温11℃左',
              },
              delta: {
                role: 'assistant',
                content: '气温11℃左',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896617,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 115,
            total_tokens: 119,
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
                content:
                  '杭州今天和未来几天的天气预报8日）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（明天）：阴天，有小雨，气温11℃左右[3][7]',
              },
              delta: {
                role: 'assistant',
                content: '右[3][7]',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896617,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 121,
            total_tokens: 125,
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
                content:
                  '杭州今天和未来几天的天气预报8日）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（明天）：阴天，有小雨，气温11℃左右[3][7]\n- 2月20',
              },
              delta: {
                role: 'assistant',
                content: '\n- 2月20',
              },
            },
          ],
        },
        {
          id: '506d64fb-e7f2-4d94-b80f-158369e9446d',
          model: 'sonar-pro',
          created: 1739896619,
          usage: {
            prompt_tokens: 4,
            completion_tokens: 241,
            total_tokens: 245,
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
                content:
                  '杭州今天和未来几天的天气预报8日）多云，气温在4-12℃之间[2][3]。白天多云，夜间转阴[7]。风力较大，上午为偏东风2-3级，傍晚增大到4级[7]。\n\n未来几天天气概况：\n- 2月19日（明天）：阴天，有小雨，气温11℃左右[3][7]\n- 2月20日：阴天，小到中雨，气温7℃左右[3][7]\n- 2月3]\n- 2月22日：小雨，气温7℃左右[3]\n\n总体来看，未来几天杭州天气较凉，以阴天和雨天为主，气温在7-11℃之间波动。建议市民适当增添衣物，注意保暖，外出时携带雨具[2][3][7]。',
              },
              delta: { role: 'assistant', content: '。' },
            },
          ],
        },
      ];
    });
  });
});
