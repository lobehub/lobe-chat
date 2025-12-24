'use client';

import DocViewer from '@cyntler/react-doc-viewer';
import { css, cx } from 'antd-style';
import { CSSProperties, memo } from 'react';

import { FileListItem } from '@/types/files';

import NotSupport from './NotSupport';
import { FileViewRenderers } from './Renderer';
import StandaloneImageViewer from './Renderer/Image/StandaloneImageViewer';
import PDFRenderer from './Renderer/PDF';

const container = css`
  overflow: auto;
  height: 100%;
  background: transparent !important;

  #proxy-renderer {
    height: 100%;
  }
`;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
const IMAGE_MIME_TYPES = new Set([
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
]);

const isImageFile = (fileType: string | undefined, fileName: string | undefined): boolean => {
  const lowerFileType = fileType?.toLowerCase();
  const lowerFileName = fileName?.toLowerCase();

  // Check MIME type
  if (lowerFileType && IMAGE_MIME_TYPES.has(lowerFileType)) {
    return true;
  }

  // Check file extension in fileType
  if (lowerFileType && IMAGE_EXTENSIONS.some((ext) => lowerFileType.includes(ext.slice(1)))) {
    return true;
  }

  // Check file extension in fileName
  if (lowerFileName && IMAGE_EXTENSIONS.some((ext) => lowerFileName.endsWith(ext))) {
    return true;
  }

  return false;
};

interface FileViewerProps extends FileListItem {
  className?: string;
  style?: CSSProperties;
}

const FileViewer = memo<FileViewerProps>(({ id, style, fileType, url, name }) => {
  if (fileType?.toLowerCase() === 'pdf' || name?.toLowerCase().endsWith('.pdf')) {
    return <PDFRenderer fileId={id} url={url} />;
  }

  if (isImageFile(fileType, name)) {
    return <StandaloneImageViewer fileId={id} url={url} />;
  }

  return (
    <DocViewer
      className={cx(container)}
      config={{
        header: { disableHeader: true },
        noRenderer: { overrideComponent: NotSupport },
      }}
      documents={[{ fileName: name, fileType, uri: url }]}
      pluginRenderers={FileViewRenderers}
      style={style}
    />
  );
});

export default FileViewer;
