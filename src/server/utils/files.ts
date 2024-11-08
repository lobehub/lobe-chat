import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';
import { S3 } from '@/server/modules/S3';

export const getFullFileUrl = async (url?: string | null, expiresIn?: number) => {
  if (!url) return '';

  // If bucket is not set public read, the preview address needs to be regenerated each time
  if (!fileEnv.S3_SET_ACL) {
    const s3 = new S3();
    return await s3.createPreSignedUrlForPreview(url, expiresIn);
  }

  if (fileEnv.S3_ENABLE_PATH_STYLE) {
    return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, fileEnv.S3_BUCKET!, url);
  }

  return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, url);
};
