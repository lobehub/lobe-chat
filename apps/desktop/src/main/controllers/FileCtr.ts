import FileService from '@/services/fileSrv';

import { ControllerModule, ipcClientEvent, ipcServerEvent } from './index';

interface UploadFileParams {
  content: ArrayBuffer;
  filename: string;
  hash: string;
  path: string;
  type: string;
}

export default class FileCtr extends ControllerModule {
  private get fileService() {
    return this.app.getService(FileService);
  }

  @ipcClientEvent('createFile')
  async uploadFile(params: UploadFileParams) {
    console.log('uploadFile', params);
    return this.fileService.uploadFile(params);
  }

  @ipcClientEvent('getFile')
  async getFile(path: string) {
    return this.fileService.getFile(path);
  }
  @ipcClientEvent('deleteFile')
  async deleteFile(path: string) {
    return this.fileService.deleteFile(path);
  }

  // ======== server event

  @ipcServerEvent('getStaticFilePath')
  async getFileUrlById(id: string) {
    console.log('send from server', id);
    return this.fileService.getFilePath(id);
  }
}
