import { dispatch } from '@lobechat/electron-client-ipc';

class DevtoolsService {
  async openDevtools(): Promise<void> {
    return dispatch('openDevtools');
  }
}

export const electronDevtoolsService = new DevtoolsService();
