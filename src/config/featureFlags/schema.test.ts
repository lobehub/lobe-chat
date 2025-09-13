import { describe, expect, it } from 'vitest';

import { FeatureFlagsSchema, evaluateFeatureFlag, mapFeatureFlagsEnvToState } from './schema';

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
      ai_image: true,
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid feature flags', () => {
    const result = FeatureFlagsSchema.safeParse({
      webrtc_sync: 'yes', // Invalid type, should be boolean or string array
    });

    expect(result.success).toBe(false);
  });

  it('should validate feature flags with user ID arrays', () => {
    const result = FeatureFlagsSchema.safeParse({
      webrtc_sync: ['user1', 'user2'],
      language_model_settings: true,
      openai_api_key: ['user3'],
    });

    expect(result.success).toBe(true);
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
      ai_image: true,
      check_updates: true,
      welcome_suggest: true,
    };

    const expectedState = {
      isAgentEditable: false,
      showCreateSession: true,
      showLLM: false,
      showProvider: false,
      showPinList: false,
      showOpenAIApiKey: true,
      showOpenAIProxyUrl: false,
      showApiKeyManage: false,
      enablePlugins: false,
      showDalle: true,
      showAiImage: true,
      showChangelog: false,
      enableCheckUpdates: true,
      showWelcomeSuggest: true,
      enableClerkSignUp: false,
      enableKnowledgeBase: false,
      enableRAGEval: false,
      enableGroupChat: false,
      showCloudPromotion: false,
      showMarket: false,
      enableSTT: false,
      hideGitHub: false,
      hideDocs: false,
    };

    const mappedState = mapFeatureFlagsEnvToState(config);

    expect(mappedState).toEqual(expectedState);
  });

  it('should map feature flags with user context', () => {
    const config = {
      webrtc_sync: ['user1', 'user2'], // Only for specific users
      language_model_settings: true, // For everyone
      openai_api_key: ['user3'], // Only for user3
    };

    // Test for user1 (should have webrtc_sync enabled)
    const stateForUser1 = mapFeatureFlagsEnvToState(config, 'user1');
    expect(stateForUser1.enableWebrtc).toBe(true);
    expect(stateForUser1.showLLM).toBe(true);
    expect(stateForUser1.showOpenAIApiKey).toBe(false);

    // Test for user3 (should have openai_api_key enabled)
    const stateForUser3 = mapFeatureFlagsEnvToState(config, 'user3');
    expect(stateForUser3.enableWebrtc).toBe(false);
    expect(stateForUser3.showLLM).toBe(true);
    expect(stateForUser3.showOpenAIApiKey).toBe(true);

    // Test for user4 (not in any user-specific lists)
    const stateForUser4 = mapFeatureFlagsEnvToState(config, 'user4');
    expect(stateForUser4.enableWebrtc).toBe(false);
    expect(stateForUser4.showLLM).toBe(true);
    expect(stateForUser4.showOpenAIApiKey).toBe(false);
  });
});

describe('evaluateFeatureFlag', () => {
  it('should return false for undefined flag values', () => {
    expect(evaluateFeatureFlag(undefined, 'user1')).toBe(false);
  });

  it('should return boolean value directly for boolean flags', () => {
    expect(evaluateFeatureFlag(true, 'user1')).toBe(true);
    expect(evaluateFeatureFlag(false, 'user1')).toBe(false);
  });

  it('should check user inclusion in user ID arrays', () => {
    const userArray = ['user1', 'user2', 'user3'];

    expect(evaluateFeatureFlag(userArray, 'user1')).toBe(true);
    expect(evaluateFeatureFlag(userArray, 'user2')).toBe(true);
    expect(evaluateFeatureFlag(userArray, 'user4')).toBe(false);
  });

  it('should return false for user arrays when no user ID provided', () => {
    const userArray = ['user1', 'user2'];
    expect(evaluateFeatureFlag(userArray, undefined)).toBe(false);
  });
});
