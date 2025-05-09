import { ElectronAppState } from '@lobechat/electron-client-ipc';
import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useOnlyFetchOnceSWR } from '@/libs/swr';
// Import for type usage
import { electronSystemService } from '@/services/electron/system';
import { globalAgentContextManager } from '@/utils/client/GlobalAgentContextManager';

import { ElectronStore } from '../store';

// Import the new service

// ======== State ======== //

// Note: Actual state is defined in initialState.ts and ElectronState interface

// ======== Action Interface ======== //

export interface ElectronAppAction {
  /**
   * Initializes the basic Electron application state, including system info and special paths.
   * Should be called once when the application starts.
   */
  useInitElectronAppState: () => SWRResponse<ElectronAppState>;
}

// ======== Action Implementation ======== //

export const createElectronAppSlice: StateCreator<
  ElectronStore,
  [['zustand/devtools', never]],
  [],
  ElectronAppAction
> = (set) => ({
  useInitElectronAppState: () =>
    useOnlyFetchOnceSWR<ElectronAppState>(
      'initElectronAppState',
      async () => electronSystemService.getAppState(),
      {
        onSuccess: (result) => {
          set({ appState: result, isAppStateInit: true }, false, 'initElectronAppState');

          // Update the global agent context manager with relevant paths
          // We typically only need paths in the agent context for now.
          globalAgentContextManager.updateContext({
            desktopPath: result.userPath!.desktop,
            documentsPath: result.userPath!.documents,
            downloadsPath: result.userPath!.downloads,
            homePath: result.userPath!.home,
            musicPath: result.userPath!.music,
            picturesPath: result.userPath!.pictures,
            userDataPath: result.userPath!.userData,
            videosPath: result.userPath!.videos,
          });
        },
      },
    ),
});
