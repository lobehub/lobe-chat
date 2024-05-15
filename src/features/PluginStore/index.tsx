import { Modal } from '@lobehub/ui';
import { Segmented } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';

import InstalledPluginList from './InstalledPluginList';
import OnlineList from './OnlineList';

interface PluginStoreProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}
export const PluginStore = memo<PluginStoreProps>(({ setOpen, open }) => {
  const { t } = useTranslation('plugin');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const [listType] = useToolStore((s) => [s.listType]);

  const gap = mobile ? 8 : 16;

  return (
    <Modal
      allowFullscreen
      footer={null}
      onCancel={() => {
        setOpen(false);
      }}
      open={open}
      styles={{ body: { overflow: 'hidden' } }}
      title={t('store.title')}
      width={800}
    >
      <Flexbox gap={gap} 
        style={{maxHeight: mobile ? `calc(75vh - 56px - 13px - ${gap}px)` : `calc(75vh - 56px - ${gap}px)`}}
        width={'100%'}
      >
        <Segmented
          block
          onChange={(v) => {
            useToolStore.setState({ listType: v as any });
          }}
          options={[
            { label: t('store.tabs.all'), value: 'all' },
            { label: t('store.tabs.installed'), value: 'installed' },
          ]}
          style={{ flex: 1 }}
          value={listType}
        />
        {listType === 'all' ? <OnlineList /> : <InstalledPluginList />}
      </Flexbox>
    </Modal>
  );
});

export default PluginStore;
