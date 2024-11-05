import { Modal, type ModalProps } from '@lobehub/ui';
import { Segmented, SegmentedProps } from 'antd';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';

import ShareImage from './ShareImage';
import ShareJSON from './ShareJSON';
import ShareText from './ShareText';

enum Tab {
  JSON = 'json',
  Screenshot = 'screenshot',
  Text = 'text',
}

const ShareModal = memo<ModalProps>(({ onCancel, open }) => {
  const [tab, setTab] = useState<Tab>(Tab.Screenshot);
  const { t } = useTranslation('chat');

  const options: SegmentedProps['options'] = useMemo(
    () => [
      {
        label: t('shareModal.screenshot'),
        value: Tab.Screenshot,
      },
      {
        label: t('shareModal.text'),
        value: Tab.Text,
      },
      {
        label: 'JSON',
        value: Tab.JSON,
      },
    ],
    [],
  );

  const isMobile = useIsMobile();
  return (
    <Modal
      allowFullscreen
      centered={false}
      footer={null}
      maxHeight={false}
      onCancel={onCancel}
      open={open}
      title={t('share', { ns: 'common' })}
      width={1440}
    >
      <Flexbox gap={isMobile ? 8 : 24}>
        <Segmented
          block
          onChange={(value) => setTab(value as Tab)}
          options={options}
          style={{ width: '100%' }}
          value={tab}
        />
        {tab === Tab.Screenshot && <ShareImage />}
        {tab === Tab.Text && <ShareText />}
        {tab === Tab.JSON && <ShareJSON />}
      </Flexbox>
    </Modal>
  );
});

export default ShareModal;
