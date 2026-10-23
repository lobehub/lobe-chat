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

  /** Server-side search, so a keyword also finds contexts outside the loaded pages. */
  const searchRemote = useCallback(
    async (q: string) => {
      const result = await fetchPage(LayersEnum.Context, 1, q, SEARCH_SIZE);
      await addEntities((result.items as unknown as RawContextItem[]).map(toEntity));
    },
    [addEntities],
  );

  /** A deep link may point past the loaded pages; fetch that one context by id. */
  const ensureContext = useCallback(
    async (id: string) => {
      const detail = await userMemoryService.getMemoryDetail({ id, layer: LayersEnum.Context });
      if (!detail || !('context' in detail)) return false;
      await addEntities([toEntity(detail as unknown as RawContextItem)]);
      return true;
    },
    [addEntities],
  );

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
  };

  const loadedPagesCover = data ? data.contextPages * PAGE_SIZE : 0;

  return {
    activities: data?.activities ?? [],
    ensureContext,
    entities: data?.entities ?? [],
    error,
    /** The unfiltered list has pages not loaded yet. */
    hasMore: !!data && loadedPagesCover < data.contextTotal,
    isLoading,
    links,
    loadMore,
    remove,
    retry: () => mutate(),
    searchRemote,
    setStatus,
    total: data?.contextTotal ?? 0,
    updateNow,
  };
};

export type EntityDataApi = ReturnType<typeof useEntityData>;
