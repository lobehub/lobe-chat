'use client';

import { Modal } from '@lobehub/ui';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { useWorkspaceModal } from '../../features/useWorkspaceModal';

const PortalModal = memo(({ children }: PropsWithChildren) => {
  const [showMobilePortal, toggleMobilePortal] = useGlobalStore((s) => [
    systemStatusSelectors.mobileShowPortal(s),
    s.toggleMobilePortal,
  ]);
  const [open, setOpen] = useWorkspaceModal(showMobilePortal, toggleMobilePortal);
  const { t } = useTranslation('portal');

  return (
    <Modal
      allowFullscreen
      height={'95%'}
      onCancel={() => setOpen(false)}
      open={open}
      styles={{
        body: { padding: 0 },
      }}
      title={t('title')}
    >
      {children}
    </Modal>
  );
});

export default PortalModal;
