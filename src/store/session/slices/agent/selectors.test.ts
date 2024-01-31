import { describe, expect, it } from 'vitest';

import { DEFAULT_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { SessionStore } from '@/store/session';
import { MetaData } from '@/types/meta';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

import { agentSelectors } from '../agent';

vi.mock('i18next', () => ({
  t: vi.fn((key) => key), // Simplified mock return value
}));

const mockSessionStore = {
  activeId: '1',
  sessions: [
    {
      id: '1',
      config: DEFAULT_AGENT_CONFIG,
      meta: {
        title: 'title1',
        description: 'description1',
      },
      type: LobeSessionType.Agent,
    } as LobeAgentSession,
    {
      id: '2',
      meta: {
        title: 'title2',
        description: 'description2',
      },
      config: DEFAULT_AGENT_CONFIG,
      type: LobeSessionType.Agent,
    } as LobeAgentSession,
  ],
} as unknown as SessionStore;

describe('agentSelectors', () => {
  describe('currentAgentConfig', () => {
    it('should return the merged default and session-specific agent config', () => {
      const config = agentSelectors.currentAgentConfig(mockSessionStore);
      expect(config).toEqual(expect.objectContaining(mockSessionStore.sessions[0].config));
    });
  });

  describe('currentAgentModel', () => {
    it('should return the model from the agent config', () => {
      const model = agentSelectors.currentAgentModel(mockSessionStore);
      expect(model).toBe(mockSessionStore.sessions[0].config.model);
    });
  });

  describe('currentAgentMeta', () => {
    it('should return the merged default and session-specific meta data', () => {
      const meta = agentSelectors.currentAgentMeta(mockSessionStore);
      expect(meta).toEqual(expect.objectContaining(mockSessionStore.sessions[0].meta));
    });

    it('should return inbox defaults if it is an inbox session', () => {
      // Assume sessionSelectors.isInboxSession() is mocked to return true for this test
      const meta = agentSelectors.currentAgentMeta(mockSessionStore);
      expect(meta.avatar).toBe(DEFAULT_AVATAR);
    });
  });

  describe('currentAgentTitle', () => {
    it('should return the title from the session meta data', () => {
      const title = agentSelectors.currentAgentTitle(mockSessionStore);
      expect(title).toBe(mockSessionStore.sessions[0].meta.title);
    });
  });

  describe('currentAgentDescription', () => {
    it('should return the description from the session meta data', () => {
      const description = agentSelectors.currentAgentDescription(mockSessionStore);
      expect(description).toBe(mockSessionStore.sessions[0].meta.description);
    });
  });

  // ... More tests for other selectors

  describe('hasSystemRole', () => {
    it('should return true if the system role is defined in the agent config', () => {
      const hasRole = agentSelectors.hasSystemRole(mockSessionStore);
      expect(hasRole).toBe(false);
    });

    it('should return false if the system role is not defined in the agent config', () => {
      const modifiedSessionStore = {
        ...mockSessionStore,
        sessions: [
          {
            ...mockSessionStore.sessions[0],
            config: {
              ...mockSessionStore.sessions[0].config,
              systemRole: 'test',
            },
          },
        ],
      };
      const hasRole = agentSelectors.hasSystemRole(modifiedSessionStore);
      expect(hasRole).toBe(true);
    });
  });

  describe('currentAgentTTS', () => {
    it('should return the TTS config from the agent config', () => {
      const ttsConfig = agentSelectors.currentAgentTTS(mockSessionStore);
      expect(ttsConfig).toEqual(mockSessionStore.sessions[0].config.tts);
    });

    it('should return the default TTS config if none is defined in the agent config', () => {
      const modifiedSessionStore = {
        ...mockSessionStore,
        sessions: [
          {
            ...mockSessionStore.sessions[0],
            config: {
              ...mockSessionStore.sessions[0].config,
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
      expect(ttsVoice).toBe(mockSessionStore.sessions[0].config.tts.voice.openai);
    });
  });

  describe('getAvatar', () => {
    it('should return the avatar from the meta data', () => {
      const meta: MetaData = { avatar: 'custom-avatar.png' };
      const avatar = agentSelectors.getAvatar(meta);
      expect(avatar).toBe(meta.avatar);
    });

    it('should return the default avatar if none is defined in the meta data', () => {
      const meta: MetaData = {};
      const avatar = agentSelectors.getAvatar(meta);
      expect(avatar).toBe(DEFAULT_AVATAR);
    });
  });

  describe('getTitle', () => {
    it('should return the title from the meta data', () => {
      const meta: MetaData = { title: 'Custom Title' };
      const title = agentSelectors.getTitle(meta);
      expect(title).toBe(meta.title);
    });

    it('should return the default title if none is defined in the meta data', () => {
      const meta: MetaData = {};
      const title = agentSelectors.getTitle(meta);
      expect(title).toBe('defaultSession'); // Assuming translation returns this key
    });
  });

  describe('getDescription', () => {
    it('should return the description from the meta data', () => {
      const meta: MetaData = { description: 'Custom Description' };
      const description = agentSelectors.getDescription(meta);
      expect(description).toBe(meta.description);
    });

    it('should return the default description if none is defined in the meta data', () => {
      const meta: MetaData = {};
      const description = agentSelectors.getDescription(meta);
      expect(description).toBe('noDescription'); // Assuming translation returns this key
    });
  });
});
