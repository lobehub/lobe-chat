import { Markdown } from '@lobehub/ui';
import { memo } from 'react';

import Loading from '../Loading';

export interface PluginMarkdownTypeProps {
  content: string;
  loading?: boolean;
}

const PluginMarkdownType = memo<PluginMarkdownTypeProps>(({ content, loading }) => {
  if (loading) return <Loading />;

  return <Markdown>{content}</Markdown>;
});

export default PluginMarkdownType;
