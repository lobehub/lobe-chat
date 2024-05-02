import { act, renderHook, waitFor } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { globalService } from '@/services/global';
import { messageService } from '@/services/message';
import { userService } from '@/services/user';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { GlobalServerConfig } from '@/types/serverConfig';

vi.mock('zustand/traditional');

vi.mock('swr', async (importOriginal) => {
  const modules = await importOriginal();
  return {
    ...(modules as any),
    mutate: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createCommonSlice', () => {
  describe('updateAvatar', () => {
    it('should update avatar', async () => {
      const { result } = renderHook(() => useUserStore());
      const avatar = 'new-avatar';

      const spyOn = vi.spyOn(result.current, 'refreshUserConfig');
      const updateAvatarSpy = vi.spyOn(userService, 'updateAvatar');

      await act(async () => {
        await result.current.updateAvatar(avatar);
      });

      expect(updateAvatarSpy).toHaveBeenCalledWith(avatar);
      expect(spyOn).toHaveBeenCalled();
    });
  });

  describe('useFetchServerConfig', () => {
    it('should fetch server config correctly', async () => {
      const mockServerConfig = {
        defaultAgent: 'agent1',
        languageModel: 'model1',
        telemetry: {},
      } as GlobalServerConfig;
      vi.spyOn(globalService, 'getGlobalConfig').mockResolvedValueOnce(mockServerConfig);

      const { result } = renderHook(() => useUserStore().useFetchServerConfig());

      await waitFor(() => expect(result.current.data).toEqual(mockServerConfig));
    });
  });

  describe('useCheckTrace', () => {
    it('should return false when shouldFetch is false', async () => {
      const { result } = renderHook(() => useUserStore().useCheckTrace(false), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(false));
    });

    it('should return false when userAllowTrace is already set', async () => {
      vi.spyOn(preferenceSelectors, 'userAllowTrace').mockReturnValueOnce(true);

      const { result } = renderHook(() => useUserStore().useCheckTrace(true), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(false));
    });

    it('should call messageService.messageCountToCheckTrace when needed', async () => {
      vi.spyOn(preferenceSelectors, 'userAllowTrace').mockReturnValueOnce(null);
      const messageCountToCheckTraceSpy = vi
        .spyOn(messageService, 'messageCountToCheckTrace')
        .mockResolvedValueOnce(true);

      const { result } = renderHook(() => useUserStore().useCheckTrace(true), {
        wrapper: withSWR,
      });

      await waitFor(() => expect(result.current.data).toBe(true));
      expect(messageCountToCheckTraceSpy).toHaveBeenCalled();
    });
  });
});
