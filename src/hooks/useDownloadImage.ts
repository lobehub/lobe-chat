import { useMemoizedFn } from 'ahooks';
import { App } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile } from '@/utils/client/downloadFile';

export function useDownloadImage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { message } = App.useApp();
  const { t } = useTranslation('image');

  return {
    downloadImage: useMemoizedFn(async (url: string, fileName: string) => {
      setIsDownloading(true);
      try {
        await downloadFile(url, fileName, false);
      } catch (error) {
        console.error('Failed to download image:', error);

        // Show a general error message that covers network issues and CORS problems
        message.error(t('generation.actions.downloadFailed'));

        throw error;
      } finally {
        setIsDownloading(false);
      }
    }),
    isDownloading,
  };
}
