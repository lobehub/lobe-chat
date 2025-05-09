import { DeleteFilesResponse } from '@lobechat/electron-server-ipc';
import * as fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { FILE_STORAGE_DIR } from '@/const/dir';
import { makeSureDirExist } from '@/utils/file-system';
import { createLogger } from '@/utils/logger';

import { ServiceModule } from './index';

const readFilePromise = promisify(fs.readFile);
const unlinkPromise = promisify(fs.unlink);

// Create logger
const logger = createLogger('services:FileService');

interface UploadFileParams {
  content: ArrayBuffer;
  filename: string;
  hash: string;
  path: string;
  type: string;
}

interface FileMetadata {
  date: string;
  dirname: string;
  filename: string;
  path: string;
}

export default class FileService extends ServiceModule {
  get UPLOADS_DIR() {
    return join(this.app.appStoragePath, FILE_STORAGE_DIR, 'uploads');
  }

  constructor(app) {
    super(app);

    // Initialize file storage directory
    logger.info('Initializing file storage directory');
    makeSureDirExist(this.UPLOADS_DIR);
    logger.debug(`Upload directory created: ${this.UPLOADS_DIR}`);
  }

  /**
   * 上传文件到本地存储
   */
  async uploadFile({
    content,
    filename,
    hash,
    type,
  }: UploadFileParams): Promise<{ metadata: FileMetadata; success: boolean }> {
    logger.info(`Starting to upload file: ${filename}, hash: ${hash}`);
    try {
      // 创建时间戳目录
      const date = (Date.now() / 1000 / 60 / 60).toFixed(0);
      const dirname = join(this.UPLOADS_DIR, date);
      logger.debug(`Creating timestamp directory: ${dirname}`);
      makeSureDirExist(dirname);

      // 生成文件保存路径
      const fileExt = filename.split('.').pop() || '';
      const savedFilename = `${hash}${fileExt ? `.${fileExt}` : ''}`;
      const savedPath = join(dirname, savedFilename);
      logger.debug(`Generated file save path: ${savedPath}`);

      // 写入文件内容
      const buffer = Buffer.from(content);
      logger.debug(`Writing file content, size: ${buffer.length} bytes`);
      await writeFile(savedPath, buffer);

      // 写入元数据文件
      const metaFilePath = `${savedPath}.meta`;
      const metadata = {
        createdAt: Date.now(),
        filename,
        hash,
        size: buffer.length,
        type,
      };
      logger.debug(`Writing metadata file: ${metaFilePath}`);
      await writeFile(metaFilePath, JSON.stringify(metadata, null, 2));

      // 返回与S3兼容的元数据格式
      const desktopPath = `desktop://${date}/${savedFilename}`;
      logger.info(`File upload successful: ${desktopPath}`);

      return {
        metadata: {
          date,
          dirname: date,
          filename: savedFilename,
          path: desktopPath,
        },
        success: true,
      };
    } catch (error) {
      logger.error(`File upload failed:`, error);
      throw new Error(`File upload failed: ${(error as Error).message}`);
    }
  }

  /**
   * 获取文件内容
   */
  async getFile(path: string): Promise<{ content: ArrayBuffer; mimeType: string }> {
    logger.info(`Getting file content: ${path}`);
    try {
      // 处理desktop://路径
      if (!path.startsWith('desktop://')) {
        logger.error(`Invalid desktop file path: ${path}`);
        throw new Error(`Invalid desktop file path: ${path}`);
      }

      // 标准化路径格式
      // 可能收到的格式: desktop:/12345/file.png 或 desktop://12345/file.png
      const normalizedPath = path.replace(/^desktop:\/+/, 'desktop://');
      logger.debug(`Normalized path: ${normalizedPath}`);

      // 解析路径
      const relativePath = normalizedPath.replace('desktop://', '');
      const filePath = join(this.UPLOADS_DIR, relativePath);
      logger.debug(`Reading file from path: ${filePath}`);

      // 读取文件内容
      logger.debug(`Starting to read file content`);
      const content = await readFilePromise(filePath);
      logger.debug(`File content read complete, size: ${content.length} bytes`);

      // 读取元数据获取MIME类型
      const metaFilePath = `${filePath}.meta`;
      let mimeType = 'application/octet-stream'; // 默认MIME类型
      logger.debug(`Attempting to read metadata file: ${metaFilePath}`);

      try {
        const metaContent = await readFilePromise(metaFilePath, 'utf8');
        const metadata = JSON.parse(metaContent);
        mimeType = metadata.type || mimeType;
        logger.debug(`Got MIME type from metadata: ${mimeType}`);
      } catch (metaError) {
        logger.warn(`Failed to read metadata file: ${(metaError as Error).message}, using default MIME type`);
        // 如果元数据文件不存在，尝试从文件扩展名猜测MIME类型
        const ext = path.split('.').pop()?.toLowerCase();
        if (ext) {
          if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
          else
            switch (ext) {
              case 'png': {
                mimeType = 'image/png';
                break;
              }
              case 'gif': {
                mimeType = 'image/gif';
                break;
              }
              case 'webp': {
                mimeType = 'image/webp';
                break;
              }
              case 'svg': {
                mimeType = 'image/svg+xml';
                break;
              }
              case 'pdf': {
                {
                  mimeType = 'application/pdf';
                  // No default
                }
                break;
              }
            }
          logger.debug(`Set MIME type based on file extension: ${mimeType}`);
        }
      }

      logger.info(`File retrieval successful: ${path}`);
      return {
        content: content.buffer as ArrayBuffer,
        mimeType,
      };
    } catch (error) {
      logger.error(`File retrieval failed:`, error);
      throw new Error(`File retrieval failed: ${(error as Error).message}`);
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<{ success: boolean }> {
    logger.info(`Deleting file: ${path}`);
    try {
      // 处理desktop://路径
      if (!path.startsWith('desktop://')) {
        logger.error(`Invalid desktop file path: ${path}`);
        throw new Error(`Invalid desktop file path: ${path}`);
      }

      // 解析路径
      const relativePath = path.replace('desktop://', '');
      const filePath = join(this.UPLOADS_DIR, relativePath);
      logger.debug(`File deletion path: ${filePath}`);

      // 删除文件及其元数据
      logger.debug(`Starting file deletion`);
      await unlinkPromise(filePath);
      logger.debug(`File deletion successful`);

      // 尝试删除元数据文件，但不强制要求存在
      try {
        logger.debug(`Attempting to delete metadata file`);
        await unlinkPromise(`${filePath}.meta`);
        logger.debug(`Metadata file deletion successful`);
      } catch (error) {
        logger.warn(`Failed to delete metadata file: ${(error as Error).message}`);
      }

      logger.info(`File deletion operation complete: ${path}`);
      return { success: true };
    } catch (error) {
      logger.error(`File deletion failed:`, error);
      throw new Error(`File deletion failed: ${(error as Error).message}`);
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(paths: string[]): Promise<DeleteFilesResponse> {
    logger.info(`Batch deleting files, count: ${paths.length}`);
    const errors: { message: string; path: string }[] = [];

    // 并行处理所有删除请求
    logger.debug(`Starting parallel deletion requests`);
    const results = await Promise.allSettled(
      paths.map(async (path) => {
        try {
          await this.deleteFile(path);
          return { path, success: true };
        } catch (error) {
          logger.warn(`Failed to delete file: ${path}, error: ${(error as Error).message}`);
          return {
            error: (error as Error).message,
            path,
            success: false,
          };
        }
      }),
    );

    // 处理结果
    logger.debug(`Processing batch deletion results`);
    results.forEach((result) => {
      if (result.status === 'rejected') {
        logger.error(`Unexpected error: ${result.reason}`);
        errors.push({
          message: `Unexpected error: ${result.reason}`,
          path: 'unknown',
        });
      } else if (!result.value.success) {
        errors.push({
          message: result.value.error,
          path: result.value.path,
        });
      }
    });

    const success = errors.length === 0;
    logger.info(`Batch deletion operation complete, success: ${success}, error count: ${errors.length}`);
    return {
      success,
      ...(errors.length > 0 && { errors }),
    };
  }

  async getFilePath(path: string): Promise<string> {
    logger.debug(`Getting filesystem path: ${path}`);
    // 处理desktop://路径
    if (!path.startsWith('desktop://')) {
      logger.error(`Invalid desktop file path: ${path}`);
      throw new Error(`Invalid desktop file path: ${path}`);
    }

    // 解析路径
    const relativePath = path.replace('desktop://', '');
    const fullPath = join(this.UPLOADS_DIR, relativePath);
    logger.debug(`Resolved filesystem path: ${fullPath}`);
    return fullPath;
  }
}
