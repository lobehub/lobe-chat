/**
 * @vitest-environment happy-dom
 */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAgentTopicGroupMode } from './useAgentTopicGroupMode';

const scopeMock = vi.hoisted(() => ({ scope: null as null | { projectId: string } }));
const preferenceMock = vi.hoisted(() => ({ globalMode: 'byTime' as string }));
const agentMock = vi.hoisted(() => ({ agentMode: undefined as string | undefined }));

vi.mock('../TopicListScope', () => ({
  useTopicListScope: () => scopeMock.scope,
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => selector({ updatePreference: vi.fn() }),
}));

vi.mock('@/store/user/selectors', () => ({
  preferenceSelectors: {
    topicGroupMode: () => preferenceMock.globalMode,
  },
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (state: unknown) => unknown) =>
    selector({ updateAgentChatConfig: vi.fn() }),
}));

vi.mock('@/store/agent/selectors', () => ({
  agentSelectors: {
    currentAgentConfig: () => ({ chatConfig: { topicGroupMode: agentMock.agentMode } }),
    currentAgentHeterogeneousProviderType: () => undefined,
  },
}));

describe('useAgentTopicGroupMode', () => {
  beforeEach(() => {
    scopeMock.scope = null;
    preferenceMock.globalMode = 'byTime';
    agentMock.agentMode = undefined;
  });

  /** @example byProject saved from a group sidebar must not reach a project's own topic list. */
  it('resolves a stored byProject to byTime inside a project-scoped list', () => {
    scopeMock.scope = { projectId: 'prj-1' };
    preferenceMock.globalMode = 'byProject';

    const { result } = renderHook(() => useAgentTopicGroupMode());

    expect(result.current.topicGroupMode).toBe('byTime');
  });

  it('keeps the global byAgent mode inside a project-scoped list', () => {
    scopeMock.scope = { projectId: 'prj-1' };
    preferenceMock.globalMode = 'byAgent';

    const { result } = renderHook(() => useAgentTopicGroupMode());

    expect(result.current.topicGroupMode).toBe('byAgent');
  });

  it("keeps byProject in an agent's own sidebar", () => {
    agentMock.agentMode = 'byProject';

    const { result } = renderHook(() => useAgentTopicGroupMode());

    expect(result.current.topicGroupMode).toBe('byProject');
  });
});
