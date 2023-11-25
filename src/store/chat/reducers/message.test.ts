import { ChatMessage, ChatMessageMap } from '@/types/chatMessage';

import { MessageDispatch, messagesReducer } from './message';

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
        role: 'system',
        meta: {},
      },
    ];
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

      expect(newState).toHaveLength(3);
      expect(newState[0].id).toEqual('message1');
      expect(newState[1].id).toEqual('message2');
      expect(newState[2].id).toEqual('message3');
      expect(newState[2]).toEqual({
        id: 'message3',
        content: 'New Message',
        meta: {},
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
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
      expect(newState).toHaveLength(3);
      expect(newState[0].id).toEqual('message1');
      expect(newState[1].id).toEqual('message2');
      expect(newState[2].id).toEqual('customId');
      expect(newState[2]).toEqual({
        id: 'customId',
        content: 'New Message',
        meta: {},
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
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

      expect(newState[2]).toEqual({
        id: 'message3',
        content: 'New Message',
        meta: {},
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
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

      expect(newState[2]).toEqual({
        id: 'message3',
        meta: {},
        content: 'New Message',
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
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

      expect(newState[2]).toEqual({
        id: 'message3',
        content: 'New Message',
        meta: {},
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
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

      expect(newState).toHaveLength(1);
      expect(newState.find((x) => x.id === 'message1')).toBeUndefined();
      expect(newState.find((x) => x.id === 'message2')).not.toBeUndefined();
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
      const newMessage = newState.find((i) => i.id === 'message1');

      expect(newMessage).not.toBeUndefined();
      expect(newMessage?.content).toBe('Updated Message');
      expect(newMessage?.updatedAt).toBeGreaterThan(initialState[0].updatedAt);
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

      expect(newState[0].extra!.translate).toEqual({ target: 'en', to: 'zh' });
      expect(newState[0].updatedAt).toBeGreaterThan(initialState[0].updatedAt);
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

      expect(newState).toEqual([]);
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
