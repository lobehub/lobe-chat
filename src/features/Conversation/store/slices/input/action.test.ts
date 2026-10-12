import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inputSlice } from './action';

const mocks = vi.hoisted(() => ({
  refreshTopic: vi.fn(),
  scheduleAgentRun: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('@lobehub/ui/base-ui', () => ({ toast: mocks.toast }));
vi.mock('i18next', () => ({ t: (key: string) => key }));
vi.mock('@/services/aiAgent', () => ({
  aiAgentService: { scheduleAgentRun: mocks.scheduleAgentRun },
}));
vi.mock('@/store/chat', () => ({
  useChatStore: { getState: () => ({ refreshTopic: mocks.refreshTopic }) },
}));

describe('commitScheduledSend', () => {
  let state: any;
  let commit: ReturnType<typeof inputSlice>['commitScheduledSend'];
  const runAt = '2030-01-01T01:00:00Z';

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.scheduleAgentRun.mockResolvedValue(undefined);
    mocks.refreshTopic.mockResolvedValue(undefined);
    state = { context: { agentId: 'agent-A', topicId: 'topic-A' }, scheduledSendAt: runAt };
    commit = inputSlice(
      (partial: any) => Object.assign(state, partial),
      () => state,
      {} as any,
    ).commitScheduledSend;
  });

  it('uses the captured agent and schedule when the conversation changes before commit', async () => {
    const target = { context: state.context, scheduledSendAt: runAt };
    state.context = { agentId: 'agent-B', topicId: 'topic-B' };
    state.scheduledSendAt = '2030-02-01T01:00:00Z';
    await expect(commit('Original message', [{ id: 'file-A' }], target)).resolves.toBe(true);
    expect(mocks.scheduleAgentRun).toHaveBeenCalledWith({
      agentId: 'agent-A',
      fileIds: ['file-A'],
      prompt: 'Original message',
      runAt,
    });
    expect(state.scheduledSendAt).toBe('2030-02-01T01:00:00Z');
  });

  it('does not disarm another conversation even when its selected time matches', async () => {
    let resolve!: () => void;
    mocks.scheduleAgentRun.mockReturnValue(
      new Promise<void>((res) => {
        resolve = res;
      }),
    );
    const pending = commit('Original message');
    state.context = { agentId: 'agent-B', topicId: 'topic-B' };
    resolve();
    await pending;
    expect(state.scheduledSendAt).toBe(runAt);
  });

  it('does not disarm a new schedule selected while the request is pending', async () => {
    let resolve!: () => void;
    mocks.scheduleAgentRun.mockReturnValue(
      new Promise<void>((res) => {
        resolve = res;
      }),
    );
    const pending = commit('Original message');
    state.scheduledSendAt = '2030-02-01T01:00:00Z';
    resolve();
    await pending;
    expect(state.scheduledSendAt).toBe('2030-02-01T01:00:00Z');
  });

  it('disarms the submitted schedule after it is persisted', async () => {
    await expect(commit('Original message')).resolves.toBe(true);
    expect(state.scheduledSendAt).toBeUndefined();
  });

  it('keeps a failed schedule armed for retry', async () => {
    mocks.scheduleAgentRun.mockRejectedValue(new Error('Network unavailable'));
    await expect(commit('Original message')).resolves.toBe(false);
    expect(state.scheduledSendAt).toBe(runAt);
    expect(mocks.refreshTopic).not.toHaveBeenCalled();
    expect(mocks.toast.error).toHaveBeenCalled();
  });
});
