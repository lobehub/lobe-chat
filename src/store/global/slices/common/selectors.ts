import { GlobalStore } from '@/store/global';

export const commonSelectors = {
  enabledOAuthSSO: (s: GlobalStore) => s.serverConfig.enabledOAuthSSO,
  enabledTelemetryChat: (s: GlobalStore) => s.serverConfig.telemetry.langfuse || false,
  userAvatar: (s: GlobalStore) => s.avatar || '',
  userId: (s: GlobalStore) => s.userId,
};
