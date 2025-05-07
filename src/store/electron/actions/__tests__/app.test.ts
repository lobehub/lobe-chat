import { ElectronAppState } from '@lobechat/electron-client-ipc';
import { SWRResponse } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { electronSystemService } from '@/services/electron/system';
import { globalAgentContextManager } from '@/utils/client/GlobalAgentContextManager';

import { createElectronAppSlice } from '../app';

// Mock dependencies
vi.mock('@/services/electron/system', () => ({
  electronSystemService: {
    getAppState: vi.fn(),
  },
}));

vi.mock('@/utils/client/GlobalAgentContextManager', () => ({
  globalAgentContextManager: {
    updateContext: vi.fn(),
  },
}));

vi.mock('@/libs/swr', () => ({
  useOnlyFetchOnceSWR: (key: string, fetcher: () => any, config: any) => {
    return {
      data: undefined,
      error: undefined,
      mutate: async () => {
        try {
          const data = await fetcher();
          config?.onSuccess?.(data);
          return data;
        } catch (error) {
          throw error;
        }
      },
    } satisfies Partial<SWRResponse<any, any>> as any;
  },
}));

describe('createElectronAppSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useInitElectronAppState', () => {
    const mockAppState: ElectronAppState = {
      userPath: {
        desktop: '/desktop',
        documents: '/documents',
        downloads: '/downloads',
        home: '/home',
        music: '/music',
        pictures: '/pictures',
        userData: '/userData',
        videos: '/videos',
      },
    };

    it('should initialize app state and update global context', async () => {
      const mockSet = vi.fn();
      const slice = createElectronAppSlice(mockSet as any, {} as any, {} as any);

      vi.mocked(electronSystemService.getAppState).mockResolvedValue(mockAppState);

      const swr = slice.useInitElectronAppState();

      await swr.mutate();

      expect(mockSet).toHaveBeenCalledWith(
        { appState: mockAppState, isAppStateInit: true },
        false,
        'initElectronAppState',
      );

      expect(globalAgentContextManager.updateContext).toHaveBeenCalledWith({
        desktopPath: mockAppState.userPath?.desktop,
        documentsPath: mockAppState.userPath?.documents,
        downloadsPath: mockAppState.userPath?.downloads,
        homePath: mockAppState.userPath?.home,
        musicPath: mockAppState.userPath?.music,
        picturesPath: mockAppState.userPath?.pictures,
        userDataPath: mockAppState.userPath?.userData,
        videosPath: mockAppState.userPath?.videos,
      });
    });

    it('should handle errors gracefully', async () => {
      const mockSet = vi.fn();
      const error = new Error('Failed to get app state');
      const slice = createElectronAppSlice(mockSet as any, {} as any, {} as any);

      vi.mocked(electronSystemService.getAppState).mockRejectedValue(error);

      const swr = slice.useInitElectronAppState();

      await expect(swr.mutate()).rejects.toThrow('Failed to get app state');

      expect(mockSet).not.toHaveBeenCalled();
      expect(globalAgentContextManager.updateContext).not.toHaveBeenCalled();
    });
  });
});
