import { ProgressInfo, UpdateInfo } from '../types';

export interface AutoUpdateDispatchEvents {
  checkUpdate: () => void;
  downloadUpdate: () => void;
  installLater: () => void;
  installNow: () => void;
  installUpdate: () => void;
}

export interface AutoUpdateBroadcastEvents {
  updateAvailable: (info: UpdateInfo) => void;
  updateDownloadProgress: (progress: ProgressInfo) => void;
  updateDownloaded: (info: UpdateInfo) => void;
  updateError: (message: string) => void;
  updateWillInstallLater: () => void;
}
