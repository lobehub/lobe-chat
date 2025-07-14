import { CreateFileParams, DeleteFilesResponse, FileMetadata } from '../types/file';

export interface FileDispatchEvents {
  deleteFiles: (paths: string[]) => DeleteFilesResponse;
  getStaticFilePath: (id: string) => string;
  getFileHTTPURL: (path: string) => string;
  createFile: (param: CreateFileParams) => { metadata: FileMetadata; success: boolean };
}
