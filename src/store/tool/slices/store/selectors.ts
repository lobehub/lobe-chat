import type { ToolStoreState } from '../../initialState';

const onlinePluginStore = (s: ToolStoreState) => {
  if (s.listType === 'all') return s.pluginStoreList;

  const installedPluginIds = new Set(s.installedPlugins.map((i) => i.identifier));

  return s.pluginStoreList.filter((p) => installedPluginIds.has(p.identifier));
};

const isPluginInstallLoading = (id: string) => (s: ToolStoreState) => s.pluginInstallLoading[id];

const getPluginById = (id: string) => (s: ToolStoreState) => {
  return s.pluginStoreList.find((i) => i.identifier === id);
};

export const pluginStoreSelectors = {
  getPluginById,
  isPluginInstallLoading,
  onlinePluginStore,
};
