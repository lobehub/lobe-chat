import type { RecentItem } from '@lobechat/types';

import {
  createReplicaSlice,
  linkReplicaEntity,
  recordLens,
  type ReplicaEntityAdapter,
  type ReplicaSyncResult,
} from '@/libs/replica';
import { documentService } from '@/services/document';
import { fileService } from '@/services/file';
import { RECENT_SIDEBAR_TYPES, recentService } from '@/services/recent';
import { taskService } from '@/services/task';
import { topicService } from '@/services/topic';
import type { HomeStore } from '@/store/home/store';
import type { StoreSetter } from '@/store/types';
import { setNamespace } from '@/utils/storeDebug';

import { type RecentEntityRef, toRecentEntityRef } from './initialState';
import {
  DOCS_HOME_LIMIT,
  docsHomeListResource,
  type DocsHomeRow,
  type DocsHomeTab,
  homeTopicRecentListResource,
  type HomeTopicRecentParams,
  recentListResource,
  toDocsHomeRow,
} from './projection';

const n = setNamespace('recent');

/** Rows in the "all recents" drawer. */
export const ALL_RECENTS_LIMIT = 50;
/** Rows the home "Recent topics" block fetches; the user's count setting caps what it shows. */
export const HOME_TOPIC_RECENT_LIMIT = 15;

interface RenameRecentParams {
  id: string;
  title: string;
  type: RecentItem['type'];
}

/** Recents mix entity types, so rows are addressed by `${type}:${id}`. */
const recentEntity: ReplicaEntityAdapter<RecentItem[], RecentItem> = {
  has: (items, ref) => items.some((item) => toRecentEntityRef(item) === ref),
  map: (items, ref, fn) => {
    let changed = false;
    const next: RecentItem[] = [];
    for (const item of items) {
      if (toRecentEntityRef(item) !== ref) {
        next.push(item);
        continue;
      }
      const mapped = fn(item);
      if (mapped !== item) changed = true;
      if (mapped) next.push(mapped);
    }
    return changed ? next : items;
  },
};

const withTitle = (item: RecentItem, title: string): RecentItem =>
  // A task rename carries the slug source with it, so the row's link is built
  // from the name the user just typed rather than the one the server still has.
  item.type === 'task' ? { ...item, slugTitle: title, title } : { ...item, title };

type Setter = StoreSetter<HomeStore>;
export const createRecentSlice = (set: Setter, get: () => HomeStore, _api?: unknown) =>
  new RecentActionImpl(set, get, _api);

export class RecentActionImpl {
  readonly #set: Setter;
  /** Server writes per entity run in order; the newest optimistic title stays on top. */
  readonly #renameQueues = new Map<RecentEntityRef, Promise<unknown>>();
  readonly #recentList;
  readonly #homeTopicRecentList;
  readonly #recents;
  readonly #docsHome;

  constructor(set: Setter, get: () => HomeStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#recentList = createReplicaSlice(recentListResource, {
      actionPrefix: n('recentList'),
      entity: recentEntity,
      fetcher: ({ limit }) => recentService.getAll(limit, RECENT_SIDEBAR_TYPES),
      get,
      set,
      stateKey: 'recentListReplica',
      view: recordLens<HomeStore, RecentItem[]>('recentListMap'),
    });
    this.#homeTopicRecentList = createReplicaSlice(homeTopicRecentListResource, {
      actionPrefix: n('homeTopicRecentList'),
      fetcher: ({ limit, view }) =>
        recentService.getAll(limit, ['topic'], true, view === 'mine', view === 'team'),
      get,
      set,
      stateKey: 'homeTopicRecentReplica',
      view: recordLens<HomeStore, RecentItem[]>('homeTopicRecentMap'),
    });
    this.#recents = linkReplicaEntity<RecentItem>([this.#recentList]);
    this.#docsHome = createReplicaSlice(docsHomeListResource, {
      actionPrefix: n('docsHome'),
      fetcher: async ({ tab }) =>
        (await fileService.getDocsHomeItems(tab, DOCS_HOME_LIMIT)).map(toDocsHomeRow),
      get,
      set,
      stateKey: 'docsHomeReplica',
      view: recordLens<HomeStore, DocsHomeRow[]>('docsHomeMap'),
    });
  }

  closeAllRecentsDrawer = (): void => {
    this.#set({ allRecentsDrawerOpen: false }, false, n('closeAllRecentsDrawer'));
  };

  openAllRecentsDrawer = (): void => {
    this.#set({ allRecentsDrawerOpen: true }, false, n('openAllRecentsDrawer'));
  };

  #persistRecentTitle = async ({ id, title, type }: RenameRecentParams): Promise<void> => {
    switch (type) {
      case 'document': {
        await documentService.updateDocument({ id, title });
        break;
      }
      case 'task': {
        await taskService.update(id, { name: title });
        break;
      }
      case 'topic': {
        await topicService.updateTopic(id, { title });
        break;
      }
    }
  };

  /** Revalidate every recents query of the active identity. */
  refreshRecents = async (): Promise<void> => {
    await this.#recentList.revalidate();
  };

  /** Revalidate the home "Recent topics" queries of the active identity. */
  refreshHomeTopicRecents = async (): Promise<void> => {
    await this.#homeTopicRecentList.revalidate();
  };

  /**
   * Show the new title in every loaded recents query right away, write it to
   * the owning entity, and roll back on failure. Renames of one entity reach
   * the server in order.
   */
  renameRecent = async (params: RenameRecentParams): Promise<void> => {
    const ref = toRecentEntityRef(params);
    const previous = this.#renameQueues.get(ref) ?? Promise.resolve();
    const operation = this.#recents.optimistic(
      ref,
      (item) => withTitle(item, params.title),
      () => previous.catch(() => undefined).then(() => this.#persistRecentTitle(params)),
    );
    this.#renameQueues.set(ref, operation);
    try {
      await operation;
    } finally {
      if (this.#renameQueues.get(ref) === operation) this.#renameQueues.delete(ref);
    }
  };

  /**
   * Seed the persisted "Recent topics" of a view before the home route paints,
   * so a revisit shows the last rows instead of the loading skeleton. A later
   * `useSync` hydrate is a no-op once the slot is filled.
   */
  preHydrateHomeTopicRecents = (view: HomeTopicRecentParams['view']): Promise<boolean> => {
    const scope = homeTopicRecentListResource.scope.get();
    // The slot may still hold the previous identity's rows; drop them before seeding.
    this.#homeTopicRecentList.ensureScope(scope);
    return this.#homeTopicRecentList.hydrate({ limit: HOME_TOPIC_RECENT_LIMIT, view }, scope);
  };

  /**
   * Home chat-mode "Recent topics" of one view. Read the rows with
   * `homeRecentSelectors.homeTopics`.
   */
  useFetchHomeTopicRecents = (
    view: HomeTopicRecentParams['view'],
    enabled: boolean,
  ): ReplicaSyncResult =>
    this.#homeTopicRecentList.useSync(
      { limit: HOME_TOPIC_RECENT_LIMIT, view },
      { enabled, revalidateOnFocus: false },
    );

  /** "All recents" drawer. Read the rows with `homeRecentSelectors.query`. */
  useFetchAllRecents = (open: boolean): ReplicaSyncResult =>
    this.#recentList.useSync({ limit: ALL_RECENTS_LIMIT }, { enabled: open });

  /** Refetch every loaded Docs home tab, e.g. after a page or file was added. */
  refreshDocsHome = async (): Promise<void> => {
    await this.#docsHome.revalidate();
  };

  /** The Docs home list for one tab. Read it with `homeRecentSelectors.docsHome`. */
  useFetchDocsHome = (tab: DocsHomeTab, enabled: boolean = true): ReplicaSyncResult =>
    this.#docsHome.useSync({ tab }, { enabled });

  /**
   * Sidebar recents. Asks for `limit + 1` rows to know whether "view all" is
   * needed; read them with `homeRecentSelectors.query`.
   */
  useFetchRecents = (isLogin: boolean | undefined, limit: number = 10): ReplicaSyncResult =>
    this.#recentList.useSync({ limit: limit + 1 }, { enabled: isLogin === true });
}

export type RecentAction = Pick<RecentActionImpl, keyof RecentActionImpl>;
