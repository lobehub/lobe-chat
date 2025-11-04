'use client';

import { StoreApiWithSelector } from '@lobechat/types';
import { createContext } from 'zustand-utils';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { createDevtools } from '@/store/middleware/createDevtools';

import { Store, store } from './action';
import { State } from './initialState';

export type { PublicState, State } from './initialState';

const devtools = createDevtools('chatInput');

export const createStore = (initState?: Partial<State>) =>
  createWithEqualityFn(subscribeWithSelector(devtools(store(initState))), shallow);

export const {
  useStore: useChatInputStore,
  useStoreApi,
  Provider,
} = createContext<StoreApiWithSelector<Store>>();

export { selectors } from './selectors';
