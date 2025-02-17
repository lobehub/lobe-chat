import { ElectronIPCServer } from '@lobechat/electron-server-ipc';

import { ipcEvent } from '../ipcServer';

const ipcServer = new ElectronIPCServer(ipcEvent);

export const initIPCServer = async (): Promise<ElectronIPCServer> => {
  await ipcServer.start();

  return ipcServer;
};
