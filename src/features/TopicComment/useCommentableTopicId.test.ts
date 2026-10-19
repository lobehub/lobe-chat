/**
 * @vitest-environment happy-dom
 */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCommentableTopicId } from './useCommentableTopicId';

const mocks = vi.hoisted(() => ({
  activeGroupId: undefined as string | undefined,
  agentMap: {} as Record<string, { visibility?: 'private' | 'public' }>,
  topicId: 'topic-1' as string | null | undefined,
  workspaceId: 'workspace-1' as string | undefined,
}));

vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  useActiveWorkspaceId: () => mocks.workspaceId,
}));

vi.mock('@/features/Conversation/useAgentConversationCoordinate', () => ({
  useAgentConversationCoordinate: () => ['agent-1', mocks.topicId, null],
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (s: unknown) => unknown) =>
    selector({ activeGroupId: mocks.activeGroupId }),
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (s: unknown) => unknown) => selector({ agentMap: mocks.agentMap }),
}));

describe('useCommentableTopicId', () => {
  beforeEach(() => {
    mocks.activeGroupId = undefined;
    mocks.agentMap = { 'agent-1': { visibility: 'public' } };
    mocks.topicId = 'topic-1';
    mocks.workspaceId = 'workspace-1';
  });

  it('returns the topic of a workspace-shared agent', () => {
    const { result } = renderHook(() => useCommentableTopicId());

    expect(result.current).toBe('topic-1');
  });

  it('returns undefined for a workspace-private agent', () => {
    mocks.agentMap = { 'agent-1': { visibility: 'private' } };

    const { result } = renderHook(() => useCommentableTopicId());

    expect(result.current).toBeUndefined();
  });

  it('keeps a group conversation commentable even when its active agent is private', () => {
    mocks.activeGroupId = 'group-1';
    mocks.agentMap = { 'agent-1': { visibility: 'private' } };

    const { result } = renderHook(() => useCommentableTopicId());

    expect(result.current).toBe('topic-1');
  });

  it('returns undefined outside a workspace', () => {
    mocks.workspaceId = undefined;

    const { result } = renderHook(() => useCommentableTopicId());

    expect(result.current).toBeUndefined();
  });

  it('returns undefined without an active topic', () => {
    mocks.topicId = null;

    const { result } = renderHook(() => useCommentableTopicId());

    expect(result.current).toBeUndefined();
  });
});
