export interface WebRTCSyncConfig {
  channelName?: string;
  channelPassword?: string;
  enabled: boolean;
  signaling?: string;
}
export interface GlobalSyncSettings {
  deviceName?: string;
  webrtc: WebRTCSyncConfig;
}
