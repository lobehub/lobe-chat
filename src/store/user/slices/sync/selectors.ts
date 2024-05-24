import { UserStore } from '../../store';
import { currentSettings } from '../settings/selectors/settings';

const webrtcConfig = (s: UserStore) => currentSettings(s).sync.webrtc;
const webrtcChannelName = (s: UserStore) => webrtcConfig(s).channelName;
const enableWebRTC = (s: UserStore) => webrtcConfig(s).enabled;
const deviceName = (s: UserStore) => currentSettings(s).sync.deviceName;

export const syncSettingsSelectors = {
  deviceName,
  enableWebRTC,
  webrtcChannelName,
  webrtcConfig,
};
