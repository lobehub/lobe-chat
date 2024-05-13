import { memo } from 'react';

import EditableFileList from '@/components/FileList/EditableFileList';
import { useFileStore } from '@/store/file';

const Files = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  if (!inputFilesList || inputFilesList?.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100vw' }}>
      <EditableFileList alwaysShowClose items={inputFilesList} padding={'0 8px'} />
    </div>
  );
});

export default Files;
