import { Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import PluginItem from './PluginItem';

export const InstalledPluginList = memo<{ keywords?: string }>(({ keywords }) => {
  const { t } = useTranslation('plugin');
  const installedPlugins = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);

  const filteredPluginList = useMemo(
    () =>
      installedPlugins.filter((item) =>
        [item.meta?.title, item.meta?.description, item.author, ...(item.meta?.tags || [])]
          .filter(Boolean)
          .join('')
          .toLowerCase()
          .includes((keywords || '')?.toLowerCase()),
      ),
    [installedPlugins, keywords],
  );

  const isEmpty = installedPlugins.length === 0;

  if (isEmpty)
    return (
      <Center gap={12} padding={40}>
        <Empty description={t('store.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Virtuoso
      itemContent={(index) => {
        const item = filteredPluginList[index];
        return <PluginItem key={item.identifier} {...item} />;
      }}
      overscan={400}
      style={{ height: 500, marginInline: -16 }}
      totalCount={filteredPluginList.length}
    />
  );
});

export default InstalledPluginList;
