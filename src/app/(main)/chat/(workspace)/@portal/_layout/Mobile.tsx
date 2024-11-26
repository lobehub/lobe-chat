'use client';

import { Modal } from '@lobehub/ui';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PortalHeader } from '@/features/Portal/router';
import { useChatStore } from '@/store/chat';

const Layout = ({ children }: PropsWithChildren) => {
  const [showMobilePortal, togglePortal] = useChatStore((s) => [s.showPortal, s.togglePortal]);
  const { t } = useTranslation('portal');

  return (
    <Modal
      allowFullscreen
      height={'95%'}
      onCancel={() => togglePortal(false)}
      open={showMobilePortal}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
      title={t('title')}
    >
      <PortalHeader />
      <Flexbox gap={8} height={'calc(100% - 52px)'} padding={'8px 8px 0'} style={{ overflow: 'hidden' }}>
        <Flexbox
          height={'100%'}
          style={{ marginInline: -8, overflow: 'hidden', position: 'relative' }}
          width={'calc(100% + 16px)'}
        >
          {children}
        </Flexbox>
      </Flexbox>
    </Modal>
  );
};

export default Layout;
