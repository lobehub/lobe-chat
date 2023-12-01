import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import FileList from 'src/components/FileList';

import { useFileStore } from '@/store/file';

const Files = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  return (
    <Flexbox padding={12}>
      <FileList alwaysShowClose items={inputFilesList} />
    </Flexbox>
  );
});

export default Files;
