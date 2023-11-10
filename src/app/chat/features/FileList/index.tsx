import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/files';

import FileItem from './FileItem';
import Lightbox from './Lightbox';

const FileList = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  return (
    <>
      <Flexbox gap={8} horizontal>
        {inputFilesList.map((i) => (
          <FileItem id={i} key={i} />
        ))}
      </Flexbox>
      <Lightbox />
    </>
  );
});

export default FileList;
