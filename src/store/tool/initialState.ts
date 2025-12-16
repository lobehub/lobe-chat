import { BuiltinToolState, initialBuiltinToolState } from './slices/builtin/initialState';
import { CustomPluginState, initialCustomPluginState } from './slices/customPlugin/initialState';
import { KlavisStoreState, initialKlavisStoreState } from './slices/klavisStore/initialState';
import { MCPStoreState, initialMCPStoreState } from './slices/mcpStore/initialState';
import { PluginStoreState, initialPluginStoreState } from './slices/oldStore/initialState';
import { PluginState, initialPluginState } from './slices/plugin/initialState';

export type ToolStoreState = PluginState &
  CustomPluginState &
  PluginStoreState &
  BuiltinToolState &
  MCPStoreState &
  KlavisStoreState;

export const initialState: ToolStoreState = {
  ...initialPluginState,
  ...initialCustomPluginState,
  ...initialPluginStoreState,
  ...initialBuiltinToolState,
  ...initialMCPStoreState,
  ...initialKlavisStoreState,
};
