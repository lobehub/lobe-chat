import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { electronIpcClient } from '@/server/modules/ElectronIPCClient';

import { FileServiceImpl } from './type';

/**
 * 桌面应用本地文件服务实现
 */
export class DesktopLocalFileImpl implements FileServiceImpl {
  /**
   * 获取本地文件的URL
   * Electron返回文件的绝对路径，然后在服务端将文件转为base64
   */
  private async getLocalFileUrl(key: string): Promise<string> {
    try {
      // 从Electron获取文件的绝对路径
      const filePath = await electronIpcClient.getFilePathById(key);

      // 检查文件是否存在
      if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return key;
      }

      // 读取文件内容
      const fileContent = readFileSync(filePath);

      // 确定文件的MIME类型
      const mimeType = this.getMimeTypeFromPath(filePath);

      // 转换为base64并返回data URL
      const base64 = fileContent.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    } catch (e) {
      console.error('[DesktopLocalFileImpl] Failed to process file from Electron IPC:', e);
      return '';
    }
  }

  /**
   * 根据文件路径获取MIME类型
   */
  private getMimeTypeFromPath(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();

    // 常见文件类型的MIME映射
    const mimeTypes: Record<string, string> = {
      '.css': 'text/css',
      '.gif': 'image/gif',
      '.html': 'text/html',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain',
      '.webp': 'image/webp',
    };

    return mimeTypes[extension] || 'application/octet-stream';
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
   * 创建预签名预览URL（本地版是通过Electron获取本地文件URL）
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
    return this.getLocalFileUrl(url);
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
}
