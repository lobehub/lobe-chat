import { ChatMessage } from '@/types/message';

import { MessageDispatch, messagesReducer } from './reducer';

describe('messagesReducer', () => {
  let initialState: ChatMessage[];

  beforeEach(() => {
    initialState = [
      {
        id: 'message1',
        content: 'Hello World',
        createdAt: 1629264000000,
        updatedAt: 1629264000000,
        role: 'user',
        meta: {},
      },
      {
        id: 'message2',
        content: 'How are you?',
        createdAt: 1629264000000,
        updatedAt: 1629264000000,
        role: 'assistant',
        meta: {},
        tools: [
          { identifier: 'tool1', apiName: 'calculator', id: 'abc', type: 'default', arguments: '' },
        ],
      },
    ];
  });

  describe('updateMessage', () => {
    it('should update the specified message with the provided value', () => {
      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'message1',
        value: { content: 'Updated Message' },
      };

      const newState = messagesReducer(initialState, payload);
      const newMessage = newState.find((i) => i.id === 'message1');

      expect(newMessage).not.toBeUndefined();
      expect(newMessage?.content).toBe('Updated Message');
      expect(newMessage?.updatedAt).toBeGreaterThan(initialState[0].updatedAt);
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'nonexistentMessage',
        value: { content: 'Updated Message' },
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'nonexistentMessage',
        value: { content: 'Updated Message' },
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });
  });

  describe('unimplemented type', () => {
    it('should throw an error when an unimplemented type is provided', () => {
      // @ts-ignore
      const payload: MessageDispatch = { type: 'unimplementedType' };

      expect(() => messagesReducer(initialState, payload)).toThrowError(
        '暂未实现的 type，请检查 reducer',
      );
    });
  });

  describe('updateMessageExtra', () => {
    it('should update the extra field of a message', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageExtra',
        id: 'message1',
        key: 'testKey',
        value: 'testValue',
      };

      const newState = messagesReducer(initialState, payload);
      const updatedMessage = newState.find((m) => m.id === 'message1');

      expect(updatedMessage?.extra).toEqual({ testKey: 'testValue' });
      expect(updatedMessage?.updatedAt).toBeGreaterThan(initialState[0].updatedAt);
    });

    it('should not modify state if message is not found', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageExtra',
        id: 'nonexistent',
        key: 'testKey',
        value: 'testValue',
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });
  });

  describe('updatePluginState', () => {
    it('should update the plugin state of a message', () => {
      const payload: MessageDispatch = {
        type: 'updatePluginState',
        id: 'message1',
        key: 'pluginKey',
        value: 'pluginValue',
      };

      const newState = messagesReducer(initialState, payload);
      const updatedMessage = newState.find((m) => m.id === 'message1');

      expect(updatedMessage?.pluginState).toEqual({ pluginKey: 'pluginValue' });
      expect(updatedMessage?.updatedAt).toBeGreaterThan(initialState[0].updatedAt);
    });

    it('should not modify state if message is not found', () => {
      const payload: MessageDispatch = {
        type: 'updatePluginState',
        id: 'nonexistent',
        key: 'pluginKey',
        value: 'pluginValue',
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });

    it('should not modify state if new plugin state is equal to old state', () => {
      const state = [
        {
          ...initialState[0],
          pluginState: { existingKey: 'existingValue' },
        },
      ];

      const payload: MessageDispatch = {
        type: 'updatePluginState',
        id: 'message1',
        key: 'existingKey',
        value: 'existingValue',
      };

      const newState = messagesReducer(state, payload);
      expect(newState).toEqual(state);
    });
  });

  describe('updateMessagePlugin', () => {
    it('should update the plugin of a tool message', () => {
      const toolMessage: ChatMessage = {
        id: 'toolMessage',
        role: 'tool',
        content: 'Tool content',
        createdAt: 1629264000000,
        updatedAt: 1629264000000,
        meta: {},
        plugin: {
          identifier: 'tool1',
          apiName: 'calculator',
          type: 'default',
          arguments: '',
        },
        tool_call_id: 'abc',
      };

      const state = [...initialState, toolMessage];

      const payload: MessageDispatch = {
        type: 'updateMessagePlugin',
        id: 'toolMessage',
        value: { identifier: 'newPlugin' },
      };

      const newState = messagesReducer(state, payload);
      const updatedMessage = newState.find((m) => m.id === 'toolMessage');

      expect(updatedMessage?.plugin).toEqual({
        apiName: 'calculator',
        arguments: '',
        identifier: 'newPlugin',
        type: 'default',
      });
      expect(updatedMessage?.updatedAt).toBeGreaterThan(toolMessage.updatedAt);
    });

    it('should not modify state if message is not found or not a tool message', () => {
      const payload: MessageDispatch = {
        type: 'updateMessagePlugin',
        id: 'message1', // This is a user message, not a tool message
        value: { identifier: 'newPlugin' },
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });
  });

  describe('updateMessageTools', () => {
    it('should update a specific tool in an assistant message', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageTools',
        id: 'message2',
        tool_call_id: 'abc',
        value: { apiName: 'updatedCalculator' },
      };

      const newState = messagesReducer(initialState, payload);
      const updatedMessage = newState.find((m) => m.id === 'message2');

      expect(updatedMessage?.tools?.[0]).toEqual({
        apiName: 'updatedCalculator',
        arguments: '',
        id: 'abc',
        identifier: 'tool1',
        type: 'default',
      });
      expect(updatedMessage?.updatedAt).toBeGreaterThan(initialState[1].updatedAt);
    });

    it('should not modify state if message is not found or not an assistant message', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageTools',
        id: 'message1', // This is a user message, not an assistant message
        tool_call_id: 'tool1',
        value: { identifier: 'updatedCalculator' },
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });

    it('should not modify state if tool is not found in the message', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageTools',
        id: 'message2',
        tool_call_id: 'nonexistentTool',
        value: { identifier: 'updatedCalculator' },
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });
  });

  describe('createMessage', () => {
    it('should add a new message to the state', () => {
      const payload: MessageDispatch = {
        type: 'createMessage',
        id: 'newMessage',
        value: {
          content: 'New message content',
          role: 'user',
          sessionId: 'inbox',
        },
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.length).toBe(initialState.length + 1);
      const newMessage = newState.find((m) => m.id === 'newMessage');
      expect(newMessage).toBeDefined();
      expect(newMessage?.content).toBe('New message content');
      expect(newMessage?.role).toBe('user');
      expect(newMessage?.createdAt).toBeDefined();
      expect(newMessage?.updatedAt).toBeDefined();
      expect(newMessage?.meta).toEqual({});
    });
  });

  describe('deleteMessage', () => {
    it('should remove a message from the state', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessage',
        id: 'message1',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.length).toBe(initialState.length - 1);
      expect(newState.find((m) => m.id === 'message1')).toBeUndefined();
    });

    it('should not modify state if message to delete is not found', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessage',
        id: 'nonexistentMessage',
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });
  });
});
