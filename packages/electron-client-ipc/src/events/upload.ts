import { FileMetadata, UploadFileParams } from '../types';

export interface UploadFilesDispatchEvents {
  createFile: (params: UploadFileParams) => { metadata: FileMetadata; success: boolean };
}
