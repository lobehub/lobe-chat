import { ImageGallery } from '@lobehub/ui';
import { memo, useMemo } from 'react';

import GalleyGrid from '@/components/GalleyGrid';

import ImageFileItem from './ImageFileItem';

interface FileListProps {
  items: string[];
}

const FileList = memo<FileListProps>(({ items }) => {
  const data = useMemo(() => items.map((id) => ({ id })), [items]);

  return (
    <ImageGallery>
      <GalleyGrid items={data} renderItem={ImageFileItem} />
    </ImageGallery>
  );
});

export default FileList;
