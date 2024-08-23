import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';

export const getFullFileUrl = (url?: string | null) => {
  if (!url) return '';

  if (fileEnv.S3_ENABLE_PATH_STYLE) {
    return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, fileEnv.S3_BUCKET!, url);
  }

  return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, url);
};
