import { Modal, Segmented, type SegmentedProps } from '@lobehub/ui';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ChatMessage } from '@/types/message';

import ShareImage from './ShareImage';
import ShareText from './ShareText';

enum Tab {
  Screenshot = 'screenshot',
  Text = 'text',
}

interface ShareModalProps {
  message: ChatMessage;
  onCancel: () => void;
  open: boolean;
}

const ShareModal = memo<ShareModalProps>(({ onCancel, open, message }) => {
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
    ],
    [],
  );

  const isMobile = useIsMobile();
  return (
    <Modal
      allowFullscreen
      centered={false}
      footer={null}
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
          variant={'filled'}
        />
        {tab === Tab.Screenshot && <ShareImage message={message} mobile={isMobile} />}
        {tab === Tab.Text && <ShareText item={message} />}
      </Flexbox>
    </Modal>
  );
});

export default ShareModal;
