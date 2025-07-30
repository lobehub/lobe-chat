import { useMemo, useRef } from 'react';
import { Md5 } from 'ts-md5';

import { useHighlighter } from './useHighlighter';

const MD5_LENGTH_THRESHOLD = 10_000;

/**
 * 高亮内容缓存和降级 hook
 * @param code 代码内容
 * @param lang 语言
 * @param theme 主题
 */
export function useTokenize(code: string, lang: string, theme: 'light' | 'dark') {
  const highlighter = useHighlighter();
  // 全局缓存（组件级别）
  const cache = useRef<Map<string, any>>(new Map());

  // 生成缓存 key
  const cacheKey = useMemo(() => {
    const hash = code.length < MD5_LENGTH_THRESHOLD ? code : Md5.hashStr(code);
    return `${lang}-${hash}`;
  }, [code, lang]);

  // 计算高亮结果
  const result = useMemo(() => {
    if (cache.current.has(cacheKey)) {
      return { error: null, tokens: cache.current.get(cacheKey) };
    }
    try {
      const tokens = highlighter.tokenize(code, { lang, theme });
      cache.current.set(cacheKey, tokens);
      return { error: null, tokens };
    } catch (err) {
      return { error: err as Error, tokens: [] };
    }
  }, [cacheKey, code, lang, highlighter, theme]);

  return result;
}
