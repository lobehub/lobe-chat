import { DeleteFilesResponse } from '../types/file';

export interface FileDispatchEvents {
  deleteFiles: (paths: string[]) => DeleteFilesResponse;
  getStaticFilePath: (id: string) => string;
}
