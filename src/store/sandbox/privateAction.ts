import { createReplicaSlice, recordLens } from '@/libs/replica';
import { sandboxStorageService } from '@/services/sandboxStorage';
import type { StoreSetter } from '@/store/types';

import { type SandboxState } from './initialState';
import {
  SANDBOX_SCOPE_ENTRY,
  type SandboxEntitlement,
  sandboxEntitlementResource,
  sandboxEnvironmentsResource,
  type SandboxInstanceDirectory,
  sandboxInstanceDirectoryResource,
  sandboxInstancesResource,
  type SandboxPickerEnvironment,
  type SandboxPickerInstanceList,
  toInstanceDirectory,
  toPickerEnvironment,
  toPickerInstance,
  toSandboxEntitlement,
} from './projection';

type Setter = StoreSetter<SandboxState>;

export class SandboxPrivateAction {
  readonly entitlement;
  readonly environments;
  readonly instanceDirectory;
  readonly instances;

  constructor(set: Setter, get: () => SandboxState) {
    this.entitlement = createReplicaSlice(sandboxEntitlementResource, {
      actionPrefix: 'sandboxEntitlement',
      fetcher: async () => toSandboxEntitlement(await sandboxStorageService.getEntitlement()),
      get,
      set,
      stateKey: 'sandboxEntitlementReplica',
      view: recordLens<SandboxState, SandboxEntitlement>('sandboxEntitlementMap'),
    });
    this.environments = createReplicaSlice(sandboxEnvironmentsResource, {
      actionPrefix: 'sandboxEnvironments',
      fetcher: async () => {
        const { environments } = await sandboxStorageService.listEnvironments();
        return environments.map(toPickerEnvironment);
      },
      get,
      set,
      stateKey: 'sandboxEnvironmentsReplica',
      view: recordLens<SandboxState, SandboxPickerEnvironment[]>('sandboxEnvironmentsMap'),
    });
    // The conversation the instance list was last asked for. Every topic shares
    // one entry and one storage key, so the replica's own guard cannot tell a
    // superseded topic's late answer from the current one; this does.
    let askedTopicId: string | null | undefined;
    this.instances = createReplicaSlice(sandboxInstancesResource, {
      actionPrefix: 'sandboxInstances',
      // Names, not sizes: sizes need a live sandbox session to answer.
      fetcher: async ({ topicId }) => {
        const asked = topicId ?? null;
        askedTopicId = asked;
        const { instances } = await sandboxStorageService.listInstances({
          topicId,
          withSizes: false,
        });
        const answer = { instances: instances.map(toPickerInstance), topicId: asked };
        // Another conversation was asked for since: keep what the entry holds
        // rather than let this answer overwrite that conversation's occupancy.
        if (askedTopicId !== asked) return get().sandboxInstancesMap[SANDBOX_SCOPE_ENTRY] ?? answer;

        return answer;
      },
      get,
      set,
      stateKey: 'sandboxInstancesReplica',
      view: recordLens<SandboxState, SandboxPickerInstanceList>('sandboxInstancesMap'),
    });
    this.instanceDirectory = createReplicaSlice(sandboxInstanceDirectoryResource, {
      actionPrefix: 'sandboxInstanceDirectory',
      fetcher: async (id) => toInstanceDirectory(await sandboxStorageService.getInstance({ id })),
      get,
      set,
      stateKey: 'sandboxInstanceDirectoryReplica',
      // A gone instance is a panel state: never persist it, and evict the
      // directory persisted earlier so a reload cannot point at it again.
      toPersisted: (data) => (data.workingDirectory === null ? null : data),
      view: recordLens<SandboxState, SandboxInstanceDirectory>('sandboxInstanceDirectoryMap'),
    });
  }
}
