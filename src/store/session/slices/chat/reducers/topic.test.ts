import { produce } from 'immer';

import { ChatTopic, ChatTopicMap } from '@/types/topic';

import { ChatTopicDispatch, topicReducer } from './topic';

describe('topicReducer', () => {
  let state: ChatTopicMap;

  beforeEach(() => {
    state = {};
  });

  describe('addChatTopic', () => {
    it('should add a new ChatTopic object to state', () => {
      const payload: ChatTopicDispatch = {
        type: 'addChatTopic',
        topic: {
          id: '1',
          title: 'Test Topic',
          createAt: Date.now(),
          updateAt: Date.now(),
        },
      };

      const newState = topicReducer(state, payload);

      expect(newState).toMatchObject({
        '1': payload.topic,
      });
    });

    it('should add a ChatTopic object with correct id', () => {
      const payload: ChatTopicDispatch = {
        type: 'addChatTopic',
        topic: {
          id: '1',
          title: 'Test Topic',
          createAt: Date.now(),
          updateAt: Date.now(),
        },
      };

      const newState = topicReducer(state, payload);

      expect(newState['1']).toBeDefined();
    });

    it('should add a ChatTopic object with correct properties', () => {
      const payload: ChatTopicDispatch = {
        type: 'addChatTopic',
        topic: {
          id: '1',
          title: 'Test Topic',
          createAt: Date.now(),
          updateAt: Date.now(),
        },
      };

      const newState = topicReducer(state, payload);

      expect(newState['1']).toMatchObject(payload.topic);
    });
  });

  describe('updateChatTopic', () => {
    it('should update the ChatTopic object in state', () => {
      const topic: ChatTopic = {
        id: '1',
        title: 'Test Topic',
        createAt: Date.now(),
        updateAt: Date.now(),
      };

      state['1'] = topic;

      const payload: ChatTopicDispatch = {
        type: 'updateChatTopic',
        id: '1',
        key: 'title',
        value: 'Updated Topic',
      };

      const newState = topicReducer(state, payload);

      expect(newState['1'].title).toBe('Updated Topic');
    });

    it('should update the ChatTopic object with correct properties', () => {
      const topic: ChatTopic = {
        id: '1',
        title: 'Test Topic',
        createAt: Date.now() - 1,
        updateAt: Date.now() - 1, // 设定比当前时间前面一点
      };

      state['1'] = topic;

      const payload: ChatTopicDispatch = {
        type: 'updateChatTopic',
        id: '1',
        key: 'title',
        value: 'Updated Topic',
      };

      const newState = topicReducer(state, payload);

      expect(newState['1'].updateAt).toBeGreaterThan(topic.updateAt);
    });
  });

  describe('deleteChatTopic', () => {
    it('should delete the specified ChatTopic object from state', () => {
      const topic: ChatTopic = {
        id: '1',
        title: 'Test Topic',
        createAt: Date.now(),
        updateAt: Date.now(),
      };

      state['1'] = topic;

      const payload: ChatTopicDispatch = {
        type: 'deleteChatTopic',
        id: '1',
      };

      const newState = topicReducer(state, payload);

      expect(newState['1']).toBeUndefined();
    });
  });

  describe('default', () => {
    it('should return the original state object', () => {
      const payload = {
        type: 'unknown',
      } as unknown as ChatTopicDispatch;

      const newState = topicReducer(state, payload);

      expect(newState).toBe(state);
    });
  });

  describe('produce', () => {
    it('should generate immutable state object', () => {
      const payload: ChatTopicDispatch = {
        type: 'addChatTopic',
        topic: {
          id: '1',
          title: 'Test Topic',
          createAt: Date.now(),
          updateAt: Date.now(),
        },
      };

      const newState = topicReducer(state, payload);

      expect(newState).not.toBe(state);
    });

    it('should not modify the original state object', () => {
      const payload: ChatTopicDispatch = {
        type: 'addChatTopic',
        topic: {
          id: '1',
          title: 'Test Topic',
          createAt: Date.now(),
          updateAt: Date.now(),
        },
      };

      const newState = topicReducer(state, payload);

      expect(state).toMatchObject({});
    });
  });
});
