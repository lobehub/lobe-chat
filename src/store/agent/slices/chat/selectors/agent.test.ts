import { describe, expect, it } from 'vitest';

import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { AgentStore } from '@/store/agent';
import { AgentState } from '@/store/agent/slices/chat/initialState';
import { merge } from '@/utils/merge';

import { initialState } from '../../../initialState';
import { agentSelectors } from './agent';

vi.mock('i18next', () => ({
  t: vi.fn((key) => key), // Simplified mock return value
}));

const agentConfig = DEFAULT_AGENT_CONFIG;

const mockSessionStore = merge(initialState, {
  activeAgentId: '1',
  agentMap: {
    '1': agentConfig,
  },
} as Partial<AgentState>) as unknown as AgentStore;

describe('agentSelectors', () => {
  describe('inboxAgentConfig', () => {
    it('should merge DEFAULT_AGENT_CONFIG and inboxAgent config correctly', () => {
      const s = {
        inboxAgentId: 'inbox-agent-123',
        agentMap: {
          'inbox-agent-123': {
            systemRole: 'user',
            model: 'gpt-3.5-turbo',
            params: {
              temperature: 0.7,
            },
          },
        },
      } as unknown as AgentStore;

      const result = agentSelectors.inboxAgentConfig(s);

      expect(result).toMatchSnapshot();
    });

    it('should return DEFAULT_AGENT_CONFIG when inboxAgentId is not set', () => {
      const s = {
        inboxAgentId: undefined,
        agentMap: {},
      } as unknown as AgentStore;

      const result = agentSelectors.inboxAgentConfig(s);

      expect(result).toEqual(DEFAULT_AGENT_CONFIG);
    });
  });

  describe('currentAgentConfig', () => {
    it('should return the merged default and session-specific agent config', () => {
      const config = agentSelectors.currentAgentConfig(mockSessionStore);
      expect(config).toEqual(expect.objectContaining(agentConfig));
    });
  });

  describe('currentAgentModel', () => {
    it('should return the model from the agent config', () => {
      const model = agentSelectors.currentAgentModel(mockSessionStore);
      expect(model).toBe(agentConfig.model);
    });
  });

  describe('hasSystemRole', () => {
    it('should return true if the system role is defined in the agent config', () => {
      const hasRole = agentSelectors.hasSystemRole(mockSessionStore);
      expect(hasRole).toBe(false);
    });

    it('should return false if the system role is not defined in the agent config', () => {
      const modifiedSessionStore = merge(mockSessionStore, {
        agentMap: {
          '1': { systemRole: 'test' },
        },
      } as Partial<AgentState>);
      const hasRole = agentSelectors.hasSystemRole(modifiedSessionStore);
      expect(hasRole).toBe(true);
    });
  });

  describe('currentAgentTTS', () => {
    it('should return the TTS config from the agent config', () => {
      const ttsConfig = agentSelectors.currentAgentTTS(mockSessionStore);
      expect(ttsConfig).toEqual(agentConfig.tts);
    });

    it('should return the default TTS config if none is defined in the agent config', () => {
      const modifiedSessionStore = {
        ...mockSessionStore,
        sessions: [
          {
            ...agentConfig,
            config: {
              ...agentConfig,
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
      expect(ttsVoice).toBe(agentConfig.tts?.voice?.openai);
    });

    it('should return the default voice for edge TTS service', () => {
      const modifiedStore = merge(mockSessionStore, {
        agentMap: {
          '1': {
            tts: { ttsService: 'edge' },
          },
        },
      } as Partial<AgentState>) as AgentStore;
      const ttsVoice = agentSelectors.currentAgentTTSVoice('en')(modifiedStore);
      expect(ttsVoice).toBe('ar-SA-HamedNeural');
    });

    it('should return the default voice for microsoft TTS service', () => {
      const modifiedStore = merge(mockSessionStore, {
        agentMap: {
          '1': {
            tts: { ttsService: 'microsoft' },
          },
        },
      } as Partial<AgentState>) as AgentStore;

      const ttsVoice = agentSelectors.currentAgentTTSVoice('en')(modifiedStore);
      expect(ttsVoice).toBe('ar-SA-HamedNeural');
    });

    it('should return the first voice if the specified voice does not exist', () => {
      const lang = 'en';
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...agentConfig,
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
      expect(provider).toBe(agentConfig.provider);
    });

    it('should fallback to openai if provider is not defined in the agent config', () => {
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...agentConfig,
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
      expect(plugins).toEqual(agentConfig.plugins);
    });

    it('should return an empty array if plugins are not defined in the agent config', () => {
      const modifiedStore = {
        ...mockSessionStore,
        agentConfig: {
          ...agentConfig,
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
      expect(systemRole).toBe(agentConfig.systemRole);
    });

    it('should return undefined if system role is not defined in the agent config', () => {
      const modifiedStore = merge({}, {
        activeAgentId: '1',
        agentMap: {
          '1': {
            systemRole: undefined,
          },
        },
      } as Partial<AgentState>) as AgentStore;

      const systemRole = agentSelectors.currentAgentSystemRole(modifiedStore);
      expect(systemRole).toBeUndefined();
    });
  });

  describe('isInboxAgent', () => {
    it('should return true if activeAgentId equals inboxAgentId', () => {
      const modifiedStore = {
        ...mockSessionStore,
        activeAgentId: 'inbox-agent-id',
        inboxAgentId: 'inbox-agent-id',
      };
      const isInbox = agentSelectors.isInboxAgent(modifiedStore);
      expect(isInbox).toBe(true);
    });

    it('should return false if activeAgentId does not equal inboxAgentId', () => {
      const isInbox = agentSelectors.isInboxAgent(mockSessionStore);
      expect(isInbox).toBe(false);
    });

    it('should return false if inboxAgentId is not set', () => {
      const modifiedStore = {
        ...mockSessionStore,
        activeAgentId: 'some-agent-id',
        inboxAgentId: undefined,
      };
      const isInbox = agentSelectors.isInboxAgent(modifiedStore);
      expect(isInbox).toBe(false);
    });
  });
});
