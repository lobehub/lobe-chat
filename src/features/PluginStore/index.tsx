import { Modal, SpotlightCard, TabsNav } from '@lobehub/ui';
import { Button, Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { usePluginStore } from '@/store/plugin';
import { pluginStoreSelectors } from '@/store/plugin/selectors';

import Loading from './Loading';
import PluginItem from './PluginItem';

interface PluginStoreProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}
export const PluginStore = memo<PluginStoreProps>(({ setOpen, open }) => {
  const { t } = useTranslation('plugin');

  const [listType, useFetchPluginList, installPlugins] = usePluginStore((s) => [
    s.listType,
    s.useFetchPluginStore,
    s.installPlugins,
  ]);

  const pluginStoreList = usePluginStore(pluginStoreSelectors.onlinePluginStore, isEqual);
  const { isLoading } = useFetchPluginList();
  const isEmpty = pluginStoreList.length === 0;

  return (
    <Modal
      footer={null}
      onCancel={() => {
        setOpen(false);
      }}
      open={open}
      title={t('store.title')}
      width={800}
    >
      <Center padding={'0 16px'}>
        {isLoading ? (
          <Loading />
        ) : (
          <Flexbox gap={24} width={'100%'}>
            <Flexbox align={'center'} horizontal justify={'space-between'}>
              <TabsNav
                activeKey={listType}
                items={[
                  { key: 'all', label: t('store.tabs.all') },
                  { key: 'installed', label: t('store.tabs.installed') },
                ]}
                onChange={(v) => {
                  usePluginStore.setState({ listType: v as any });
                }}
              />

              <Flexbox gap={8} horizontal>
                {listType === 'all' && (
                  <Button
                    onClick={() => {
                      installPlugins(pluginStoreList.map((item) => item.identifier));
                    }}
                  >
                    {t('store.installAllPlugins')}
                  </Button>
                )}
              </Flexbox>
            </Flexbox>
            {isEmpty ? (
              <Center padding={40}>
                <Empty description={t('store.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
              </Center>
            ) : (
              <SpotlightCard columns={2} gap={16} items={pluginStoreList} renderItem={PluginItem} />
            )}
          </Flexbox>
        )}
      </Center>
    </Modal>
  );
});

export default PluginStore;
