import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { SessionStoreState, initialState } from './initialState';
import { SessionAction, createSessionSlice } from './slices/session/action';
import { SessionGroupAction, createSessionGroupSlice } from './slices/sessionGroup/action';

//  ===============  聚合 createStoreFn ============ //

export interface SessionStore extends SessionAction, SessionGroupAction, SessionStoreState {}

const createStore: StateCreator<SessionStore> = (...parameters) => ({
  ...initialState,
  ...createSessionSlice(...parameters),
  ...createSessionGroupSlice(...parameters),
});

//  ===============  implement useStore ============ //

export const useSessionStore = createWithEqualityFn<SessionStore>()(
  subscribeWithSelector(
    // TODO: RN端暂未实现此功能 - devtools中间件，需要替换为persist中间件
    // devtools(createStore, {
    //   name: 'LobeChat_Session' + (isDev ? '_DEV' : ''),
    // }),
    createStore,
  ),
  shallow,
);

export const getSessionStoreState = () => useSessionStore.getState();
