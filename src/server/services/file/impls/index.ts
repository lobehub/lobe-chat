import { S3StaticFileImpl } from './s3';
import { FileServiceImpl } from './type';

/**
 * 创建文件服务模块
 */
export const createFileServiceModule = (): FileServiceImpl => {
  // 默认使用 S3 实现
  return new S3StaticFileImpl();
};

export type { FileServiceImpl } from './type';
