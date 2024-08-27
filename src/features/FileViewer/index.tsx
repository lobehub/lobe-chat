'use client';

import DocViewer, { MSDocRenderer } from '@cyntler/react-doc-viewer';
import { createStyles } from 'antd-style';
import { CSSProperties, memo } from 'react';

import { FileListItem } from '@/types/files';

import NotSupport from './NotSupport';
import PDFViewer from './PDFViewer';
import TXTViewer from './TXTViewer';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 12px;
    background: ${token.colorBgLayout} !important;
  `,
}));

interface FileViewerProps extends FileListItem {
  className?: string;
  style?: CSSProperties;
}

const FileViewer = memo<FileViewerProps>(({ id, style, fileType, url, name }) => {
  const { styles } = useStyles();
  if (fileType === 'pdf' || name.endsWith('.pdf')) {
    return <PDFViewer fileId={id} url={url} />;
  }

  return (
    <DocViewer
      className={styles.container}
      config={{
        header: { disableHeader: true },
        noRenderer: { overrideComponent: NotSupport },
      }}
      documents={[{ fileName: name, fileType, uri: url }]}
      pluginRenderers={[TXTViewer, MSDocRenderer]}
      style={style}
    />
  );
});

export default FileViewer;
