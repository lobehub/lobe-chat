import { FileMetadata, UploadFileParams } from '../types';

export interface FilesDispatchEvents {
  createFile: (params: UploadFileParams) => { metadata: FileMetadata; success: boolean };
  deleteFile: (path: string) => { success: boolean };
  getFile: (path: string) => { content: ArrayBuffer; mimeType: string };
}
