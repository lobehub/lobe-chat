import { ChatToolPayload, UIChatMessage } from '@lobechat/types';

import { MessageDispatch, messagesReducer } from './reducer';

describe('messagesReducer', () => {
  let initialState: UIChatMessage[];

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

    it('should update a block in group message children when id matches a block', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'Original block content',
              tools: [
                {
                  id: 'tool1',
                  identifier: 'search',
                  apiName: 'search',
                  type: 'builtin',
                  arguments: '{"query": "test"}',
                },
              ],
            },
          ],
        } as UIChatMessage,
      ];

      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'block1',
        value: { content: 'Updated block content' },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      const groupMessage = newState.find((m) => m.id === 'group1');
      const block = groupMessage?.children?.find((b) => b.id === 'block1');

      expect(block?.content).toBe('Updated block content');
      expect(groupMessage?.updatedAt).toBeGreaterThan(1629264000000);
    });

    it('should update block tools in group message children', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'Block content',
              tools: [
                {
                  id: 'tool1',
                  identifier: 'search',
                  apiName: 'search',
                  type: 'builtin',
                  arguments: '{"query": "test"}',
                },
              ],
            },
          ],
        } as UIChatMessage,
      ];

      const newTools = [
        {
          id: 'tool1',
          identifier: 'search',
          apiName: 'search',
          type: 'builtin',
          arguments: '{"query": "updated"}',
          result: {
            id: 'result1',
            content: 'Search result',
          },
        },
      ];

      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'block1',
        value: { tools: newTools as any },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      const groupMessage = newState.find((m) => m.id === 'group1');
      const block = groupMessage?.children?.find((b) => b.id === 'block1');

      expect(block?.tools).toEqual(newTools);
      expect(groupMessage?.updatedAt).toBeGreaterThan(1629264000000);
    });

    it('should not modify state when updating non-existent block in group message', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'Block content',
            },
          ],
        } as UIChatMessage,
      ];

      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'nonexistentBlock',
        value: { content: 'Updated content' },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      expect(newState).toEqual(stateWithGroup);
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

    it('should update the extra field of a message if extra exist', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageExtra',
        id: 'data',
        key: 'abc',
        value: '2',
      };

      const newState = messagesReducer(
        [
          {
            id: 'data',
            content: 'Hello World',
            createdAt: 1629264000000,
            updatedAt: 1629264000000,
            role: 'user',
            meta: {},
            extra: { abc: '1' },
          } as UIChatMessage,
          ...initialState,
        ],
        payload,
      );
      const updatedMessage = newState.find((m) => m.id === 'data');

      expect(updatedMessage?.extra).toEqual({ abc: '2' });
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
      const toolMessage: UIChatMessage = {
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

  describe('addMessageTool', () => {
    it('should add a tool to the specified assistant message if it dont have tools', () => {
      const messageId = '1';
      const toolPayload: ChatToolPayload = {
        id: 'tc_1',
        type: 'default',
        identifier: 'tool1',
        apiName: 'testFunction',
        arguments: '{"arg1": "value1"}',
      };

      const payload: MessageDispatch = {
        type: 'addMessageTool',
        id: messageId,
        value: toolPayload,
      };

      const newState = messagesReducer(
        [...initialState, { id: messageId, role: 'assistant', content: '' } as UIChatMessage],
        payload,
      );
      const updatedMessage = newState.find((m) => m.id === messageId);

      expect(updatedMessage).not.toBeUndefined();
      expect(updatedMessage?.tools).toHaveLength(1);
      expect(updatedMessage?.tools?.[0]).toEqual(toolPayload);
      expect(updatedMessage?.updatedAt).toBeGreaterThan(initialState[0].updatedAt);
    });

    it('should add a tool to the specified assistant message', () => {
      const messageId = 'message2';
      const toolPayload: ChatToolPayload = {
        id: 'tc_1',
        type: 'default',
        identifier: 'tool1',
        apiName: 'testFunction',
        arguments: '{"arg1": "value1"}',
      };

      const payload: MessageDispatch = {
        type: 'addMessageTool',
        id: messageId,
        value: toolPayload,
      };

      const newState = messagesReducer(
        [...initialState, { id: messageId, role: 'assistant', content: '' } as UIChatMessage],
        payload,
      );
      const updatedMessage = newState.find((m) => m.id === messageId);

      expect(updatedMessage).not.toBeUndefined();
      expect(updatedMessage?.tools).toHaveLength(2);
      expect(updatedMessage?.tools?.[1]).toEqual(toolPayload);
    });

    it('should not modify the state if the message is not found', () => {
      const toolPayload: ChatToolPayload = {
        id: 'tc_1',
        type: 'default',
        identifier: 'tool1',
        apiName: 'testFunction',
        arguments: '{"arg1": "value1"}',
      };

      const payload: MessageDispatch = {
        type: 'addMessageTool',
        id: 'nonexistentMessage',
        value: toolPayload,
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });

    it('should not add a tool if the message is not an assistant message', () => {
      const toolPayload: ChatToolPayload = {
        id: 'tc_1',
        type: 'default',
        identifier: 'tool1',
        apiName: 'testFunction',
        arguments: '{"arg1": "value1"}',
      };

      const payload: MessageDispatch = {
        type: 'addMessageTool',
        id: 'message1', // This is a user message
        value: toolPayload,
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });
  });

  describe('deleteMessageTool', () => {
    it('should delete the specified tool from the message', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessageTool',
        id: 'message2',
        tool_call_id: 'abc',
      };

      const newState = messagesReducer(initialState, payload);
      const updatedMessage = newState.find((m) => m.id === 'message2');

      expect(updatedMessage).not.toBeUndefined();
      expect(updatedMessage?.tools).toHaveLength(0);
      expect(updatedMessage?.updatedAt).toBeGreaterThan(initialState[0].updatedAt);
    });

    it('should not modify the state if the message is not found', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessageTool',
        id: 'nonexistentMessage',
        tool_call_id: 'tool1',
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });

    it('should not modify the state if the tool is not found', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessageTool',
        id: 'message1',
        tool_call_id: 'nonexistentTool',
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });

    it('should not delete a tool if the message is not an assistant message', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessageTool',
        id: 'message1', // This is a user message
        tool_call_id: 'tool1',
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

  describe('deleteMessages', () => {
    it('should remove 2 messages from the state', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessages',
        ids: ['message1', 'message2'],
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.length).toBe(0);
      expect(newState.find((m) => m.id === 'message1')).toBeUndefined();
      expect(newState.find((m) => m.id === 'message2')).toBeUndefined();
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

  describe('updateGroupBlockToolResult', () => {
    it('should update a tool result in a group message block', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'Assistant response',
              tools: [
                {
                  id: 'tool1',
                  identifier: 'search',
                  apiName: 'search',
                  type: 'builtin',
                  arguments: '{"query": "test"}',
                  result: {
                    id: 'result1',
                    content: 'Initial result',
                  },
                },
              ],
            },
          ],
        } as UIChatMessage,
      ];

      const payload: MessageDispatch = {
        type: 'updateGroupBlockToolResult',
        groupMessageId: 'group1',
        blockId: 'block1',
        toolId: 'tool1',
        toolResult: {
          id: 'result1',
          content: 'Updated result content',
          state: { foo: 'bar' },
        },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      const groupMessage = newState.find((m) => m.id === 'group1');
      const block = groupMessage?.children?.find((b) => b.id === 'block1');
      const tool = block?.tools?.find((t) => t.id === 'tool1');

      expect(tool?.result).toEqual({
        id: 'result1',
        content: 'Updated result content',
        state: { foo: 'bar' },
      });
      expect(groupMessage?.updatedAt).toBeGreaterThan(1629264000000);
    });

    it('should not modify state if group message is not found', () => {
      const payload: MessageDispatch = {
        type: 'updateGroupBlockToolResult',
        groupMessageId: 'nonexistent',
        blockId: 'block1',
        toolId: 'tool1',
        toolResult: {
          id: 'result1',
          content: 'Updated result',
        },
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });

    it('should not modify state if block is not found', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'Assistant response',
              tools: [],
            },
          ],
        } as UIChatMessage,
      ];

      const payload: MessageDispatch = {
        type: 'updateGroupBlockToolResult',
        groupMessageId: 'group1',
        blockId: 'nonexistentBlock',
        toolId: 'tool1',
        toolResult: {
          id: 'result1',
          content: 'Updated result',
        },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      expect(newState).toEqual(stateWithGroup);
    });

    it('should not modify state if tool is not found', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'Assistant response',
              tools: [
                {
                  id: 'tool1',
                  identifier: 'search',
                  apiName: 'search',
                  type: 'builtin',
                  arguments: '{"query": "test"}',
                },
              ],
            },
          ],
        } as UIChatMessage,
      ];

      const payload: MessageDispatch = {
        type: 'updateGroupBlockToolResult',
        groupMessageId: 'group1',
        blockId: 'block1',
        toolId: 'nonexistentTool',
        toolResult: {
          id: 'result1',
          content: 'Updated result',
        },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      expect(newState).toEqual(stateWithGroup);
    });
  });

  describe('addGroupBlock', () => {
    it('should add a new block to group message children', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'First block',
            },
          ],
        } as UIChatMessage,
      ];

      const payload: MessageDispatch = {
        type: 'addGroupBlock',
        groupMessageId: 'group1',
        blockId: 'block2',
        value: {
          id: 'block2',
          content: 'Second block',
        },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      const groupMessage = newState.find((m) => m.id === 'group1');

      expect(groupMessage?.children).toHaveLength(2);
      expect(groupMessage?.children?.[1]).toEqual({
        id: 'block2',
        content: 'Second block',
      });
      expect(groupMessage?.updatedAt).toBeGreaterThan(1629264000000);
    });

    it('should not modify state if group message is not found', () => {
      const stateWithGroup: UIChatMessage[] = [
        ...initialState,
        {
          id: 'group1',
          role: 'group',
          content: '',
          createdAt: 1629264000000,
          updatedAt: 1629264000000,
          meta: {},
          children: [
            {
              id: 'block1',
              content: 'First block',
            },
          ],
        } as UIChatMessage,
      ];

      const payload: MessageDispatch = {
        type: 'addGroupBlock',
        groupMessageId: 'nonexistentGroup',
        blockId: 'block2',
        value: {
          id: 'block2',
          content: 'Second block',
        },
      };

      const newState = messagesReducer(stateWithGroup, payload);
      expect(newState).toEqual(stateWithGroup);
    });

    it('should not modify state if message is not a group message', () => {
      const payload: MessageDispatch = {
        type: 'addGroupBlock',
        groupMessageId: 'message1',
        blockId: 'block2',
        value: {
          id: 'block2',
          content: 'Second block',
        },
      };

      const newState = messagesReducer(initialState, payload);
      expect(newState).toEqual(initialState);
    });
  });
});
