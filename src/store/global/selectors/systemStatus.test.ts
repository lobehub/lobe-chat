import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { DatabaseLoadingState } from '@/types/clientDB';

import { INITIAL_STATUS } from '../initialState';
import * as selectors from './systemStatus';

// Mock version constants
vi.mock('@/const/version', () => ({
  isUsePgliteDB: true,
  isServerMode: false,
}));

describe('systemStatus selectors', () => {
  const mockStore = {
    status: {
      ...INITIAL_STATUS,
      expandSessionGroupKeys: ['test'],
      showSystemRole: true,
      mobileShowTopic: true,
      mobileShowPortal: true,
      showChatSideBar: true,
      zenMode: false,
      showSessionPanel: true,
      showFilePanel: true,
      hidePWAInstaller: true,
      sessionsWidth: 300,
      portalWidth: 500,
      filePanelWidth: 400,
      inputHeight: 100,
      threadInputHeight: 80,
      isEnablePglite: false,
    },
    isStatusInit: true,
    initClientDBStage: DatabaseLoadingState.Ready,
    sidebarKey: SidebarTabKey.Chat,
    statusStorage: {} as any,
  } as GlobalStore;

  it('should get sessionGroupKeys', () => {
    expect(selectors.sessionGroupKeys(mockStore)).toEqual(['test']);
  });

  it('should get showSystemRole', () => {
    expect(selectors.showSystemRole(mockStore)).toBe(true);
  });

  it('should get mobileShowTopic', () => {
    expect(selectors.mobileShowTopic(mockStore)).toBe(true);
  });

  it('should get mobileShowPortal', () => {
    expect(selectors.mobileShowPortal(mockStore)).toBe(true);
  });

  it('should get showChatSideBar', () => {
    expect(selectors.showChatSideBar(mockStore)).toBe(true);

    const mockStoreWithZenMode = {
      ...mockStore,
      status: {
        ...mockStore.status,
        zenMode: true,
      },
    } as GlobalStore;

    expect(selectors.showChatSideBar(mockStoreWithZenMode)).toBe(false);
  });

  it('should get showSessionPanel', () => {
    expect(selectors.showSessionPanel(mockStore)).toBe(true);

    const mockStoreWithZenMode = {
      ...mockStore,
      status: {
        ...mockStore.status,
        zenMode: true,
      },
    } as GlobalStore;

    expect(selectors.showSessionPanel(mockStoreWithZenMode)).toBe(false);
  });

  it('should get showFilePanel', () => {
    expect(selectors.showFilePanel(mockStore)).toBe(true);
  });

  it('should get hidePWAInstaller', () => {
    expect(selectors.hidePWAInstaller(mockStore)).toBe(true);
  });

  it('should get showChatHeader', () => {
    expect(selectors.showChatHeader(mockStore)).toBe(true);

    const mockStoreWithZenMode = {
      ...mockStore,
      status: {
        ...mockStore.status,
        zenMode: true,
      },
    } as GlobalStore;

    expect(selectors.showChatHeader(mockStoreWithZenMode)).toBe(false);
  });

  it('should get inZenMode', () => {
    expect(selectors.inZenMode(mockStore)).toBe(false);
  });

  it('should get sessionWidth', () => {
    expect(selectors.sessionWidth(mockStore)).toBe(300);
  });

  it('should get portalWidth with default', () => {
    // Cast to avoid type error with undefined portalWidth
    const mockStoreWithoutPortalWidth = {
      ...mockStore,
      status: {
        ...mockStore.status,
        portalWidth: undefined,
      },
    } as any as GlobalStore;
    expect(selectors.portalWidth(mockStoreWithoutPortalWidth)).toBe(400);
  });

  it('should get portalWidth', () => {
    expect(selectors.portalWidth(mockStore)).toBe(500);
  });

  it('should get filePanelWidth', () => {
    expect(selectors.filePanelWidth(mockStore)).toBe(400);
  });

  it('should get inputHeight', () => {
    expect(selectors.inputHeight(mockStore)).toBe(100);
  });

  it('should get threadInputHeight', () => {
    expect(selectors.threadInputHeight(mockStore)).toBe(80);
  });

  describe('isPgliteNotEnabled', () => {
    it('should return true when conditions are met', () => {
      const store = {
        ...mockStore,
        status: {
          ...mockStore.status,
          isEnablePglite: false,
        },
        isStatusInit: true,
      } as GlobalStore;

      expect(selectors.isPgliteNotEnabled(store)).toBe(true);
    });

    it('should return false when isStatusInit is false', () => {
      const store = {
        ...mockStore,
        isStatusInit: false,
      } as GlobalStore;
      expect(selectors.isPgliteNotEnabled(store)).toBe(false);
    });
  });

  describe('isPgliteNotInited', () => {
    it('should return true when conditions are met', () => {
      const store = {
        ...mockStore,
        status: {
          ...mockStore.status,
          isEnablePglite: true,
        },
        isStatusInit: true,
        initClientDBStage: DatabaseLoadingState.Initializing,
      } as GlobalStore;

      expect(selectors.isPgliteNotInited(store)).toBe(true);
    });

    it('should return false when isStatusInit is false', () => {
      const store = {
        ...mockStore,
        isStatusInit: false,
      } as GlobalStore;
      expect(selectors.isPgliteNotInited(store)).toBe(false);
    });
  });

  describe('isPgliteInited', () => {
    it('should return true when conditions are met', () => {
      const store = {
        ...mockStore,
        status: {
          ...mockStore.status,
          isEnablePglite: true,
        },
        initClientDBStage: DatabaseLoadingState.Ready,
      } as GlobalStore;
      expect(selectors.isPgliteInited(store)).toBe(true);
    });

    it('should return false when not ready', () => {
      const store = {
        ...mockStore,
        initClientDBStage: DatabaseLoadingState.Initializing,
      } as GlobalStore;
      expect(selectors.isPgliteInited(store)).toBe(false);
    });
  });

  describe('isDBInited', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return true when pglite is inited', () => {
      const store = {
        ...mockStore,
        status: {
          ...mockStore.status,
          isEnablePglite: true,
        },
        initClientDBStage: DatabaseLoadingState.Ready,
      } as GlobalStore;
      expect(selectors.isDBInited(store)).toBe(true);
    });

    it('should return true when not using pglite', async () => {
      vi.doMock('@/const/version', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@/const/version')>();
        return {
          ...actual,
          isUsePgliteDB: false,
        };
      });

      const reloadedSelectors = await import('./systemStatus');
      expect(reloadedSelectors.isDBInited(mockStore)).toBe(true);
    });
  });
});
