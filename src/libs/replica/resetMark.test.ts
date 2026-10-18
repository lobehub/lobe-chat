import type { ReplicaStorage } from '@lobechat/replica';
import { beforeEach, describe, expect, it } from 'vitest';

import { guardResetRows, markReplicaScopeReset, resetReplicaScopeMarks } from './resetMark';

const KEY = { queryKey: 'a', scope: 'u1:ws1' };

class PrototypeStorage implements ReplicaStorage<string> {
  rows = new Map<string, { data: string; updatedAt: number }>();
  async get(key: typeof KEY) {
    return this.rows.get(key.queryKey);
  }
  async getStrict(key: typeof KEY) {
    return this.rows.get(key.queryKey);
  }
  getSync(key: typeof KEY) {
    return this.rows.get(key.queryKey);
  }
  async remove(key: typeof KEY) {
    this.rows.delete(key.queryKey);
  }
  async set(key: typeof KEY, row: { data: string; updatedAt: number }) {
    this.rows.set(key.queryKey, row);
  }
}

describe('guardResetRows', () => {
  beforeEach(() => {
    localStorage.clear();
    resetReplicaScopeMarks();
  });

  it('reads rows written before a reset of their scope as absent', async () => {
    const inner = new PrototypeStorage();
    inner.rows.set('a', { data: 'previous context', updatedAt: 100 });
    const storage = guardResetRows(inner) as PrototypeStorage;

    markReplicaScopeReset('u1:ws1', 200);

    expect(await storage.get(KEY)).toBeUndefined();
    expect(await storage.getStrict!(KEY)).toBeUndefined();
    expect(storage.getSync(KEY)).toBeUndefined();
  });

  it('keeps rows written after the reset and rows of other scopes', async () => {
    const inner = new PrototypeStorage();
    const storage = guardResetRows(inner);
    markReplicaScopeReset('u1:ws1', 200);

    await storage.set(KEY, { data: 'new context', updatedAt: 300 });
    expect(await storage.get(KEY)).toEqual({ data: 'new context', updatedAt: 300 });

    markReplicaScopeReset('u2:ws1', 1000);
    expect(await storage.get(KEY)).toEqual({ data: 'new context', updatedAt: 300 });
  });

  it('keeps the mark across a reload', async () => {
    const inner = new PrototypeStorage();
    inner.rows.set('a', { data: 'previous context', updatedAt: 100 });
    markReplicaScopeReset('u1:ws1', 200);

    resetReplicaScopeMarks(); // a fresh session re-reads it from localStorage

    expect(await guardResetRows(inner).get(KEY)).toBeUndefined();
  });
});
