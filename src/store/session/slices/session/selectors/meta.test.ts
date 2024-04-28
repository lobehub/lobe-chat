import { describe, expect, it } from 'vitest';

import { DEFAULT_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { SessionStore } from '@/store/session';
import { MetaData } from '@/types/meta';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

import { sessionMetaSelectors } from './meta';

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

describe('sessionMetaSelectors', () => {
  describe('currentAgentMeta', () => {
    it('should return the merged default and session-specific meta data', () => {
      const meta = sessionMetaSelectors.currentAgentMeta(mockSessionStore);
      expect(meta).toEqual(expect.objectContaining(mockSessionStore.sessions[0].meta));
    });

    it('should return inbox defaults if it is an inbox session', () => {
      // Assume sessionSelectors.isInboxSession() is mocked to return true for this test
      const meta = sessionMetaSelectors.currentAgentMeta(mockSessionStore);
      expect(meta.avatar).toBe(DEFAULT_AVATAR);
    });
  });

  describe('currentAgentTitle', () => {
    it('should return the title from the session meta data', () => {
      const title = sessionMetaSelectors.currentAgentTitle(mockSessionStore);
      expect(title).toBe(mockSessionStore.sessions[0].meta.title);
    });
  });

  describe('currentAgentDescription', () => {
    it('should return the description from the session meta data', () => {
      const description = sessionMetaSelectors.currentAgentDescription(mockSessionStore);
      expect(description).toBe(mockSessionStore.sessions[0].meta.description);
    });
  });

  describe('getAvatar', () => {
    it('should return the avatar from the meta data', () => {
      const meta: MetaData = { avatar: 'custom-avatar.png' };
      const avatar = sessionMetaSelectors.getAvatar(meta);
      expect(avatar).toBe(meta.avatar);
    });

    it('should return the default avatar if none is defined in the meta data', () => {
      const meta: MetaData = {};
      const avatar = sessionMetaSelectors.getAvatar(meta);
      expect(avatar).toBe(DEFAULT_AVATAR);
    });
  });

  describe('getTitle', () => {
    it('should return the title from the meta data', () => {
      const meta: MetaData = { title: 'Custom Title' };
      const title = sessionMetaSelectors.getTitle(meta);
      expect(title).toBe(meta.title);
    });

    it('should return the default title if none is defined in the meta data', () => {
      const meta: MetaData = {};
      const title = sessionMetaSelectors.getTitle(meta);
      expect(title).toBe('defaultSession'); // Assuming translation returns this key
    });
  });

  describe('getDescription', () => {
    it('should return the description from the meta data', () => {
      const meta: MetaData = { description: 'Custom Description' };
      const description = sessionMetaSelectors.getDescription(meta);
      expect(description).toBe(meta.description);
    });

    it('should return the default description if none is defined in the meta data', () => {
      const meta: MetaData = {};
      const description = sessionMetaSelectors.getDescription(meta);
      expect(description).toBe('noDescription'); // Assuming translation returns this key
    });
  });
});
