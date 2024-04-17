/* eslint-disable typescript-sort-keys/interface */
import { DB_File } from '@/database/client/schemas/files';
import { FilePreview } from '@/types/files';

export interface IFileService {
  uploadFile(file: DB_File): Promise<any>;
  uploadImageByUrl(url: string, file: Pick<DB_File, 'name' | 'metadata'>): Promise<any>;
  removeFile(id: string): Promise<any>;
  removeAllFiles(): Promise<any>;
  getFile(id: string): Promise<FilePreview>;
}
