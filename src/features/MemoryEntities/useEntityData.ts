import { useMemo } from 'react';

import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService, userMemoryService } from '@/services/userMemory';
import { LayersEnum } from '@/types/userMemory';

import { type RawActivityItem, type RawContextItem, toActivity, toEntity } from './adapt';
import { linkByNames } from './link';
import { type MemoryActivity, type MemoryEntity } from './types';

const PAGE_SIZE = 100;
/** 99% of users have ≤150 contexts and ≤230 activities; three pages cover them. */
const MAX_PAGES = 3;

const fetchAll = async <T>(layer: LayersEnum): Promise<{ items: T[]; truncated: boolean }> => {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await userMemoryService.queryMemories({ layer, page, pageSize: PAGE_SIZE });
    items.push(...(result.items as unknown as T[]));
    if (items.length >= (result.total ?? 0) || result.items.length < PAGE_SIZE)
      return { items, truncated: false };
  }
  return { items, truncated: true };
};

interface EntityData {
  activities: MemoryActivity[];
  entities: MemoryEntity[];
  truncated: boolean;
}

const fetchEntityData = async (): Promise<EntityData> => {
  const [contexts, activities] = await Promise.all([
    fetchAll<RawContextItem>(LayersEnum.Context),
    fetchAll<RawActivityItem>(LayersEnum.Activity),
  ]);
  return {
    activities: activities.items.map(toActivity),
    entities: contexts.items.map(toEntity),
    truncated: contexts.truncated || activities.truncated,
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

  return {
    activities: data?.activities ?? [],
    entities: data?.entities ?? [],
    error,
    isLoading,
    links,
    remove,
    retry: () => mutate(),
    setStatus,
    truncated: data?.truncated ?? false,
    updateNow,
  };
};

export type EntityDataApi = ReturnType<typeof useEntityData>;
