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
  RunCommandParams,
  RunCommandResult,
  WriteLocalFileParams,
  dispatch,
} from '@lobechat/electron-client-ipc';

class LocalFileService {
  // File Operations
  async listLocalFiles(params: ListLocalFileParams): Promise<LocalFileItem[]> {
    return dispatch('listLocalFiles', params);
  }

  async readLocalFile(params: LocalReadFileParams): Promise<LocalReadFileResult> {
    return dispatch('readLocalFile', params);
  }

  async readLocalFiles(params: LocalReadFilesParams): Promise<LocalReadFileResult[]> {
    return dispatch('readLocalFiles', params);
  }

  async searchLocalFiles(params: LocalSearchFilesParams): Promise<LocalFileItem[]> {
    return dispatch('searchLocalFiles', params);
  }

  async openLocalFile(params: OpenLocalFileParams) {
    return dispatch('openLocalFile', params);
  }

  async openLocalFolder(params: OpenLocalFolderParams) {
    return dispatch('openLocalFolder', params);
  }

  async moveLocalFiles(params: MoveLocalFilesParams): Promise<LocalMoveFilesResultItem[]> {
    return dispatch('moveLocalFiles', params);
  }

  async renameLocalFile(params: RenameLocalFileParams) {
    return dispatch('renameLocalFile', params);
  }

  async writeFile(params: WriteLocalFileParams) {
    return dispatch('writeLocalFile', params);
  }

  async editLocalFile(params: EditLocalFileParams): Promise<EditLocalFileResult> {
    return dispatch('editLocalFile', params);
  }

  // Shell Commands
  async runCommand(params: RunCommandParams): Promise<RunCommandResult> {
    return dispatch('runCommand', params);
  }

  async getCommandOutput(params: GetCommandOutputParams): Promise<GetCommandOutputResult> {
    return dispatch('getCommandOutput', params);
  }

  async killCommand(params: KillCommandParams): Promise<KillCommandResult> {
    return dispatch('killCommand', params);
  }

  // Search & Find
  async grepContent(params: GrepContentParams): Promise<GrepContentResult> {
    return dispatch('grepContent', params);
  }

  async globFiles(params: GlobFilesParams): Promise<GlobFilesResult> {
    return dispatch('globLocalFiles', params);
  }

  // Helper methods
  async openLocalFileOrFolder(path: string, isDirectory: boolean) {
    if (isDirectory) {
      return this.openLocalFolder({ isDirectory, path });
    } else {
      return this.openLocalFile({ path });
    }
  }

  async openFileFolder(path: string) {
    return this.openLocalFolder({ isDirectory: false, path });
  }
}

export const localFileService = new LocalFileService();
