import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';

export interface ReactNativeMarkdownProps {
  children: string;
  components?: Components;
  rehypePlugins?: PluggableList;
  remarkPlugins?: PluggableList;
}
