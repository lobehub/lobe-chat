import { describe, expect, it } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { AgentStore } from '@/store/agent';
import { UserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';
import { LobeAgentConfig } from '@/types/agent';

import { agentSelectors } from './selectors';

vi.mock('i18next', () => ({
  t: vi.fn((key) => key), // Simplified mock return value
}));

const mockSessionStore = {
  activeId: '1',
  agentConfig: DEFAULT_AGENT_CONFIG,
} as AgentStore;

describe('agentSelectors', () => {
  describe('defaultAgentConfig', () => {
    it('should merge DEFAULT_AGENT_CONFIG and defaultAgent(s).config correctly', () => {
      const s = {
        defaultAgentConfig: {
          systemRole: 'user',
          model: 'gpt-3.5-turbo',
          params: {
            temperature: 0.7,
          },
        },
      } as unknown as AgentStore;

      const result = agentSelectors.defaultAgentConfig(s);

      expect(result).toMatchSnapshot();
    });
  });

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
      expect(ttsVoice).toBe(mockSessionStore.agentConfig.tts?.voice?.openai);
    });

    it('should return the default voice for edge TTS service', () => {
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...mockSessionStore.agentConfig,
          tts: {
            ...DEFAUTT_AGENT_TTS_CONFIG,
            ttsService: 'edge',
          },
        },
      } as AgentStore;
      const ttsVoice = agentSelectors.currentAgentTTSVoice('en')(modifiedStore);
      expect(ttsVoice).toBe('ar-SA-HamedNeural');
    });

    it('should return the default voice for microsoft TTS service', () => {
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...mockSessionStore.agentConfig,
          tts: {
            ...DEFAUTT_AGENT_TTS_CONFIG,
            ttsService: 'microsoft',
          },
        },
      } as AgentStore;
      const ttsVoice = agentSelectors.currentAgentTTSVoice('en')(modifiedStore);
      expect(ttsVoice).toBe('ar-SA-HamedNeural');
    });

    it('should return the first voice if the specified voice does not exist', () => {
      const lang = 'en';
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...mockSessionStore.agentConfig,
          tts: {
            ...DEFAUTT_AGENT_TTS_CONFIG,
            ttsService: 'avc',
            voice: {
              openai: 'non-existent-voice',
            },
          },
        },
      };
      const ttsVoice = agentSelectors.currentAgentTTSVoice(lang)(modifiedStore as any);
      expect(ttsVoice).toBe('alloy');
    });
  });

  describe('currentAgentModelProvider', () => {
    it('should return the provider from the agent config', () => {
      const provider = agentSelectors.currentAgentModelProvider(mockSessionStore);
      expect(provider).toBe(mockSessionStore.agentConfig.provider);
    });

    it('should fallback to openai if provider is not defined in the agent config', () => {
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...mockSessionStore.agentConfig,
          provider: undefined,
        },
      };
      const provider = agentSelectors.currentAgentModelProvider(modifiedStore);
      expect(provider).toEqual('openai');
    });
  });

  describe('currentAgentPlugins', () => {
    it('should return the plugins array from the agent config', () => {
      const plugins = agentSelectors.currentAgentPlugins(mockSessionStore);
      expect(plugins).toEqual(mockSessionStore.agentConfig.plugins);
    });

    it('should return an empty array if plugins are not defined in the agent config', () => {
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...mockSessionStore.agentConfig,
          plugins: undefined,
        },
      };
      const plugins = agentSelectors.currentAgentPlugins(modifiedStore);
      expect(plugins).toEqual([]);
    });
  });

  describe('currentAgentSystemRole', () => {
    it('should return the system role from the agent config', () => {
      const systemRole = agentSelectors.currentAgentSystemRole(mockSessionStore);
      expect(systemRole).toBe(mockSessionStore.agentConfig.systemRole);
    });

    it('should return undefined if system role is not defined in the agent config', () => {
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...mockSessionStore.agentConfig,
          systemRole: undefined,
        },
      };
      const systemRole = agentSelectors.currentAgentSystemRole(modifiedStore);
      expect(systemRole).toBeUndefined();
    });
  });

  describe('isInboxSession', () => {
    it('should return true if activeId is INBOX_SESSION_ID', () => {
      const modifiedStore = {
        ...mockSessionStore,
        activeId: INBOX_SESSION_ID,
      };
      const isInbox = agentSelectors.isInboxSession(modifiedStore);
      expect(isInbox).toBe(true);
    });

    it('should return false if activeId is not INBOX_SESSION_ID', () => {
      const isInbox = agentSelectors.isInboxSession(mockSessionStore);
      expect(isInbox).toBe(false);
    });
  });
});
