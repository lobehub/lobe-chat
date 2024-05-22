import { describe, expect, it } from 'vitest';

import { ChatStore } from '@/store/chat';
import { initialState } from '@/store/chat/initialState';
import { merge } from '@/utils/merge';

import { topicSelectors } from '../../selectors';

const initialStore = initialState as ChatStore;

const topicMaps = {
  test: [
    { id: 'topic1', name: 'Topic 1' },
    { id: 'topic2', name: 'Topic 2' },
  ],
};

describe('topicSelectors', () => {
  describe('currentTopics', () => {
    it('should return undefined if there are no topics with activeId', () => {
      const topics = topicSelectors.currentTopics(initialStore);
      expect(topics).toBeUndefined();
    });

    it('should return all current topics from the store', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });

      const topics = topicSelectors.currentTopics(state);
      expect(topics).toEqual(topicMaps.test);
    });
  });

  describe('currentTopicLength', () => {
    it('should return 0 if there are no topics', () => {
      const length = topicSelectors.currentTopicLength(initialStore);
      expect(length).toBe(0);
    });

    it('should return the number of current topics', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
      const length = topicSelectors.currentTopicLength(state);
      expect(length).toBe(topicMaps.test.length);
    });
  });
});
