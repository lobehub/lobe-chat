import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_FEATURE_FLAGS } from '@/config/featureFlags';

import { ServerConfigStore, createServerConfigStore, initServerConfigStore } from './store';

describe('createServerConfigStore', () => {
  beforeEach(() => {
    // 每个测试用例前重置模块状态
    vi.resetModules();
  });

  it('should create a singleton store', () => {
    const store1 = createServerConfigStore();
    const store2 = createServerConfigStore();

    expect(store1).toBe(store2);
  });

  it('should initialize store with default state', () => {
    const store = createServerConfigStore();

    expect(store.getState()).toEqual({
      featureFlags: DEFAULT_FEATURE_FLAGS,
      serverConfig: { telemetry: {}, aiProvider: {} },
    });
  });

  it('should initialize store with custom initial state', () => {
    const initialState: Partial<ServerConfigStore> = {
      featureFlags: { edit_agent: false },
      serverConfig: { telemetry: { langfuse: true }, aiProvider: {} },
    };

    const store = initServerConfigStore(initialState);

    expect(store.getState().featureFlags.edit_agent).toBeFalsy();
    expect(store.getState().serverConfig).toEqual({
      telemetry: { langfuse: true },
      aiProvider: {},
    });
  });

  it('should update store state correctly', () => {
    const store = createServerConfigStore();

    act(() => {
      store.setState({ featureFlags: { dalle: false } });
    });

    expect(store.getState().featureFlags.dalle).toBeFalsy();
  });
});
