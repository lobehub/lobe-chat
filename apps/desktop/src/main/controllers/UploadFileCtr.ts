import FileService from '@/services/fileSrv';

import { ControllerModule, ipcClientEvent, ipcServerEvent } from './index';

interface UploadFileParams {
  content: ArrayBuffer;
  filename: string;
  hash: string;
  path: string;
  type: string;
}

export default class UploadFileCtr extends ControllerModule {
  private get fileService() {
    return this.app.getService(FileService);
  }

  @ipcClientEvent('createFile')
  async uploadFile(params: UploadFileParams) {
    return this.fileService.uploadFile(params);
  }

  // ======== server event

  @ipcServerEvent('getStaticFilePath')
  async getFileUrlById(id: string) {
    return this.fileService.getFilePath(id);
  }

  @ipcServerEvent('deleteFiles')
  async deleteFiles(paths: string[]) {
    return this.fileService.deleteFiles(paths);
  }
}
