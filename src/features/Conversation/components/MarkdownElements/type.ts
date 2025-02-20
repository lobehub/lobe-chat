import { FC, ReactNode } from 'react';

export interface MarkdownElementProps {
  children: ReactNode;
  id: string;
  type: string;
}

export interface MarkdownElement {
  Component: FC<MarkdownElementProps>;
  rehypePlugin?: any;
  remarkPlugin?: any;
  tag: string;
}
