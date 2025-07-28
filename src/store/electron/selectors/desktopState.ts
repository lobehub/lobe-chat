import { ElectronState } from '@/store/electron/initialState';

const usePath = (s: ElectronState) => s.appState.userPath;

export const desktopStateSelectors = {
  usePath,
};
