import type { MCPSliceState } from './slices/mcp/initialState';
import { initialMCPSliceState } from './slices/mcp/initialState';
import type { PluginSliceState } from './slices/plugin/initialState';
import { initialPluginSliceState } from './slices/plugin/initialState';
import type { ProviderSliceState } from './slices/provider/initialState';
import { initialProviderSliceState } from './slices/provider/initialState';

/**
 * State of the discover (marketplace) store: the replica views of its slices,
 * plus each slice's bookkeeping. Slices add their own actions on top.
 */
export type DiscoverStoreState = MCPSliceState & PluginSliceState & ProviderSliceState;

export const initialState: DiscoverStoreState = {
  ...initialMCPSliceState,
  ...initialPluginSliceState,
  ...initialProviderSliceState,
};
