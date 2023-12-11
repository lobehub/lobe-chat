import { Modal, TabsNav } from '@lobehub/ui';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import MobilePadding from '@/components/MobilePadding';
import { useToolStore } from '@/store/tool';
import { pluginStoreSelectors } from '@/store/tool/selectors';

import AddPluginButton from './AddPluginButton';
import InstalledPluginList from './InstalledPluginList';
import OnlineList from './OnlineList';

interface PluginStoreProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}
export const PluginStore = memo<PluginStoreProps>(({ setOpen, open }) => {
  const { t } = useTranslation('plugin');

  const [listType, installPlugins] = useToolStore((s) => [s.listType, s.installPlugins]);

  const pluginStoreList = useToolStore(pluginStoreSelectors.onlinePluginStore, isEqual);

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
                <AddPluginButton />
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
            {listType === 'all' ? <OnlineList /> : <InstalledPluginList />}
          </Flexbox>
        </Center>
      </MobilePadding>
    </Modal>
  );
});

export default PluginStore;
