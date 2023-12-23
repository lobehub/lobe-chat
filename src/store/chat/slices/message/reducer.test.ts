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
        role: 'system',
        meta: {},
      },
    ];
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
