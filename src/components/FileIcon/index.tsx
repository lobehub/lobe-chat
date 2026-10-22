import { FileTypeIcon, MaterialFileTypeIcon } from '@lobehub/ui';
import React, { memo } from 'react';

import { mimeTypeMap } from './config';

interface FileListProps {
  fileName: string;
  fileType?: string;
  isDirectory?: boolean;
  size?: number;
  variant?: 'raw' | 'file' | 'folder';
}

const FileIcon = memo<FileListProps>(({ fileName, size, variant = 'raw', isDirectory }) => {
  // `fileName` is typed as required, but it also reaches this component from
  // persisted data (editor JSON, tool results, message attachments) that can
  // omit it or carry an older shape. MaterialFileTypeIcon splits the name, so
  // normalize here: a missing name must render the generic icon, not throw.
  const name = typeof fileName === 'string' ? fileName : '';

  if (isDirectory)
    return (
      <MaterialFileTypeIcon
        fallbackUnknownType={false}
        filename={name}
        size={size}
        type={'folder'}
        variant={variant}
      />
    );

  if (Object.keys(mimeTypeMap).some((key) => name.toLowerCase().endsWith(`.${key}`))) {
    const ext = name.split('.').pop()?.toLowerCase() as string;

    return (
      <FileTypeIcon
        color={mimeTypeMap[ext]}
        filetype={ext?.toUpperCase()}
        size={size}
        type={'file'}
      />
    );
  }

  return <MaterialFileTypeIcon filename={name} size={size} type={'file'} variant={variant} />;
});

export default FileIcon;
