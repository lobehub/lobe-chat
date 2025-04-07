import { dispatch } from '@lobechat/electron-client-ipc';

import { FileMetadata } from '@/types/files';

/**
 * 桌面应用文件API客户端服务
 */
class DesktopFileAPI {
  /**
   * 上传文件到桌面应用
   * @param file 文件对象
   * @param hash 文件哈希
   * @returns 上传结果
   */
  async uploadFile(
    file: File,
    hash: string,
  ): Promise<{ metadata: FileMetadata; success: boolean }> {
    const arrayBuffer = await file.arrayBuffer();

    return dispatch('createFile', {
      content: arrayBuffer,
      filename: file.name,
      hash,
      path: file.name,
      type: file.type,
    });
  }

  /**
   * 获取桌面存储的文件
   * @param path 文件路径 (desktop://...)
   * @returns 文件内容和MIME类型
   */
  async getFile(path: string): Promise<{ content: ArrayBuffer; mimeType: string }> {
    if (!path.startsWith('desktop://')) throw new Error('Invalid desktop file path');

    return dispatch('getFile', path);
  }

  /**
   * 删除桌面存储的文件
   * @param path 文件路径 (desktop://...)
   * @returns 操作结果
   */
  async deleteFile(path: string): Promise<{ success: boolean }> {
    if (!path.startsWith('desktop://')) throw new Error('Invalid desktop file path');

    return dispatch('deleteFile', path);
  }
}

export const desktopFileAPI = new DesktopFileAPI();
