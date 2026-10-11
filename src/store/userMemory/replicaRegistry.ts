import { type LayersEnum } from '@/types/userMemory';

/**
 * The invalidation contract between the shared userMemory base actions
 * (`purgeAllMemories`, `updateMemory`) and every slice that keeps its data in a
 * `@lobechat/replica` resource.
 *
 * A replica persists its rows per query, so a plain `set` of the view (or an SWR
 * `mutate`) leaves the persisted rows behind and a reload paints deleted data.
 * Instead of the base slice importing every sibling slice, each migrated slice
 * registers a handle here from its constructor, and the base actions drive all
 * registered handles:
 *
 * - `purgeAllMemories` calls `clear()` (memory + every persisted row of the
 *   active scope) on every handle, then `revalidate()` so mounted views settle
 *   on the server's (now empty) answer instead of loading forever.
 * - `updateMemory` hands the saved content to the handles whose `layer` matches,
 *   so the owning replica patches its rows (`updateEntity`) instead of the base
 *   slice writing a plain `set` into the replica view.
 *
 * A layer with a registered handle is owned by its replica: the base actions skip
 * that layer's legacy plain-state reset / SWR revalidation. A layer without one
 * keeps the legacy path, so unmigrated slices keep working unchanged.
 */
export interface UserMemoryReplicaUpdate {
  content: string;
  id: string;
  layer: LayersEnum;
}

export interface UserMemoryReplicaHandle {
  /** Drop the whole resource: `slice.clear()`. */
  clear: () => Promise<boolean>;
  /**
   * The memory layer whose list this replica owns. Set it only when the handle
   * replaces the base slice's legacy reset / update of that layer.
   */
  layer?: LayersEnum;
  /** Refetch mounted entries after a purge: `slice.revalidate()`. */
  revalidate?: () => Promise<unknown>;
  /** Apply a saved memory edit of `layer` to the replica rows (e.g. `slice.updateEntity`). */
  update?: (update: UserMemoryReplicaUpdate) => void;
}

/**
 * Handles are partitioned by the owning store's `get` (every slice of one store
 * receives the same function), so separate store instances never share them.
 */
type RegistryOwner = () => unknown;

const registries = new WeakMap<RegistryOwner, Map<string, UserMemoryReplicaHandle>>();

const handlesOf = (owner: RegistryOwner) => [...(registries.get(owner)?.values() ?? [])];

/**
 * Register a replica the base actions must invalidate. `name` is unique per
 * replica; registering it again (store re-creation, HMR) replaces the handle.
 */
export const registerUserMemoryReplica = (
  owner: RegistryOwner,
  name: string,
  handle: UserMemoryReplicaHandle,
): (() => void) => {
  let handles = registries.get(owner);
  if (!handles) {
    handles = new Map();
    registries.set(owner, handles);
  }
  handles.set(name, handle);

  return () => {
    if (registries.get(owner)?.get(name) === handle) registries.get(owner)!.delete(name);
  };
};

/** The layers whose lists are owned by a registered replica. */
export const getUserMemoryReplicaLayers = (owner: RegistryOwner): Set<LayersEnum> =>
  new Set(handlesOf(owner).flatMap((handle) => (handle.layer ? [handle.layer] : [])));

/**
 * Clear every registered replica, then revalidate them. One failing replica
 * does not stop the others. Resolves `true` when every persisted row is purged.
 */
export const clearUserMemoryReplicas = async (owner: RegistryOwner): Promise<boolean> => {
  const handles = handlesOf(owner);
  const cleared = await Promise.allSettled(handles.map((handle) => handle.clear()));
  await Promise.allSettled(handles.map((handle) => handle.revalidate?.()));

  return cleared.every((result) => result.status === 'fulfilled' && result.value);
};

/**
 * Hand a saved memory edit to the replicas owning its layer. Returns whether
 * any replica owns the layer, i.e. whether the legacy update path must be
 * skipped.
 */
export const updateUserMemoryReplicas = (
  owner: RegistryOwner,
  update: UserMemoryReplicaUpdate,
): boolean => {
  let owned = false;

  for (const handle of handlesOf(owner)) {
    if (handle.layer !== update.layer) continue;
    owned = true;
    handle.update?.(update);
  }

  return owned;
};
