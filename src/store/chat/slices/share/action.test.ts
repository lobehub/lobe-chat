import { ChatMessage } from '@lobechat/types';
import { act, renderHook } from '@testing-library/react';

import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';
import { shareService } from '@/services/share';
import { useChatStore } from '@/store/chat';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shareSlice actions', () => {
  describe('genShareUrl', () => {
    it('TODO', async () => {
      const { result } = renderHook(() => useChatStore());
      await act(async () => {
        await result.current.genShareUrl();
      });
    });
  });
});
