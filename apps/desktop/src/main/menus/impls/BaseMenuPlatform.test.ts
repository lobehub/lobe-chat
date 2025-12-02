import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';

import { BaseMenuPlatform } from './BaseMenuPlatform';

// Create a concrete implementation for testing
class TestMenuPlatform extends BaseMenuPlatform {}

// Mock App instance
const mockApp = {
  i18n: {
    ns: vi.fn(),
  },
  browserManager: {
    getMainWindow: vi.fn(),
    showMainWindow: vi.fn(),
    retrieveByIdentifier: vi.fn(),
  },
  updaterManager: {
    checkForUpdates: vi.fn(),
  },
  menuManager: {
    rebuildAppMenu: vi.fn(),
  },
  storeManager: {
    openInEditor: vi.fn(),
  },
} as unknown as App;

describe('BaseMenuPlatform', () => {
  let menuPlatform: TestMenuPlatform;

  beforeEach(() => {
    vi.clearAllMocks();
    menuPlatform = new TestMenuPlatform(mockApp);
  });

  describe('constructor', () => {
    it('should initialize with app instance', () => {
      expect(menuPlatform['app']).toBe(mockApp);
    });

    it('should store app reference for subclasses', () => {
      const anotherInstance = new TestMenuPlatform(mockApp);
      expect(anotherInstance['app']).toBe(mockApp);
    });
  });
});
