import { isLastFormulaRenderable } from '@lobehub/ui/es/hooks/useMarkdown/latex';
import {
  addToCache,
  contentCache,
  preprocessMarkdownContent,
} from '@lobehub/ui/es/hooks/useMarkdown/utils';
import { useMemo, useRef, useState } from 'react';

import { useMarkdownContext } from '../../Markdown/components/MarkdownProvider';
import { ensureCodeBlockOnNewLine } from './ensureCodeBlockOnNewLine';

export const useMarkdownContent = (children: string): string | undefined => {
  const { animated, enableLatex = true, enableCustomFootnotes } = useMarkdownContext();
  const [validContent, setValidContent] = useState<string>('');
  const prevProcessedContent = useRef<string>('');

  // Calculate cache key with fewer string concatenations and better performance
  const cacheKey = useMemo(
    () => `${children}|${enableLatex ? 1 : 0}|${enableCustomFootnotes ? 1 : 0}`,
    [children, enableLatex, enableCustomFootnotes],
  );

  // Process content and use cache to avoid repeated calculations
  return useMemo(() => {
    // Try to get from cache first for best performance
    if (contentCache.has(cacheKey)) {
      return contentCache.get(cacheKey);
    }

    // Process new content only if needed
    let processedContent = preprocessMarkdownContent(children, {
      enableCustomFootnotes,
      enableLatex,
    });

    // 确保代码块独立成行（不处理行内代码 `code`）
    processedContent = ensureCodeBlockOnNewLine(processedContent);

    // Special handling for LaTeX content when animated
    if (animated && enableLatex) {
      const isRenderable = isLastFormulaRenderable(processedContent);
      if (!isRenderable && validContent) {
        processedContent = validContent;
      }
    }

    // Only update state if content changed (prevents unnecessary re-renders)
    if (processedContent !== prevProcessedContent.current) {
      setValidContent(processedContent);
      prevProcessedContent.current = processedContent;
    }

    // Cache the processed result
    addToCache(cacheKey, processedContent);
    return processedContent;
  }, [cacheKey, children, enableLatex, enableCustomFootnotes, animated, validContent]);
};
