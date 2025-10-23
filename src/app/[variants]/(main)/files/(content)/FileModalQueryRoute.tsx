'use client';

import { Modal } from '@lobehub/ui';
import { ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import { useSearchParams } from 'next/navigation';
import { memo, useEffect, useState } from 'react';

import { DETAIL_PANEL_WIDTH } from '@/app/[variants]/(main)/files/features/FileDetail';

import FileDetail from './modal/FileDetail';
import FilePreview from './modal/FilePreview';

const useStyles = createStyles(({ css, token }, showDetail: boolean) => {
  return {
    body: css`
      height: 100%;
      max-height: calc(100dvh - 56px) !important;
    `,
    content: css`
      height: 100%;
      border: none !important;
      background: transparent !important;
    `,
    extra: css`
      position: fixed;
      z-index: ${token.zIndexPopupBase + 10};
      inset-block: 0 0;
      inset-inline-end: 0;

      width: ${DETAIL_PANEL_WIDTH}px;
      border-inline-start: 1px solid ${token.colorSplit};

      background: ${token.colorBgLayout};
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

/**
 * FileModalQueryRoute component
 * Renders the file preview modal when a 'files' query parameter is present
 * Example: ?files=file_123
 * File data is fetched from the Zustand store by FilePreview and FileDetail components
 */
const FileModalQueryRoute = memo(() => {
  const searchParams = useSearchParams();
  const fileId = searchParams.get('files');
  const [open, setOpen] = useState(false);
  const { styles } = useStyles(true);

  console.log('searchParams', searchParams);

  console.log('fileId', fileId);

  useEffect(() => {
    setOpen(!!fileId);
  }, [fileId]);

  const handleClose = () => {
    // Remove the 'files' query parameter
    const params = new URLSearchParams(searchParams.toString());
    params.delete('files');

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);

    setOpen(false);
  };

  if (!fileId) return null;

  return (
    <>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <Modal
          className={styles.modal}
          classNames={{ body: styles.body, content: styles.content, header: styles.header }}
          footer={false}
          onCancel={handleClose}
          open={open}
          width={'auto'}
        >
          <FilePreview id={fileId} />
        </Modal>
      </ConfigProvider>
      <div className={styles.extra}>
        <FileDetail id={fileId} />
      </div>
    </>
  );
});

FileModalQueryRoute.displayName = 'FileModalQueryRoute';

export default FileModalQueryRoute;
