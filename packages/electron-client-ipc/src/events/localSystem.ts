import {
  EditLocalFileParams,
  EditLocalFileResult,
  GetCommandOutputParams,
  GetCommandOutputResult,
  GlobFilesParams,
  GlobFilesResult,
  GrepContentParams,
  GrepContentResult,
  KillCommandParams,
  KillCommandResult,
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
  RunCommandParams,
  RunCommandResult,
  WriteLocalFileParams,
} from '../types';

/* eslint-disable typescript-sort-keys/interface */
export interface LocalSystemDispatchEvents {
  // File Operations
  editLocalFile: (params: EditLocalFileParams) => EditLocalFileResult;
  moveLocalFiles: (params: MoveLocalFilesParams) => LocalMoveFilesResultItem[];
  openLocalFile: (params: OpenLocalFileParams) => void;
  openLocalFolder: (params: OpenLocalFolderParams) => void;
  readLocalFile: (params: LocalReadFileParams) => LocalReadFileResult;
  readLocalFiles: (params: LocalReadFilesParams) => LocalReadFileResult[];
  renameLocalFile: (params: RenameLocalFileParams) => RenameLocalFileResult;
  writeLocalFile: (params: WriteLocalFileParams) => RenameLocalFileResult;
  // Shell Commands
  runCommand: (params: RunCommandParams) => RunCommandResult;
  getCommandOutput: (params: GetCommandOutputParams) => GetCommandOutputResult;
  killCommand: (params: KillCommandParams) => KillCommandResult;
  // Search & Find
  listLocalFiles: (params: ListLocalFileParams) => LocalFileItem[];
  grepContent: (params: GrepContentParams) => GrepContentResult;
  globLocalFiles: (params: GlobFilesParams) => GlobFilesResult;
  searchLocalFiles: (params: LocalSearchFilesParams) => LocalFileItem[];
}
