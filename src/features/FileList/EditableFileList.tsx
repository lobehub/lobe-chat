import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { EditableFileList as Base } from '@/components/FileList';
import { filesSelectors, useFileStore } from '@/store/file';

interface EditableFileListProps {
  alwaysShowClose?: boolean;
  editable?: boolean;
  items: string[];
  padding?: number | string;
}

export const EditableFileList = memo<EditableFileListProps>(
  ({ items, editable = true, alwaysShowClose, padding }) => {
    const [removeFile] = useFileStore((s) => [s.removeFile]);
    const list = useFileStore(filesSelectors.getImageDetailByList(items), isEqual);

    return (
      <Base
        alwaysShowClose={alwaysShowClose}
        editable={editable}
        items={list}
        onRemove={(id) => removeFile(id)}
        padding={padding}
      />
    );
  },
);

export default EditableFileList;
