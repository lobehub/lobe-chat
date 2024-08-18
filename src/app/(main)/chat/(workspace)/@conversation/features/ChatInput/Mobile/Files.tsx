import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { EditableFileList as Base } from '@/components/FileList';
import { filesSelectors, useFileStore } from '@/store/file';

const Files = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);
  const list = useFileStore(filesSelectors.getImageDetailByList(inputFilesList), isEqual);
  const [removeFile] = useFileStore((s) => [s.removeChatUploadFile]);

  if (!inputFilesList || inputFilesList?.length === 0) return null;

  return (
    <Flexbox paddingBlock={4} style={{ position: 'relative' }}>
      <Base
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
