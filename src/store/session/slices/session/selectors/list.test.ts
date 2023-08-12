import type { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

import { initLobeSession } from '../initialState';
import {
  currentSession,
  currentSessionSafe,
  getSessionById,
  getSessionMetaById,
  hasSessionList,
  sessionList,
} from './list';

describe('currentSession', () => {
  const s = {
    activeId: '1',
    sessions: {
      '1': {
        id: '1',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
      '2': {
        id: '2',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
    },
    inbox: {
      id: 'inbox',
      config: {
        model: LanguageModel.GPT3_5,
        params: {},
        systemRole: 'system-role',
      },
      type: LobeSessionType.Agent,
    } as LobeAgentSession,
  } as unknown as SessionStore;

  it('should return undefined when s.activeId is not defined', () => {
    expect(currentSession({ sessions: {} } as any)).toBeUndefined();
  });

  it('should return s.inbox when s.activeId is equal to INBOX_SESSION_ID', () => {
    expect(currentSession({ ...s, activeId: 'inbox' })).toEqual(s.inbox);
  });

  it('should return s.sessions[s.activeId] when s.activeId is not equal to INBOX_SESSION_ID', () => {
    expect(currentSession(s)).toEqual(s.sessions['1']);
  });
});

describe('currentSessionSafe', () => {
  const s = {
    activeId: '1',
    sessions: {
      '1': {
        id: '1',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
      '2': {
        id: '2',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
    },
    inbox: {
      id: 'inbox',
      config: {
        model: LanguageModel.GPT3_5,
        params: {},
        systemRole: 'system-role',
      },
      type: LobeSessionType.Agent,
    } as LobeAgentSession,
  } as unknown as SessionStore;

  it('should return initLobeSession when currentSession(s) returns undefined', () => {
    expect(currentSessionSafe({ sessions: {} } as any)).toEqual(initLobeSession);
  });

  it('should return the result of currentSession(s) when it returns a non-undefined value', () => {
    expect(currentSessionSafe(s)).toEqual(s.sessions['1']);
  });
});

describe('sessionList', () => {
  const s = {
    sessions: {
      '1': {
        pinned: true,
        updateAt: 100,
      },
      '2': {
        pinned: false,
        updateAt: 200,
      },
      '3': {
        pinned: true,
        updateAt: 300,
      },
    },
  } as unknown as SessionStore;

  it('should return an array of sessions sorted by pinned and updateAt fields', () => {
    expect(sessionList(s)).toEqual([s.sessions['3'], s.sessions['1'], s.sessions['2']]);
  });

  it('should return an empty array when s.sessions is an empty object', () => {
    const result = sessionList({
      sessions: {},
    } as any);
    expect(result).toEqual([]);
  });

  it('should return a sorted session list when s.sessions is not empty object', () => {
    const session1 = {
      id: '1',
      pinned: true,
      updateAt: 1635705600000,
      meta: {},
    };
    const session2 = {
      id: '2',
      pinned: false,
      updateAt: 1635705600000,
      meta: {},
    };
    const session3 = {
      id: '3',
      pinned: true,
      updateAt: 1635705700000,
      meta: {},
    };
    const s = {
      sessions: {
        '1': session1,
        '2': session2,
        '3': session3,
      },
    } as unknown as SessionStore;
    const result = sessionList(s);
    expect(result).toEqual([session3, session1, session2]);
  });

  it('should return a sorted session list when s.searchKeywords is not an empty string', () => {
    const session1 = {
      id: '1',
      pinned: true,
      meta: { title: 'yword' },

      updateAt: 1635705600000,
    };
    const session2 = {
      id: '2',
      pinned: false,
      meta: { title: 'keyword' },
      updateAt: 1635705600000,
    };
    const session3 = {
      id: '3',
      pinned: true,
      meta: { title: 'kyword' },
      updateAt: 1635705800000,
    };
    const s = {
      sessions: {
        '1': session1,
        '2': session2,
        '3': session3,
      },
      searchKeywords: 'k',
    } as unknown as SessionStore;

    const result = sessionList(s);
    expect(result).toEqual([session3, session2]);
  });

  it('should return an empty array when s.sessions is an empty object and s.searchKeywords is not an empty string', () => {
    const result = sessionList({
      sessions: {},
      searchKeywords: 'keyword',
    } as unknown as SessionStore);
    expect(result).toEqual([]);
  });
});

describe('hasSessionList', () => {
  it('should return true when sessionList(s) returns a non-empty array', () => {
    const s = {
      sessions: {
        '1': {},
      },
    } as unknown as SessionStore;
    expect(hasSessionList(s)).toBe(true);
  });

  it('should return false when sessionList(s) returns an empty array', () => {
    const s = {
      sessions: {},
    } as unknown as SessionStore;
    expect(hasSessionList(s)).toBe(false);
  });
});

describe('getSessionById', () => {
  const s = {
    activeId: '1',
    sessions: {
      '1': {
        id: '1',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
      '2': {
        id: '2',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
    },
    inbox: {
      id: 'inbox',
      config: {
        model: LanguageModel.GPT3_5,
        params: {},
        systemRole: 'system-role',
      },
      type: LobeSessionType.Agent,
    } as LobeAgentSession,
  } as unknown as SessionStore;

  it('should return s.inbox when id is equal to INBOX_SESSION_ID', () => {
    expect(getSessionById('inbox')(s)).toEqual(s.inbox);
  });

  it('should return the session with the specified id when id is not equal to INBOX_SESSION_ID', () => {
    expect(getSessionById('1')(s)).toEqual(s.sessions['1']);
  });

  it('should return initLobeSession when the session with the specified id does not exist', () => {
    expect(getSessionById('3')(s)).toEqual(initLobeSession);
  });
});

describe('getSessionMetaById', () => {
  const s: SessionStore = {
    sessions: {
      '1': {
        meta: {
          title: 'Session 1',
        },
      },
      '2': {
        meta: {
          title: 'Session 2',
        },
      },
    },
    inbox: {
      meta: {
        title: 'Inbox',
      },
    },
  } as unknown as SessionStore;

  it('should return the meta data of the session with the specified id', () => {
    expect(getSessionMetaById('1')(s)).toEqual({ title: 'Session 1' });
  });

  it('should return the meta data of the inbox session when id is equal to INBOX_SESSION_ID', () => {
    expect(getSessionMetaById('inbox')(s)).toEqual({ title: 'Inbox' });
  });

  it('should return an empty object when the session with the specified id does not exist', () => {
    expect(getSessionMetaById('3')(s)).toEqual({});
  });
});
