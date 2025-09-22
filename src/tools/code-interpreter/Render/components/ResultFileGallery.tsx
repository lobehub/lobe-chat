import { CodeInterpreterFileItem } from '@lobechat/types';
import { PreviewGroup } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import GalleyGrid from '@/components/GalleyGrid';

import { ResultFile, ResultImage } from './ResultFileItem';

const ResultFileGallery = memo<{ files: CodeInterpreterFileItem[] }>(({ files }) => {
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
              <ResultImage {...imageFiles[0]} />
            </Flexbox>
          ) : (
            <GalleyGrid
              items={imageFiles.map((file) => ({ ...file }))}
              renderItem={(props) => <ResultImage {...props} />}
            />
          )}
        </PreviewGroup>
      )}

      {/* 其他文件列表 */}
      {otherFiles.length > 0 && (
        <Flexbox gap={8} horizontal wrap="wrap">
          {otherFiles.map((file, index) => (
            <ResultFile key={`${file.filename}-${index}`} {...file} />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default ResultFileGallery;
