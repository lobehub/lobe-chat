import { PreviewGroup } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import GalleyGrid from '@/components/GalleyGrid';
import { PythonFileItem } from '@/types/tool/python';

import PythonFileItemComponent from './PythonFileItem';

interface PythonFileGalleryProps {
  files: PythonFileItem[];
  messageId: string;
}

const PythonFileGallery = memo<PythonFileGalleryProps>(({ files, messageId }) => {
  if (!files || files.length === 0) {
    return null;
  }

  // 分离图片和其他文件
  const imageFiles = files.filter((file) =>
    /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(file.filename),
  );
  const otherFiles = files.filter(
    (file) => !/\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(file.filename),
  );

  return (
    <Flexbox gap={16}>
      {/* 图片预览组 */}
      {imageFiles.length > 0 && (
        <PreviewGroup>
          {imageFiles.length === 1 ? (
            // 单张图片时占据更大空间
            <Flexbox style={{ maxWidth: 400 }}>
              <PythonFileItemComponent isImage {...imageFiles[0]} messageId={messageId} />
            </Flexbox>
          ) : (
            <GalleyGrid
              items={imageFiles.map((file) => ({ ...file, messageId }))}
              renderItem={(props) => <PythonFileItemComponent isImage {...props} />}
            />
          )}
        </PreviewGroup>
      )}

      {/* 其他文件列表 */}
      {otherFiles.length > 0 && (
        <Flexbox gap={8} horizontal wrap="wrap">
          {otherFiles.map((file, index) => (
            <PythonFileItemComponent
              key={`${file.filename}-${index}`}
              {...file}
              messageId={messageId}
            />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default PythonFileGallery;
