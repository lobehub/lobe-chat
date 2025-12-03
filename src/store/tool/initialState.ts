import { BuiltinToolState, initialBuiltinToolState } from './slices/builtin';
import { CustomPluginState, initialCustomPluginState } from './slices/customPlugin';
import { KlavisStoreState, initialKlavisStoreState } from './slices/klavisStore';
import { MCPStoreState, initialMCPStoreState } from './slices/mcpStore';
import { PluginState, initialPluginState } from './slices/plugin';
import { PluginStoreState, initialPluginStoreState } from './slices/oldStore';

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
