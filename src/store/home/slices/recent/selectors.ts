import { type HomeStore } from '@/store/home/store';

import { type RecentEntityRef, toRecentEntityRef } from './initialState';
import {
  createHomeTopicRecentKey,
  type DocsHomeTab,
  type HomeTopicRecentParams,
} from './projection';

/** Items of one recents query; `undefined` until it is hydrated or fetched. */
const query = (queryKey: string) => (s: HomeStore) => s.recentListMap[queryKey];

const item = (queryKey: string, ref: RecentEntityRef) => (s: HomeStore) =>
  s.recentListMap[queryKey]?.find((recent) => toRecentEntityRef(recent) === ref);

/** One Docs home tab; `undefined` until hydrated or fetched. */
const docsHome = (tab: DocsHomeTab) => (s: HomeStore) => s.docsHomeMap[tab];

/** Home "Recent topics" of one view; `undefined` until hydrated or fetched. */
const homeTopics = (params: HomeTopicRecentParams) => (s: HomeStore) =>
  s.homeTopicRecentMap[createHomeTopicRecentKey(params)];

export const homeRecentSelectors = {
  docsHome,
  homeTopics,
  item,
  query,
};
