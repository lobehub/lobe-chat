import { getElectronStoreState } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

export const getRemoteServerUrl = (): string | undefined =>
  electronSyncSelectors.remoteServerUrl(getElectronStoreState());
