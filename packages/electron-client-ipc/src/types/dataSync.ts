export type StorageMode = 'local' | 'cloud' | 'selfHost';
export enum StorageModeEnum {
  Cloud = 'cloud',
  Local = 'local',
  SelfHost = 'selfHost',
}

/**
 * Events related to remote server configuration
 */
export interface DataSyncConfig {
  active?: boolean;
  remoteServerUrl?: string;
  storageMode: StorageMode;
}
