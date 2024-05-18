/* eslint-disable typescript-sort-keys/interface */
import { DB_File } from '@/database/client/schemas/files';
import { FilePreview } from '@/types/files';

export interface IFileService {
  createFile(file: DB_File): Promise<any>;
  removeFile(id: string): Promise<any>;
  removeAllFiles(): Promise<any>;
  getFile(id: string): Promise<FilePreview>;
}
