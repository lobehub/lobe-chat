import { useCallback, useMemo } from 'react';

import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService, userMemoryService } from '@/services/userMemory';
import { LayersEnum } from '@/types/userMemory';

import {
  mergeById,
  type RawActivityItem,
  type RawContextItem,
  toActivity,
  toEntity,
  uniqueById,
} from './adapt';
import { linkByNames } from './link';
import { type MemoryActivity, type MemoryEntity } from './types';

const PAGE_SIZE = 100;
/** 99% of users have ≤150 contexts and ≤230 activities; three pages cover them up front. */
const INITIAL_PAGES = 3;
const SEARCH_SIZE = 50;

const fetchPage = (layer: LayersEnum, page: number, q?: string, pageSize = PAGE_SIZE) =>
  userMemoryService.queryMemories({ layer, page, pageSize, q });

const fetchInitial = async <T>(layer: LayersEnum) => {
  const items: T[] = [];
  let total = 0;
  let pages = 0;
  for (let page = 1; page <= INITIAL_PAGES; page++) {
    const result = await fetchPage(layer, page);
    items.push(...(result.items as unknown as T[]));
    total = result.total ?? items.length;
    pages = page;
    if (items.length >= total || result.items.length < PAGE_SIZE) break;
  }
  return { items, pages, total };
};

interface EntityData {
  activities: MemoryActivity[];
  /** Pages of the unfiltered context list loaded so far. */
  contextPages: number;
  contextTotal: number;
  entities: MemoryEntity[];
}

const fetchEntityData = async (): Promise<EntityData> => {
  const [contexts, activities] = await Promise.all([
    fetchInitial<RawContextItem>(LayersEnum.Context),
    fetchInitial<RawActivityItem>(LayersEnum.Activity),
  ]);
  return {
    activities: uniqueById(activities.items.map(toActivity)),
    contextPages: contexts.pages,
    contextTotal: contexts.total,
    entities: uniqueById(contexts.items.map(toEntity)),
  };
};

const KEY = 'memory-entity-pages';

export const useEntityData = () => {
  const { data, error, isLoading, mutate } = useClientDataSWR<EntityData>(KEY, fetchEntityData, {
    revalidateOnFocus: false,
  });

  const hasMore = !!data && data.contextPages * PAGE_SIZE < data.contextTotal;

  const links = useMemo(
    () => (data ? linkByNames(data.entities, data.activities) : undefined),
    [data],
  );

  const addEntities = useCallback(
    (incoming: MemoryEntity[], patch?: Partial<EntityData>) =>
      mutate(
        (current) =>
          current && { ...current, ...patch, entities: mergeById(current.entities, incoming) },
        { revalidate: false },
      ),
    [mutate],
  );

  /** Writes go to the backend first; the list is patched in place instead of refetched. */
  const patchEntity = (id: string, fn: (entity: MemoryEntity) => MemoryEntity | undefined) =>
    mutate(
      (current) =>
        current && {
          ...current,
          entities: current.entities.flatMap((entity) => {
            if (entity.id !== id) return [entity];
            const next = fn(entity);
            return next ? [next] : [];
          }),
        },
      { revalidate: false },
    );

  /** Next page of the unfiltered list, for users with more contexts than the first load. */
  const loadMore = async () => {
    if (!data) return;
    const page = data.contextPages + 1;
    const result = await fetchPage(LayersEnum.Context, page);
    await addEntities((result.items as unknown as RawContextItem[]).map(toEntity), {
      contextPages: page,
      contextTotal: result.total ?? data.contextTotal,
    });
  };


  const updateNow = async (id: string, description: string) => {
    await memoryCRUDService.updateContext(id, { description });
    await patchEntity(id, (entity) => ({
      ...entity,
      description,
      updatedAt: new Date().toISOString(),
    }));
  };

  const setStatus = async (id: string, statusValue: string, status: MemoryEntity['status']) => {
    await memoryCRUDService.updateContext(id, { currentStatus: statusValue });
    await patchEntity(id, (entity) => ({ ...entity, status, statusValue }));
  };

  const remove = async (id: string) => {
    await memoryCRUDService.deleteContext(id);
    await patchEntity(id, () => undefined);
    // Offset pages shift once a row is gone; reload them so 「加载更早的情境」 does not skip one.
    if (hasMore) await mutate();
  };


  return {
    activities: data?.activities ?? [],
    entities: data?.entities ?? [],
    error,
    /** The unfiltered list has pages not loaded yet. */
    hasMore,
    isLoading,
    links,
    loadMore,
    remove,
    retry: () => mutate(),
    setStatus,
    total: data?.contextTotal ?? 0,
    updateNow,
  };
};

export type EntityDataApi = ReturnType<typeof useEntityData>;

/**
 * Server-side search for contexts outside the loaded pages. Its rows are shown as matches as
 * they are: the server also searches fields the list does not hold (status, parent details).
 */
export const useRemoteContextSearch = (q: string, enabled: boolean) =>
  useClientDataSWR<MemoryEntity[]>(
    enabled && q ? ['memory-entity-pages-search', q] : null,
    async () => {
      const result = await fetchPage(LayersEnum.Context, 1, q, SEARCH_SIZE);
      return uniqueById((result.items as unknown as RawContextItem[]).map(toEntity));
    },
    { revalidateOnFocus: false },
  );

/** A deep link (e.g. "open in memory" from a chat) may point past the loaded pages. */
export const useLinkedContext = (id: string | undefined, enabled: boolean) =>
  useClientDataSWR<MemoryEntity | null>(
    enabled && id ? ['memory-entity-pages-context', id] : null,
    async () => {
      const detail = await userMemoryService.getMemoryDetail({ id: id!, layer: LayersEnum.Context });
      return detail && 'context' in detail ? toEntity(detail as unknown as RawContextItem) : null;
    },
    { revalidateOnFocus: false },
  );
