import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ForwardTopicParams } from '@/store/chat/slices/forward/action';

import { useForwardTopic } from './useForwardTopic';

const mocks = vi.hoisted(() => ({
  clearPortalStack: vi.fn(),
  forwardTopic: vi.fn(),
  navigate: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));
vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: typeof mocks) => unknown) => selector(mocks),
}));
vi.mock('@/features/Workspace/useWorkspaceAwareNavigate', () => ({
  useWorkspaceAwareNavigate: () => mocks.navigate,
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@lobehub/ui/base-ui', () => ({ toast: { error: mocks.error, success: mocks.success } }));

describe('topic handoff acceptance', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cancels once on the first persisted target, before any target finishes', async () => {
    let params!: ForwardTopicParams;
    let finish!: () => void;
    mocks.forwardTopic.mockImplementation((input: ForwardTopicParams) => {
      params = input;
      return new Promise((resolve) => {
        finish = () => resolve({ succeeded: [{ agentId: 'b' }, { agentId: 'c' }], failed: [] });
      });
    });
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useForwardTopic({ agentId: 'a', topicId: 'source', onSuccess }),
    );
    act(() => result.current([{ id: 'b' }, { id: 'c' }]));
    expect(onSuccess).not.toHaveBeenCalled();
    await act(async () => {
      await params.onTopicCreated?.({ id: 'c' }, 'topic-c');
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    await act(async () => {
      await params.onTopicCreated?.({ id: 'b' }, 'topic-b');
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalled();
    await act(async () => finish());
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('leaves the source schedule intact when every target fails before persistence', async () => {
    mocks.forwardTopic.mockResolvedValue({ succeeded: [], failed: [{ agentId: 'b' }] });
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useForwardTopic({ agentId: 'a', topicId: 'source', onSuccess }),
    );
    await act(async () => result.current([{ id: 'b' }]));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalled();
  });
});
