import type { MCPSliceState } from './slices/mcp/initialState';
import { initialMCPSliceState } from './slices/mcp/initialState';
import type { ModelSliceState } from './slices/model/initialState';
import { initialModelSliceState } from './slices/model/initialState';
import type { ProviderSliceState } from './slices/provider/initialState';
import { initialProviderSliceState } from './slices/provider/initialState';

/**
 * State of the discover (marketplace) store: the replica views of its slices,
 * plus each slice's bookkeeping. Slices add their own actions on top.
 */
export type DiscoverStoreState = MCPSliceState & ModelSliceState & ProviderSliceState;

export const initialState: DiscoverStoreState = {
  ...initialMCPSliceState,
  ...initialModelSliceState,
  ...initialProviderSliceState,
};
