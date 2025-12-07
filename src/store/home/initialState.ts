import { AgentListState, initialAgentListState } from './slices/agentList/initialState';
import { HomeInputState, initialHomeInputState } from './slices/homeInput/initialState';
import { RecentState, initialRecentState } from './slices/recent/initialState';

export interface HomeStoreState extends AgentListState, RecentState, HomeInputState {}

export const initialState: HomeStoreState = {
  ...initialAgentListState,
  ...initialRecentState,
  ...initialHomeInputState,
};
