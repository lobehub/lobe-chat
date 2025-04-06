import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';
import { S3 } from '@/server/modules/S3';

/**
 * 文件服务类
 * 基于现有的 S3 模块封装的文件服务
 */
export class FileService {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3();
  }

  /**
   * 删除文件
   */
  public async deleteFile(key: string) {
    return this.s3.deleteFile(key);
  }

  /**
   * 批量删除文件
   */
  public async deleteFiles(keys: string[]) {
    return this.s3.deleteFiles(keys);
  }

  /**
   * 获取文件内容
   */
  public async getFileContent(key: string): Promise<string> {
    return this.s3.getFileContent(key);
  }

  /**
   * 获取文件字节数组
   */
  public async getFileByteArray(key: string): Promise<Uint8Array> {
    return this.s3.getFileByteArray(key);
  }

  /**
   * 创建预签名上传URL
   */
  public async createPreSignedUrl(key: string): Promise<string> {
    return this.s3.createPreSignedUrl(key);
  }

  /**
   * 创建预签名预览URL
   */
  public async createPreSignedUrlForPreview(key: string, expiresIn?: number): Promise<string> {
    return this.s3.createPreSignedUrlForPreview(key, expiresIn);
  }

  /**
   * 上传内容
   */
  public async uploadContent(path: string, content: string) {
    return this.s3.uploadContent(path, content);
  }

  /**
   * 获取完整文件URL
   */
  public async getFullFileUrl(url?: string | null, expiresIn?: number): Promise<string> {
    if (!url) return '';

    // If bucket is not set public read, the preview address needs to be regenerated each time
    if (!fileEnv.S3_SET_ACL) {
      return await this.createPreSignedUrlForPreview(url, expiresIn);
    }

    if (fileEnv.S3_ENABLE_PATH_STYLE) {
      return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, fileEnv.S3_BUCKET!, url);
    }

    return urlJoin(fileEnv.S3_PUBLIC_DOMAIN!, url);
  }
}
