import { FileModel } from '@/database/file';
import { LocalFile } from '@/types/database/files';

class FileService {
  async uploadFile(file: LocalFile) {
    // save to local storage
    // we may want to save to a remote server later
    return FileModel.create(file);
  }
}

export const fileService = new FileService();
