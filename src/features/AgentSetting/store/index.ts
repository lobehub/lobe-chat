import { StoreApi } from 'zustand';
import { createContext } from 'zustand-utils';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { Store, store } from './action';

export type { State } from './initialState';

export const createStore = () => createWithEqualityFn(subscribeWithSelector(store), shallow);

interface StoreApiWithSelector extends Omit<StoreApi<Store>, 'subscribe'> {
  subscribe: <T extends keyof Store>(
    selector: (state: Store, prevState: Store) => void,
    listener?: (state: Store[T]) => void,
  ) => () => void;
}

export const { useStore, useStoreApi, Provider } = createContext<StoreApiWithSelector>();
