import { isDesktop } from '@/const/version';

import { DesktopLocalFileImpl } from './local';
import { S3StaticFileImpl } from './s3';
import { FileServiceImpl } from './type';

/**
 * Create file service module
 * Automatically selects between S3 or desktop local file implementation based on environment
 */
export const createFileServiceModule = (): FileServiceImpl => {
  // If in desktop application environment, use local file implementation
  if (isDesktop) {
    return new DesktopLocalFileImpl();
  }

  return new S3StaticFileImpl();
};

export type { FileServiceImpl } from './type';
