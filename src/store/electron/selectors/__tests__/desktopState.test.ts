import { describe, expect, it } from 'vitest';

import { ElectronState } from '@/store/electron/initialState';

import { desktopStateSelectors } from '../desktopState';

describe('desktopStateSelectors', () => {
  describe('usePath', () => {
    it('should return userPath from appState', () => {
      const state: ElectronState = {
        isAppStateInit: false,
        appState: {
          userPath: {
            desktop: '/test/desktop',
            documents: '/test/documents',
            downloads: '/test/downloads',
            home: '/test/home',
            music: '/test/music',
            pictures: '/test/pictures',
            userData: '/test/userdata',
            videos: '/test/videos',
          },
        },
        dataSyncConfig: {
          storageMode: 'local',
        },
        isInitRemoteServerConfig: false,
      };

      expect(desktopStateSelectors.usePath(state)).toEqual({
        desktop: '/test/desktop',
        documents: '/test/documents',
        downloads: '/test/downloads',
        home: '/test/home',
        music: '/test/music',
        pictures: '/test/pictures',
        userData: '/test/userdata',
        videos: '/test/videos',
      });
    });

    it('should handle undefined userPath', () => {
      const state: ElectronState = {
        appState: {},
        isAppStateInit: false,
        dataSyncConfig: {
          storageMode: 'local',
        },
        isInitRemoteServerConfig: false,
      };

      expect(desktopStateSelectors.usePath(state)).toBeUndefined();
    });
  });
});
