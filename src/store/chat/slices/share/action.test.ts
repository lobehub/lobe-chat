import { act, renderHook } from '@testing-library/react';

import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';
import { shareGPTService } from '@/services/share';
import { useChatStore } from '@/store/chat';

describe('shareSlice actions', () => {
  let shareGPTServiceSpy: any;
  let windowOpenSpy;

  beforeEach(() => {
    shareGPTServiceSpy = vi
      .spyOn(shareGPTService, 'createShareGPTUrl')
      .mockResolvedValue('test-url');
    windowOpenSpy = vi.spyOn(window, 'open');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('shareToShareGPT', () => {
    it('should share to ShareGPT and open a new window', async () => {
      const { result } = renderHook(() => useChatStore());
      const shareGPTServiceSpy = vi.spyOn(shareGPTService, 'createShareGPTUrl');
      const windowOpenSpy = vi.spyOn(window, 'open');
      const avatar = 'avatar-url';
      const withPluginInfo = true;
      const withSystemRole = true;

      await act(async () => {
        await result.current.shareToShareGPT({ avatar, withPluginInfo, withSystemRole });
      });

      expect(shareGPTServiceSpy).toHaveBeenCalled();
      expect(windowOpenSpy).toHaveBeenCalled();
    });
    it('should handle messages from different roles correctly', async () => {
      // 注意：此处需要你根据实际情况模拟 chatSelectors.currentChats 和 agentSelectors 返回的数据
      // 此外，你可能需要调整 useChatStore 的引用路径
      const { result } = renderHook(() => useChatStore());
      await act(async () => {
        await result.current.shareToShareGPT({
          withPluginInfo: true,
          withSystemRole: true,
        });
      });
      // 根据你的逻辑添加对应的expect断言
    });

    it('should not include system role information when withSystemRole is false or systemRole is undefined', async () => {
      // 模拟不同的配置以测试这个行为
      // 你可能需要调整 useChatStore 的引用路径
      const { result } = renderHook(() => useChatStore());
      await act(async () => {
        await result.current.shareToShareGPT({
          withSystemRole: false,
        });
      });
      // 根据你的逻辑添加对应的expect断言
    });

    it('should use default avatar URL when avatar is not provided', async () => {
      const { result } = renderHook(() => useChatStore());
      await act(async () => {
        await result.current.shareToShareGPT({});
      });

      expect(shareGPTServiceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          avatarUrl: DEFAULT_USER_AVATAR_URL,
        }),
      );
    });

    it('should set shareLoading to true before sharing and to false after sharing', async () => {
      const { result } = renderHook(() => useChatStore());
      expect(result.current.shareLoading).toBe(false);
      await act(async () => {
        await result.current.shareToShareGPT({});
      });
      expect(result.current.shareLoading).toBe(false);
      // 注意：这里的验证可能需要你根据实际的状态管理逻辑进行调整
    });
  });
});
