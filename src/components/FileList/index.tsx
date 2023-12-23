import { ImageGallery } from '@lobehub/ui';
import { memo } from 'react';

import GalleyGrid from '@/components/GalleyGrid';

import ImageFileItem from './ImageFileItem';

interface FileListProps {
  items: string[];
}

const FileList = memo<FileListProps>(({ items }) => {
  return (
    <ImageGallery>
      <GalleyGrid items={items} renderItem={ImageFileItem} />
    </ImageGallery>
  );
});

export default FileList;
