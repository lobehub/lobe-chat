import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { ImageFileListViewer } from '@/components/FileList';
import { filesSelectors, useFileStore } from '@/store/file';

interface FileListProps {
  items: string[];
}

export const FileListPreviewer = memo<FileListProps>(({ items }) => {
  const useFetchFiles = useFileStore((s) => s.useFetchFiles);
  const data = useFileStore(filesSelectors.getImageDetailByList(items), isEqual);
  useFetchFiles(items);

  return <ImageFileListViewer items={data} />;
});
