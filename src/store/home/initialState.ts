import { AgentListState, initialAgentListState } from './slices/agentList/initialState';
import { HomeInputState, initialHomeInputState } from './slices/homeInput/initialState';
import { RecentState, initialRecentState } from './slices/recent/initialState';
import { SidebarUIState, initialSidebarUIState } from './slices/sidebarUI/initialState';

export interface HomeStoreState
  extends AgentListState, RecentState, HomeInputState, SidebarUIState {}

export const initialState: HomeStoreState = {
  ...initialAgentListState,
  ...initialRecentState,
  ...initialHomeInputState,
  ...initialSidebarUIState,
};
