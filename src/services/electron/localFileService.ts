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
  WriteLocalFileParams,
  dispatch,
} from '@lobechat/electron-client-ipc';

class LocalFileService {
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

  async openLocalFileOrFolder(path: string, isDirectory: boolean) {
    if (isDirectory) {
      return this.openLocalFolder({ isDirectory, path });
    } else {
      return this.openLocalFile({ path });
    }
  }
}

export const localFileService = new LocalFileService();
