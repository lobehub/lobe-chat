import { ImageGallery } from '@lobehub/ui';
import { memo } from 'react';

import GalleyGrid from '@/components/GalleyGrid';
import ImageItem from '@/components/ImageItem';

import { ImageFileItem } from './type';

interface FileListProps {
  items: ImageFileItem[];
}

export const ImageFileListViewer = memo<FileListProps>(({ items }) => {
  return (
    <ImageGallery>
      <GalleyGrid items={items} renderItem={ImageItem} />
    </ImageGallery>
  );
});
