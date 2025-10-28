import { CSSProperties, ElementType, ReactNode, Ref } from 'react';
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
  allowHtml?: boolean;
  allowHtmlList?: ElementType[];
  animated?: boolean;
  children: string;
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
  className?: string;
  customRender?: (dom: ReactNode, context: { text: string }) => ReactNode;
  enableImageGallery?: boolean;
  onDoubleClick?: () => void;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
}
