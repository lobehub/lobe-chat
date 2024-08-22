import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';

export const getFullFileUrl = (url?: string | null) => {
  if (!url) return '';

  return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, url);
};
