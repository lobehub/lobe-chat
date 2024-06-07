import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { EditableFileList } from '@/features/FileList';
import { useFileStore } from '@/store/file';

const Files = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  if (!inputFilesList || inputFilesList?.length === 0) return null;

  return (
    <Flexbox paddingBlock={4} style={{ position: 'relative' }}>
      <EditableFileList alwaysShowClose items={inputFilesList} padding={'4px 8px 8px'} />
    </Flexbox>
  );
});

export default Files;
