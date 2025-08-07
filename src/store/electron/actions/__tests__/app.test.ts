import { ElectronAppState } from '@lobechat/electron-client-ipc';
import { SWRResponse } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { electronSystemService } from '@/services/electron/system';
import { ElectronStore } from '@/store/electron/store';
import { globalAgentContextManager } from '@/utils/client/GlobalAgentContextManager';

import { createElectronAppSlice } from '../app';

vi.mock('@/utils/client/GlobalAgentContextManager');
vi.mock('@/services/electron/system');

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

const mockSWRResponse: SWRResponse<ElectronAppState, Error> = {
  data: mockAppState,
  error: undefined,
  isLoading: false,
  isValidating: false,
  mutate: vi.fn(),
};

vi.mock('@/libs/swr', () => ({
  useOnlyFetchOnceSWR: (key: string, fetcher: () => Promise<any>, config: any) => {
    if (config?.onSuccess) {
      config.onSuccess(mockAppState);
    }
    return mockSWRResponse;
  },
}));

describe('createElectronAppSlice', () => {
  const mockSet = vi.fn();
  const mockGetState = vi.fn();
  const mockStore = {
    getState: mockGetState,
    setState: mockSet,
    subscribe: vi.fn(),
    getInitialState: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(electronSystemService.getAppState).mockResolvedValue(mockAppState);
  });

  it('should initialize electron app state correctly', () => {
    const slice = createElectronAppSlice(mockSet, mockStore as any, {} as any);
    const result = slice.useInitElectronAppState();

    expect(result).toEqual(mockSWRResponse);

    expect(mockSet).toHaveBeenCalledWith(
      { appState: mockAppState, isAppStateInit: true },
      false,
      'initElectronAppState',
    );

    expect(globalAgentContextManager.updateContext).toHaveBeenCalledWith({
      desktopPath: '/desktop',
      documentsPath: '/documents',
      downloadsPath: '/downloads',
      homePath: '/home',
      musicPath: '/music',
      picturesPath: '/pictures',
      userDataPath: '/userData',
      videosPath: '/videos',
    });
  });
});
