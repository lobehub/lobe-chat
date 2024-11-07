import { t } from 'i18next';
import { describe, expect, it } from 'vitest';

import { ChatStore } from '@/store/chat';
import { initialState } from '@/store/chat/initialState';
import { merge } from '@/utils/merge';

import { topicSelectors } from './selectors';

// Mock i18next
vi.mock('i18next', () => ({
  t: vi.fn().mockImplementation((key) => key),
}));

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
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
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

  describe('groupedTopicsSelector', () => {
    it('should return empty array if there are no topics', () => {
      const state = merge(initialStore, { activeId: 'test' });
      const grouped = topicSelectors.groupedTopicsSelector(state);
      expect(grouped).toEqual([]);
    });

    it('should return grouped topics by time when no favorites exist', () => {
      const topics = [
        { id: 'topic1', name: 'Topic 1', favorite: false, createAt: '2023-01-01' },
        { id: 'topic2', name: 'Topic 2', favorite: false, createAt: '2023-01-01' },
      ];

      const state = merge(initialStore, {
        topicMaps: { test: topics },
        activeId: 'test',
      });

      const grouped = topicSelectors.groupedTopicsSelector(state);
      expect(grouped).toHaveLength(1); // One time-based group
      expect(grouped[0].children).toEqual(topics);
    });

    it('should separate favorite and unfavorite topics into different groups', () => {
      const topics = [
        { id: 'topic1', name: 'Topic 1', favorite: true, createAt: '2023-01-01' },
        { id: 'topic2', name: 'Topic 2', favorite: false, createAt: '2023-01-01' },
        { id: 'topic3', name: 'Topic 3', favorite: true, createAt: '2023-01-01' },
      ];

      const state = merge(initialStore, {
        topicMaps: { test: topics },
        activeId: 'test',
      });

      const grouped = topicSelectors.groupedTopicsSelector(state);

      expect(grouped).toHaveLength(2); // Favorite group + one time-based group

      // Check favorite group
      expect(grouped[0]).toEqual({
        id: 'favorite',
        title: 'favorite', // This matches the mocked t function return
        children: topics.filter((t) => t.favorite),
      });

      // Check unfavorite group
      expect(grouped[1].children).toEqual(topics.filter((t) => !t.favorite));
    });

    it('should only create time-based groups when there are no favorites', () => {
      const topics = [
        { id: 'topic1', name: 'Topic 1', favorite: false, createAt: '2023-01-01' },
        { id: 'topic2', name: 'Topic 2', favorite: false, createAt: '2023-02-01' },
      ];

      const state = merge(initialStore, {
        topicMaps: { test: topics },
        activeId: 'test',
      });

      const grouped = topicSelectors.groupedTopicsSelector(state);

      // Should not have a favorites group
      expect(grouped.find((g) => g.id === 'favorite')).toBeUndefined();

      // Should have time-based groups
      expect(grouped.every((g) => g.id !== 'favorite')).toBeTruthy();
    });
  });
});
