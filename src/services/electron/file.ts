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
   * @param path 文件存储路径
   * @returns 上传结果
   */
  async uploadFile(
    file: File,
    hash: string,
    path: string,
  ): Promise<{ metadata: FileMetadata; success: boolean }> {
    const arrayBuffer = await file.arrayBuffer();

    return dispatch('createFile', {
      content: arrayBuffer,
      filename: file.name,
      hash,
      path,
      type: file.type,
    });
  }
}

export const desktopFileAPI = new DesktopFileAPI();
