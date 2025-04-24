import { dispatch } from '@lobechat/electron-client-ipc';

class AutoUpdateService {
  checkUpdate = async () => {
    return dispatch('checkUpdate');
  };

  installNow = async () => {
    return dispatch('installNow');
  };

  installLater = async () => {
    return dispatch('installLater');
  };

  downloadUpdate() {
    return dispatch('downloadUpdate');
  }
}

export const autoUpdateService = new AutoUpdateService();
