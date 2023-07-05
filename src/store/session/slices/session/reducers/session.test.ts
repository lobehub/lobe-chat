import { ChatMessage } from '@/types/chatMessage';
import { LanguageModel } from '@/types/llm';
import { LobeAgentSession, LobeSessionType, LobeSessions } from '@/types/session';

import { SessionDispatch, sessionsReducer } from './session';

describe('sessionsReducer', () => {
  let initialState: LobeSessions;

  beforeEach(() => {
    initialState = {};
  });

  it('adds a session to the state', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {},
      type: LobeSessionType.Agent,
    };

    const action: SessionDispatch = {
      session,
      type: 'addSession',
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState).toEqual({
      [session.id]: session,
    });
  });

  it('does not add a session if it already exists', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {},
      type: LobeSessionType.Agent,
    };

    initialState = {
      [session.id]: session,
    };

    const action: SessionDispatch = {
      session,
      type: 'addSession',
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('removes a session from the state', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {},
      type: LobeSessionType.Agent,
    };

    initialState = {
      [session.id]: session,
    };

    const action: SessionDispatch = {
      id: session.id,
      type: 'removeSession',
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState).toEqual({});
  });

  it('does not remove a session if it does not exist', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {},
      type: LobeSessionType.Agent,
    };

    initialState = {
      [session.id]: session,
    };

    const action: SessionDispatch = {
      id: '456',
      type: 'removeSession',
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('updates the chat for a session', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {},
      type: LobeSessionType.Agent,
    };

    initialState = {
      [session.id]: session,
    };

    const newChats: ChatMessage[] = [
      {
        content: 'Hello',
        createAt: Date.now(),
        id: '123',
        meta: {},
        role: 'user',
      },
      {
        content: 'Hi there',
        createAt: Date.now(),
        id: '456',
        meta: {},
        role: 'user',
      },
    ];

    const action: SessionDispatch = {
      chats: newChats,
      id: session.id,
      type: 'updateSessionChat',
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState[session.id].chats).toEqual(newChats);
  });

  it('does not update the chat for a session if it does not exist', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {},
      type: LobeSessionType.Agent,
    };

    initialState = {
      [session.id]: session,
    };

    const newChats: ChatMessage[] = [
      {
        content: 'Hello',
        createAt: Date.now(),
        id: '123',
        meta: {},
        role: 'user',
      },
      {
        content: 'Hi there',
        createAt: Date.now(),
        id: '456',
        meta: {},
        role: 'user',
      },
    ];

    const action: SessionDispatch = {
      chats: newChats,
      id: '456',
      type: 'updateSessionChat',
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('updates the meta for a session', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {
        description: 'This is session 1',
        title: 'Session 1',
      },
      type: LobeSessionType.Agent,
    };

    initialState = {
      [session.id]: session,
    };

    const newMetaValue = 'Session 2';

    const action: SessionDispatch = {
      id: session.id,
      key: 'title',
      type: 'updateSessionMeta',
      value: newMetaValue,
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState[session.id].meta.title).toEqual(newMetaValue);
  });

  it('does not update the meta for a session if it does not exist', () => {
    const session: LobeAgentSession = {
      chats: [],
      config: {
        model: LanguageModel.GPT3_5,
        params: {
          temperature: 0.6,
        },
        systemRole: 'system',
      },
      id: '123',
      meta: {
        description: 'This is session 1',
        title: 'Session 1',
      },
      type: LobeSessionType.Agent,
    };

    initialState = {
      [session.id]: session,
    };

    const newMetaValue = 'Session 2';

    const action: SessionDispatch = {
      id: '456',
      key: 'title',
      type: 'updateSessionMeta',
      value: newMetaValue,
    };

    const newState = sessionsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('returns the initial state if the action type is invalid', () => {
    // @ts-ignore
    const action: SessionDispatch = { type: 'invalidAction' };

    const initialState = {};
    const newState = sessionsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });
});
