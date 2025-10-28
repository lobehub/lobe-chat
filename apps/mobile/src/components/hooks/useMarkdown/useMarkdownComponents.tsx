import { useMemo } from 'react';
import type { Components } from 'react-markdown';

import { useMarkdownContext } from '../../Markdown/components/MarkdownProvider';
import Section from '../../Markdown/components/Section';

export const useMarkdownComponents = (): Components => {
  const { components } = useMarkdownContext();

  const memoComponents = useMemo(
    () => ({
      section: (props: any) => <Section {...props} />,
    }),
    [],
  );

  return useMemo(
    () => ({
      ...memoComponents,
      ...components,
    }),
    [memoComponents, components],
  );
};
