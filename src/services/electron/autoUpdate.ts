import { dispatch } from '@lobechat/electron-client-ipc';

class AutoUpdateService {
  downloadUpdate = async () => {
    return dispatch('downloadUpdate');
  };

  quitAndInstallUpdate = async () => {
    return dispatch('installNow');
  };

  installLater = async () => {
    return dispatch('installLater');
  };
}

export const autoUpdateService = new AutoUpdateService();
