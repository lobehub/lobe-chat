import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { topicService } from '@/services/topic';
import { useChatStore } from '@/store/chat/store';
import { topicMapKey } from '@/store/chat/utils/topicMapKey';

const AGENT_ID = 'agent-1';
const TOPIC_ID = 'topic-1';
const BUCKET = topicMapKey({ agentId: AGENT_ID });

const seedBucket = (status: 'unread' | 'active') =>
  useChatStore.setState({
    topicDataMap: {
      [BUCKET]: { hasMore: false, items: [{ id: TOPIC_ID, status, title: 't' } as any] } as any,
    },
  });

const bucketStatus = () =>
  useChatStore.getState().topicDataMap[BUCKET]?.items?.find((t) => t.id === TOPIC_ID)?.status;

describe('markTopicRead', () => {
  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState());
    useChatStore.setState({ activeAgentId: AGENT_ID });
    vi.spyOn(topicService, 'markTopicRead').mockResolvedValue({
      id: TOPIC_ID,
      status: 'active',
    } as any);
    vi.spyOn(topicService, 'updateTopic').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears an unread topic loaded in the topic buckets and mirrors it locally', async () => {
    seedBucket('unread');

    await useChatStore.getState().markTopicRead({ agentId: AGENT_ID, topicId: TOPIC_ID });

    expect(topicService.markTopicRead).toHaveBeenCalledWith(TOPIC_ID);
    expect(bucketStatus()).toBe('active');
  });

  it('leaves a topic it cannot see alone', async () => {
    await useChatStore.getState().markTopicRead({ agentId: AGENT_ID, topicId: TOPIC_ID });

    expect(topicService.markTopicRead).not.toHaveBeenCalled();
  });

  /** @example A project conversation lives in the project replica, not in `topicDataMap`. */
  it('clears a topic outside the topic buckets when the caller knows it is unread', async () => {
    await useChatStore
      .getState()
      .markTopicRead({ agentId: AGENT_ID, status: 'unread', topicId: TOPIC_ID });

    expect(topicService.markTopicRead).toHaveBeenCalledWith(TOPIC_ID);
  });

  it('skips the write when the caller reports a status other than unread', async () => {
    await useChatStore
      .getState()
      .markTopicRead({ agentId: AGENT_ID, status: 'running', topicId: TOPIC_ID });

    expect(topicService.markTopicRead).not.toHaveBeenCalled();
  });

  /**
   * @example A persisted project row still says unread, but a run started since
   * on another device: the server keeps `running`, so nothing writes `active`.
   */
  it('never writes active itself and mirrors nothing when the server says the topic moved on', async () => {
    vi.mocked(topicService.markTopicRead).mockResolvedValue(null);
    seedBucket('unread');

    await useChatStore.getState().markTopicRead({ agentId: AGENT_ID, topicId: TOPIC_ID });

    expect(topicService.updateTopic).not.toHaveBeenCalled();
    expect(bucketStatus()).toBe('unread');
  });
});
