import { ElectronState } from '../initialState';

const isSyncActive = (s: ElectronState) => {
  return s.remoteServerConfig.active;
};

export const electronSyncSelectors = {
  isSyncActive,
};
