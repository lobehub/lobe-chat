import { CustomPluginState, initialCustomPluginState } from './slices/customPlugin';
import { PluginState, initialPluginState } from './slices/plugin';
import { PluginStoreState as StoreState, initialPluginStoreState } from './slices/store';

export type PluginStoreState = PluginState & CustomPluginState & StoreState;

export const initialState: PluginStoreState = {
  ...initialPluginState,
  ...initialCustomPluginState,
  ...initialPluginStoreState,
};
