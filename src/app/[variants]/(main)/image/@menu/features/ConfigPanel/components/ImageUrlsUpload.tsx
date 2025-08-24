import { memo } from 'react';

import { useImageStore } from '@/store/image';
import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';
import { imageGenerationConfigSelectors } from '@/store/image/slices/generationConfig/selectors';
import { constrainDimensions } from '@/utils/dimensionConstraints';

import ImageUpload from './ImageUpload';
import MultiImagesUpload from './MultiImagesUpload';

const ImageUrlsUpload = memo(() => {
  const { value, setValue, maxCount, maxFileSize } = useGenerationConfigParam('imageUrls');

  // Get dimension support and constraints
  const paramsSchema = useImageStore(imageGenerationConfigSelectors.parametersSchema);
  const isSupportWidth = useImageStore(imageGenerationConfigSelectors.isSupportedParam('width'));
  const isSupportHeight = useImageStore(imageGenerationConfigSelectors.isSupportedParam('height'));
  const setWidth = useImageStore((s) => s.setWidth);
  const setHeight = useImageStore((s) => s.setHeight);

  // Helper function to auto-set dimensions with constraints
  const autoSetDimensions = (dimensions: { height: number, width: number; }) => {
    if (!isSupportWidth || !isSupportHeight || !paramsSchema?.width || !paramsSchema?.height)
      return;

    const constraints = {
      height: { max: paramsSchema.height.max || 1024, min: paramsSchema.height.min || 512 },
      width: { max: paramsSchema.width.max || 1024, min: paramsSchema.width.min || 512 },
    };

    const adjusted = constrainDimensions(dimensions.width, dimensions.height, constraints);
    setWidth(adjusted.width);
    setHeight(adjusted.height);
  };

  // When maxCount is 1, use ImageUpload for single image upload
  if (maxCount === 1) {
    const handleSingleChange = (
      data?:
        | string // Old API: just URL
        | { dimensions?: { height: number, width: number; }, url: string; }, // New API: URL with dimensions
    ) => {
      const url = typeof data === 'string' ? data : data?.url;
      const dimensions = typeof data === 'object' ? data?.dimensions : undefined;

      setValue(url ? [url] : []);

      // Auto-set dimensions if available
      if (dimensions) {
        autoSetDimensions(dimensions);
      }
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
  const handleChange = (
    data:
      | string[] // Old API: just URLs
      | { dimensions?: { height: number, width: number; }, urls: string[]; }, // New API: URLs with first image dimensions
  ) => {
    const urls = Array.isArray(data) ? data : data.urls;
    const dimensions = Array.isArray(data) ? undefined : data.dimensions;

    // Directly set the URLs to the store
    // The store will handle URL to path conversion when needed
    setValue(urls);

    // Only auto-set dimensions if no existing images and only uploading one image
    if (!value?.length && urls.length === 1 && dimensions) {
      autoSetDimensions(dimensions);
    }
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
