import { BuiltinToolState, initialBuiltinToolState } from './slices/builtin';
import { CustomPluginState, initialCustomPluginState } from './slices/customPlugin';
import { PluginState, initialPluginState } from './slices/plugin';
import { PluginStoreState, initialPluginStoreState } from './slices/store';

export type ToolStoreState = PluginState & CustomPluginState & PluginStoreState & BuiltinToolState;

export const initialState: ToolStoreState = {
  ...initialPluginState,
  ...initialCustomPluginState,
  ...initialPluginStoreState,
  ...initialBuiltinToolState,
};
