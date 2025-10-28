import { Components } from 'react-markdown';
import { ViewProps } from 'react-native';
import type { Pluggable } from 'unified';

import type { ReactNativeMarkdownProps } from './ReactNativeMarkdown/type';

export interface TypographyProps {
  borderRadius?: number;
  fontSize?: number;
  headerMultiple?: number;
  lineHeight?: number;
  marginMultiple?: number;
}

export interface SyntaxMarkdownProps extends Omit<TypographyProps, 'children'> {
  animated?: boolean;
  children: string;
  components?: Components;
  enableCustomFootnotes?: boolean;
  enableGithubAlert?: boolean;
  enableLatex?: boolean;
  enableMermaid?: boolean;
  enableStream?: boolean;
  fullFeaturedCodeBlock?: boolean;
  reactMarkdownProps?: Omit<
    ReactNativeMarkdownProps,
    'components' | 'rehypePlugins' | 'remarkPlugins'
  >;
  rehypePlugins?: Pluggable[];
  rehypePluginsAhead?: Pluggable[];
  remarkPlugins?: Pluggable[];
  remarkPluginsAhead?: Pluggable[];
  showFootnotes?: boolean;
  variant?: 'default' | 'chat';
}

export interface MarkdownProps extends SyntaxMarkdownProps {
  enableImageGallery?: boolean;
  style?: ViewProps['style'];
}
