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

  // Separate images and other files
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
      {/* Image preview group */}
      {imageFiles.length > 0 && (
        <PreviewGroup>
          {imageFiles.length === 1 ? (
            // Single image takes up more space
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

      {/* Other file list */}
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
