import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const webrtcConfig = (s: GlobalStore) => currentSettings(s).sync.webrtc;
const enableWebRTC = (s: GlobalStore) => webrtcConfig(s).enabled;

export const syncSettingsSelectors = {
  enableWebRTC,
  webrtcConfig,
};
