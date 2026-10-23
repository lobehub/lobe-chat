import type { PageState } from './initialState';
import type { PageSectionScope } from './projection';
import { listSelectors } from './slices/list';

/** One Docs sidebar page section (`mine` / `shared`); `undefined` until first read. */
const pageSection = (scope: PageSectionScope) => (s: PageState) => s.pageSectionMap[scope];

export const pageSelectors = {
  ...listSelectors,
  pageSection,
};
