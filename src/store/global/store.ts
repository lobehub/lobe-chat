import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { type GlobalClientDBAction, clientDBSlice } from './actions/clientDb';
import { type GlobalGeneralAction, generalActionSlice } from './actions/general';
import { type GlobalWorkspacePaneAction, globalWorkspaceSlice } from './actions/workspacePane';
import { type GlobalState, initialState } from './initialState';
import { type SettingsSlice, createSettingsSlice } from './slices/settings'; // Added for SettingsSlice

//  ===============  聚合 createStoreFn ============ //

export interface GlobalStore
  extends GlobalState,
    GlobalWorkspacePaneAction,
    GlobalClientDBAction,
    GlobalGeneralAction,
    SettingsSlice { // Added SettingsSlice
  /* empty */
}

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...globalWorkspaceSlice(...parameters),
  ...clientDBSlice(...parameters),
  ...generalActionSlice(...parameters),
  ...createSettingsSlice(...parameters), // Added createSettingsSlice
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('global');

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow,
);
