import { describe, expect, it } from 'vitest';

import { chainTranslate } from '../translate';

describe('chainTranslate', () => {
  it('should create a payload with system and user messages for translation', () => {
    // Arrange
    const content = 'This is a test sentence.';
    const targetLang = 'zh-CN';

    // Act
    const result = chainTranslate(content, targetLang);

    // Assert
    expect(result).toEqual({
      messages: [
        {
          content: '你是一名擅长翻译的助理，你需要将输入的语言翻译为目标语言',
          role: 'system',
        },
        {
          content: `请将以下内容 ${content}，翻译为 ${targetLang} `,
          role: 'user',
        },
      ],
    });
  });
});
