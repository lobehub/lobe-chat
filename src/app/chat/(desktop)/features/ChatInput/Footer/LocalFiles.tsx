import { memo } from 'react';

import EditableFileList from '@/components/FileList/EditableFileList';
import { useFileStore } from '@/store/file';

export const LocalFiles = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  return <EditableFileList items={inputFilesList} padding={0} />;
});
