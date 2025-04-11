import { FileMetadata, UploadFileParams } from '../types';

export interface FilesDispatchEvents {
  createFile: (params: UploadFileParams) => { metadata: FileMetadata; success: boolean };
}
