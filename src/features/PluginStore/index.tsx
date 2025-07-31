import { Modal } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Content from './Content';

interface PluginStoreProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}
export const PluginStore = memo<PluginStoreProps>(({ setOpen, open }) => {
  const { t } = useTranslation('plugin');

  return (
    <Modal
      allowFullscreen
      footer={null}
      onCancel={() => {
        setOpen(false);
      }}
      open={open}
      styles={{
        body: { overflow: 'hidden', padding: 0 },
      }}
      title={t('store.title')}
      width={'min(90%, 1280px)'}
    >
      <Content />
    </Modal>
  );
});

export default PluginStore;
