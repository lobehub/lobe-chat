import { dispatch } from '@lobechat/electron-client-ipc';

class AutoUpdateService {
  downloadUpdate = async () => {
    return dispatch('downloadUpdate');
  };

  quitAndInstallUpdate = async () => {
    return dispatch('quitAndInstallUpdate');
  };
}

export const autoUpdateService = new AutoUpdateService();
