import { getAllStyleKeywords } from '../constants';

/**
 * FLUX 双CLIP提示词智能分割工具
 * 将单一prompt分离为T5-XXL和CLIP-L的不同输入
 */
export function splitPromptForDualCLIP(prompt: string): {
  // 风格关键词，给CLIP-L理解视觉概念
  clipLPrompt: string;
  // 完整描述，给T5-XXL理解语义
  t5xxlPrompt: string;
} {
  if (!prompt) {
    return { clipLPrompt: '', t5xxlPrompt: '' };
  }

  // 使用框架配置的风格关键词库
  const styleKeywords = getAllStyleKeywords();

  // 分离风格关键词
  const words = prompt.toLowerCase().split(/[\s,]+/);
  const styleWords: string[] = [];
  const contentWords: string[] = [];

  // 匹配风格关键词
  const originalWords = prompt.split(/[\s,]+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let isStyleWord = false;

    // 检查单词匹配
    for (const keyword of styleKeywords) {
      const keywordWords = keyword.toLowerCase().split(/\s+/);

      // 检查单词序列匹配
      if (keywordWords.length === 1 && word.includes(keywordWords[0])) {
        styleWords.push(originalWords[i]);
        isStyleWord = true;
        break;
      } else if (keywordWords.length > 1) {
        // 检查多词短语匹配
        const sequence = words.slice(i, i + keywordWords.length).join(' ');
        if (sequence === keyword.toLowerCase()) {
          styleWords.push(...originalWords.slice(i, i + keywordWords.length));
          i += keywordWords.length - 1; // 跳过已匹配的词
          isStyleWord = true;
          break;
        }
      }
    }

    if (!isStyleWord) {
      contentWords.push(originalWords[i]);
    }
  }

  // 构建结果
  if (styleWords.length > 0) {
    return {
      // CLIP-L专注风格和视觉概念
      clipLPrompt: styleWords.join(' '),
      // T5-XXL接收完整context以理解语义关系
      t5xxlPrompt: prompt,
    };
  }

  // 无风格词时的fallback：相同prompt（保证兼容性）
  return {
    clipLPrompt: prompt,
    t5xxlPrompt: prompt,
  };
}
