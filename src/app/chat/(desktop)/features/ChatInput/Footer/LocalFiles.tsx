import { memo } from 'react';

import FileList from '@/app/chat/components/FileList';
import { useFileStore } from '@/store/files';

export const LocalFiles = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  return <FileList items={inputFilesList} />;
});
