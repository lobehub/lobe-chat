import { pluginHelpers } from '../../helpers';
import type { ToolStoreState } from '../../initialState';

const isCustomPlugin = (id: string) => (s: ToolStoreState) =>
  pluginHelpers.isCustomPlugin(id, s.customPluginList);

export const customPluginSelectors = {
  isCustomPlugin,
};
