import { rehypeKatexDir } from '@lobehub/ui/es/Markdown/plugins/rehypeKatexDir';
import { useMemo } from 'react';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import type { Pluggable } from 'unified';

import { useMarkdownContext } from '@/components/Markdown/components/MarkdownProvider';

export const useMarkdownRehypePlugins = (): Pluggable[] => {
  const {
    animated,
    enableLatex,
    enableCustomFootnotes,
    enableGithubAlert,
    rehypePlugins = [],
    rehypePluginsAhead = [],
  } = useMarkdownContext();

  const memoPlugins = useMemo(
    () =>
      [enableGithubAlert && rehypeGithubAlerts, enableLatex && rehypeKatexDir].filter(
        Boolean,
      ) as Pluggable[],
    [animated, enableLatex, enableGithubAlert, enableCustomFootnotes],
  );

  return useMemo(
    () => [...rehypePluginsAhead, ...memoPlugins, ...rehypePlugins],
    [rehypePlugins, memoPlugins, rehypePluginsAhead],
  );
};
