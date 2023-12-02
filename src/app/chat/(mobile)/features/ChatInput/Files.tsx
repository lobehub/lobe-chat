import { memo } from 'react';

import EditableFileList from '@/components/FileList/EditableFileList';
import { useFileStore } from '@/store/file';

const Files = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  return (
    <div style={{ position: 'relative', width: '100vw' }}>
      <EditableFileList alwaysShowClose items={inputFilesList} />
    </div>
  );
});

export default Files;
