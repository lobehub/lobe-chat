import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFetchTopics } from './useFetchTopics';

// Mock store dependencies
const mockUseAgentStore = vi.hoisted(() => vi.fn());
const mockUseAgentGroupStore = vi.hoisted(() => vi.fn());
const mockUseGlobalStore = vi.hoisted(() => vi.fn());
const mockUseChatStore = vi.hoisted(() => vi.fn());

vi.mock('@/store/agent', () => ({
  useAgentStore: mockUseAgentStore,
}));

vi.mock('@/store/agent/selectors', () => ({
  builtinAgentSelectors: {
    isInboxAgent: vi.fn((s) => s.isInbox),
  },
}));

vi.mock('@/store/agentGroup', () => ({
  useAgentGroupStore: mockUseAgentGroupStore,
}));

vi.mock('@/store/chat', () => ({
  useChatStore: mockUseChatStore,
}));

vi.mock('@/store/global', () => ({
  useGlobalStore: mockUseGlobalStore,
}));

vi.mock('@/store/global/selectors', () => ({
  systemStatusSelectors: {
    topicPageSize: vi.fn((s) => s.topicPageSize),
  },
}));

describe('useFetchTopics', () => {
  const mockUseFetchTopicsFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChatStore.mockImplementation((selector) => selector({ useFetchTopics: mockUseFetchTopicsFn }));
    mockUseGlobalStore.mockImplementation((selector) => selector({ topicPageSize: 20 }));
  });

  it('should fetch topics with agentId when no groupId is active', () => {
    const activeAgentId = 'agent-123';

    mockUseAgentStore.mockImplementation((selector) =>
      selector({ activeAgentId, isInbox: false }),
    );
    mockUseAgentGroupStore.mockImplementation((selector) =>
      selector({ activeGroupId: undefined }),
    );

    renderHook(() => useFetchTopics());

    expect(mockUseFetchTopicsFn).toHaveBeenCalledWith(true, {
      agentId: activeAgentId,
      groupId: undefined,
      isInbox: false,
      pageSize: 20,
    });
  });

  it('should fetch topics with groupId when group session is active', () => {
    const activeAgentId = 'agent-123';
    const activeGroupId = 'group-456';

    mockUseAgentStore.mockImplementation((selector) =>
      selector({ activeAgentId, isInbox: false }),
    );
    mockUseAgentGroupStore.mockImplementation((selector) =>
      selector({ activeGroupId }),
    );

    renderHook(() => useFetchTopics());

    expect(mockUseFetchTopicsFn).toHaveBeenCalledWith(true, {
      agentId: activeAgentId,
      groupId: activeGroupId,
      isInbox: false,
      pageSize: 20,
    });
  });

  it('should set isInbox to false when groupId is present even if agent is inbox', () => {
    const activeAgentId = 'inbox';
    const activeGroupId = 'group-789';

    mockUseAgentStore.mockImplementation((selector) =>
      selector({ activeAgentId, isInbox: true }),
    );
    mockUseAgentGroupStore.mockImplementation((selector) =>
      selector({ activeGroupId }),
    );

    renderHook(() => useFetchTopics());

    expect(mockUseFetchTopicsFn).toHaveBeenCalledWith(true, {
      agentId: activeAgentId,
      groupId: activeGroupId,
      isInbox: false,
      pageSize: 20,
    });
  });

  it('should pass isInbox true when inbox agent and no groupId', () => {
    const activeAgentId = 'inbox';

    mockUseAgentStore.mockImplementation((selector) =>
      selector({ activeAgentId, isInbox: true }),
    );
    mockUseAgentGroupStore.mockImplementation((selector) =>
      selector({ activeGroupId: undefined }),
    );

    renderHook(() => useFetchTopics());

    expect(mockUseFetchTopicsFn).toHaveBeenCalledWith(true, {
      agentId: activeAgentId,
      groupId: undefined,
      isInbox: true,
      pageSize: 20,
    });
  });

  it('should use topicPageSize from global store', () => {
    const customPageSize = 50;

    mockUseAgentStore.mockImplementation((selector) =>
      selector({ activeAgentId: 'agent-1', isInbox: false }),
    );
    mockUseAgentGroupStore.mockImplementation((selector) =>
      selector({ activeGroupId: undefined }),
    );
    mockUseGlobalStore.mockImplementation((selector) =>
      selector({ topicPageSize: customPageSize }),
    );

    renderHook(() => useFetchTopics());

    expect(mockUseFetchTopicsFn).toHaveBeenCalledWith(true, {
      agentId: 'agent-1',
      groupId: undefined,
      isInbox: false,
      pageSize: customPageSize,
    });
  });
});