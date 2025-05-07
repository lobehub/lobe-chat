import { loadFile } from '@lobechat/file-loaders';
import debug from 'debug';

import { FileModel } from '@/database/models/file';
import { LobeChatDatabase } from '@/database/type';
import { LobeDocument } from '@/types/document';

import { FileService } from '../file';

const log = debug('lobe-chat:service:document');

export class DocumentService {
  userId: string;
  private fileModel: FileModel;
  private fileService: FileService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.fileModel = new FileModel(db, userId);
    this.fileService = new FileService(db, userId);
  }

  /**
   * 解析文件内容
   *
   */
  async parseFile(fileId: string): Promise<LobeDocument> {
    const { filePath, file, cleanup } = await this.fileService.downloadFileToLocal(fileId);

    const logPrefix = `[${file.name}]`;
    log(`${logPrefix} 开始解析文件, 路径: ${filePath}`);

    try {
      // 使用loadFile加载文件内容
      const fileDocument = await loadFile(filePath);

      log(`${logPrefix} 文件解析成功 %O`, {
        fileType: fileDocument.fileType,
        size: fileDocument.content.length,
      });

      return {
        ...fileDocument,
        createdAt: file.createdAt,
        source: file.url,
        title: fileDocument.metadata?.title,
        updatedAt: file.updatedAt,
      };
    } catch (error) {
      console.error(`${logPrefix} 文件解析失败:`, error);
      throw error;
    } finally {
      cleanup();
    }
  }
}
