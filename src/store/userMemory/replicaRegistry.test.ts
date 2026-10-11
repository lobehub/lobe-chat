import { describe, expect, it, vi } from 'vitest';

import { LayersEnum } from '@/types/userMemory';

import {
  clearUserMemoryReplicas,
  getUserMemoryReplicaLayers,
  registerUserMemoryReplica,
  updateUserMemoryReplicas,
} from './replicaRegistry';

const owner = () => () => ({});

describe('userMemory replica registry', () => {
  it('clears and then revalidates every handle of the owner only', async () => {
    const store = owner();
    const other = owner();
    const calls: string[] = [];
    registerUserMemoryReplica(store, 'a', {
      clear: async () => (calls.push('clear:a'), true),
      revalidate: async () => calls.push('revalidate:a'),
    });
    registerUserMemoryReplica(store, 'b', { clear: async () => (calls.push('clear:b'), true) });
    const otherClear = vi.fn(async () => true);
    registerUserMemoryReplica(other, 'a', { clear: otherClear });

    await expect(clearUserMemoryReplicas(store)).resolves.toBe(true);

    expect(calls).toEqual(['clear:a', 'clear:b', 'revalidate:a']);
    expect(otherClear).not.toHaveBeenCalled();
  });

  it('keeps clearing the other replicas when one fails, and reports it', async () => {
    const store = owner();
    const survivor = vi.fn(async () => true);
    registerUserMemoryReplica(store, 'broken', {
      clear: () => Promise.reject(new Error('idb down')),
    });
    registerUserMemoryReplica(store, 'survivor', { clear: survivor });

    await expect(clearUserMemoryReplicas(store)).resolves.toBe(false);
    expect(survivor).toHaveBeenCalledTimes(1);
  });

  it('routes an edit to the replica owning the layer and reports ownership', () => {
    const store = owner();
    const update = vi.fn();
    registerUserMemoryReplica(store, 'activities', {
      clear: async () => true,
      layer: LayersEnum.Activity,
      update,
    });

    const edit = { content: 'new', id: 'mem-1', layer: LayersEnum.Activity };
    expect(updateUserMemoryReplicas(store, edit)).toBe(true);
    expect(update).toHaveBeenCalledWith(edit);

    expect(
      updateUserMemoryReplicas(store, { content: 'x', id: 'mem-2', layer: LayersEnum.Context }),
    ).toBe(false);
    expect(getUserMemoryReplicaLayers(store)).toEqual(new Set([LayersEnum.Activity]));
  });

  it('replaces a re-registered handle and unregisters only the current one', async () => {
    const store = owner();
    const first = vi.fn(async () => true);
    const second = vi.fn(async () => true);
    const unregisterFirst = registerUserMemoryReplica(store, 'a', { clear: first });
    const unregisterSecond = registerUserMemoryReplica(store, 'a', { clear: second });

    unregisterFirst();
    await clearUserMemoryReplicas(store);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    unregisterSecond();
    await clearUserMemoryReplicas(store);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
