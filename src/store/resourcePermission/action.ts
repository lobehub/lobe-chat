import { cacheScope, createReplicaSlice, recordLens, type ReplicaSyncResult } from '@/libs/replica';
import type {
  ResourceAccessLevel,
  ResourceCollaborator,
  ResourceGeneralAccess,
} from '@/services/resourcePermission';
import { resourcePermissionService } from '@/services/resourcePermission';
import type { StoreSetter } from '@/store/types';
import { setNamespace } from '@/utils/storeDebug';
import { isTrpcErrorCode } from '@/utils/trpcError';

import {
  initialState,
  type ResourceAccessCheck,
  type ResourcePermissionState,
} from './initialState';
import {
  resourceAccessResource,
  resourceCollaboratorsResource,
  resourceKey,
  type ResourceRef,
} from './projection';
import { accessSessionKey } from './selectors';
import { useResourcePermissionStore } from './store';

const n = setNamespace('resourcePermission');

type Setter = StoreSetter<ResourcePermissionState>;

/**
 * Failures that are the server's answer rather than a transport fault: the
 * resource went private, left the workspace, or the caller lost access.
 */
export const isAccessDenialError = (error: unknown): boolean =>
  isTrpcErrorCode(error, 'NOT_FOUND') ||
  isTrpcErrorCode(error, 'FORBIDDEN') ||
  isTrpcErrorCode(error, 'UNAUTHORIZED');

export class ResourcePermissionActionImpl {
  readonly #access;
  readonly #collaborators;
  readonly #set: Setter;

  constructor(set: Setter, get: () => ResourcePermissionState) {
    this.#set = set;

    this.#access = createReplicaSlice(resourceAccessResource, {
      actionPrefix: 'resourceAccess',
      effects: {
        // Every server answer, unchanged ones included, re-confirms the record
        // for this session — that is what management checks wait for.
        onApplied: (_data, _params, { key, scope }) => this.#markAccess(scope, key, 'confirmed'),
        onError: (error, _params, { key, scope }) => {
          if (key === undefined || !isAccessDenialError(error)) return;
          // The persisted grant no longer holds: drop it so neither this view
          // nor a reload acts on it, and fail every check closed.
          this.#markAccess(scope, key, 'denied');
          void this.#access.remove(key, scope);
        },
      },
      fetcher: ({ resourceId, resourceType }) =>
        resourcePermissionService.getGeneralAccess(resourceType, resourceId),
      get,
      set,
      stateKey: 'accessReplica',
      view: recordLens<ResourcePermissionState, ResourceGeneralAccess>('accessMap'),
    });

    this.#collaborators = createReplicaSlice(resourceCollaboratorsResource, {
      actionPrefix: 'resourceCollaborators',
      effects: {
        onError: (error, _params, { key, scope }) => {
          // Only managers may list grants; a caller who lost that must not
          // keep (or reload) the list they saw before.
          if (key !== undefined && isAccessDenialError(error)) {
            void this.#collaborators.remove(key, scope);
          }
        },
      },
      fetcher: ({ resourceId, resourceType }) =>
        resourcePermissionService.listCollaborators(resourceType, resourceId),
      get,
      set,
      stateKey: 'collaboratorsReplica',
      view: recordLens<ResourcePermissionState, ResourceCollaborator[]>('collaboratorsMap'),
    });
  }

  #markAccess = (scope: string, key: string, check: ResourceAccessCheck): void => {
    this.#set(
      (s) => ({
        accessSessionMap: { ...s.accessSessionMap, [accessSessionKey(scope, key)]: check },
      }),
      false,
      n('markAccess', { check, key }),
    );
  };

  useFetchAccess = (ref: ResourceRef | null): ReplicaSyncResult => this.#access.useSync(ref);

  useFetchCollaborators = (ref: ResourceRef | null): ReplicaSyncResult =>
    this.#collaborators.useSync(ref);

  setAccessLevel = async (ref: ResourceRef, accessLevel: ResourceAccessLevel): Promise<void> => {
    const scope = cacheScope.get();
    const key = resourceKey(ref);
    await this.#access.optimistic(
      key,
      (data) => ({
        ...data,
        accessLevel,
        generalAccess: accessLevel === 'edit' ? 'editor' : 'viewer',
      }),
      () => resourcePermissionService.setAccessLevel(ref.resourceType, ref.resourceId, accessLevel),
      { confirm: (result) => () => result },
    );
    // The write's response is a server answer too.
    if (cacheScope.get() === scope) this.#markAccess(scope, key, 'confirmed');
  };

  addCollaborators = async (
    ref: ResourceRef,
    userIds: string[],
    accessLevel: ResourceAccessLevel,
  ): Promise<void> => {
    await resourcePermissionService.addCollaborators(
      ref.resourceType,
      ref.resourceId,
      userIds,
      accessLevel,
    );
    await this.#collaborators.fetch(ref, { fresh: true });
  };

  /**
   * The row disappears immediately and comes back if the server rejects the
   * revocation (the caller surfaces the error).
   */
  removeCollaborator = async (ref: ResourceRef, userId: string): Promise<void> => {
    await this.#collaborators.optimistic(
      resourceKey(ref),
      (list) => list.filter((item) => item.userId !== userId),
      () => resourcePermissionService.removeCollaborator(ref.resourceType, ref.resourceId, userId),
    );
    await this.#collaborators.fetch(ref, { fresh: true });
  };

  reset = (): void => {
    this.#set(initialState, false, n('reset'));
  };
}

const { getState, setState } = useResourcePermissionStore;

export const resourcePermissionActions = new ResourcePermissionActionImpl(setState, getState);
