import { describe, expect, it, vi } from 'vitest';

import { chainAbstractChunkText } from '../abstractChunk';

describe('chainAbstractChunkText', () => {
  it('should generate correct chat payload for chunk text', () => {
    const testText = 'This is a sample chunk of text that needs to be summarized.';

    const result = chainAbstractChunkText(testText);

    expect(result).toEqual({
      messages: [
        {
          content:
            '你是一名擅长从 chunk 中提取摘要的助理，你需要将用户的会话总结为 1~2 句话的摘要，输出成 chunk 所使用的语种',
          role: 'system',
        },
        {
          content: `chunk: ${testText}`,
          role: 'user',
        },
      ],
    });
  });

  it('should handle empty text', () => {
    const result = chainAbstractChunkText('');

    expect(result.messages).toHaveLength(2);
    expect(result.messages![1].content).toBe('chunk: ');
  });

  it('should handle text with special characters', () => {
    const testText = 'Text with special chars: @#$%^&*()';

    const result = chainAbstractChunkText(testText);

    expect(result.messages![1].content).toBe(`chunk: ${testText}`);
  });

  it('should always use system role for first message', () => {
    const result = chainAbstractChunkText('test');

    expect(result.messages![0].role).toBe('system');
  });

  it('should always use user role for second message', () => {
    const result = chainAbstractChunkText('test');

    expect(result.messages![1].role).toBe('user');
  });
});
