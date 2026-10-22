import { beforeEach, describe, expect, it, vi } from 'vitest';

import { startProjectTopicDraft } from './startProjectTopicDraft';

const { chat } = vi.hoisted(() => ({
  chat: { setPendingNewTopicDirectory: vi.fn(), switchTopic: vi.fn() },
}));

vi.mock('@/store/chat', () => ({
  useChatStore: { getState: () => chat },
}));

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

    expect(chat.switchTopic).toHaveBeenCalledWith(null, { skipRefreshMessage: true });
    expect(chat.setPendingNewTopicDirectory).toHaveBeenCalledWith({
      agentId: 'agt_1',
      projectWorkingDirectoryId: 'pwd_1',
    });
    expect(navigate).toHaveBeenCalledWith('/project/prj_1/conversation');
  });
});
