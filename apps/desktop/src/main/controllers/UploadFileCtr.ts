import { UploadFileParams } from '@lobechat/electron-client-ipc';
import { CreateFileParams } from '@lobechat/electron-server-ipc';

import FileService from '@/services/fileSrv';

import { ControllerModule, ipcClientEvent, ipcServerEvent } from './index';

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

  @ipcServerEvent('getFileHTTPURL')
  async getFileHTTPURL(path: string) {
    return this.fileService.getFileHTTPURL(path);
  }

  @ipcServerEvent('deleteFiles')
  async deleteFiles(paths: string[]) {
    return this.fileService.deleteFiles(paths);
  }

  @ipcServerEvent('createFile')
  async createFile(params: CreateFileParams) {
    return this.fileService.uploadFile(params);
  }
}
