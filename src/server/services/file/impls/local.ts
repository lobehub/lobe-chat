import { sha256 } from 'js-sha256';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { electronIpcClient } from '@/server/modules/ElectronIPCClient';
import { inferContentTypeFromImageUrl } from '@/utils/url';

import { FileServiceImpl } from './type';
import { extractKeyFromUrlOrReturnOriginal } from './utils';

/**
 * 桌面应用本地文件服务实现
 */
export class DesktopLocalFileImpl implements FileServiceImpl {
  /**
   * 获取本地文件的URL
   * 通过 IPC 从主进程获取 HTTP URL
   */
  private async getLocalFileUrl(key: string): Promise<string> {
    try {
      return await electronIpcClient.getFileHTTPURL(key);
    } catch (e) {
      console.error('[DesktopLocalFileImpl] Failed to get file HTTP URL via IPC:', e);
      return '';
    }
  }

  /**
   * 创建预签名上传URL（本地版实际上是直接返回文件路径，可能需要进一步扩展）
   */
  async createPreSignedUrl(key: string): Promise<string> {
    // 在桌面应用本地文件实现中，不需要预签名URL
    // 直接返回文件路径
    return key;
  }

  /**
   * 创建预签名预览URL（本地版是通过HTTP路径访问本地文件）
   */
  async createPreSignedUrlForPreview(key: string): Promise<string> {
    return this.getLocalFileUrl(key);
  }

  async deleteFile(key: string): Promise<any> {
    return await this.deleteFiles([key]);
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(keys: string[]): Promise<any> {
    try {
      if (!keys || keys.length === 0) return { success: true };

      // 确保所有路径都是合法的desktop://路径
      const invalidKeys = keys.filter((key) => !key.startsWith('desktop://'));
      if (invalidKeys.length > 0) {
        console.error('Invalid desktop file paths:', invalidKeys);
        return {
          errors: invalidKeys.map((key) => ({ message: 'Invalid desktop file path', path: key })),
          success: false,
        };
      }

      // 使用electronIpcClient的专用方法
      return await electronIpcClient.deleteFiles(keys);
    } catch (error) {
      console.error('Failed to delete files:', error);
      return {
        errors: [
          {
            message: `Batch delete failed: ${(error as Error).message}`,
            path: 'batch',
          },
        ],
        success: false,
      };
    }
  }

  /**
   * 获取文件字节数组
   */
  async getFileByteArray(key: string): Promise<Uint8Array> {
    try {
      // 从Electron获取文件的绝对路径
      const filePath = await electronIpcClient.getFilePathById(key);

      // 检查文件是否存在
      if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return new Uint8Array();
      }

      // 读取文件内容并转换为Uint8Array
      const buffer = readFileSync(filePath);
      return new Uint8Array(buffer);
    } catch (e) {
      console.error('Failed to get file byte array:', e);
      return new Uint8Array();
    }
  }

  /**
   * 获取文件内容
   */
  async getFileContent(key: string): Promise<string> {
    try {
      // 从Electron获取文件的绝对路径
      const filePath = await electronIpcClient.getFilePathById(key);

      // 检查文件是否存在
      if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return '';
      }

      // 读取文件内容并转换为字符串
      return readFileSync(filePath, 'utf8');
    } catch (e) {
      console.error('Failed to get file content:', e);
      return '';
    }
  }

  /**
   * 获取完整文件URL
   */
  async getFullFileUrl(url?: string | null): Promise<string> {
    if (!url) return '';

    // Handle legacy data compatibility using shared utility
    const key = extractKeyFromUrlOrReturnOriginal(url, this.getKeyFromFullUrl.bind(this));

    return this.getLocalFileUrl(key);
  }

  /**
   * 上传内容
   * 注意：这个功能可能需要扩展Electron IPC接口
   */
  async uploadContent(filePath: string, content: string): Promise<any> {
    // 这里需要扩展electronIpcClient以支持上传文件内容
    // 例如: return electronIpcClient.uploadContent(filePath, content);
    console.warn('uploadContent not implemented for Desktop local file service', filePath, content);
    return;
  }

  /**
   * 从完整URL中提取key
   * 从 HTTP URL 中提取 desktop:// 格式的路径
   */
  getKeyFromFullUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter((segment) => segment !== '');

      // 移除第一个路径段（desktop-file）
      pathSegments.shift();

      // 重新组合剩余的路径段
      const filePath = pathSegments.join('/');

      // 返回 desktop:// 格式的路径
      return `desktop://${filePath}`;
    } catch (e) {
      console.error('[DesktopLocalFileImpl] Failed to extract key from URL:', e);
      return '';
    }
  }

  /**
   * 上传媒体文件
   */
  async uploadMedia(key: string, buffer: Buffer): Promise<{ key: string }> {
    try {
      // 将 Buffer 转换为 Base64 字符串
      const content = buffer.toString('base64');

      // 从 key 中提取文件名
      const filename = path.basename(key);

      // 计算文件的 SHA256 hash
      const hash = sha256(buffer);

      // 根据文件URL推断 MIME 类型
      const type = inferContentTypeFromImageUrl(key)!;

      // 构造上传参数
      const uploadParams = {
        content,
        filename,
        hash,
        path: key,
        type,
      };

      // 调用 electronIpcClient 上传文件
      const result = await electronIpcClient.createFile(uploadParams);

      if (!result.success) {
        throw new Error('Failed to upload file via Electron IPC');
      }

      console.log('[DesktopLocalFileImpl] File uploaded successfully:', result.metadata);
      return { key: result.metadata.path };
    } catch (error) {
      console.error('[DesktopLocalFileImpl] Failed to upload media file:', error);
      throw error;
    }
  }
}
