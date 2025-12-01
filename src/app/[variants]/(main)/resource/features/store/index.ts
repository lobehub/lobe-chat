'use client';

import { createContext } from 'zustand-utils';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { StoreApiWithSelector } from '@/types/index';

import { Store, store } from './action';
import { State } from './initialState';

export type { State } from './initialState';

export const createStore = (initState?: Partial<State>) =>
  createWithEqualityFn(subscribeWithSelector(store(initState)), shallow);

export const {
  useStore: useResourceManagerStore,
  useStoreApi,
  Provider,
} = createContext<StoreApiWithSelector<Store>>();

export { selectors } from './selectors';
