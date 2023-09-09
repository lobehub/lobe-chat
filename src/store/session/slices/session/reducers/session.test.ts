import { produce } from 'immer';

import { ChatMessage } from '@/types/chatMessage';
import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig, LobeAgentSession, LobeSessionType, LobeSessions } from '@/types/session';

import { SessionDispatch, sessionsReducer } from './session';

describe('sessionsReducer', () => {
  describe('addSession', () => {
    it('should add session to state when valid session and type are provided', () => {
      const state: LobeSessions = {};
      const session = {
        id: 'session-id',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession;
      const payload: SessionDispatch = {
        type: 'addSession',
        session,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual({
        'session-id': session,
      });
    });

    it('should not change state when invalid session and type are provided', () => {
      const state: LobeSessions = {};
      const session = undefined as unknown as LobeAgentSession;
      const payload: SessionDispatch = {
        type: 'addSession',
        session,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });
  });

  describe('removeSession', () => {
    it('should remove session from state when valid id and type are provided', () => {
      const state = {
        'session-id': {
          id: 'session-id',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system-role',
          },
          type: 'agent',
        } as LobeAgentSession,
      } as LobeSessions;
      const id = 'session-id';
      const payload: SessionDispatch = {
        type: 'removeSession',
        id,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual({});
    });

    it('should not change state when invalid id and type are provided', () => {
      const state: LobeSessions = {
        'session-id': {
          id: 'session-id',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system-role',
          },
          type: 'agent',
        } as LobeAgentSession,
      };
      const id = 'non-existent-id';
      const payload: SessionDispatch = {
        type: 'removeSession',
        id,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });
  });

  describe('updateSessionMeta', () => {
    it('should update session meta when valid id, key, and value are provided', () => {
      const state: LobeSessions = {
        'session-id': {
          id: 'session-id',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system-role',
          },
          type: 'agent',
          meta: {
            avatar: 'avatar-url',
            backgroundColor: 'background-color',
            description: 'description',
            tags: ['tag1', 'tag2'],
            title: 'title',
          },
        } as LobeAgentSession,
      };
      const id = 'session-id';
      const key: keyof MetaData = 'title';
      const value = 'new-title';
      const payload: SessionDispatch = {
        type: 'updateSessionMeta',
        id,
        key,
        value,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual({
        'session-id': {
          ...state['session-id'],
          meta: {
            ...state['session-id'].meta,
            title: 'new-title',
          },
        },
      });
    });

    it('should not change state when invalid id, key, and value are provided', () => {
      const state: LobeSessions = {
        'session-id': {
          id: 'session-id',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system-role',
          },
          type: 'agent',
          meta: {
            avatar: 'avatar-url',
            backgroundColor: 'background-color',
            description: 'description',
            tags: ['tag1', 'tag2'],
            title: 'title',
          },
        } as LobeAgentSession,
      };
      const id = 'non-existent-id';
      const key = 'invalid-key' as keyof MetaData;
      const value = 'new-value';
      const payload: SessionDispatch = {
        type: 'updateSessionMeta',
        id,
        key,
        value,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });

    it('should not change state when valid id, invalid key, and value are provided', () => {
      const state: LobeSessions = {
        'session-id': {
          id: 'session-id',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system-role',
          },
          type: 'agent',
          meta: {
            avatar: 'avatar-url',
            backgroundColor: 'background-color',
            description: 'description',
            tags: ['tag1', 'tag2'],
            title: 'title',
          },
        } as LobeAgentSession,
      };
      const id = 'session-id';
      const key = 'invalid-key' as keyof MetaData;
      const value = 'new-value';
      const payload: SessionDispatch = {
        type: 'updateSessionMeta',
        id,
        key,
        value,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });
  });

  describe('updateSessionConfig', () => {
    it('should update session config when valid id and partial config are provided', () => {
      const state: LobeSessions = {
        'session-id': {
          id: 'session-id',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system-role',
          },
          type: 'agent',
          meta: {
            avatar: 'avatar-url',
            backgroundColor: 'background-color',
            description: 'description',
            tags: ['tag1', 'tag2'],
            title: 'title',
          },
        } as LobeAgentSession,
      };
      const id = 'session-id';
      const config: Partial<LobeAgentConfig> = {
        model: LanguageModel.GPT4,
      };
      const payload: SessionDispatch = {
        type: 'updateSessionConfig',
        id,
        config,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual({
        'session-id': {
          ...state['session-id'],
          config: {
            ...state['session-id'].config,
            model: 'gpt-4',
          },
        },
      });
    });

    it('should update session agent config correctly', () => {
      const state: LobeSessions = {
        session1: {
          id: 'session1',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system',
          },
        } as LobeAgentSession,
        session2: {
          id: 'session2',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system',
          },
        } as LobeAgentSession,
      };

      const payload: SessionDispatch = {
        type: 'updateSessionConfig',
        id: 'session1',
        config: {
          model: LanguageModel.GPT4,
          params: {},
        },
      };

      const expectedState = produce(state, (draft) => {
        draft.session1.config = {
          model: LanguageModel.GPT4,
          params: {},
          systemRole: 'system',
        };
      });

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(expectedState);
    });

    it('should not change state when invalid session ID is provided for updating session agent config', () => {
      const state: LobeSessions = {
        session1: {
          id: 'session1',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system',
          },
        } as LobeAgentSession,
      };

      const payload: SessionDispatch = {
        type: 'updateSessionConfig',
        id: 'session2',
        config: {
          model: LanguageModel.GPT4,
          params: {},
        },
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });

    it.skip('should not change state when invalid session agent config is provided for updating session agent config', () => {
      const state: LobeSessions = {
        session1: {
          id: 'session1',
          config: {
            model: 'gpt-3.5-turbo',
            params: {},
            systemRole: 'system',
          },
        } as LobeAgentSession,
      };

      const payload: SessionDispatch = {
        type: 'updateSessionConfig',
        id: 'session1',
        config: {
          model: LanguageModel.GPT4,
          params: {},
          invalidKey: 'invalidValue',
        } as unknown as LobeAgentConfig,
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });
  });

  test('should not change state when invalid operation type is provided', () => {
    const state: LobeSessions = {
      session1: {
        id: 'session1',
        config: {
          model: 'gpt-3.5-turbo',
          params: {},
          systemRole: 'system',
        },
      } as LobeAgentSession,
    };

    const payload = {
      type: 'invalidOperation',
    } as unknown as SessionDispatch;

    const newState = sessionsReducer(state, payload);

    expect(newState).toEqual(state);
  });

  describe('updateSessionChat', () => {
    it('should update session chat correctly', () => {
      const state: LobeSessions = {
        session1: {
          id: 'session1',
          chats: {},
        } as LobeAgentSession,
        session2: {
          id: 'session2',
          chats: {},
        } as LobeAgentSession,
      };

      const payload: SessionDispatch = {
        type: 'updateSessionChat',
        id: 'session1',
        chats: {
          message1: {
            id: 'message1',
            content: 'Hello',
          } as ChatMessage,
        },
      };

      const expectedState = produce(state, (draft) => {
        draft.session1.chats = {
          message1: {
            id: 'message1',
            content: 'Hello',
          } as ChatMessage,
        };
      });

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(expectedState);
    });

    it('should not change state when invalid session ID is provided for updating session chat', () => {
      const state: LobeSessions = {
        session1: {
          id: 'session1',
          chats: {},
        } as LobeAgentSession,
      };

      const payload: SessionDispatch = {
        type: 'updateSessionChat',
        id: 'session2',
        chats: {
          message1: {
            id: 'message1',
            content: 'Hello',
          } as ChatMessage,
        },
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });

    it.skip('should not change state when invalid chat data is provided for updating session chat', () => {
      const state: LobeSessions = {
        session1: {
          id: 'session1',
          chats: {},
        } as LobeAgentSession,
      };

      const payload: SessionDispatch = {
        type: 'updateSessionChat',
        id: 'session1',
        chats: {
          message1: {
            id: 'message1',
            content: 'Hello',
            invalidKey: 'invalidValue',
          } as unknown as ChatMessage,
        },
      };

      const newState = sessionsReducer(state, payload);

      expect(newState).toEqual(state);
    });
  });
});
