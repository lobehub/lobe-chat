import { consola } from 'consola';
import dotenv from 'dotenv';

import s3 from './s3';
import type { ImgInfo, S3UserConfig, UploadResult } from './s3/types';
import { formatPath } from './s3/utils';

dotenv.config();
export const uploader = async (
  file: File,
  filename: string,
  basePath: string = 'blog/assets/',
  uploadPath?: string,
) => {
  const item: ImgInfo = {
    buffer: Buffer.from(await file.arrayBuffer()),
    extname: file.name.split('.').pop() as string,
    fileName: file.name,
    mimeType: file.type,
  };

  const userConfig: S3UserConfig = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    bucketName: 'hub-apac-1',
    endpoint: 'https://d35842305b91be4b48e06ff9a9ad83f5.r2.cloudflarestorage.com',
    pathPrefix: 'https://hub-apac-1.lobeobjects.space',
    pathStyleAccess: true,
    region: 'auto',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    uploadPath: uploadPath || `${basePath}${filename}.{extName}`,
  };

  const client = s3.createS3Client(userConfig);

  let results: UploadResult;

  try {
    results = await s3.createUploadTask({
      acl: 'public-read',
      bucketName: userConfig.bucketName,
      client,
      item: item,
      path: formatPath(item, userConfig.uploadPath),
      urlPrefix: userConfig.pathPrefix,
    });

    return results.url;
  } catch (error) {
    consola.error('上传到 S3 存储发生错误，请检查网络连接和配置是否正确');
    consola.error(error);
  }
};
