import type { AssistantSliceState } from './slices/assistant/initialState';
import { initialAssistantSliceState } from './slices/assistant/initialState';
import type { GroupAgentSliceState } from './slices/groupAgent/initialState';
import { initialGroupAgentSliceState } from './slices/groupAgent/initialState';
import type { MCPSliceState } from './slices/mcp/initialState';
import { initialMCPSliceState } from './slices/mcp/initialState';
import type { PluginSliceState } from './slices/plugin/initialState';
import { initialPluginSliceState } from './slices/plugin/initialState';
import type { ProviderSliceState } from './slices/provider/initialState';
import { initialProviderSliceState } from './slices/provider/initialState';
import type { SocialSliceState } from './slices/social/initialState';
import { initialSocialSliceState } from './slices/social/initialState';
import type { UserSliceState } from './slices/user/initialState';
import { initialUserSliceState } from './slices/user/initialState';

/**
 * State of the discover (marketplace) store: the replica views of its slices,
 * plus each slice's bookkeeping. Slices add their own actions on top.
 */
export type DiscoverStoreState = AssistantSliceState & GroupAgentSliceState & MCPSliceState & PluginSliceState & ProviderSliceState & SocialSliceState & UserSliceState;

export const initialState: DiscoverStoreState = {
  ...initialAssistantSliceState,
  ...initialGroupAgentSliceState,
  ...initialMCPSliceState,
  ...initialPluginSliceState,
  ...initialProviderSliceState,
  ...initialSocialSliceState,
  ...initialUserSliceState,
};
