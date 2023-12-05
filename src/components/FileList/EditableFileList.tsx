import { ImageGallery } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileItem from '@/components/FileList/FileItem';

interface EditableFileListProps {
  alwaysShowClose?: boolean;
  editable?: boolean;
  items: string[];
  padding?: number | string;
}

const EditableFileList = memo<EditableFileListProps>(
  ({ items, editable = true, alwaysShowClose, padding = 12 }) => {
    const { mobile } = useResponsive();
    return (
      <Flexbox
        gap={mobile ? 4 : 6}
        horizontal
        padding={padding}
        style={{ overflow: 'auto', width: '100%' }}
      >
        <ImageGallery>
          {items.map((i) => (
            <FileItem alwaysShowClose={alwaysShowClose} editable={editable} id={i} key={i} />
          ))}
        </ImageGallery>
      </Flexbox>
    );
  },
);

export default EditableFileList;
