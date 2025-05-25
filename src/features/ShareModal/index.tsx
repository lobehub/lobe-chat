import { Modal, type ModalProps, Segmented, type SegmentedProps } from '@lobehub/ui';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ChatMessage } from '@/types/message';

import ShareImage from './ShareImage';
import ShareJSON from './ShareJSON';
import ShareText from './ShareText';

enum Tab {
  JSON = 'json',
  Screenshot = 'screenshot',
  Text = 'text',
}

interface ShareModalProps extends ModalProps {
  displayMessageIds: string[];
  messages: ChatMessage[];
  systemRole?: string;
}

const ShareModal = memo<ShareModalProps>(
  ({ onCancel, open, messages, systemRole, displayMessageIds }) => {
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
          {tab === Tab.Screenshot && (
            <ShareImage messageIds={displayMessageIds} mobile={isMobile} systemRole={systemRole} />
          )}
          {tab === Tab.Text && <ShareText messages={messages} systemRole={systemRole} />}
          {tab === Tab.JSON && <ShareJSON messages={messages} systemRole={systemRole} />}
        </Flexbox>
      </Modal>
    );
  },
);

export default ShareModal;
