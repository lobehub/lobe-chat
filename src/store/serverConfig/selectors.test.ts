import { describe, expect, it, vi } from 'vitest';

import { featureFlagsSelectors, serverConfigSelectors } from './selectors';
import { initServerConfigStore } from './store';

vi.mock('zustand/traditional');

describe('featureFlagsSelectors', () => {
  it('should return mapped feature flags from store', () => {
    const store = initServerConfigStore({
      featureFlags: {
        language_model_settings: false,
        edit_agent: false,
      },
    });

    const result = featureFlagsSelectors(store.getState());

    expect(result).toEqual({
      enableWebrtc: false,
      isAgentEditable: false,
      enablePlugins: true,
      showCreateSession: true,
      showChangelog: true,
      enableRAGEval: false,
      showDalle: true,
      enableKnowledgeBase: true,
      showLLM: false,
      showCloudPromotion: false,
      showOpenAIApiKey: true,
      hideDocs: false,
      hideGitHub: false,
      showOpenAIProxyUrl: true,
      enableCheckUpdates: true,
      showWelcomeSuggest: true,
      enableClerkSignUp: true,
      showMarket: true,
      showPinList: false,
      enableSTT: true,
    });
  });
});

describe('serverConfigSelectors', () => {
  describe('enabledOAuthSSO', () => {
    it('should return enabledOAuthSSO value from store', () => {
      const store = initServerConfigStore({
        serverConfig: {
          enabledOAuthSSO: true,
          telemetry: {},
        },
      });

      const result = serverConfigSelectors.enabledOAuthSSO(store.getState());

      expect(result).toBe(true);
    });
  });

  describe('enabledTelemetryChat', () => {
    it('should return langfuse value from store when defined', () => {
      const store = initServerConfigStore({
        serverConfig: {
          telemetry: { langfuse: true },
        },
      });

      const result = serverConfigSelectors.enabledTelemetryChat(store.getState());

      expect(result).toBe(true);
    });

    it('should return false when langfuse is not defined', () => {
      const store = initServerConfigStore({
        serverConfig: {
          telemetry: {},
        },
      });

      const result = serverConfigSelectors.enabledTelemetryChat(store.getState());

      expect(result).toBe(false);
    });
  });
});
