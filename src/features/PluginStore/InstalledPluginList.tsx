import { SpotlightCard } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import PluginItem from './PluginItem';

export const OnlineList = memo(() => {
  const installedPlugins = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);

  return <SpotlightCard columns={2} gap={16} items={installedPlugins} renderItem={PluginItem} />;
});

export default OnlineList;
