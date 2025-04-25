import { FC, ReactNode } from 'react';

export interface MarkdownElementProps<T = any> {
  children: ReactNode;
  id: string;
  node: {
    properties: T;
  };
  tagName: string;
  type: string;
}

export interface MarkdownElement {
  Component: FC<MarkdownElementProps>;
  rehypePlugin?: any;
  remarkPlugin?: any;
  tag: string;
}
