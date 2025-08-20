import { ActionIcon, PreviewGroup } from '@lobehub/ui';
import { Download } from 'lucide-react';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import GalleyGrid from '@/components/GalleyGrid';
import { fileService } from '@/services/file';
import { PythonImageItem } from '@/types/tool/python';

import PythonImageItemComponent from './PythonImageItem';

interface PythonImageGalleryProps {
  images: PythonImageItem[];
  messageId: string;
}

const PythonImageGallery = memo<PythonImageGalleryProps>(({ images, messageId }) => {
  const { t } = useTranslation('tool');
  const currentRef = useRef(0);

  const handleDownload = async () => {
    const currentImage = images[currentRef.current];
    if (!currentImage) return;

    // 优先使用永久存储的图片
    if (currentImage.imageId) {
      try {
        const { url, name } = await fileService.getFile(currentImage.imageId);
        const link = document.createElement('a');
        link.href = url;
        link.download = name || currentImage.filename;
        link.click();
      } catch (error) {
        console.error('Failed to download image:', error);
      }
    } else if (currentImage.previewUrl) {
      // 如果只有预览 URL，下载预览图片
      const link = document.createElement('a');
      link.href = currentImage.previewUrl;
      link.download = currentImage.filename;
      link.click();
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Flexbox gap={16}>
      <PreviewGroup
        preview={{
          onChange: (current: number) => {
            currentRef.current = current;
          },
          onVisibleChange: (visible: boolean, _prevVisible: boolean, current: number) => {
            currentRef.current = current;
          },
          toolbarAddon: (
            <ActionIcon
              color={'#fff'}
              icon={Download}
              onClick={handleDownload}
              title={t('python.downloadImage')}
            />
          ),
        }}
      >
        <GalleyGrid
          items={images.map((image) => ({ ...image, messageId }))}
          renderItem={PythonImageItemComponent}
        />
      </PreviewGroup>
    </Flexbox>
  );
});

export default PythonImageGallery;
