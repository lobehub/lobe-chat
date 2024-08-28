'use client';

import { Modal } from '@lobehub/ui';
import { ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

import { DETAIL_PANEL_WIDTH } from '@/app/(main)/files/features/FileDetail';

const useStyles = createStyles(({ css, token }, showDetail: boolean) => {
  return {
    body: css`
      height: 100%;
      max-height: calc(100dvh - 56px) !important;
    `,
    content: css`
      height: 100%;
      background: transparent !important;
      border: none !important;
    `,
    extra: css`
      position: fixed;
      z-index: ${token.zIndexPopupBase + 10};
      inset-block: 0 0;
      inset-inline-end: 0;

      width: ${DETAIL_PANEL_WIDTH}px;

      background: ${token.colorBgLayout};
      border-inline-start: 1px solid ${token.colorSplit};
    `,
    header: css`
      background: transparent !important;
    `,
    modal: css`
      position: relative;
      inset-block-start: 0;

      width: ${showDetail ? `calc(100vw - ${DETAIL_PANEL_WIDTH}px) ` : '100vw'} !important;
      max-width: none;
      height: 100%;
      margin: 0;
      padding-block-end: 0;

      > div {
        height: 100%;
      }
    `,
  };
});

interface FullscreenModalProps {
  children: ReactNode;
  detail?: ReactNode;
}

const FullscreenModal = ({ children, detail }: FullscreenModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const { styles } = useStyles(!!detail);

  return (
    <>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <Modal
          className={styles.modal}
          classNames={{ body: styles.body, content: styles.content, header: styles.header }}
          footer={false}
          onCancel={() => {
            router.back();
            setOpen(false);
          }}
          open={open}
          width={'auto'}
        >
          {children}
        </Modal>
      </ConfigProvider>
      {!!detail && <div className={styles.extra}>{detail}</div>}
    </>
  );
};
export default FullscreenModal;
