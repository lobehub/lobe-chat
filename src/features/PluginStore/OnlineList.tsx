import { Icon, SpotlightCard } from '@lobehub/ui';
import { Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { ServerCrash } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginStoreSelectors } from '@/store/tool/selectors';

import Loading from './Loading';
import PluginItem from './PluginItem';

export const OnlineList = memo(() => {
  const { t } = useTranslation('plugin');

  const [useFetchPluginList] = useToolStore((s) => [s.useFetchPluginStore]);

  const pluginStoreList = useToolStore(pluginStoreSelectors.onlinePluginStore, isEqual);

  const { isLoading, error } = useFetchPluginList();
  const isEmpty = pluginStoreList.length === 0;

  return isLoading ? (
    <Loading />
  ) : isEmpty ? (
    <Center gap={12} padding={40}>
      {error ? (
        <>
          <Icon icon={ServerCrash} size={{ fontSize: 80 }} />
          {t('store.networkError')}
        </>
      ) : (
        <Empty description={t('store.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
      )}
    </Center>
  ) : (
    <SpotlightCard columns={2} gap={16} items={pluginStoreList} renderItem={PluginItem} />
  );
});

export default OnlineList;
