import { GlobalStore } from '@/store/global';

export const commonSelectors = {
  enabledOAuthSSO: (s: GlobalStore) => s.serverConfig.enabledOAuthSSO,
  enabledTelemetryChat: (s: GlobalStore) => s.serverConfig.telemetry.langfuse || false,
  userAvatar: (s: GlobalStore) => s.avatar || '',
  userId: (s: GlobalStore) => s.userId,
};

export const featureFlagsSelectors = {
  enableWebrtc: (s: GlobalStore) => s.featureFlags.webrtcSync,
  isAgentEditable: (s: GlobalStore) => s.featureFlags.isAgentEditable,

  showCreateSession: (s: GlobalStore) => s.featureFlags.showCreateSession,
  showLLM: (s: GlobalStore) => s.featureFlags.languageModel,

  showOpenAIApiKey: (s: GlobalStore) => s.featureFlags.openaiApiKey,
  showOpenAIProxyUrl: (s: GlobalStore) => s.featureFlags.openaiProxyUrl,
};
