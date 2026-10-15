import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useChatStore } from '@/store/chat';
import { initialState } from '@/store/chat/initialState';
import { topicMapKey } from '@/store/chat/utils/topicMapKey';
import type { ChatTopic, ChatTopicStatus } from '@/types/topic';

import { topicSelectors } from './selectors';

const bucketKey = topicMapKey({ agentId: 'agent-1' });

const topic = (id: string, status: ChatTopicStatus, updatedAt: number) =>
  ({ createdAt: updatedAt, id, status, title: id, updatedAt }) as ChatTopic;

const seed = (items: ChatTopic[], activeTopicId: string) =>
  useChatStore.setState({
    activeAgentId: 'agent-1',
    activeTopicId,
    topicDataMap: {
      [bucketKey]: { currentPage: 0, hasMore: false, items, pageSize: 20, total: items.length },
    },
  });

const setStatus = (id: string, status: ChatTopicStatus) => {
  const bucket = useChatStore.getState().topicDataMap[bucketKey];
  useChatStore.setState({
    topicDataMap: {
      [bucketKey]: {
        ...bucket,
        items: bucket.items.map((item) => (item.id === id ? { ...item, status } : item)),
      },
    },
  });
};

const sidebarIds = () =>
  topicSelectors
    .displayTopicsForSidebar(
      20,
      'updatedAt',
      false,
    )(useChatStore.getState())
    ?.map(({ id }) => id);

describe('justArchivedTopicId', () => {
  beforeEach(() => {
    useChatStore.setState(initialState);
  });

  afterEach(() => {
    useChatStore.setState(initialState);
  });

  it('hides the active topic from the sidebar as soon as it is archived', () => {
    seed([topic('current', 'active', 2), topic('other', 'active', 1)], 'current');
    expect(sidebarIds()).toEqual(['current', 'other']);

    setStatus('current', 'completed');

    expect(useChatStore.getState().justArchivedTopicId).toBe('current');
    expect(sidebarIds()).toEqual(['other']);
  });

  it('still shows the archived topic when "show archived" is on', () => {
    seed([topic('current', 'active', 2), topic('other', 'active', 1)], 'current');

    setStatus('current', 'completed');

    expect(
      topicSelectors
        .displayTopicsForSidebar(
          20,
          'updatedAt',
          true,
        )(useChatStore.getState())
        ?.map(({ id }) => id),
    ).toEqual(['current', 'other']);
  });

  it('clears once the user moves to another topic, so reopening pins it again', () => {
    seed([topic('current', 'active', 2), topic('other', 'active', 1)], 'current');
    setStatus('current', 'completed');

    useChatStore.setState({ activeTopicId: 'other' });
    expect(useChatStore.getState().justArchivedTopicId).toBeUndefined();

    useChatStore.setState({ activeTopicId: 'current' });
    expect(sidebarIds()).toEqual(['other', 'current']);
  });

  it('keeps a topic opened already archived pinned in the sidebar', () => {
    useChatStore.setState({
      topicDetailMap: { archived: topic('archived', 'completed', 1) },
    });
    seed([topic('other', 'active', 2)], 'archived');

    expect(useChatStore.getState().justArchivedTopicId).toBeUndefined();
    expect(sidebarIds()).toEqual(['other', 'archived']);
  });
});
