'use client';

import { StoreApiWithSelector } from '@lobechat/types';
import { createContext } from 'zustand-utils';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { createDevtools } from '@/store/middleware/createDevtools';

import { Store, store } from './action';

export type { State } from './initialState';

const devtools = createDevtools('agentSetting');

export const createStore = () =>
  createWithEqualityFn(subscribeWithSelector(devtools(store)), shallow);

export const { useStore, useStoreApi, Provider } = createContext<StoreApiWithSelector<Store>>();

export { selectors } from './selectors';
