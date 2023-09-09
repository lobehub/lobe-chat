import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { type Store, createStore } from './store';

export const useMarketStore = createWithEqualityFn<Store>()(devtools(createStore), shallow);

export { selectors } from './selectors';
export { type Store } from './store';
