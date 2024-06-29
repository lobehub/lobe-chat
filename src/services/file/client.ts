import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';
import { FileModel } from '@/database/client/models/file';
import { DB_File } from '@/database/client/schemas/files';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { FilePreview } from '@/types/files';

import { IFileService } from './type';

export class ClientService implements IFileService {
  async createFile(file: DB_File) {
    // save to local storage
    // we may want to save to a remote server later
    return FileModel.create(file);
  }

  async getFile(id: string): Promise<FilePreview> {
    const item = await FileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    if (item.saveMode === 'url') {
      if (this.enableServer && !fileEnv.NEXT_PUBLIC_S3_DOMAIN) {
        throw new Error('fileEnv.NEXT_PUBLIC_S3_DOMAIN is not set while enable server upload');
      }

      return {
        fileType: item.fileType,
        id,
        name: item.metadata.filename,
        saveMode: 'url',
        url: urlJoin(fileEnv.NEXT_PUBLIC_S3_DOMAIN!, item.url!),
      };
    }

    // arrayBuffer to url
    const url = URL.createObjectURL(new Blob([item.data!], { type: item.fileType }));
    const base64 = Buffer.from(item.data!).toString('base64');

    return {
      base64Url: `data:${item.fileType};base64,${base64}`,
      fileType: item.fileType,
      id,
      name: item.name,
      saveMode: 'local',
      url,
    };
  }

  async removeFile(id: string) {
    return FileModel.delete(id);
  }

  async removeAllFiles() {
    return FileModel.clear();
  }

  private get enableServer() {
    return serverConfigSelectors.enableUploadFileToServer(
      window.global_serverConfigStore.getState(),
    );
  }
}
