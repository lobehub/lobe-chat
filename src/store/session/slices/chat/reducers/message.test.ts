import { ChatMessageMap } from '@/types/chatMessage';

import { MessageDispatch, messagesReducer } from './message';

describe('messagesReducer', () => {
  let initialState: ChatMessageMap;

  beforeEach(() => {
    initialState = {
      message1: {
        id: 'message1',
        content: 'Hello World',
        createAt: 1629264000000,
        updateAt: 1629264000000,
        role: 'user',
      },
      message2: {
        id: 'message2',
        content: 'How are you?',
        createAt: 1629264000000,
        updateAt: 1629264000000,
        role: 'system',
      },
    } as unknown as ChatMessageMap;
  });

  describe('addMessage', () => {
    it('should add a new message to the state', () => {
      const payload: MessageDispatch = {
        type: 'addMessage',
        message: 'New Message',
        role: 'user',
        id: 'message3',
      };

      const newState = messagesReducer(initialState, payload);

      expect(Object.keys(newState)).toHaveLength(3);
      expect(newState).toHaveProperty('message1');
      expect(newState).toHaveProperty('message2');
      expect(newState).toHaveProperty('message3');
      expect(newState.message3).toEqual({
        id: 'message3',
        content: 'New Message',
        meta: {},
        createAt: expect.any(Number),
        updateAt: expect.any(Number),
        role: 'user',
      });
    });

    it('should use the provided id when adding a new message', () => {
      const payload: MessageDispatch = {
        type: 'addMessage',
        id: 'customId',
        message: 'New Message',
        role: 'user',
      };

      const newState = messagesReducer(initialState, payload);

      expect(Object.keys(newState)).toHaveLength(3);
      expect(newState).toHaveProperty('message1');
      expect(newState).toHaveProperty('message2');
      expect(newState).toHaveProperty('customId');
      expect(newState.customId).toEqual({
        id: 'customId',
        content: 'New Message',
        meta: {},
        createAt: expect.any(Number),
        updateAt: expect.any(Number),
        role: 'user',
      });
    });

    it('should use the provided parentId when adding a new message', () => {
      const payload: MessageDispatch = {
        type: 'addMessage',
        message: 'New Message',
        id: 'message3',
        role: 'user',
        parentId: 'message1',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.message3).toEqual({
        id: 'message3',
        content: 'New Message',
        meta: {},
        createAt: expect.any(Number),
        updateAt: expect.any(Number),
        role: 'user',
        parentId: 'message1',
      });
    });

    it('should use the provided quotaId when adding a new message', () => {
      const payload: MessageDispatch = {
        type: 'addMessage',
        message: 'New Message',
        id: 'message3',
        role: 'user',
        quotaId: 'message2',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.message3).toEqual({
        id: 'message3',
        meta: {},
        content: 'New Message',
        createAt: expect.any(Number),
        updateAt: expect.any(Number),
        role: 'user',
        quotaId: 'message2',
      });
    });

    it('should use the provided parentId and quotaId when adding a new message', () => {
      const payload: MessageDispatch = {
        type: 'addMessage',
        message: 'New Message',
        id: 'message3',
        role: 'user',
        parentId: 'message1',
        quotaId: 'message2',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.message3).toEqual({
        id: 'message3',
        content: 'New Message',
        meta: {},
        createAt: expect.any(Number),
        updateAt: expect.any(Number),
        role: 'user',
        parentId: 'message1',
        quotaId: 'message2',
      });
    });
  });

  describe('deleteMessage', () => {
    it('should remove the specified message from the state', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessage',
        id: 'message1',
      };

      const newState = messagesReducer(initialState, payload);

      expect(Object.keys(newState)).toHaveLength(1);
      expect(newState).not.toHaveProperty('message1');
      expect(newState).toHaveProperty('message2');
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessage',
        id: 'nonexistentMessage',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'deleteMessage',
        id: 'nonexistentMessage',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });
  });

  describe('updateMessage', () => {
    it('should update the specified message with the provided value', () => {
      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'message1',
        key: 'content',
        value: 'Updated Message',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.message1.content).toBe('Updated Message');
      expect(newState.message1.updateAt).toBeGreaterThan(initialState.message1.updateAt);
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'nonexistentMessage',
        key: 'content',
        value: 'Updated Message',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'updateMessage',
        id: 'nonexistentMessage',
        key: 'content',
        value: 'Updated Message',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });
  });

  describe('updateMessageExtra', () => {
    it('should update the specified message extra property with the provided value', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageExtra',
        id: 'message1',
        key: 'translate',
        value: { target: 'en', to: 'zh' },
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState.message1.extra!.translate).toEqual({ target: 'en', to: 'zh' });
      expect(newState.message1.updateAt).toBeGreaterThan(initialState.message1.updateAt);
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageExtra',
        id: 'nonexistentMessage',
        key: 'translate',
        value: { target: 'en', to: 'zh' },
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });

    it('should not modify the state if the specified message does not exist', () => {
      const payload: MessageDispatch = {
        type: 'updateMessageExtra',
        id: 'nonexistentMessage',
        key: 'translate',
        value: { target: 'en', to: 'zh' },
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual(initialState);
    });
  });

  describe('resetMessages', () => {
    it('should reset the state to an empty object', () => {
      const payload: MessageDispatch = {
        type: 'resetMessages',
      };

      const newState = messagesReducer(initialState, payload);

      expect(newState).toEqual({});
    });

    it('should delete messages with the specified topicId', () => {
      const initialState = {
        message1: {
          id: 'message1',
          content: 'Hello World',
          createAt: 1629264000000,
          updateAt: 1629264000000,
          role: 'user',
          topicId: 'topic1',
        },
        message2: {
          id: 'message2',
          content: 'How are you?',
          createAt: 1629264000000,
          updateAt: 1629264000000,
          role: 'system',
        },
      } as unknown as ChatMessageMap;

      const payload: MessageDispatch = {
        type: 'resetMessages',
        topicId: 'topic1',
      };

      const newState = messagesReducer(initialState, payload);

      expect(Object.keys(newState)).toHaveLength(1);
      expect(newState).not.toHaveProperty('message1');
      expect(newState).toHaveProperty('message2');
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
});
