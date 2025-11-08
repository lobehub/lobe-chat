import { LobeChatDatabase } from '@lobechat/database';
import { TRPCError } from '@trpc/server';
import { sha256 } from 'js-sha256';

import { serverDBEnv } from '@/config/db';
import { FileModel } from '@/database/models/file';
import { FileItem } from '@/database/schemas';
import { TempFileManager } from '@/server/utils/tempFileManager';
import { inferContentTypeFromImageUrl } from '@/utils/url';
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

  /**
   * 上传 base64 数据并创建数据库记录
   * @param base64Data - Base64 数据 (支持 data URI 格式或纯 base64)
   * @param pathname - 文件存储路径 (需包含文件扩展名)
   * @returns 包含 key（存储路径）、fileId（数据库记录ID）和 url（代理访问路径）
   */
  public async uploadBase64(
    base64Data: string,
    pathname: string,
  ): Promise<{ fileId: string; key: string; url: string }> {
    let base64String: string;

    // 如果是 data URI 格式 (data:image/png;base64,xxx)
    if (base64Data.startsWith('data:')) {
      const commaIndex = base64Data.indexOf(',');
      if (commaIndex === -1) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid base64 data format' });
      }
      base64String = base64Data.slice(commaIndex + 1);
    } else {
      // 纯 base64 字符串
      base64String = base64Data;
    }

    // 转换为 Buffer
    const buffer = Buffer.from(base64String, 'base64');

    // 上传到存储（S3 或本地）
    const { key } = await this.uploadMedia(pathname, buffer);

    // 从 pathname 提取文件名
    const name = pathname.split('/').pop() || 'unknown';

    // 计算文件元信息
    const size = buffer.length;
    const fileType = inferContentTypeFromImageUrl(pathname) || 'application/octet-stream';
    const hash = sha256(buffer);

    // 创建数据库记录
    const { id } = await this.fileModel.create({
      fileHash: hash,
      fileType,
      name,
      size,
      url: key, // 存储原始 key（S3 key 或 desktop://）
    });

    // 返回统一的代理 URL：/f/:id
    return { fileId: id, key, url: `/f/${id}` };
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
}
