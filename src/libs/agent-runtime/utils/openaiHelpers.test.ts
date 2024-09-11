import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { imageUrlToBase64 } from '@/utils/imageToBase64';

import { convertMessageContent, convertOpenAIMessages } from './openaiHelpers';
import { parseDataUri } from './uriParser';

// 模拟依赖
vi.mock('@/utils/imageToBase64');
vi.mock('./uriParser');

describe('convertMessageContent', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the same content if not image_url type', async () => {
    const content = { type: 'text', text: 'Hello' } as OpenAI.ChatCompletionContentPart;
    const result = await convertMessageContent(content);
    expect(result).toEqual(content);
  });

  it('should convert image URL to base64 when necessary', async () => {
    // 设置环境变量
    process.env.LLM_VISION_IMAGE_USE_BASE64 = '1';

    const content = {
      type: 'image_url',
      image_url: { url: 'https://example.com/image.jpg' },
    } as OpenAI.ChatCompletionContentPart;

    vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });
    vi.mocked(imageUrlToBase64).mockResolvedValue({
      base64: 'base64String',
      mimeType: 'image/jpeg',
    });

    const result = await convertMessageContent(content);

    expect(result).toEqual({
      type: 'image_url',
      image_url: { url: 'data:image/jpeg;base64,base64String' },
    });

    expect(parseDataUri).toHaveBeenCalledWith('https://example.com/image.jpg');
    expect(imageUrlToBase64).toHaveBeenCalledWith('https://example.com/image.jpg');
  });

  it('should not convert image URL when not necessary', async () => {
    process.env.LLM_VISION_IMAGE_USE_BASE64 = undefined;

    const content = {
      type: 'image_url',
      image_url: { url: 'https://example.com/image.jpg' },
    } as OpenAI.ChatCompletionContentPart;

    vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });

    const result = await convertMessageContent(content);

    expect(result).toEqual(content);
    expect(imageUrlToBase64).not.toHaveBeenCalled();
  });
});

describe('convertOpenAIMessages', () => {
  it('should convert string content messages', async () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ] as OpenAI.ChatCompletionMessageParam[];

    const result = await convertOpenAIMessages(messages);

    expect(result).toEqual(messages);
  });

  it('should convert array content messages', async () => {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
        ],
      },
    ] as OpenAI.ChatCompletionMessageParam[];

    vi.spyOn(Promise, 'all');
    vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });
    vi.mocked(imageUrlToBase64).mockResolvedValue({
      base64: 'base64String',
      mimeType: 'image/jpeg',
    });

    process.env.LLM_VISION_IMAGE_USE_BASE64 = '1';

    const result = await convertOpenAIMessages(messages);

    expect(result).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          {
            type: 'image_url',
            image_url: { url: 'data:image/jpeg;base64,base64String' },
          },
        ],
      },
    ]);

    expect(Promise.all).toHaveBeenCalledTimes(2); // 一次用于消息数组，一次用于内容数组

    process.env.LLM_VISION_IMAGE_USE_BASE64 = undefined;
  });
  it('should convert array content messages', async () => {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
        ],
      },
    ] as OpenAI.ChatCompletionMessageParam[];

    vi.spyOn(Promise, 'all');
    vi.mocked(parseDataUri).mockReturnValue({ type: 'url', base64: null, mimeType: null });
    vi.mocked(imageUrlToBase64).mockResolvedValue({
      base64: 'base64String',
      mimeType: 'image/jpeg',
    });

    const result = await convertOpenAIMessages(messages);

    expect(result).toEqual(messages);

    expect(Promise.all).toHaveBeenCalledTimes(2); // 一次用于消息数组，一次用于内容数组
  });
});
