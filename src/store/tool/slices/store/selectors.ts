import type { ToolStoreState } from '../../initialState';

const installedPlugins = (s: ToolStoreState) => Object.values(s.pluginManifestMap);

const onlinePluginStore = (s: ToolStoreState) => {
  if (s.listType === 'all') return s.pluginList;

  const installedPluginIds = Object.keys(s.pluginManifestMap);

  return s.pluginList.filter((p) => installedPluginIds.includes(p.identifier));
};

const isPluginInstalled = (id: string) => (s: ToolStoreState) => !!s.pluginManifestMap[id];
const isPluginInstallLoading = (id: string) => (s: ToolStoreState) => s.pluginInstallLoading[id];

export const pluginStoreSelectors = {
  installedPlugins,
  isPluginInstallLoading,
  isPluginInstalled,
  onlinePluginStore,
};
