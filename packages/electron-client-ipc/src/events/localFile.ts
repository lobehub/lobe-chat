import {
  ListLocalFileParams,
  LocalFileItem,
  LocalMoveFilesResultItem,
  LocalReadFileParams,
  LocalReadFileResult,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  MoveLocalFilesParams,
  OpenLocalFileParams,
  OpenLocalFolderParams,
  RenameLocalFileParams,
  RenameLocalFileResult,
  WriteLocalFileParams,
} from '../types';

export interface LocalFilesDispatchEvents {
  // Local Files API Events
  listLocalFiles: (params: ListLocalFileParams) => LocalFileItem[];
  moveLocalFiles: (params: MoveLocalFilesParams) => LocalMoveFilesResultItem[];

  openLocalFile: (params: OpenLocalFileParams) => void;
  openLocalFolder: (params: OpenLocalFolderParams) => void;
  readLocalFile: (params: LocalReadFileParams) => LocalReadFileResult;
  readLocalFiles: (params: LocalReadFilesParams) => LocalReadFileResult[];

  renameLocalFile: (params: RenameLocalFileParams) => RenameLocalFileResult;
  searchLocalFiles: (params: LocalSearchFilesParams) => LocalFileItem[];
  writeLocalFile: (params: WriteLocalFileParams) => RenameLocalFileResult;
}
