import type { RecentItem } from '@lobechat/types';

import { defineReplica } from '@/libs/replica';
import type { fileService } from '@/services/file';

export interface RecentListParams {
  limit: number;
}

/** Entry key of one recents query (`recentListMap[limit:N]`). */
export const createRecentQueryKey = (limit: number): string => `limit:${limit}`;

/**
 * Recent documents / tasks / topics, one entry per requested limit (the sidebar
 * asks for `pageSize + 1`, the drawer for 50). localStorage keeps the first
 * frame of the home sidebar instant.
 */
export const recentListResource = defineReplica<RecentListParams, RecentItem[]>({
  key: ({ limit }) => createRecentQueryKey(limit),
  name: 'recentList',
  storage: 'localStorage',
  version: 1,
});

/** Whose topics the home "Recent topics" block lists in a workspace. */
export type HomeTopicRecentView = 'mine' | 'team';

export interface HomeTopicRecentParams {
  limit: number;
  view: HomeTopicRecentView;
}

/** Entry key of one home topic recents query (`homeTopicRecentMap[mine:limit:N]`). */
export const createHomeTopicRecentKey = ({ limit, view }: HomeTopicRecentParams): string =>
  `${view}:limit:${limit}`;

/**
 * Home chat-mode "Recent topics", with message previews. Mine and team are
 * separate entries: workspace topics are shared, so "mine" is narrowed
 * server-side before the limit rather than filtered out of the team feed.
 */
export const homeTopicRecentListResource = defineReplica<HomeTopicRecentParams, RecentItem[]>({
  key: createHomeTopicRecentKey,
  name: 'homeTopicRecentList',
  storage: 'localStorage',
  version: 1,
});

export type DocsHomeTab = 'mine' | 'recent' | 'shared';

export interface DocsHomeParams {
  tab: DocsHomeTab;
}

/** Rows the Docs home list shows; it fetches one head page per tab. */
export const DOCS_HOME_LIMIT = 50;

/** One row of the Docs home list: a page or an uploaded file. */
export interface DocsHomeRow {
  createdAt: Date | string;
  emoji?: string;
  fileType: string;
  id: string;
  kind: 'file' | 'page';
  /** Knowledge bases the row is filed into; empty for standalone rows. */
  knowledgeBaseIds: string[];
  name: string;
  owner?: { avatar?: string | null; id: string; name: string } | null;
  updatedAt: Date | string;
  userId?: string | null;
}

type DocsHomeItem = Awaited<ReturnType<typeof fileService.getDocsHomeItems>>[number];

/** Server row → list row. Slim on purpose: the list persists to localStorage. */
export const toDocsHomeRow = (item: DocsHomeItem): DocsHomeRow => {
  const emoji = (item.metadata as { emoji?: unknown } | null | undefined)?.emoji;
  const uploader = item.uploader;
  return {
    createdAt: item.createdAt,
    emoji: typeof emoji === 'string' ? emoji : undefined,
    fileType: item.fileType,
    id: item.id,
    knowledgeBaseIds: item.knowledgeBaseIds ?? [],
    kind: item.sourceType === 'document' ? 'page' : 'file',
    name: item.name,
    owner: uploader
      ? {
          avatar: uploader.avatar,
          id: uploader.id,
          name: uploader.fullName || uploader.username || uploader.id.slice(0, 8),
        }
      : null,
    updatedAt: item.updatedAt,
    userId: item.userId,
  };
};

/**
 * The Docs home list, one entry per tab. localStorage keeps the first frame
 * instant; the cache scope already carries the workspace.
 */
export const docsHomeListResource = defineReplica<DocsHomeParams, DocsHomeRow[]>({
  key: ({ tab }) => tab,
  name: 'docsHomeList',
  storage: 'localStorage',
  version: 1,
});
