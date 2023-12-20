import { LobeTool } from '@/types/tool';

export type PluginsSettings = Record<string, any>;

export interface PluginState {
  installedPlugins: LobeTool[];
  loadingInstallPlugins: boolean;
  pluginsSettings: PluginsSettings;
}

export const initialPluginState: PluginState = {
  installedPlugins: [],
  loadingInstallPlugins: true,
  pluginsSettings: {},
};
