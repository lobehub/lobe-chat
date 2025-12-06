import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { createFileExplorerStore } from './store';

export const useFileExplorerStore = createWithEqualityFn(
  subscribeWithSelector(createFileExplorerStore()),
  shallow,
);

export { fileExplorerSelectors } from './selectors';
export type { FileExplorerActions, FileExplorerState } from './types';
