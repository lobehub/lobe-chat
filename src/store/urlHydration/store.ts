import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { type UrlHydrationAction, urlHydrationAction } from './action';
import { type UrlHydrationState, initialState } from './initialState';

//  ===============  聚合 createStoreFn ============ //

export interface UrlHydrationStore extends UrlHydrationState, UrlHydrationAction {}

const createStore: StateCreator<UrlHydrationStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...urlHydrationAction(...parameters),
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('urlHydration');

export const useUrlHydrationStore = createWithEqualityFn<UrlHydrationStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow,
);
