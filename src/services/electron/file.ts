import { FileMetadata } from '@lobechat/types';

import { ensureElectronIpc } from '@/utils/electron/ipc';

/**
 * Desktop application file API client service
 */
class DesktopFileAPI {
  /**
   * Upload file to desktop application
   * @param file File object
   * @param hash File hash
   * @param path File storage path
   * @returns Upload result
   */
  async uploadFile(
    file: File,
    hash: string,
    path: string,
  ): Promise<{ metadata: FileMetadata; success: boolean }> {
    const arrayBuffer = await file.arrayBuffer();

    return ensureElectronIpc().upload.uploadFile({
      content: arrayBuffer,
      filename: file.name,
      hash,
      path,
      type: file.type,
    });
  }
}

export const desktopFileAPI = new DesktopFileAPI();
