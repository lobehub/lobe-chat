import { memo, useCallback } from 'react';
import { View } from 'react-native';

import Image from '@/components/Image';

import { MarkdownRender, StreamdownRender } from './SyntaxMarkdown';
import { MarkdownProvider } from './components/MarkdownProvider';
import { useDelayedAnimated } from './components/useDelayedAnimated';
import type { MarkdownProps } from './type';

const Markdown = memo<MarkdownProps>((props) => {
  const {
    children = '',
    fullFeaturedCodeBlock,
    animated,
    enableLatex = true,
    enableMermaid = true,
    enableImageGallery = true,
    enableCustomFootnotes,
    enableGithubAlert,
    enableStream = false,
    rehypePluginsAhead,
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
    showFootnotes = true,
    citations,
    style,
    components,
    ...rest
  } = props;

  const delayedAnimated = useDelayedAnimated(animated);

  const Render = useCallback(
    ({
      enableStream,
      children,
      reactMarkdownProps,
    }: Pick<MarkdownProps, 'children' | 'enableStream' | 'reactMarkdownProps'>) => {
      const DefaultRender = enableStream ? StreamdownRender : MarkdownRender;
      return <DefaultRender {...reactMarkdownProps}>{children}</DefaultRender>;
    },
    [],
  );

  return (
    <Image.PreviewGroup preview={enableImageGallery}>
      <MarkdownProvider
        animated={delayedAnimated}
        borderRadius={borderRadius}
        citations={citations}
        components={components}
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
        <View style={style}>
          <Render
            enableStream={enableStream && delayedAnimated}
            reactMarkdownProps={reactMarkdownProps}
            {...rest}
          >
            {children}
          </Render>
        </View>
      </MarkdownProvider>
    </Image.PreviewGroup>
  );
});

Markdown.displayName = 'Markdown';

export default Markdown;
