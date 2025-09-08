import { describe, expect, it, vi } from 'vitest';

import { DatabaseLoadingState } from '@/types/clientDB';
import { merge } from '@/utils/merge';

import { GlobalState, INITIAL_STATUS, initialState } from '../initialState';
import { systemStatusSelectors } from './systemStatus';

// Mock version constants
vi.mock('@/const/version', () => ({
  isServerMode: false,
  isUsePgliteDB: true,
}));

describe('systemStatusSelectors', () => {
  describe('sessionGroupKeys', () => {
    it('should return expandSessionGroupKeys from status', () => {
      const s: GlobalState = merge(initialState, {
        status: {
          expandSessionGroupKeys: ['group1', 'group2'],
        },
      });
      expect(systemStatusSelectors.sessionGroupKeys(s)).toEqual(['group1', 'group2']);
    });

    it('should return initial value if not set', () => {
      const s: GlobalState = merge(initialState, {
        status: {
          expandSessionGroupKeys: undefined,
        },
      });
      expect(systemStatusSelectors.sessionGroupKeys(s)).toEqual(
        INITIAL_STATUS.expandSessionGroupKeys,
      );
    });
  });

  describe('basic selectors', () => {
    const s: GlobalState = merge(initialState, {
      status: {
        showSystemRole: true,
        mobileShowTopic: true,
        mobileShowPortal: true,
        showChatSideBar: true,
        showSessionPanel: true,
        showFilePanel: true,
        hidePWAInstaller: true,
        isShowCredit: true,
        zenMode: false,
        sessionsWidth: 300,
        portalWidth: 500,
        filePanelWidth: 400,
        inputHeight: 150,
        threadInputHeight: 100,
      },
    });

    it('should return correct values for basic selectors', () => {
      expect(systemStatusSelectors.showSystemRole(s)).toBe(true);
      expect(systemStatusSelectors.mobileShowTopic(s)).toBe(true);
      expect(systemStatusSelectors.mobileShowPortal(s)).toBe(true);
      expect(systemStatusSelectors.showChatSideBar(s)).toBe(true);
      expect(systemStatusSelectors.showSessionPanel(s)).toBe(true);
      expect(systemStatusSelectors.showFilePanel(s)).toBe(true);
      expect(systemStatusSelectors.hidePWAInstaller(s)).toBe(true);
      expect(systemStatusSelectors.isShowCredit(s)).toBe(true);
      expect(systemStatusSelectors.showChatHeader(s)).toBe(true);
      expect(systemStatusSelectors.inZenMode(s)).toBe(false);
      expect(systemStatusSelectors.sessionWidth(s)).toBe(300);
      expect(systemStatusSelectors.portalWidth(s)).toBe(500);
      expect(systemStatusSelectors.filePanelWidth(s)).toBe(400);
      expect(systemStatusSelectors.wideScreen(s)).toBe(true);
    });

    it('should handle zen mode effects', () => {
      const zenState = merge(s, {
        status: { zenMode: true },
      });
      expect(systemStatusSelectors.showChatSideBar(zenState)).toBe(false);
      expect(systemStatusSelectors.showSessionPanel(zenState)).toBe(false);
      expect(systemStatusSelectors.showChatHeader(zenState)).toBe(false);
    });

    it('should return default portal width if not set', () => {
      const noPortalWidth = merge(initialState, {
        status: { portalWidth: undefined },
      });
      expect(systemStatusSelectors.portalWidth(noPortalWidth)).toBe(400);
    });
  });

  describe('theme mode', () => {
    it('should return the correct theme', () => {
      const s: GlobalState = merge(initialState, {
        status: {
          themeMode: 'light',
        },
      });
      expect(systemStatusSelectors.themeMode(s)).toBe('light');
    });

    it('should return auto if not set', () => {
      const s: GlobalState = merge(initialState, {
        status: {
          themeMode: undefined,
        },
      });
      expect(systemStatusSelectors.themeMode(s)).toBe('auto');
    });
  });

  describe('pglite status selectors', () => {
    describe('isPgliteNotEnabled', () => {
      it('should return true when conditions are met', () => {
        const s: GlobalState = {
          ...initialState,
          isStatusInit: true,
          status: {
            ...initialState.status,
            isEnablePglite: false,
          },
        };
        expect(systemStatusSelectors.isPgliteNotEnabled(s)).toBe(true);
      });

      it('should return false when isStatusInit is false', () => {
        const s: GlobalState = {
          ...initialState,
          isStatusInit: false,
          status: {
            ...initialState.status,
            isEnablePglite: false,
          },
        };
        expect(systemStatusSelectors.isPgliteNotEnabled(s)).toBe(false);
      });
    });

    describe('isPgliteNotInited', () => {
      it('should return true when pglite is enabled but not ready', () => {
        const s: GlobalState = {
          ...initialState,
          isStatusInit: true,
          status: {
            ...initialState.status,
            isEnablePglite: true,
          },
          initClientDBStage: DatabaseLoadingState.Initializing,
        };
        expect(systemStatusSelectors.isPgliteNotInited(s)).toBe(true);
      });

      it('should return false when pglite is ready', () => {
        const s: GlobalState = {
          ...initialState,
          isStatusInit: true,
          status: {
            ...initialState.status,
            isEnablePglite: true,
          },
          initClientDBStage: DatabaseLoadingState.Ready,
        };
        expect(systemStatusSelectors.isPgliteNotInited(s)).toBe(false);
      });

      it('should return false when pglite is not enabled', () => {
        const s: GlobalState = {
          ...initialState,
          isStatusInit: true,
          status: {
            ...initialState.status,
            isEnablePglite: false,
          },
          initClientDBStage: DatabaseLoadingState.Initializing,
        };
        expect(systemStatusSelectors.isPgliteNotInited(s)).toBe(false);
      });
    });

    describe('isPgliteInited', () => {
      it('should return true when pglite is enabled and ready', () => {
        const s: GlobalState = {
          ...initialState,
          isStatusInit: true,
          status: {
            ...initialState.status,
            isEnablePglite: true,
          },
          initClientDBStage: DatabaseLoadingState.Ready,
        };
        expect(systemStatusSelectors.isPgliteInited(s)).toBe(true);
      });

      it('should return false when not ready', () => {
        const s: GlobalState = {
          ...initialState,
          isStatusInit: true,
          status: {
            ...initialState.status,
            isEnablePglite: true,
          },
          initClientDBStage: DatabaseLoadingState.Initializing,
        };
        expect(systemStatusSelectors.isPgliteInited(s)).toBe(false);
      });
    });
  });
});
