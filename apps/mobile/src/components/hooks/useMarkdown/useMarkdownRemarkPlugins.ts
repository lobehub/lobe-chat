'use client';

import { remarkBr } from '@lobehub/ui/es/Markdown/plugins/remarkBr';
import { remarkCustomFootnotes } from '@lobehub/ui/es/Markdown/plugins/remarkCustomFootnotes';
import { remarkGfmPlus } from '@lobehub/ui/es/Markdown/plugins/remarkGfmPlus';
import { remarkVideo } from '@lobehub/ui/es/Markdown/plugins/remarkVideo';
import { useMemo } from 'react';
import remarkBreaks from 'remark-breaks';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { Pluggable } from 'unified';

import { useMarkdownContext } from '@/components/Markdown/components/MarkdownProvider';

export const useMarkdownRemarkPlugins = (): Pluggable[] => {
  const {
    enableLatex,
    enableCustomFootnotes,
    remarkPlugins = [],
    remarkPluginsAhead = [],
    variant,
    allowHtml,
  } = useMarkdownContext();

  const isChatMode = variant === 'chat';

  const memoPlugins = useMemo(
    () =>
      [
        remarkCjkFriendly,
        enableLatex && remarkMath,
        [remarkGfm, { singleTilde: false }],
        !allowHtml && remarkBr,
        !allowHtml && remarkGfmPlus,
        !allowHtml && remarkVideo,
        enableCustomFootnotes && remarkCustomFootnotes,
        isChatMode && remarkBreaks,
      ].filter(Boolean) as Pluggable[],
    [allowHtml, isChatMode, enableLatex, enableCustomFootnotes],
  );

  return useMemo(
    () => [...remarkPluginsAhead, ...memoPlugins, ...remarkPlugins],
    [remarkPlugins, memoPlugins, remarkPluginsAhead],
  );
};
