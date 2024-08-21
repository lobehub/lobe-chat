import { ImageGallery } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ImageItem from '@/components/ImageItem';
import { UploadFileItem } from '@/types/files';

interface EditableFileListProps {
  alwaysShowClose?: boolean;
  editable?: boolean;
  items: UploadFileItem[];
  onRemove?: (id: string) => void;
  padding?: number | string;
}

const EditableFileList = memo<EditableFileListProps>(
  ({ items, editable = true, alwaysShowClose, onRemove, padding = 12 }) => {
    const { mobile } = useResponsive();

    return (
      <Flexbox
        gap={mobile ? 4 : 6}
        horizontal
        padding={padding}
        style={{ overflow: 'scroll', width: '100%' }}
      >
        <ImageGallery>
          {items.map((i) => (
            <ImageItem
              alt={i.file.name}
              alwaysShowClose={alwaysShowClose}
              editable={editable}
              key={i.id}
              loading={i.status === 'pending'}
              onRemove={() => onRemove?.(i.id)}
              url={i.previewUrl}
            />
          ))}
        </ImageGallery>
      </Flexbox>
    );
  },
);

export default EditableFileList;
