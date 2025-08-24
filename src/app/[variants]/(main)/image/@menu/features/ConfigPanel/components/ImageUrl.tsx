import { memo } from 'react';

import { useImageStore } from '@/store/image';
import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';
import { imageGenerationConfigSelectors } from '@/store/image/slices/generationConfig/selectors';
import { constrainDimensions } from '@/utils/dimensionConstraints';

import ImageUpload from './ImageUpload';

const ImageUrl = memo(() => {
  const { value: imageUrl, setValue, maxFileSize } = useGenerationConfigParam('imageUrl');

  // Get dimension support and constraints
  const paramsSchema = useImageStore(imageGenerationConfigSelectors.parametersSchema);
  const isSupportWidth = useImageStore(imageGenerationConfigSelectors.isSupportedParam('width'));
  const isSupportHeight = useImageStore(imageGenerationConfigSelectors.isSupportedParam('height'));
  const setWidth = useImageStore((s) => s.setWidth);
  const setHeight = useImageStore((s) => s.setHeight);

  const handleChange = (
    data?:
      | string // Old API: just URL
      | { dimensions?: { height: number, width: number; }, url: string; }, // New API: URL with dimensions
  ) => {
    // Compatible handling: data can be string (old version) or object (new version)
    const url = typeof data === 'string' ? data : data?.url;
    const dimensions = typeof data === 'object' ? data?.dimensions : undefined;

    setValue(url ?? null);

    // Auto-set dimensions if available and width/height parameters are supported
    if (
      dimensions &&
      isSupportWidth &&
      isSupportHeight &&
      paramsSchema?.width &&
      paramsSchema?.height
    ) {
      const constraints = {
        height: { max: paramsSchema.height.max || 1024, min: paramsSchema.height.min || 512 },
        width: { max: paramsSchema.width.max || 1024, min: paramsSchema.width.min || 512 },
      };

      const adjusted = constrainDimensions(dimensions.width, dimensions.height, constraints);
      setWidth(adjusted.width);
      setHeight(adjusted.height);
    }
  };

  return <ImageUpload maxFileSize={maxFileSize} onChange={handleChange} value={imageUrl} />;
});

export default ImageUrl;
