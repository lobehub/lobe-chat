const emptyObject = {};
const emptyArray: never[] = [];
const noop = () => undefined;

const emptyState = {
  addTab: noop,
  autoRenameTopicTitle: noop,
  connectGateway: noop,
  duplicateTopic: noop,
  favoriteTopic: noop,
  isDevicesInit: false,
  markTopicCompleted: noop,
  migrateLocalRecentsToDevice: noop,
  openTopicInNewWindow: noop,
  removeTopic: noop,
  setCurrentRouteMeta: noop,
  useFetchGatewayDeviceInfo: noop,
  activeRecentScope: undefined,
  activeTabId: null,
  activeTabScope: undefined,
  appState: emptyObject,
  appTrayVisible: false,
  currentRouteMeta: null,
  currentRouteMetaUrl: null,
  dataSyncConfig: emptyObject,
  desktopHotkeys: emptyObject,
  gatewayConnectionStatus: 'disconnected',
  gatewayDeviceInfo: undefined,
  isAppStateInit: false,
  isConnectingServer: false,
  isConnectionDrawerOpen: false,
  isDesktopHotkeysInit: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
  pinnedPageBuckets: emptyObject,
  pinnedPages: emptyArray,
  proxySettings: emptyObject,
  recentPageBuckets: emptyObject,
  recentPages: emptyArray,
  remoteServerSyncError: undefined,
  splitView: null,
  tabs: emptyArray,
};

// Renderable stand-in, not a throwing proxy: shared components call the hook
// during render and must see "desktop features off", not a crash.
export const useElectronStore = <T = unknown>(selector?: (state: typeof emptyState) => T): T =>
  selector ? selector(emptyState) : (emptyState as T);

useElectronStore.getState = () => emptyState;

export const getElectronStoreState = () => emptyState;
