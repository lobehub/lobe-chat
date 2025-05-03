import { describe, expect, it } from 'vitest';

import { initialState } from '../initialState';

describe('initialState', () => {
  it('should have correct initial values', () => {
    expect(initialState).toEqual({
      appState: {},
      dataSyncConfig: { storageMode: 'local' },
      isAppStateInit: false,
      isConnectingServer: false,
      isInitRemoteServerConfig: false,
      isSyncActive: false,
    });
  });

  it('should match ElectronState interface', () => {
    // Verify optional properties
    expect(initialState.isConnectingServer).toBeDefined();
    expect(initialState.isSyncActive).toBeDefined();
    expect(initialState.remoteServerSyncError).toBeUndefined();

    // Verify required properties
    expect(initialState.appState).toBeDefined();
    expect(initialState.dataSyncConfig).toBeDefined();
    expect(initialState.isAppStateInit).toBeDefined();
    expect(initialState.isInitRemoteServerConfig).toBeDefined();
  });

  it('should have correct dataSyncConfig', () => {
    expect(initialState.dataSyncConfig).toEqual({
      storageMode: 'local',
    });
  });
});
