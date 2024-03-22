import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const webrtcConfig = (s: GlobalStore) => currentSettings(s).sync.webrtc;
const webrtcChannelName = (s: GlobalStore) => webrtcConfig(s).channelName;
const enableWebRTC = (s: GlobalStore) => webrtcConfig(s).enabled;
const deviceName = (s: GlobalStore) => currentSettings(s).sync.deviceName;

export const syncSettingsSelectors = {
  deviceName,
  enableWebRTC,
  webrtcChannelName,
  webrtcConfig,
};
