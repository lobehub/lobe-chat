import { FileModel } from '@/database/models/file';
import { DB_File } from '@/database/schemas/files';
import { FilePreview } from '@/types/files';

class FileService {
  async uploadFile(file: DB_File) {
    // save to local storage
    // we may want to save to a remote server later
    return FileModel.create(file);
  }

  async removeFile(id: string) {
    return FileModel.delete(id);
  }

  async removeAllFiles() {
    return FileModel.clear();
  }

  async getFile(id: string): Promise<FilePreview> {
    const item = await FileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    // arrayBuffer to url
    const url = URL.createObjectURL(new Blob([item.data]));
    const base64 = Buffer.from(item.data).toString('base64');

    return {
      base64Url: `data:${item.fileType};base64,${base64}`,
      fileType: item.fileType,
      name: item.name,
      saveMode: 'local',
      url,
    };
  }
}

export const fileService = new FileService();
