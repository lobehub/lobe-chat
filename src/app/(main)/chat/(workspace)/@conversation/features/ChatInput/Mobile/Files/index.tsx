import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { filesSelectors, useFileStore } from '@/store/file';

import FileList from './FileList';

const Files = memo(() => {
  const list = useFileStore(filesSelectors.chatUploadFileList, isEqual);
  const [removeFile] = useFileStore((s) => [s.removeChatUploadFile]);

  if (!list || list?.length === 0) return null;

  return (
    <Flexbox paddingBlock={4} style={{ position: 'relative' }}>
      <FileList
        alwaysShowClose
        editable
        items={list}
        onRemove={(id) => removeFile(id)}
        padding={'4px 8px 8px'}
      />
    </Flexbox>
  );
});

export default Files;
