import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { topicService } from '@/services/topic';
import { useChatStore } from '@/store/chat/store';
import { topicMapKey } from '@/store/chat/utils/topicMapKey';

const AGENT_ID = 'agent-1';
const TOPIC_ID = 'topic-1';

describe('markTopicRead', () => {
  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState());
    useChatStore.setState({ activeAgentId: AGENT_ID });
    vi.spyOn(topicService, 'updateTopic').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('flips an unread topic loaded in the topic buckets back to active', async () => {
    useChatStore.setState({
      topicDataMap: {
        [topicMapKey({ agentId: AGENT_ID })]: {
          hasMore: false,
          items: [{ id: TOPIC_ID, status: 'unread', title: 't' } as any],
        } as any,
      },
    });

    await useChatStore.getState().markTopicRead({ agentId: AGENT_ID, topicId: TOPIC_ID });

    expect(topicService.updateTopic).toHaveBeenCalledWith(TOPIC_ID, { status: 'active' });
  });

  it('leaves a topic it cannot see alone', async () => {
    await useChatStore.getState().markTopicRead({ agentId: AGENT_ID, topicId: TOPIC_ID });

    expect(topicService.updateTopic).not.toHaveBeenCalled();
  });

  /** @example A project conversation lives in the project replica, not in `topicDataMap`. */
  it('clears a topic outside the topic buckets when the caller knows it is unread', async () => {
    await useChatStore
      .getState()
      .markTopicRead({ agentId: AGENT_ID, status: 'unread', topicId: TOPIC_ID });

    expect(topicService.updateTopic).toHaveBeenCalledWith(TOPIC_ID, { status: 'active' });
  });

  it('never stomps a status the caller reports as something other than unread', async () => {
    await useChatStore
      .getState()
      .markTopicRead({ agentId: AGENT_ID, status: 'running', topicId: TOPIC_ID });

    expect(topicService.updateTopic).not.toHaveBeenCalled();
  });
});
