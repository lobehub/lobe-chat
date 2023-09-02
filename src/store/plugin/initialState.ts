import { CustomPluginState, initialCustomPluginState } from './slices/customPlugin';
import { PluginState, initialPluginState } from './slices/plugin';

export type PluginStoreState = PluginState & CustomPluginState;

export const initialState: PluginStoreState = {
  ...initialPluginState,
  ...initialCustomPluginState,
};
