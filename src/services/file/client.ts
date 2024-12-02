import { FileModel } from '@/database/_deprecated/models/file';
import { DB_File } from '@/database/_deprecated/schemas/files';
import { FileItem } from '@/types/files';

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

  async getFile(id: string): Promise<FileItem> {
    const item = await FileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    // arrayBuffer to url
    const url = URL.createObjectURL(new Blob([item.data!], { type: item.fileType }));

    return {
      createdAt: new Date(item.createdAt),
      id,
      name: item.name,
      size: item.size,
      type: item.fileType,
      updatedAt: new Date(item.updatedAt),
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
