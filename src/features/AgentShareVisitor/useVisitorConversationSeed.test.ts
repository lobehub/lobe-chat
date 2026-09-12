import type { SharedAgentData } from '@lobechat/types';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useVisitorConversationSeed } from './useVisitorConversationSeed';

const mocks = vi.hoisted(() => ({
  chatState: {} as Record<string, unknown>,
  seedAgent: vi.fn(),
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: {
    getState: () => ({ internal_dispatchAgentMap: mocks.seedAgent }),
    setState: vi.fn(),
  },
}));
vi.mock('@/store/chat', () => ({
  useChatStore: {
    setState: (state: Record<string, unknown>) => Object.assign(mocks.chatState, state),
  },
}));

const agentMeta = (name: string): SharedAgentData['agentMeta'] => ({
  avatar: null,
  backgroundColor: null,
  description: null,
  name,
  title: null,
});

const identity: Pick<SharedAgentData, 'agentId' | 'agentMeta' | 'shareId'> = {
  agentId: 'agt_shared',
  agentMeta: agentMeta('Shared assistant'),
  shareId: 'share_1',
};

describe('useVisitorConversationSeed', () => {
  beforeEach(() => {
    mocks.chatState = { activeAgentId: 'agt_previous', activeTopicId: 'tpc_previous' };
  });

  it('restores the URL topic on direct entry and follows history navigation', () => {
    const { result, rerender } = renderHook(
      ({ topicId }: { topicId?: string }) => useVisitorConversationSeed(identity, topicId),
      { initialProps: { topicId: 'tpc_1' } as { topicId?: string } },
    );
    expect(result.current).toBe(true);
    expect(mocks.chatState).toMatchObject({ activeAgentId: 'agt_shared', activeTopicId: 'tpc_1' });
    rerender({ topicId: 'tpc_2' });
    expect(mocks.chatState.activeTopicId).toBe('tpc_2');
    rerender({ topicId: 'tpc_1' });
    expect(mocks.chatState.activeTopicId).toBe('tpc_1');
    rerender({ topicId: undefined });
    expect(mocks.chatState.activeTopicId).toBeUndefined();
  });

  it('does not reset a newly created topic when share metadata revalidates', () => {
    const { rerender } = renderHook((data) => useVisitorConversationSeed(data), {
      initialProps: identity,
    });
    act(() => {
      mocks.chatState.activeTopicId = 'tpc_created';
    });
    rerender({ ...identity, agentMeta: agentMeta('Renamed assistant') });
    expect(mocks.chatState.activeTopicId).toBe('tpc_created');
    rerender({ ...identity, agentId: 'agt_other', shareId: 'share_2' });
    expect(mocks.chatState.activeTopicId).toBeUndefined();
  });
});
