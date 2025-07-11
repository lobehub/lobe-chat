import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { type ElectronAppAction, createElectronAppSlice } from './actions/app';
import { type ClaudeCodeAction, createClaudeCodeSlice } from './claudeCode/action';
import { type ElectronRemoteServerAction, remoteSyncSlice } from './actions/sync';
import { type ElectronState, initialState } from './initialState';

//  ===============  聚合 createStoreFn ============ //

export interface ElectronStore
  extends ElectronState,
    ElectronRemoteServerAction,
    ElectronAppAction,
    ClaudeCodeAction {
  /* empty */
}

const createStore: StateCreator<ElectronStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...remoteSyncSlice(...parameters),
  ...createElectronAppSlice(...parameters),
  ...createClaudeCodeSlice(...parameters),
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('electron');

export const useElectronStore = createWithEqualityFn<ElectronStore>()(
  devtools(createStore),
  shallow,
);

export const getElectronStoreState = () => useElectronStore.getState();
