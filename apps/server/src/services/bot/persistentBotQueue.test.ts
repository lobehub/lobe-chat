import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BOT_QUEUE_RETENTION_MS,
  configurePersistentBotState,
  isPersistentBotQueueEnabled,
} from './persistentBotQueue';

afterEach(() => vi.unstubAllEnvs());
describe('persistent bot queue', () => {
  it('is opt-in and disabled on Vercel', () => {
    vi.stubEnv('BOT_QUEUE_WAIT_FOR_COMPLETION', '1');
    vi.stubEnv('VERCEL', '');
    expect(isPersistentBotQueueEnabled()).toBe(true);
    vi.stubEnv('VERCEL', '1');
    expect(isPersistentBotQueueEnabled()).toBe(false);
  });
  it('keeps a second receiver excluded beyond the SDK 30-second lease', async () => {
    let now = 0;
    let until = 0;
    const state = {
      async acquireLock(id: string, ttl: number) {
        if (until > now) return null;
        until = now + ttl;
        return { threadId: id, token: 'owner' };
      },
      async extendLock(_lock: unknown, ttl: number) {
        until = now + ttl;
        return true;
      },
    };
    configurePersistentBotState(state as any);
    const owner = await state.acquireLock('thread', 30_000);
    now = 120_000;
    expect(await state.acquireLock('thread', 30_000)).toBeNull();
    await state.extendLock(owner, 30_000);
    now += 120_000;
    expect(await state.acquireLock('thread', 30_000)).toBeNull();
    expect(BOT_QUEUE_RETENTION_MS).toBeGreaterThan(now);
  });
});
