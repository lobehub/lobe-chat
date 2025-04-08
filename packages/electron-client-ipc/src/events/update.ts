import { ProgressInfo, UpdateInfo } from '../types';

export interface AutoUpdateDispatchEvents {
  checkUpdate: () => { success: true };
  downloadUpdate: () => { success: true };
  installUpdate: () => { success: true };
  quitAndInstallUpdate: () => { success: true };
}

export interface AutoUpdateBroadcastEvents {
  updateAvailable: (info: UpdateInfo) => void;
  updateDownloadProgress: (progress: ProgressInfo) => void;
  updateDownloaded: (info: UpdateInfo) => void;
  updateError: (message: string) => void;
}
