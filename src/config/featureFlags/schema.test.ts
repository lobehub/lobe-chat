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

  // New test cases for newly added feature flags
  it('should validate newly added feature flags', () => {
    const result = FeatureFlagsSchema.safeParse({
      check_updates: true,
      welcome_suggest: false,
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('check_updates', true);
    expect(result.data).toHaveProperty('welcome_suggest', false);
  });

  it('should reject invalid values for newly added feature flags', () => {
    const result = FeatureFlagsSchema.safeParse({
      check_updates: 'yes', // Invalid type, should be boolean
      welcome_suggest: 'no', // Invalid type, should be boolean
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

  // Test the behavior of the application when feature flags are toggled on and off
  it('should correctly toggle feature flags on and off', () => {
    const configOn = {
      check_updates: true,
      welcome_suggest: true,
    };

    const stateOn = mapFeatureFlagsEnvToState(configOn);
    expect(stateOn.enableCheckUpdates).toBe(true);
    expect(stateOn.showWelcomeSuggest).toBe(true);

    const configOff = {
      check_updates: false,
      welcome_suggest: false,
    };

    const stateOff = mapFeatureFlagsEnvToState(configOff);
    expect(stateOff.enableCheckUpdates).toBe(false);
    expect(stateOff.showWelcomeSuggest).toBe(false);
  });
});
