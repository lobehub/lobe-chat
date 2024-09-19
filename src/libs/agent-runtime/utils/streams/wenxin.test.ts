import { describe, expect, it, vi } from 'vitest';

import * as uuidModule from '@/utils/uuid';

import { ChatResp } from '../../wenxin/type';
import { WenxinResultToStream, WenxinStream } from './wenxin';

const dataStream = [
  {
    id: 'as-vb0m37ti8y',
    object: 'chat.completion',
    created: 1709089502,
    sentence_id: 0,
    is_end: false,
    is_truncated: false,
    result: '当然可以，',
    need_clear_history: false,
    finish_reason: 'normal',
    usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
  },
  {
    id: 'as-vb0m37ti8y',
    object: 'chat.completion',
    created: 1709089504,
    sentence_id: 1,
    is_end: false,
    is_truncated: false,
    result:
      '以下是一些建议的自驾游路线，它们涵盖了各种不同的风景和文化体验：\n\n1. **西安-敦煌历史文化之旅**：\n\n\n\t* 路线：西安',
    need_clear_history: false,
    finish_reason: 'normal',
    usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
  },
  {
    id: 'as-vb0m37ti8y',
    object: 'chat.completion',
    created: 1709089506,
    sentence_id: 2,
    is_end: false,
    is_truncated: false,
    result: ' - 天水 - 兰州 - 嘉峪关 - 敦煌\n\t* 特点：此路线让您领略到中国西北的丰富历史文化。',
    need_clear_history: false,
    finish_reason: 'normal',
    usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
  },
  {
    id: 'as-vb0m37ti8y',
    object: 'chat.completion',
    created: 1709089508,
    sentence_id: 3,
    is_end: false,
    is_truncated: false,
    result: '您可以参观西安的兵马俑、大雁塔，体验兰州的黄河风情，以及在敦煌欣赏壮丽的莫高窟。',
    need_clear_history: false,
    finish_reason: 'normal',
    usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
  },
  {
    id: 'as-vb0m37ti8y',
    object: 'chat.completion',
    created: 1709089511,
    sentence_id: 4,
    is_end: false,
    is_truncated: false,
    result: '\n2. **海南环岛热带风情游**：\n\n\n\t* 路线：海口 - 三亚 - 陵水 - 万宁 - 文昌 - 海',
    need_clear_history: false,
    finish_reason: 'normal',
    usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
  },
  {
    id: 'as-vb0m37ti8y',
    object: 'chat.completion',
    created: 1709089512,
    sentence_id: 5,
    is_end: false,
    is_truncated: false,
    result:
      '口\n\t* 特点：海南岛是中国唯一的黎族聚居区，这里有独特的热带风情、美丽的海滩和丰富的水果。',
    need_clear_history: false,
    finish_reason: 'normal',
    usage: { prompt_tokens: 5, completion_tokens: 153, total_tokens: 158 },
  },
];

describe('WenxinStream', () => {
  it('should transform Wenxin stream to protocol stream', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const mockWenxinStream: AsyncIterable<ChatResp> = {
      // @ts-ignore
      async *[Symbol.asyncIterator]() {
        for (const item of dataStream) {
          yield item;
        }
      },
    };

    const stream = WenxinResultToStream(mockWenxinStream);

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onTokenMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = WenxinStream(stream, {
      onStart: onStartMock,
      onText: onTextMock,
      onToken: onTokenMock,
      onCompletion: onCompletionMock,
    });

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(
      [
        'id: as-vb0m37ti8y',
        'event: text',
        `data: "当然可以，"\n`,
        'id: as-vb0m37ti8y',
        'event: text',
        `data: "以下是一些建议的自驾游路线，它们涵盖了各种不同的风景和文化体验：\\n\\n1. **西安-敦煌历史文化之旅**：\\n\\n\\n\\t* 路线：西安"\n`,
        'id: as-vb0m37ti8y',
        'event: text',
        `data: " - 天水 - 兰州 - 嘉峪关 - 敦煌\\n\\t* 特点：此路线让您领略到中国西北的丰富历史文化。"\n`,
        'id: as-vb0m37ti8y',
        'event: text',
        `data: "您可以参观西安的兵马俑、大雁塔，体验兰州的黄河风情，以及在敦煌欣赏壮丽的莫高窟。"\n`,
        'id: as-vb0m37ti8y',
        'event: text',
        `data: "\\n2. **海南环岛热带风情游**：\\n\\n\\n\\t* 路线：海口 - 三亚 - 陵水 - 万宁 - 文昌 - 海"\n`,
        'id: as-vb0m37ti8y',
        'event: text',
        `data: "口\\n\\t* 特点：海南岛是中国唯一的黎族聚居区，这里有独特的热带风情、美丽的海滩和丰富的水果。"\n`,
      ].map((item) => `${item}\n`),
    );

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, '"当然可以，"');
    expect(onTextMock).toHaveBeenNthCalledWith(2, '"以下是一些建议的自驾游路线，它们涵盖了各种不同的风景和文化体验：\\n\\n1. **西安-敦煌历史文化之旅**：\\n\\n\\n\\t* 路线：西安"');
    expect(onTokenMock).toHaveBeenCalledTimes(6);
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });
});
