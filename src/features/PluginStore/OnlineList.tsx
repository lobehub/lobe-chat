import { Icon, SearchBar } from '@lobehub/ui';
import { Button, Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { ServerCrash } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import AddPluginButton from '@/features/PluginStore/AddPluginButton';
import { useToolStore } from '@/store/tool';
import { pluginSelectors, pluginStoreSelectors } from '@/store/tool/selectors';

import Loading from './Loading';
import PluginItem from './PluginItem';

export const OnlineList = memo(() => {
  const { t } = useTranslation('plugin');
  const [keywords, setKeywords] = useState<string>();

  const pluginStoreList = useToolStore((s) => {
    const custom = pluginSelectors.installedCustomPluginMetaList(s);
    const store = pluginStoreSelectors.onlinePluginStore(s);

    return [...custom, ...store];
  }, isEqual);
  const storePluginIds = useToolStore(
    (s) => pluginStoreSelectors.onlinePluginStore(s).map((s) => s.identifier),
    isEqual,
  );

  const [useFetchPluginList, installPlugins] = useToolStore((s) => [
    s.useFetchPluginStore,
    s.installPlugins,
  ]);

  const { isLoading, error } = useFetchPluginList();

  const isEmpty = pluginStoreList.length === 0;

  return (
    <Flexbox gap={16}>
      <Flexbox align={'center'} gap={16} horizontal justify={'space-between'}>
        <Flexbox flex={1}>
          <SearchBar
            allowClear
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('store.placeholder')}
            type={'block'}
            value={keywords}
          />
        </Flexbox>
        <Flexbox gap={8} horizontal>
          <AddPluginButton />
          <Button
            onClick={() => {
              installPlugins(storePluginIds);
            }}
          >
            {t('store.installAllPlugins')}
          </Button>
        </Flexbox>
      </Flexbox>

      {isLoading ? (
        <Loading />
      ) : isEmpty ? (
        <Center gap={12} padding={40}>
          {error ? (
            <>
              <Icon icon={ServerCrash} size={{ fontSize: 80 }} />
              {t('store.networkError')}
            </>
          ) : (
            <Empty description={t('store.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Center>
      ) : (
        <Flexbox gap={24}>
          {pluginStoreList
            .filter((item) =>
              [item.meta?.title, item.meta?.description, item.author, ...(item.meta?.tags || [])]
                .filter(Boolean)
                .join('')
                .toLowerCase()
                .includes((keywords || '')?.toLowerCase()),
            )
            .map((item) => (
              <PluginItem key={item.identifier} {...item} />
            ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default OnlineList;
