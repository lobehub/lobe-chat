import { FileModel } from '@/database/client/models/file';
import { DB_File } from '@/database/client/schemas/files';
import { FilePreview } from '@/types/files';

import { IFileService } from './type';

export class ClientService implements IFileService {
  async createFile(file: DB_File) {
    // save to local storage
    // we may want to save to a remote server later
    const res = await FileModel.create(file);
    // arrayBuffer to url
    const base64 = Buffer.from(file.data!).toString('base64');

    return {
      id: res.id,
      url: `data:${file.fileType};base64,${base64}`,
    };
  }

  async getFile(id: string): Promise<FilePreview> {
    const item = await FileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
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

  async removeFiles(ids: string[]) {
    await Promise.all(ids.map((id) => FileModel.delete(id)));
  }

  async removeAllFiles() {
    return FileModel.clear();
  }
}
