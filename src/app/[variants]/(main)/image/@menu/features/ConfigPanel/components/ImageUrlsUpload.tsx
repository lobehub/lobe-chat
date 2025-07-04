import { memo } from 'react';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

import MultiImagesUpload from './MultiImagesUpload';

const ImageUrlsUpload = memo(() => {
  const { value, setValue } = useGenerationConfigParam('imageUrls');

  const handleChange = (urls: string[]) => {
    // Directly set the URLs to the store
    // The store will handle URL to path conversion when needed
    setValue(urls);
  };

  return <MultiImagesUpload onChange={handleChange} value={value} />;
});

export default ImageUrlsUpload;
