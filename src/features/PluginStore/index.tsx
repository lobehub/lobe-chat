import { Icon, Modal, SpotlightCard, TabsNav } from '@lobehub/ui';
import { Button, Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { ServerCrash } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import MobilePadding from '@/components/MobilePadding';
import { useToolStore } from '@/store/tool';
import { pluginStoreSelectors } from '@/store/tool/selectors';

import Loading from './Loading';
import PluginItem from './PluginItem';

interface PluginStoreProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}
export const PluginStore = memo<PluginStoreProps>(({ setOpen, open }) => {
  const { t } = useTranslation('plugin');

  const [listType, useFetchPluginList, installPlugins] = useToolStore((s) => [
    s.listType,
    s.useFetchPluginStore,
    s.installPlugins,
  ]);

  const pluginStoreList = useToolStore(pluginStoreSelectors.onlinePluginStore, isEqual);
  const { isLoading, error } = useFetchPluginList();
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
      <MobilePadding>
        <Center>
          <Flexbox gap={24} width={'100%'}>
            <Flexbox align={'center'} horizontal justify={'space-between'}>
              <TabsNav
                activeKey={listType}
                items={[
                  { key: 'all', label: t('store.tabs.all') },
                  { key: 'installed', label: t('store.tabs.installed') },
                ]}
                onChange={(v) => {
                  useToolStore.setState({ listType: v as any });
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
                  <Empty
                    description={t('store.empty')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  ></Empty>
                )}
              </Center>
            ) : (
              <SpotlightCard columns={2} gap={16} items={pluginStoreList} renderItem={PluginItem} />
            )}
          </Flexbox>
        </Center>
      </MobilePadding>
    </Modal>
  );
});

export default PluginStore;
