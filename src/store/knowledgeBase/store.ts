import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { KnowledgeBaseStoreState, initialState } from './initialState';
import { KnowledgeBaseContentAction, createContentSlice } from './slices/content';
import { KnowledgeBaseCrudAction, createCrudSlice } from './slices/crud';

//  ===============  聚合 createStoreFn ============ //

export type KnowledgeBaseStore = KnowledgeBaseStoreState &
  KnowledgeBaseCrudAction &
  KnowledgeBaseContentAction;

const createStore: StateCreator<KnowledgeBaseStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createCrudSlice(...parameters),
  ...createContentSlice(...parameters),
});

//  ===============  实装 useStore ============ //
const devtools = createDevtools('knowledgeBase');

export const useKnowledgeBaseStore = createWithEqualityFn<KnowledgeBaseStore>()(
  devtools(createStore),
  shallow,
);
