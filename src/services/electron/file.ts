import { ensureElectronIpc } from '@/utils/electron/ipc';
import { FileMetadata } from '@lobechat/types';

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

    return ensureElectronIpc().upload.createFile({
      content: arrayBuffer,
      filename: file.name,
      hash,
      path,
      type: file.type,
    });
  }
}

export const desktopFileAPI = new DesktopFileAPI();
