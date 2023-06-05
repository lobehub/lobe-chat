import { ChatAgentMap } from '@/types';
import { Md5 } from 'ts-md5';
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
        id: '123',
        title: 'Default Agent',
        content: '',
        hash: '',
        avatar: '',
      },
    };

    const next = agentsReducer(initialState, {
      type: 'addAgent',
      title: 'New Agent',
      content: 'New Agent Content',
      avatar: 'New Agent Avatar',
    });

    expect(next).toEqual({
      ...initialState,
      'mocked-uuid': {
        id: 'mocked-uuid',
        title: 'New Agent',
        content: 'New Agent Content',
        hash: Md5.hashStr('New Agent Content'),
        avatar: 'New Agent Avatar',
        model: 'gpt-3.5-turbo',
      },
    });
  });
  it('should remove an agent', () => {
    const initialState = {
      default: {
        id: 'default',
        title: 'Default Agent',
        content: '',
        hash: '',
        avatar: '',
      },
    };

    const action: AgentDispatch = {
      type: 'removeAgent',
      id: 'default',
    };

    const expectedState: ChatAgentMap = {};

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });
  //
  it("should update an agent's avatar", () => {
    const initialState = {
      default: {
        id: 'default',
        title: 'Default Agent',
        content: '',
        hash: '',
        avatar: '',
      },
    };
    const action: AgentDispatch = {
      type: 'updateAgentData',
      id: 'default',
      key: 'avatar',
      value: 'New Default Avatar',
    };

    const expectedState: ChatAgentMap = {
      default: {
        id: 'default',
        title: 'Default Agent',
        content: '',
        hash: '',
        avatar: 'New Default Avatar',
      },
    };

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });
  //
  it("should update an agent's title", () => {
    const initialState = {
      default: {
        id: 'default',
        title: 'Default Agent',
        content: '',
        hash: '',
        avatar: '',
      },
    };

    const action: AgentDispatch = {
      type: 'updateAgentData',
      id: 'default',
      key: 'title',
      value: 'New Default Title',
    };

    const expectedState: ChatAgentMap = {
      default: {
        id: 'default',
        title: 'New Default Title',
        content: '',
        hash: '',
        avatar: '',
      },
    };

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });

  it("should update an agent's content and hash", () => {
    const initialState = {
      default: {
        id: 'default',
        title: 'Default Agent',
        content: '',
        hash: '',
        avatar: '',
      },
    };

    const action: AgentDispatch = {
      type: 'updateAgentData',
      id: 'default',
      key: 'content',
      value: 'New Default Content',
    };

    const expectedState: ChatAgentMap = {
      default: {
        id: 'default',
        title: 'Default Agent',
        content: 'New Default Content',
        hash: Md5.hashStr('New Default Content'),
        avatar: '',
      },
    };

    const newState = agentsReducer(initialState, action);
    expect(newState).toMatchObject(expectedState);
  });

  it('default 报错', () => {
    expect(() => agentsReducer({}, {} as AgentDispatch)).toThrowError();
  });
});
