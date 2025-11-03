import { LobeChatDatabase } from '@lobechat/database';
import { TRPCError } from '@trpc/server';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

import { serverDBEnv } from '@/config/db';
import { BRANDING_NAME } from '@/const/branding';
import { FileModel } from '@/database/models/file';
import { FileItem } from '@/database/schemas';
import { TempFileManager } from '@/server/utils/tempFileManager';
import { BatchDownloadEventType } from '@/types/files';
import { getUserAuth } from '@/utils/server';
import { getYYYYmmddHHMMss } from '@/utils/time';
import { nanoid } from '@/utils/uuid';

import { FileServiceImpl, createFileServiceModule } from './impls';

/**
 * 文件服务类
 * 使用模块化实现方式，提供文件操作服务
 */
export class FileService {
  private userId: string;
  private fileModel: FileModel;

  private impl: FileServiceImpl = createFileServiceModule();

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.fileModel = new FileModel(db, userId);
  }

  /**
   * 删除文件
   */
  public async deleteFile(key: string) {
    return this.impl.deleteFile(key);
  }

  /**
   * 批量删除文件
   */
  public async deleteFiles(keys: string[]) {
    return this.impl.deleteFiles(keys);
  }

  /**
   * 获取文件内容
   */
  public async getFileContent(key: string): Promise<string> {
    return this.impl.getFileContent(key);
  }

  /**
   * 获取文件字节数组
   */
  public async getFileByteArray(key: string): Promise<Uint8Array> {
    return this.impl.getFileByteArray(key);
  }

  /**
   * 创建预签名上传URL
   */
  public async createPreSignedUrl(key: string): Promise<string> {
    return this.impl.createPreSignedUrl(key);
  }

  /**
   * 创建预签名预览URL
   */
  public async createPreSignedUrlForPreview(key: string, expiresIn?: number): Promise<string> {
    return this.impl.createPreSignedUrlForPreview(key, expiresIn);
  }

  /**
   * 上传内容
   */
  public async uploadContent(path: string, content: string) {
    return this.impl.uploadContent(path, content);
  }

  /**
   * 获取完整文件URL
   */
  public async getFullFileUrl(url?: string | null, expiresIn?: number): Promise<string> {
    return this.impl.getFullFileUrl(url, expiresIn);
  }

  /**
   * 从完整 URL中 提取 key
   */
  public getKeyFromFullUrl(url: string): string {
    return this.impl.getKeyFromFullUrl(url);
  }

  /**
   * 上传媒体文件
   */
  public async uploadMedia(key: string, buffer: Buffer): Promise<{ key: string }> {
    return this.impl.uploadMedia(key, buffer);
  }

  async downloadFileToLocal(
    fileId: string,
  ): Promise<{ cleanup: () => void; file: FileItem; filePath: string }> {
    const file = await this.fileModel.findById(fileId);
    if (!file) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' });
    }

    let content: Uint8Array | undefined;
    try {
      content = await this.getFileByteArray(file.url);
    } catch (e) {
      console.error(e);
      // if file not found, delete it from db
      if ((e as any).Code === 'NoSuchKey') {
        await this.fileModel.delete(fileId, serverDBEnv.REMOVE_GLOBAL_FILE);
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' });
      }
    }

    if (!content) throw new TRPCError({ code: 'BAD_REQUEST', message: 'File content is empty' });

    const dir = nanoid();
    const tempManager = new TempFileManager(dir);

    const filePath = await tempManager.writeTempFile(content, file.name);
    return { cleanup: () => tempManager.cleanup(), file, filePath };
  }

  /**
   * 根据文件ID批量查找文件
   */
  async findFilesByIds(fileIds: string[]) {
    return this.fileModel.findByIds(fileIds);
  }

  /**
   * 批量下载文件（订阅模式）
   */
  async *batchDownloadSubscription(
    fileIds: string[],
  ): AsyncGenerator<BatchDownloadEventType, void, unknown> {
    const { userId } = await getUserAuth();
    if (!userId) {
      yield { message: 'User not authorized', type: 'error' };
      return;
    }

    if (!fileIds || fileIds.length === 0) {
      yield { message: 'No file IDs provided', type: 'error' };
      return;
    }

    try {
      const files = await this.findFilesByIds(fileIds);
      if (files.length === 0) {
        yield { message: 'No files found for the given IDs', type: 'error' };
        return;
      }

      const archive = archiver('zip', { zlib: { level: 1 } });
      const passThrough = new PassThrough();
      archive.pipe(passThrough);

      // 创建一个 Promise 来捕获来自 archiver 的底层错误
      const archiveFinished = new Promise((resolve, reject) => {
        archive.on('end', resolve);
        archive.on('error', reject);
        passThrough.on('error', reject);
      });

      // 1. **执行文件处理循环**
      // `archive.append` 是非阻塞的，它会把任务加入队列，压缩在后台进行。
      let downloadedFileCount = 0;
      const failedFiles: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = ((i + 1) / files.length) * 100;

        yield {
          message: `${i + 1}/${files.length}`,
          percent: progress,
          type: 'progress',
        };

        try {
          const fileContent = await this.getFileByteArray(file.url);
          if (fileContent && fileContent.length > 0) {
            archive.append(Buffer.from(fileContent), { name: file.name });
            downloadedFileCount++;
          } else {
            failedFiles.push(file.name);
          }
        } catch {
          failedFiles.push(file.name);
        }
      }

      // 2. **完成归档**
      archive.finalize();

      if (downloadedFileCount === 0 && files.length > 0) {
        yield { message: 'All files failed to process.', type: 'error' };
        return;
      }

      if (failedFiles.length > 0) {
        yield { message: `Failed to process files: ${failedFiles.join(', ')}`, type: 'warning' };
      }

      // 3. **消费数据流**
      // `for await...of` 会等待后台的 archiver 生成数据块，然后 yield 出去。
      for await (const chunk of passThrough) {
        const bufferChunk = chunk as Buffer;
        yield {
          data: bufferChunk.toString('base64'),
          size: bufferChunk.length,
          type: 'chunk',
        };
      }

      // 等待 archiver 确认所有数据都已写完
      await archiveFinished;

      // 4. **发送最终信号**
      const fileName = `${BRANDING_NAME}_batch_download_${getYYYYmmddHHMMss(new Date())}.zip`;
      yield {
        downloadedCount: downloadedFileCount,
        fileName,
        totalCount: files.length,
        type: 'done',
      };
    } catch (error: any) {
      yield { message: error instanceof Error ? error.message : 'Unknown error.', type: 'error' };
    }
  }
}
