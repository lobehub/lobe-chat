export interface WebRTCSyncConfig {
  channelName?: string;
  channelPassword?: string;
  enabled: boolean;
  signaling?: string;
}
export interface LiveblocksSyncConfig {
  customApiKey?: boolean;
  customName?: boolean;
  enabled: boolean;
  publicApiKey?: string;
  roomName?: string;
  roomPassword?: string;
}
export interface UserSyncSettings {
  deviceName?: string;
  liveblocks: LiveblocksSyncConfig;
  webrtc: WebRTCSyncConfig;
}
