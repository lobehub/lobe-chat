import { memo, useCallback } from 'react';

import { MarkdownRender, StreamdownRender } from './SyntaxMarkdown';
import { MarkdownProvider } from './components/MarkdownProvider';
import type { MarkdownProps } from './type';

const Markdown = memo<MarkdownProps>((props) => {
  const {
    children = '',
    fullFeaturedCodeBlock,
    enableLatex = true,
    enableMermaid = true,
    enableCustomFootnotes,
    enableGithubAlert,
    enableStream = false,
    rehypePluginsAhead,
    allowHtml,
    borderRadius,
    fontSize = 14,
    headerMultiple = 0.25,
    marginMultiple = 1,
    variant = 'chat',
    reactMarkdownProps,
    lineHeight = 1.6,
    rehypePlugins,
    remarkPlugins,
    remarkPluginsAhead,
    customRender,
    showFootnotes = true,
    ...rest
  } = props;

  const Render = useCallback(
    ({
      enableStream,
      children,
      reactMarkdownProps,
    }: Pick<MarkdownProps, 'children' | 'enableStream' | 'reactMarkdownProps'>) => {
      const DefaultRender = enableStream ? StreamdownRender : MarkdownRender;
      const defaultDOM = <DefaultRender {...reactMarkdownProps}>{children}</DefaultRender>;
      return customRender ? customRender(defaultDOM, { text: children }) : defaultDOM;
    },
    [customRender],
  );

  return (
    <MarkdownProvider
      allowHtml={allowHtml}
      borderRadius={borderRadius}
      enableCustomFootnotes={enableCustomFootnotes}
      enableGithubAlert={enableGithubAlert}
      enableLatex={enableLatex}
      enableMermaid={enableMermaid}
      fontSize={fontSize}
      fullFeaturedCodeBlock={fullFeaturedCodeBlock}
      headerMultiple={headerMultiple}
      lineHeight={lineHeight}
      marginMultiple={marginMultiple}
      rehypePlugins={rehypePlugins}
      rehypePluginsAhead={rehypePluginsAhead}
      remarkPlugins={remarkPlugins}
      remarkPluginsAhead={remarkPluginsAhead}
      showFootnotes={showFootnotes}
      variant={variant}
    >
      <Render enableStream={enableStream} reactMarkdownProps={reactMarkdownProps} {...rest}>
        {children}
      </Render>
    </MarkdownProvider>
  );
});

Markdown.displayName = 'Markdown';

export default Markdown;
