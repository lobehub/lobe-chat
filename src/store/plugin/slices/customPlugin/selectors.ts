import { pluginHelpers } from '../../helpers';
import type { PluginStoreState } from '../../initialState';

const isCustomPlugin = (id: string) => (s: PluginStoreState) =>
  pluginHelpers.isCustomPlugin(id, s.customPluginList);

export const customPluginSelectors = {
  isCustomPlugin,
};
