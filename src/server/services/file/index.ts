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

const SIGNAL_SENTINEL = Symbol('eventSignal');
const createResolvablePromise = <T>() => {
  let resolveFn: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolve) => {
    resolveFn = resolve;
  });
  return { promise, resolve: resolveFn! };
};

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

    const archive = archiver('zip', { zlib: { level: 1 } });
    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    const eventQueue: BatchDownloadEventType[] = [];
    let eventSignal = createResolvablePromise<typeof SIGNAL_SENTINEL>();

    const producerPromise = (async () => {
      let downloadedFileCount = 0;
      const failedFiles: string[] = [];
      const files = await this.findFilesByIds(fileIds);

      if (files.length === 0) {
        archive.finalize();
        return { downloadedFileCount, failedFiles, filesFound: false, totalCount: 0 };
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const progressEvent: BatchDownloadEventType = {
          message: `${i + 1}/${files.length}`,
          percent: ((i + 1) / files.length) * 100,
          type: 'progress',
        };
        eventQueue.push(progressEvent);
        eventSignal.resolve(SIGNAL_SENTINEL);

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

      archive.finalize();
      return { downloadedFileCount, failedFiles, filesFound: true, totalCount: files.length };
    })();

    producerPromise.catch((err) => {
      passThrough.emit('error', err);
    });

    try {
      const streamIterator = passThrough[Symbol.asyncIterator]();
      let streamEnded = false;

      while (!streamEnded) {
        const nextChunkPromise = streamIterator.next();

        const raceWinner = await Promise.race([nextChunkPromise, eventSignal.promise]);

        while (eventQueue.length > 0) {
          yield eventQueue.shift()!;
        }

        if (raceWinner === SIGNAL_SENTINEL) {
          eventSignal = createResolvablePromise();
        } else {
          const chunkResult = raceWinner as IteratorResult<Buffer>;
          if (chunkResult.done) {
            streamEnded = true;
          } else {
            const bufferChunk = chunkResult.value;
            yield {
              data: bufferChunk.toString('base64'),
              size: bufferChunk.length,
              type: 'chunk',
            };
          }
        }
      }

      const { downloadedFileCount, failedFiles, totalCount, filesFound } = await producerPromise;

      if (!filesFound) {
        yield { message: 'No files found for the given IDs', type: 'error' };
        return;
      }

      if (downloadedFileCount === 0 && totalCount > 0) {
        yield { message: 'All files failed to process.', type: 'error' };
        return;
      }

      if (failedFiles.length > 0) {
        yield { message: `Failed to process files: ${failedFiles.join(', ')}`, type: 'warning' };
      }

      const fileName = `${BRANDING_NAME}_batch_download_${getYYYYmmddHHMMss(new Date())}.zip`;
      yield {
        downloadedCount: downloadedFileCount,
        fileName: fileName,
        totalCount: totalCount,
        type: 'done',
      };
    } catch (error: any) {
      yield { message: error instanceof Error ? error.message : 'Unknown error.', type: 'error' };
    }
  }
}
