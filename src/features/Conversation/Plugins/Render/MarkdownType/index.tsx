import { Markdown } from '@lobehub/ui';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

import Loading from '../Loading';

export interface PluginMarkdownTypeProps {
  content: string;
  loading?: boolean;
}

const PluginMarkdownType = memo<PluginMarkdownTypeProps>(({ content, loading }) => {
  const fontSize = useGlobalStore((s) => settingsSelectors.currentSettings(s).fontSize);
  if (loading) return <Loading />;

  return (
    <Markdown fontSize={fontSize} variant={'chat'}>
      {content}
    </Markdown>
  );
});

export default PluginMarkdownType;
