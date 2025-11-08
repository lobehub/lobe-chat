import { LobeChatDatabase } from '@lobechat/database';
import { TRPCError } from '@trpc/server';
import archiver from 'archiver';
import { PassThrough, Readable } from 'node:stream';
import pLimit from 'p-limit';

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
   * 获取文件流
   */
  public async getFileStream(key: string): Promise<Readable> {
    return this.impl.getFileStream(key);
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
    const eventQueue: BatchDownloadEventType[] = [];

    const signal = {
      create() {
        const { promise, resolve } = createResolvablePromise<typeof SIGNAL_SENTINEL>();
        this.promise = promise;
        this.resolve = resolve;
      },
      promise: null as Promise<typeof SIGNAL_SENTINEL> | null,
      resolve: null as ((value: typeof SIGNAL_SENTINEL) => void) | null,
    };
    signal.create();

    let totalFiles = 0; // 记录总文件数(数据库中存在的)
    let handledFileCount = 0; // 记录已处理（成功或失败）的文件总数
    let processedFileCount = 0; // 记录成功的文件数
    const failedFiles: string[] = []; // 记录失败的文件列表

    // 进度发送函数，现在接收一个参数来表示当前进度
    const sendProgress = (currentCount: number) => {
      if (totalFiles > 0 && currentCount <= totalFiles) {
        eventQueue.push({
          message: `${currentCount}/${totalFiles}`,
          percent: (currentCount / totalFiles) * 100,
          type: 'progress',
        });
        signal.resolve?.(SIGNAL_SENTINEL);
      }
    };

    const producerPromise = new Promise<void>((resolve) => {
      archive.on('finish', resolve);
    });

    archive.on('warning', (warn) => {
      console.warn('Archiver warning:', warn);
    });
    archive.on('error', (err) => passThrough.emit('error', err));

    const handleFileCompletion = () => {
      handledFileCount++;
      sendProgress(handledFileCount);
    };

    archive.pipe(passThrough);

    // 开始生产压缩包
    const startProduction = async () => {
      const files = await this.findFilesByIds(fileIds);
      if (files.length === 0) {
        archive.finalize();
        return;
      }
      const limit = pLimit(10); // 限制并发数为 10

      totalFiles = files.length;

      // 立即发送第一个进度，让UI马上有响应
      if (totalFiles > 0) {
        sendProgress(0);
      }

      const promises = files.map((file) =>
        limit(async () => {
          try {
            const stream = await this.impl.getFileStream(file.url);
            return new Promise<void>((resolve) => {
              stream.once('error', (err) => {
                console.error(`Stream error for file "${file.name}":`, err);
                failedFiles.push(file.name);
                handleFileCompletion();
                resolve(); // 出错时也要 resolve，让 Promise.all 继续
              });

              stream.once('end', () => {
                processedFileCount++; // 成功数 +1
                handleFileCompletion();
                resolve();
              });

              archive.append(stream, { name: file.name });
            });
          } catch (error) {
            console.error(`Failed to get stream for file "${file.name}":`, error);
            failedFiles.push(file.name);
            handleFileCompletion();
          }
        }),
      );
      await Promise.all(promises);
      archive.finalize();
    };

    startProduction().catch((err) => passThrough.emit('error', err));

    try {
      const streamIterator = passThrough[Symbol.asyncIterator]();
      let streamEnded = false;
      let nextChunkPromise = streamIterator.next();

      while (!streamEnded) {
        const raceWinner = await Promise.race([nextChunkPromise, signal.promise!]);

        while (eventQueue.length > 0) {
          yield eventQueue.shift()!;
        }

        if (raceWinner === SIGNAL_SENTINEL) {
          signal.create();
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
            nextChunkPromise = streamIterator.next();
          }
        }
      }

      await producerPromise;

      if (totalFiles > 0 && processedFileCount === 0) {
        yield { message: 'All files failed to process.', type: 'error' };
        return;
      }

      if (totalFiles === 0) {
        yield { message: 'No files found for the given IDs', type: 'error' };
        return;
      }

      if (failedFiles.length > 0) {
        yield { message: `Failed to process files: ${failedFiles.join(', ')}`, type: 'warning' };
      }

      const fileName = `${BRANDING_NAME}_batch_download_${getYYYYmmddHHMMss(new Date())}.zip`;
      yield {
        downloadedCount: processedFileCount,
        fileName: fileName,
        totalCount: totalFiles,
        type: 'done',
      };
    } catch (error: any) {
      yield { message: error instanceof Error ? error.message : 'Unknown error.', type: 'error' };
      archive.destroy();
      passThrough.destroy();
    }
  }
}
