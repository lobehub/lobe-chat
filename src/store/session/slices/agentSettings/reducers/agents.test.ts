import { Md5 } from 'ts-md5';

import { ChatAgentMap } from '@/types';

import { AgentDispatch, agentsReducer } from './agents';

beforeEach(() => {
  vi.mock('uuid', () => ({
    v4: () => 'mocked-uuid',
  }));
});

describe('agentsReducer', () => {
  it('should add a new agent', () => {
    const initialState = {
      '123': {
        avatar: '',
        content: '',
        hash: '',
        id: '123',
        title: 'Default Agent',
      },
    };

    const next = agentsReducer(initialState, {
      avatar: 'New Agent Avatar',
      content: 'New Agent Content',
      title: 'New Agent',
      type: 'addAgent',
    });

    expect(next).toEqual({
      ...initialState,
      'mocked-uuid': {
        avatar: 'New Agent Avatar',
        content: 'New Agent Content',
        hash: Md5.hashStr('New Agent Content'),
        id: 'mocked-uuid',
        model: 'gpt-3.5-turbo',
        title: 'New Agent',
      },
    });
  });
  it('should remove an agent', () => {
    const initialState = {
      default: {
        avatar: '',
        content: '',
        hash: '',
        id: 'default',
        title: 'Default Agent',
      },
    };

    const action: AgentDispatch = {
      id: 'default',
      type: 'removeAgent',
    };

    const expectedState: ChatAgentMap = {};

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });
  //
  it("should update an agent's avatar", () => {
    const initialState = {
      default: {
        avatar: '',
        content: '',
        hash: '',
        id: 'default',
        title: 'Default Agent',
      },
    };
    const action: AgentDispatch = {
      id: 'default',
      key: 'avatar',
      type: 'updateAgentData',
      value: 'New Default Avatar',
    };

    const expectedState: ChatAgentMap = {
      default: {
        avatar: 'New Default Avatar',
        content: '',
        hash: '',
        id: 'default',
        title: 'Default Agent',
      },
    };

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });
  //
  it("should update an agent's title", () => {
    const initialState = {
      default: {
        avatar: '',
        content: '',
        hash: '',
        id: 'default',
        title: 'Default Agent',
      },
    };

    const action: AgentDispatch = {
      id: 'default',
      key: 'title',
      type: 'updateAgentData',
      value: 'New Default Title',
    };

    const expectedState: ChatAgentMap = {
      default: {
        avatar: '',
        content: '',
        hash: '',
        id: 'default',
        title: 'New Default Title',
      },
    };

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });

  it("should update an agent's content and hash", () => {
    const initialState = {
      default: {
        avatar: '',
        content: '',
        hash: '',
        id: 'default',
        title: 'Default Agent',
      },
    };

    const action: AgentDispatch = {
      id: 'default',
      key: 'content',
      type: 'updateAgentData',
      value: 'New Default Content',
    };

    const expectedState: ChatAgentMap = {
      default: {
        avatar: '',
        content: 'New Default Content',
        hash: Md5.hashStr('New Default Content'),
        id: 'default',
        title: 'Default Agent',
      },
    };

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });

  it('default 报错', () => {
    expect(() => agentsReducer({}, {} as AgentDispatch)).toThrowError();
  });
});
