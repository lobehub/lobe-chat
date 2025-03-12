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

  describe('currentActiveTopicSummary', () => {
    it('should return undefined if there is no active topic', () => {
      const summary = topicSelectors.currentActiveTopicSummary(initialStore);
      expect(summary).toBeUndefined();
    });

    it('should return topic summary with content and metadata', () => {
      const state = merge(initialStore, {
        topicMaps: {
          test: [
            {
              id: 'topic1',
              historySummary: 'Test summary',
              metadata: { model: 'gpt-4', provider: 'openai' },
            },
          ],
        },
        activeId: 'test',
        activeTopicId: 'topic1',
      });

      const summary = topicSelectors.currentActiveTopicSummary(state);
      expect(summary).toEqual({
        content: 'Test summary',
        model: 'gpt-4',
        provider: 'openai',
      });
    });

    it('should handle missing metadata', () => {
      const state = merge(initialStore, {
        topicMaps: {
          test: [{ id: 'topic1', historySummary: 'Test summary' }],
        },
        activeId: 'test',
        activeTopicId: 'topic1',
      });

      const summary = topicSelectors.currentActiveTopicSummary(state);
      expect(summary).toEqual({
        content: 'Test summary',
        model: '',
        provider: '',
      });
    });
  });

  describe('currentUnFavTopics', () => {
    it('should return all unfavorited topics', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
      const topics = topicSelectors.currentUnFavTopics(state);
      expect(topics).toEqual([topicMaps.test[1]]);
    });

    it('should return empty array if no topics exist', () => {
      const topics = topicSelectors.currentUnFavTopics(initialStore);
      expect(topics).toEqual([]);
    });
  });

  describe('displayTopics', () => {
    it('should return current topics', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
      const topics = topicSelectors.displayTopics(state);
      expect(topics).toEqual(topicMaps.test);
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

  describe('isCreatingTopic', () => {
    it('should return creatingTopic state', () => {
      const state = merge(initialStore, { creatingTopic: true });
      expect(topicSelectors.isCreatingTopic(state)).toBe(true);
    });
  });

  describe('isUndefinedTopics', () => {
    it('should return true when topics are undefined', () => {
      expect(topicSelectors.isUndefinedTopics(initialStore)).toBe(true);
    });

    it('should return false when topics exist', () => {
      const state = merge(initialStore, { topicMaps, activeId: 'test' });
      expect(topicSelectors.isUndefinedTopics(state)).toBe(false);
    });
  });

  describe('isInSearchMode', () => {
    it('should return inSearchingMode state', () => {
      const state = merge(initialStore, { inSearchingMode: true });
      expect(topicSelectors.isInSearchMode(state)).toBe(true);
    });
  });

  describe('isSearchingTopic', () => {
    it('should return isSearchingTopic state', () => {
      const state = merge(initialStore, { isSearchingTopic: true });
      expect(topicSelectors.isSearchingTopic(state)).toBe(true);
    });
  });

  describe('searchTopics', () => {
    it('should return search topics', () => {
      const searchTopics = [{ id: 'search1', name: 'Search Topic' }];
      const state = merge(initialStore, { searchTopics });
      expect(topicSelectors.searchTopics(state)).toEqual(searchTopics);
    });
  });
});
