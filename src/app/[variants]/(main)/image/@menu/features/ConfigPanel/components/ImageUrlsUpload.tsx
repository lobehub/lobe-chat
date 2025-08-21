import { memo } from 'react';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

import ImageUpload from './ImageUpload';
import MultiImagesUpload from './MultiImagesUpload';

const ImageUrlsUpload = memo(() => {
  const { value, setValue, maxCount, maxFileSize } = useGenerationConfigParam('imageUrls');

  // When maxCount is 1, use ImageUpload for single image upload
  if (maxCount === 1) {
    const handleSingleChange = (url?: string) => {
      setValue(url ? [url] : []);
    };

    return (
      <ImageUpload
        maxFileSize={maxFileSize}
        onChange={handleSingleChange}
        value={value?.[0] ?? null}
      />
    );
  }

  // Otherwise use MultiImagesUpload for multiple images
  const handleChange = (urls: string[]) => {
    // Directly set the URLs to the store
    // The store will handle URL to path conversion when needed
    setValue(urls);
  };

  return (
    <MultiImagesUpload
      maxCount={maxCount}
      maxFileSize={maxFileSize}
      onChange={handleChange}
      value={value}
    />
  );
});

export default ImageUrlsUpload;
