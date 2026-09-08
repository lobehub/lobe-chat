export const desktopStateSelectors = {
  displayRelativePath: () => undefined,
  userHomePath: () => undefined,
  userPath: () => undefined,
};

export const desktopHotkeysSelectors = {
  hotkeys: () => ({}),
  isHotkeysInit: () => false,
};

export const electronSyncSelectors = {
  isOfficialServer: () => false,
  isSyncActive: () => false,
  rawRemoteServerUrl: () => undefined,
  remoteServerUrl: () => '',
  storageMode: () => 'cloud',
};
