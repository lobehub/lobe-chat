import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import AddPluginButton from './AddPluginButton';
import PluginItem from './PluginItem';

export const InstalledPluginList = memo(() => {
  const installedPlugins = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);

  return (
    <Flexbox gap={16}>
      <Flexbox align={'center'} gap={16} horizontal justify={'space-between'}>
        <Flexbox flex={1} />
        <Flexbox gap={8} horizontal>
          <AddPluginButton />
        </Flexbox>
      </Flexbox>

      <Flexbox gap={24}>
        {installedPlugins.map((i) => (
          <PluginItem {...i} key={i.identifier} />
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default InstalledPluginList;
