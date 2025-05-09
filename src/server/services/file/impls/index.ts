import { isDesktop } from '@/const/version';

import { DesktopLocalFileImpl } from './local';
import { S3StaticFileImpl } from './s3';
import { FileServiceImpl } from './type';

/**
 * 创建文件服务模块
 * 根据环境自动选择使用S3或桌面本地文件实现
 */
export const createFileServiceModule = (): FileServiceImpl => {
  // 如果在桌面应用环境，使用本地文件实现
  if (isDesktop) {
    return new DesktopLocalFileImpl();
  }

  return new S3StaticFileImpl();
};

export type { FileServiceImpl } from './type';
