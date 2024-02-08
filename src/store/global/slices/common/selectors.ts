import { GlobalStore } from '@/store/global';

export const commonSelectors = {
  enabledOAuthSSO: (s: GlobalStore) => s.serverConfig.enabledOAuthSSO,
  userAvatar: (s: GlobalStore) => s.avatar || '',
};
