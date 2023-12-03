import type { PluginStoreState } from '../../initialState';

const installedPlugins = (s: PluginStoreState) => Object.values(s.pluginManifestMap);

const onlinePluginStore = (s: PluginStoreState) => {
  if (s.listType === 'all') return s.pluginList;

  const installedPluginIds = Object.keys(s.pluginManifestMap);

  return s.pluginList.filter((p) => installedPluginIds.includes(p.identifier));
};

const isPluginInstalled = (id: string) => (s: PluginStoreState) => !!s.pluginManifestMap[id];
const isPluginInstallLoading = (id: string) => (s: PluginStoreState) => s.pluginInstallLoading[id];

export const pluginStoreSelectors = {
  installedPlugins,
  isPluginInstallLoading,
  isPluginInstalled,
  onlinePluginStore,
};
