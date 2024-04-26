import { GlobalStore } from '@/store/global';

export const commonSelectors = {
  enabledOAuthSSO: (s: GlobalStore) => s.serverConfig.enabledOAuthSSO,
  enabledTelemetryChat: (s: GlobalStore) => s.serverConfig.telemetry.langfuse || false,
  userAvatar: (s: GlobalStore) => s.avatar || '',
  userId: (s: GlobalStore) => s.userId,
};

export const featureFlagsSelectors = {
  enableWebrtc: (s: GlobalStore) => s.featureFlags.webrtcSync,
  hideLLM: (s: GlobalStore) => !s.featureFlags.languageModel,

  hideOpenAIApiKey: (s: GlobalStore) => !s.featureFlags.openaiApiKey,
  hideOpenAIProxyUrl: (s: GlobalStore) => !s.featureFlags.openaiProxyUrl,
};
