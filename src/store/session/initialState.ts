import { HomeInputState, initialHomeInputState } from './slices/homeInput/initialState';
import { RecentState, initialRecentState } from './slices/recent/initialState';
import { SessionState, initialSessionState } from './slices/session/initialState';
import { SessionGroupState, initSessionGroupState } from './slices/sessionGroup/initialState';

export interface SessionStoreState
  extends SessionGroupState, SessionState, RecentState, HomeInputState {}

export const initialState: SessionStoreState = {
  ...initSessionGroupState,
  ...initialSessionState,
  ...initialRecentState,
  ...initialHomeInputState,
};
