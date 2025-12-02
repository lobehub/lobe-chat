'use client';

import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { store } from './action';

export type { State } from './initialState';

// Create a global store instance instead of context-based
export const useResourceManagerStore = createWithEqualityFn(
  subscribeWithSelector(store()),
  shallow,
);

export { selectors } from './selectors';
