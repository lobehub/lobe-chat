import { memo } from 'react';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

import ImageUpload from './ImageUpload';

const ImageUrl = memo(() => {
  const { value: imageUrl, setValue } = useGenerationConfigParam('imageUrl');

  // Extract the first URL from the array for single image display
  const handleChange = (url?: string) => {
    setValue(url ?? null);
  };

  return <ImageUpload onChange={handleChange} value={imageUrl} />;
});

export default ImageUrl;
