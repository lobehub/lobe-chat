/* eslint-disable typescript-sort-keys/interface */
import { FilePreview, UploadFileParams } from '@/types/files';

export interface IFileService {
  createFile(file: UploadFileParams): Promise<{ id: string }>;
  removeFile(id: string): Promise<any>;
  removeAllFiles(): Promise<any>;
  getFile(id: string): Promise<FilePreview>;
}
