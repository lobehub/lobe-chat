import { PythonFileItem } from '@lobechat/types';
import { PreviewGroup } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import GalleyGrid from '@/components/GalleyGrid';

import { PythonFile, PythonImage } from './PythonFileItem';

const PythonFileGallery = memo<{ files: PythonFileItem[] }>(({ files }) => {
  if (!files || files.length === 0) {
    return null;
  }

  // 分离图片和其他文件
  const imageFiles = [];
  const otherFiles = [];
  for (const file of files) {
    if (/\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(file.filename)) {
      imageFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  }

  return (
    <Flexbox gap={16}>
      {/* 图片预览组 */}
      {imageFiles.length > 0 && (
        <PreviewGroup>
          {imageFiles.length === 1 ? (
            // 单张图片时占据更大空间
            <Flexbox style={{ maxWidth: 400 }}>
              <PythonImage {...imageFiles[0]} />
            </Flexbox>
          ) : (
            <GalleyGrid
              items={imageFiles.map((file) => ({ ...file }))}
              renderItem={(props) => <PythonImage {...props} />}
            />
          )}
        </PreviewGroup>
      )}

      {/* 其他文件列表 */}
      {otherFiles.length > 0 && (
        <Flexbox gap={8} horizontal wrap="wrap">
          {otherFiles.map((file, index) => (
            <PythonFile key={`${file.filename}-${index}`} {...file} />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default PythonFileGallery;
