import { FileItem, UploadFileParams } from '@/types/files';

export interface IFileService {
  createFile(
    file: UploadFileParams,
    knowledgeBaseId?: string,
  ): Promise<{ id: string; url: string }>;
  getFile(id: string): Promise<FileItem>;
  removeAllFiles(): Promise<any>;
  removeFile(id: string): Promise<any>;
  removeFiles(ids: string[]): Promise<any>;
}
