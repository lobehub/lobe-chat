import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';
import { S3 } from '@/server/modules/S3';

export const getFullFileUrl = async (url?: string | null) => {
  if (!url) return '';

  // 如果未设置公共读，则需要每次重新生成预览地址
  if (!fileEnv.S3_SET_ACL) {
    const s3 = new S3();
    return await s3.createPreSignedUrlForPreview(url);
  }

  if (fileEnv.S3_ENABLE_PATH_STYLE) {
    return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, fileEnv.S3_BUCKET!, url);
  }

  return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, url);
};
