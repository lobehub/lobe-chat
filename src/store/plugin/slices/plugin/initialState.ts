import { PluginManifestMap } from '@/types/plugin';

export type PluginsSettings = Record<string, any>;

export interface PluginState {
  manifestPrepared: boolean;
  pluginManifestMap: PluginManifestMap;
  pluginsSettings: PluginsSettings;
}

export const initialPluginState: PluginState = {
  manifestPrepared: false,
  pluginManifestMap: {},
  pluginsSettings: {},
};
