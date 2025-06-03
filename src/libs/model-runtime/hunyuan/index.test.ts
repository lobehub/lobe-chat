// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime, ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeHunyuanAI } from './index';

testProvider({
  Runtime: LobeHunyuanAI,
  provider: ModelProvider.Hunyuan,
  defaultBaseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
  chatDebugEnv: 'DEBUG_HUNYUAN_CHAT_COMPLETION',
  chatModel: 'hunyuan-lite',
});

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeHunyuanAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

describe('LobeHunyuanAI', () => {
  describe('chat', () => {
    it('should with search citations', async () => {
      const data = [
        {
          id: '939fbdb8dbb9b4c5944cbbe687c977c2',
          object: 'chat.completion.chunk',
          created: 1741000456,
          model: 'hunyuan-turbo',
          system_fingerprint: '',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', content: '为您' },
              finish_reason: null,
            },
          ],
          note: '以上内容为AI生成，不代表开发者立场，请勿删除或修改本标记',
          search_info: {
            search_results: [
              {
                index: 1,
                title: '公务员考试时政热点【2025年3月3日】_公务员考试网_华图教育',
                url: 'http://www.huatu.com/2025/0303/2803685.html',
                icon: 'https://hunyuan-img-1251316161.cos.ap-guangzhou.myqcloud.com/%2Fpublic/img/63ce96deffe0119827f12deaa5ffe7ef.jpg',
                text: '华图教育官网',
              },
              {
                index: 2,
                title: '外交部新闻（2025年3月3日）',
                url: 'https://view.inews.qq.com/a/20250303A02NLC00?scene=qqsearch',
                icon: 'https://hunyuan-img-1251316161.cos.ap-guangzhou.myqcloud.com/%2Fpublic/img/00ce40298870d1accb7920d641152722.jpg',
                text: '腾讯网',
              },
            ],
          },
        },
        {
          id: '939fbdb8dbb9b4c5944cbbe687c977c2',
          object: 'chat.completion.chunk',
          created: 1741000456,
          model: 'hunyuan-turbo',
          system_fingerprint: '',
          choices: [
            {
              index: 0,
              delta: { role: 'assistant', content: '找到' },
              finish_reason: null,
            },
          ],
          note: '以上内容为AI生成，不代表开发者立场，请勿删除或修改本标记',
          search_info: {
            search_results: [
              {
                index: 1,
                title: '公务员考试时政热点【2025年3月3日】_公务员考试网_华图教育',
                url: 'http://www.huatu.com/2025/0303/2803685.html',
                icon: 'https://hunyuan-img-1251316161.cos.ap-guangzhou.myqcloud.com/%2Fpublic/img/63ce96deffe0119827f12deaa5ffe7ef.jpg',
                text: '华图教育官网',
              },
              {
                index: 2,
                title: '外交部新闻（2025年3月3日）',
                url: 'https://view.inews.qq.com/a/20250303A02NLC00?scene=qqsearch',
                icon: 'https://hunyuan-img-1251316161.cos.ap-guangzhou.myqcloud.com/%2Fpublic/img/00ce40298870d1accb7920d641152722.jpg',
                text: '腾讯网',
              },
            ],
          },
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
          'id: 939fbdb8dbb9b4c5944cbbe687c977c2',
          'event: grounding',
          'data: {"citations":[{"title":"公务员考试时政热点【2025年3月3日】_公务员考试网_华图教育","url":"http://www.huatu.com/2025/0303/2803685.html"},{"title":"外交部新闻（2025年3月3日）","url":"https://view.inews.qq.com/a/20250303A02NLC00?scene=qqsearch"}]}\n',
          'id: 939fbdb8dbb9b4c5944cbbe687c977c2',
          'event: text',
          'data: "为您"\n',
          'id: 939fbdb8dbb9b4c5944cbbe687c977c2',
          'event: text',
          'data: "找到"\n',
        ].map((line) => `${line}\n`),
      );

      expect((await reader.read()).done).toBe(true);
    });
  });
});
