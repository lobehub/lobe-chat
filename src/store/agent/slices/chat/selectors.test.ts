import { describe, expect, it } from 'vitest';

import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { AgentStore } from '@/store/agent';

import { agentSelectors } from './selectors';

vi.mock('i18next', () => ({
  t: vi.fn((key) => key), // Simplified mock return value
}));

const mockSessionStore = {
  activeId: '1',
  agentConfig: DEFAULT_AGENT_CONFIG,
} as AgentStore;

describe('agentSelectors', () => {
  describe('currentAgentConfig', () => {
    it('should return the merged default and session-specific agent config', () => {
      const config = agentSelectors.currentAgentConfig(mockSessionStore);
      expect(config).toEqual(expect.objectContaining(mockSessionStore.agentConfig));
    });
  });

  describe('currentAgentModel', () => {
    it('should return the model from the agent config', () => {
      const model = agentSelectors.currentAgentModel(mockSessionStore);
      expect(model).toBe(mockSessionStore.agentConfig.model);
    });
  });

  describe('hasSystemRole', () => {
    it('should return true if the system role is defined in the agent config', () => {
      const hasRole = agentSelectors.hasSystemRole(mockSessionStore);
      expect(hasRole).toBe(false);
    });

    it('should return false if the system role is not defined in the agent config', () => {
      const modifiedSessionStore = {
        ...mockSessionStore,
        agentConfig: {
          ...mockSessionStore.agentConfig,
          systemRole: 'test',
        },
      };
      const hasRole = agentSelectors.hasSystemRole(modifiedSessionStore);
      expect(hasRole).toBe(true);
    });
  });

  describe('currentAgentTTS', () => {
    it('should return the TTS config from the agent config', () => {
      const ttsConfig = agentSelectors.currentAgentTTS(mockSessionStore);
      expect(ttsConfig).toEqual(mockSessionStore.agentConfig.tts);
    });

    it('should return the default TTS config if none is defined in the agent config', () => {
      const modifiedSessionStore = {
        ...mockSessionStore,
        sessions: [
          {
            ...mockSessionStore.agentConfig,
            config: {
              ...mockSessionStore.agentConfig,
              tts: DEFAUTT_AGENT_TTS_CONFIG,
            },
          },
        ],
      };
      const ttsConfig = agentSelectors.currentAgentTTS(modifiedSessionStore);
      expect(ttsConfig).toEqual(DEFAUTT_AGENT_TTS_CONFIG);
    });
  });

  describe('currentAgentTTSVoice', () => {
    it('should return the appropriate TTS voice based on the service and language', () => {
      const lang = 'en';
      const ttsVoice = agentSelectors.currentAgentTTSVoice(lang)(mockSessionStore);
      expect(ttsVoice).toBe(mockSessionStore.agentConfig.tts.voice.openai);
    });
  });
});
