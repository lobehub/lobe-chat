import { describe, expect, it } from 'vitest';

import { FeatureFlagsSchema, mapFeatureFlagsEnvToState } from './schema';

describe('FeatureFlagsSchema', () => {
  it('should validate correct feature flags', () => {
    const result = FeatureFlagsSchema.safeParse({
      webrtc_sync: true,
      language_model_settings: false,
      openai_api_key: true,
      openai_proxy_url: false,
      create_session: true,
      edit_agent: false,
      dalle: true,
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid feature flags', () => {
    const result = FeatureFlagsSchema.safeParse({
      webrtc_sync: 'yes', // Invalid type, should be boolean
    });

    expect(result.success).toBe(false);
  });
});

describe('mapFeatureFlagsEnvToState', () => {
  it('should correctly map feature flags to state', () => {
    const config = {
      webrtc_sync: true,
      language_model_settings: false,
      openai_api_key: true,
      openai_proxy_url: false,
      create_session: true,
      edit_agent: false,
      dalle: true,
      check_updates: true,
      welcome_suggest: true,
    };

    const expectedState = {
      enableWebrtc: true,
      isAgentEditable: false,
      showCreateSession: true,
      showLLM: false,
      showOpenAIApiKey: true,
      showOpenAIProxyUrl: false,
      showDalle: true,
      enableCheckUpdates: true,
      showWelcomeSuggest: true,
    };

    const mappedState = mapFeatureFlagsEnvToState(config);

    expect(mappedState).toEqual(expectedState);
  });
});
