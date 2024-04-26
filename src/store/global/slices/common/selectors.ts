import { GlobalStore } from '@/store/global';

export const commonSelectors = {
  enabledOAuthSSO: (s: GlobalStore) => s.serverConfig.enabledOAuthSSO,
  enabledTelemetryChat: (s: GlobalStore) => s.serverConfig.telemetry.langfuse || false,
  userAvatar: (s: GlobalStore) => s.avatar || '',
  userId: (s: GlobalStore) => s.userId,
};

export const featureFlagsSelectors = {
  enableWebrtc: (s: GlobalStore) => s.featureFlags.webrtc_sync,
  isAgentEditable: (s: GlobalStore) => s.featureFlags.edit_agent,

  showCreateSession: (s: GlobalStore) => s.featureFlags.create_session,
  showLLM: (s: GlobalStore) => s.featureFlags.language_model_settings,

  showOpenAIApiKey: (s: GlobalStore) => s.featureFlags.openai_api_key,
  showOpenAIProxyUrl: (s: GlobalStore) => s.featureFlags.openai_proxy_url,
};
