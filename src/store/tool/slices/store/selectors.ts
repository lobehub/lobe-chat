import { InstallPluginMeta } from '@/types/tool/plugin';

import type { ToolStoreState } from '../../initialState';

const onlinePluginStore = (s: ToolStoreState) => {
  const installedPluginIds = new Set(s.installedPlugins.map((i) => i.identifier));
  const list =
    s.listType === 'all'
      ? s.pluginStoreList
      : s.pluginStoreList.filter((p) => installedPluginIds.has(p.identifier));

  return list.map<InstallPluginMeta>((p) => ({
    author: p.author,
    createdAt: p.createdAt,
    homepage: p.homepage,
    identifier: p.identifier,
    meta: p.meta,
    type: 'plugin',
  }));
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
