import { dispatch } from '@/utils/electron/dispatch';

class DevtoolsService {
  async openDevtools(): Promise<void> {
    return dispatch('openDevtools');
  }
}

export const electronDevtoolsService = new DevtoolsService();
