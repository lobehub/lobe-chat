'use client';

import { createContext } from 'zustand-utils';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';


import { Store, store } from './action';
import { StoreApiWithSelector } from '@/types/zustand';

export type { State } from './initialState';

export const createStore = () => createWithEqualityFn(subscribeWithSelector(store), shallow);

export const { useStore, useStoreApi, Provider } = createContext<StoreApiWithSelector<Store>>();

export { selectors } from './selectors';