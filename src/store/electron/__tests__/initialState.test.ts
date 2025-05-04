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
    // Test that optional properties are undefined by default
    expect(initialState.remoteServerSyncError).toBeUndefined();
  });
});
