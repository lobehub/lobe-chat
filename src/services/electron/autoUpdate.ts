import { dispatch } from '@lobechat/electron-client-ipc';

class AutoUpdateService {
  installNow = async () => {
    return dispatch('installNow');
  };

  installLater = async () => {
    return dispatch('installLater');
  };
}

export const autoUpdateService = new AutoUpdateService();
