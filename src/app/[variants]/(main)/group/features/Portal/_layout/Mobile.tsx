'use client';

import { Flexbox, Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PortalContent } from '@/features/Portal/router';
import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background: linear-gradient(${token.colorBgElevated}, ${token.colorBgContainer}) !important;
  `,
}));

const Layout = () => {
  const { styles, cx } = useStyles();
  const [showMobilePortal, isPortalThread, togglePortal] = useChatStore((s) => [
    s.showPortal,
    !!s.portalThreadId,
    s.togglePortal,
  ]);
  const { t } = useTranslation('portal');

  const renderBody = (body: ReactNode) => (
    <Flexbox
      gap={8}
      height={'calc(100% - 52px)'}
      padding={'0 8px'}
      style={{ overflow: 'hidden' }}
    >
      <Flexbox
        height={'100%'}
        style={{ marginInline: -8, overflow: 'hidden', position: 'relative' }}
        width={'calc(100% + 16px)'}
      >
        {body}
      </Flexbox>
    </Flexbox>
  );

  return (
    <Modal
      allowFullscreen
      className={cx(isPortalThread && styles.container)}
      footer={null}
      height={'95%'}
      onCancel={() => togglePortal(false)}
      open={showMobilePortal}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
      title={t('title')}
    >
      <PortalContent renderBody={renderBody} />
    </Modal>
  );
};

export default Layout;
