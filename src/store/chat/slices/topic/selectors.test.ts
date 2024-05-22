import { describe, expect, it } from 'vitest';

import { ChatStore } from '@/store/chat';
import { initialState } from '@/store/chat/initialState';
import { merge } from '@/utils/merge';

import { topicSelectors } from '../../selectors';

const initialStore = initialState as ChatStore;

const topicMaps = {
  test: [
    { id: 'topic1', name: 'Topic 1', favorite: true },
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

  describe('currentActiveTopic', () => {
    it('should return undefined if there is no active topic', () => {
      const topic = topicSelectors.currentActiveTopic(initialStore);
      expect(topic).toBeUndefined();
    });

    it('should return the current active topic', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test', activeTopicId: 'topic1' });
      const topic = topicSelectors.currentActiveTopic(state);
      expect(topic).toEqual(topicMaps.test[0]);
    });
  });

  describe('currentUnFavTopics', () => {
    it('should return all unfavorited topics', () => {
      const state = merge(initialStore, { topics: topicMaps.test });
      const topics = topicSelectors.currentUnFavTopics(state);
      expect(topics).toEqual([topicMaps.test[1]]);
    });
  });

  describe('displayTopics', () => {
    it('should return current topics if not searching', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
      const topics = topicSelectors.displayTopics(state);
      expect(topics).toEqual(topicMaps.test);
    });

    it('should return search topics if searching', () => {
      const searchTopics = [{ id: 'search1', name: 'Search 1' }];
      const state = merge(initialStore, { isSearchingTopic: true, searchTopics });
      const topics = topicSelectors.displayTopics(state);
      expect(topics).toEqual(searchTopics);
    });
  });

  describe('getTopicById', () => {
    it('should return undefined if topic is not found', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
      const topic = topicSelectors.getTopicById('notfound')(state);
      expect(topic).toBeUndefined();
    });

    it('should return the topic with the given id', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
      const topic = topicSelectors.getTopicById('topic1')(state);
      expect(topic).toEqual(topicMaps.test[0]);
    });
  });
});
