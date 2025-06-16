import { Icon } from '@lobehub/ui';
import { Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { ServerCrash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors, pluginSelectors } from '@/store/tool/selectors';

import Loading from './Loading';
import PluginItem from './PluginItem';

export const MCPPluginList = memo<{ keywords?: string }>(({ keywords }) => {
  const { t } = useTranslation('plugin');

  const pluginStoreList = useToolStore((s) => {
    const custom = pluginSelectors.installedCustomPluginMetaList(s);
    const store = mcpStoreSelectors.mcpPluginList(s);
    return [...custom, ...store];
  }, isEqual);

  const useFetchMCPPluginStore = useToolStore((s) => s.useFetchMCPPluginStore);

  const { isLoading, error } = useFetchMCPPluginStore({ keywords });

  const isEmpty = pluginStoreList.length === 0;

  const filteredPluginList = useMemo(
    () =>
      pluginStoreList.filter((item) =>
        [item.meta?.title, item.meta?.description, item.author, ...(item.meta?.tags || [])]
          .filter(Boolean)
          .join('')
          .toLowerCase()
          .includes((keywords || '')?.toLowerCase()),
      ),
    [pluginStoreList, keywords],
  );

  if (isLoading) return <Loading />;
  if (isEmpty)
    return (
      <Center gap={12} padding={40}>
        {error ? (
          <>
            <Icon icon={ServerCrash} size={80} />
            {t('store.networkError')}
          </>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Center>
    );

  return (
    <Virtuoso
      itemContent={(index) => {
        const item = filteredPluginList[index];
        return <PluginItem key={item.identifier} {...item} isMCP />;
      }}
      overscan={400}
      style={{ height: 500, marginInline: -16 }}
      totalCount={filteredPluginList.length}
    />
  );
});

export default MCPPluginList;
