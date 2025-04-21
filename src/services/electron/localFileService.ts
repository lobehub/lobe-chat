import {
  ListLocalFileParams,
  LocalFileItem,
  LocalReadFileParams,
  LocalReadFileResult,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  OpenLocalFileParams,
  OpenLocalFolderParams,
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
}

export const localFileService = new LocalFileService();
