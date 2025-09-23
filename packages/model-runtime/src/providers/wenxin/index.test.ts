// @vitest-environment node
import { LobeOpenAICompatibleRuntime } from '@lobechat/model-runtime';
import { ModelProvider } from 'model-bank';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeWenxinAI } from './index';

testProvider({
  Runtime: LobeWenxinAI,
  provider: ModelProvider.Wenxin,
  defaultBaseURL: 'https://qianfan.baidubce.com/v2',
  chatDebugEnv: 'DEBUG_WENXIN_CHAT_COMPLETION',
  chatModel: 'ernie-speed-128k',
});

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeWenxinAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

describe('LobeWenxinAI', () => {
  describe('chat', () => {
    it('should with search citations', async () => {
      const data = [
        {
          id: 'as-bhrxwy5fq1',
          object: 'chat.completion.chunk',
          created: 1741000028,
          model: 'ernie-4.0-8k-latest',
          choices: [
            {
              index: 0,
              delta: { content: '今天是**', role: 'assistant' },
              flag: 0,
            },
          ],
          search_results: [
            { index: 1, url: 'http://www.mnw.cn/news/shehui/', title: '社会新闻' },
            {
              index: 2,
              url: 'https://www.chinanews.com.cn/sh/2025/03-01/10376297.shtml',
              title: '中越边民共庆“春龙节”',
            },
            {
              index: 3,
              url: 'https://www.chinanews.com/china/index.shtml',
              title: '中国新闻网_时政',
            },
          ],
        },
        {
          id: 'as-bhrxwy5fq1',
          object: 'chat.completion.chunk',
          created: 1741000028,
          model: 'ernie-4.0-8k-latest',
          choices: [
            {
              index: 0,
              delta: { content: '20' },
              flag: 0,
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
          'id: as-bhrxwy5fq1',
          'event: grounding',
          'data: {"citations":[{"title":"社会新闻","url":"http://www.mnw.cn/news/shehui/"},{"title":"中越边民共庆“春龙节”","url":"https://www.chinanews.com.cn/sh/2025/03-01/10376297.shtml"},{"title":"中国新闻网_时政","url":"https://www.chinanews.com/china/index.shtml"}]}\n',
          'id: as-bhrxwy5fq1',
          'event: text',
          'data: "今天是**"\n',
          'id: as-bhrxwy5fq1',
          'event: text',
          'data: "20"\n',
        ].map((line) => `${line}\n`),
      );

      expect((await reader.read()).done).toBe(true);
    });
  });
});
