import { useEffect, useState } from 'react';

import { useFileStore } from '@/store/file';

export const useIsSupportedForChunking = (fileType: string) => {
  const [isSupported, setIsSupported] = useState(false);
  const isSupportedForChunking = useFileStore((s) => s.isSupportedForChunking);

  useEffect(() => {
    isSupportedForChunking(fileType).then(setIsSupported);
  }, [fileType, isSupportedForChunking]);

  return isSupported;
};
