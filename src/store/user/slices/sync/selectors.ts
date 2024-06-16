import { DEFAULT_SYNC_CONFIG } from '@/const/settings/sync';
import { UserSyncSettings } from '@/types/user/settings';

import { UserStore } from '../../store';
import { currentSettings } from '../settings/selectors/settings';

const syncConfig = (s: UserStore): UserSyncSettings =>
  currentSettings(s).sync || DEFAULT_SYNC_CONFIG;

const webrtcConfig = (s: UserStore) => syncConfig(s).webrtc;
const webrtcChannelName = (s: UserStore) => webrtcConfig(s).channelName;
const enableWebRTC = (s: UserStore) => webrtcConfig(s).enabled;
const deviceName = (s: UserStore) => syncConfig(s).deviceName;

export const syncSettingsSelectors = {
  deviceName,
  enableWebRTC,
  webrtcChannelName,
  webrtcConfig,
};
