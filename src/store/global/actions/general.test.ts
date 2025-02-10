import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

import { globalService } from '@/services/global';
import { type SystemStatus } from '@/store/global/initialState';
import { LocaleMode } from '@/types/locale';
import { switchLang } from '@/utils/client/switchLang';

import { generalActionSlice } from './general';

vi.mock('@/utils/client/switchLang', () => ({
  switchLang: vi.fn(),
}));

vi.mock('@/services/global', () => ({
  globalService: {
    getLatestVersion: vi.fn(),
  },
}));

describe('generalActionSlice', () => {
  const mockStatusStorage = {
    getFromLocalStorage: vi.fn(),
    saveToLocalStorage: vi.fn(),
  };

  const createTestStore = () => {
    const store = create<any>()((set, get, api) => ({
      ...generalActionSlice(set, get, api),
      isStatusInit: true,
      status: {
        language: 'auto' as LocaleMode,
        inputHeight: 200,
        showSessionPanel: true,
      },
      statusStorage: mockStatusStorage,
    }));
    return store;
  };

  const useStore = createTestStore();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateSystemStatus', () => {
    it('should not update status when isStatusInit is false', () => {
      const store = create<any>()((set, get, api) => ({
        ...generalActionSlice(set, get, api),
        isStatusInit: false,
        status: { inputHeight: 200 },
        statusStorage: mockStatusStorage,
      }));

      store.getState().updateSystemStatus({ inputHeight: 300 });
      expect(mockStatusStorage.saveToLocalStorage).not.toBeCalled();
    });

    it('should update status and save to localStorage', () => {
      const newStatus: Partial<SystemStatus> = {
        inputHeight: 300,
        showSessionPanel: false,
      };

      useStore.getState().updateSystemStatus(newStatus);

      expect(mockStatusStorage.saveToLocalStorage).toBeCalledWith({
        language: 'auto',
        inputHeight: 300,
        showSessionPanel: false,
      });
    });

    it('should not update if new status is equal to current status', () => {
      const currentStatus = useStore.getState().status;
      useStore.getState().updateSystemStatus(currentStatus);

      expect(mockStatusStorage.saveToLocalStorage).not.toBeCalled();
    });

    it('should merge partial updates with existing status', () => {
      const partialUpdate = {
        inputHeight: 400,
      };

      useStore.getState().updateSystemStatus(partialUpdate);

      expect(mockStatusStorage.saveToLocalStorage).toBeCalledWith({
        language: 'auto',
        inputHeight: 400,
        showSessionPanel: false,
      });
    });
  });

  describe('switchLocale', () => {
    it('should update language in system status and call switchLang', () => {
      const locale: LocaleMode = 'zh-CN';
      useStore.getState().switchLocale(locale);

      expect(mockStatusStorage.saveToLocalStorage).toBeCalledWith(
        expect.objectContaining({
          language: locale,
        }),
      );
      expect(switchLang).toBeCalledWith(locale);
    });
  });
});
