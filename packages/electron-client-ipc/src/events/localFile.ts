import {
  ListLocalFileParams,
  LocalFileItem,
  LocalReadFileParams,
  LocalReadFileResult,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  OpenLocalFileParams,
  OpenLocalFolderParams,
} from '../types';

export interface LocalFilesDispatchEvents {
  // Local Files API Events
  listLocalFiles: (params: ListLocalFileParams) => LocalFileItem[];
  // New methods
  openLocalFile: (params: OpenLocalFileParams) => void;
  openLocalFolder: (params: OpenLocalFolderParams) => void;
  readLocalFile: (params: LocalReadFileParams) => LocalReadFileResult;

  readLocalFiles: (params: LocalReadFilesParams) => LocalReadFileResult[];
  searchLocalFiles: (params: LocalSearchFilesParams) => LocalFileItem[];
}
