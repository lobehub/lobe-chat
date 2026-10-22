import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isRunnableProjectDirectory, startProjectTopicDraft } from './startProjectTopicDraft';

const { chat } = vi.hoisted(() => ({
  chat: { setPendingNewTopicDirectory: vi.fn(), switchTopic: vi.fn() },
}));

vi.mock('@/store/chat', () => ({
  useChatStore: { getState: () => chat },
}));

describe('isRunnableProjectDirectory', () => {
  it('requires a linked environment instance and write access', () => {
    const runnable = { environmentId: 'env', instanceId: 'ins', permission: 'readWrite' };

    expect(isRunnableProjectDirectory(runnable)).toBe(true);
    expect(isRunnableProjectDirectory({ ...runnable, permission: 'read' })).toBe(false);
    expect(isRunnableProjectDirectory({ ...runnable, environmentId: null })).toBe(false);
    expect(isRunnableProjectDirectory({ ...runnable, instanceId: undefined })).toBe(false);
  });
});

describe('startProjectTopicDraft', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stages the directory on a blank conversation and opens the project composer', () => {
    const navigate = vi.fn();

    startProjectTopicDraft({
      agentId: 'agt_1',
      directoryId: 'pwd_1',
      navigate,
      projectId: 'prj_1',
    });

    // The draft belongs to the target agent, so its blank bucket is the one
    // cleaned — not whichever conversation the "+" was clicked from.
    expect(chat.switchTopic).toHaveBeenCalledWith(null, {
      clearNewKeyContext: { agentId: 'agt_1', groupId: null },
      skipRefreshMessage: true,
    });
    expect(chat.setPendingNewTopicDirectory).toHaveBeenCalledWith({
      agentId: 'agt_1',
      projectWorkingDirectoryId: 'pwd_1',
    });
    expect(navigate).toHaveBeenCalledWith('/project/prj_1/conversation');
  });
});
