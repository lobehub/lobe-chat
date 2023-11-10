import { FileModel } from '@/database/file';
import { LocalFile } from '@/types/database/files';
import { FilePreview } from '@/types/files';

class FileService {
  async uploadFile(file: LocalFile) {
    // save to local storage
    // we may want to save to a remote server later
    return FileModel.create(file);
  }

  async getFile(id: string): Promise<FilePreview> {
    const item = await FileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    // arrayBuffer to url
    const url = URL.createObjectURL(new Blob([item.data]));

    return {
      name: item.name,
      type: item.type,
      url,
    };
  }
}

export const fileService = new FileService();
