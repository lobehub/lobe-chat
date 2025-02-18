import { sanitizeUTF8 } from './sanitizeUTF8';

describe('UTF-8 Sanitization', () => {
  it('should handle null bytes', () => {
    const input = 'test\u0000string';
    expect(sanitizeUTF8(input)).toBe('teststring');
  });

  it('should handle invalid UTF-8 sequences', () => {
    const input = 'test\uD800string'; // 未配对的代理项
    expect(sanitizeUTF8(input)).toBe('teststring');
  });

  it('should handle invalid UTF-8 content', () => {
    const input = '\u0002\u0000\u0000\u0002�{\\"error\\":{\\"code\\":\\"resource_exhausted\\",';
    expect(sanitizeUTF8(input)).toBe('{\\"error\\":{\\"code\\":\\"resource_exhausted\\",');
  });

  it('should preserve valid UTF-8 characters', () => {
    const input = '你好，世界！';
    expect(sanitizeUTF8(input)).toBe('你好，世界！');
  });
});
