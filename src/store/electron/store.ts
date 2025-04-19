import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { type ElectronRemoteServerAction, remoteSyncSlice } from './actions/sync';
import { type ElectronState, initialState } from './initialState';

//  ===============  聚合 createStoreFn ============ //

export interface ElectronStore extends ElectronState, ElectronRemoteServerAction {
  /* empty */
}

const createStore: StateCreator<ElectronStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...remoteSyncSlice(...parameters),
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('electron');

export const useElectronStore = createWithEqualityFn<ElectronStore>()(
  devtools(createStore),
  shallow,
);
