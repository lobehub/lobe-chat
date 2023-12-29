import { Markdown } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '../Loading';

export interface PluginMarkdownTypeProps {
  content: string;
  loading?: boolean;
}

const PluginMarkdownType = memo<PluginMarkdownTypeProps>(({ content, loading }) => {
  if (loading)
    return (
      <Flexbox gap={8}>
        <Loading />
      </Flexbox>
    );

  return <Markdown>{content}</Markdown>;
});

export default PluginMarkdownType;
