const emptyObject = {};
const emptyArray: never[] = [];
const noop = async () => undefined;

const emptyState = {
  activeRecentScope: undefined,
  activeTabId: null,
  activeTabScope: undefined,
  addTab: noop,
  appState: emptyObject,
  appTrayVisible: false,
  autoRenameTopicTitle: noop,
  connectGateway: noop,
  currentRouteMeta: null,
  currentRouteMetaUrl: null,
  dataSyncConfig: emptyObject,
  desktopHotkeys: emptyObject,
  duplicateTopic: noop,
  favoriteTopic: noop,
  gatewayConnectionStatus: 'disconnected',
  gatewayDeviceInfo: undefined,
  isAppStateInit: false,
  isConnectingServer: false,
  isConnectionDrawerOpen: false,
  isDesktopHotkeysInit: false,
  isDevicesInit: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
  markTopicCompleted: noop,
  migrateLocalRecentsToDevice: noop,
  openTopicInNewWindow: noop,
  pinnedPageBuckets: emptyObject,
  pinnedPages: emptyArray,
  proxySettings: emptyObject,
  recentPageBuckets: emptyObject,
  recentPages: emptyArray,
  remoteServerSyncError: undefined,
  removeTopic: noop,
  setCurrentRouteMeta: noop,
  splitView: null,
  tabs: emptyArray,
  useFetchGatewayDeviceInfo: noop,
};

// Renderable stand-in, not a throwing proxy: shared components call the hook
// during render and must see "desktop features off", not a crash.
export const useElectronStore = <T = unknown>(selector?: (state: typeof emptyState) => T): T =>
  selector ? selector(emptyState) : (emptyState as T);

useElectronStore.getState = () => emptyState;

export const getElectronStoreState = () => emptyState;
