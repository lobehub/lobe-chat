import { FeatureFlagStore } from './store';

export const featureFlagsSelectors = {
  enableWebrtc: (s: FeatureFlagStore) => s.webrtc_sync,
  isAgentEditable: (s: FeatureFlagStore) => s.edit_agent,

  showCreateSession: (s: FeatureFlagStore) => s.create_session,
  showLLM: (s: FeatureFlagStore) => s.language_model_settings,

  showOpenAIApiKey: (s: FeatureFlagStore) => s.openai_api_key,
  showOpenAIProxyUrl: (s: FeatureFlagStore) => s.openai_proxy_url,
};
