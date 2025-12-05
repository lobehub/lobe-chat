'use client';

import { Button, Modal } from '@lobehub/ui';
import { ArrowUpRightIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { ChangelogService } from '@/server/services/changelog';

import ChangelogContent from './ChangelogContent';

interface ChangelogModalProps {
  onClose: () => void;
  open: boolean;
}

const ChangelogModal = memo<ChangelogModalProps>(({ open, onClose }) => {
  const { t } = useTranslation('common');

  const { data = [] } = useSWR(open ? 'changelog-index' : null, async () => {
    const changelogService = new ChangelogService();
    return await changelogService.getChangelogIndex();
  });

  if (!open) return null;

  return (
    <Modal
      destroyOnHidden
      footer={null}
      onCancel={onClose}
      open={open}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
      title={
        <Flexbox align={'center'} gap={8}>
          <Button
            icon={<ArrowUpRightIcon size={16} />}
            iconPosition="end"
            onClick={onClose}
            type="text"
          >
            {t('changelog')}
          </Button>
        </Flexbox>
      }
      width={800}
    >
      <Flexbox gap={16} padding={16} style={{ width: '100%' }}>
        {data.length > 0 ? (
          <ChangelogContent data={data} />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>{t('loading')}</div>
        )}
      </Flexbox>
    </Modal>
  );
});

ChangelogModal.displayName = 'ChangelogModal';

export default ChangelogModal;
