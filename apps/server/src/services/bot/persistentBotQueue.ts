import type { StateAdapter } from 'chat';

// Opt-in for a continuously running server, never a serverless request lifecycle.
export const isPersistentBotQueueEnabled = () =>
  process.env.BOT_QUEUE_WAIT_FOR_COMPLETION === '1' && !process.env.VERCEL;

export const BOT_OPERATION_WAIT_MS = 30 * 60 * 1000;
export const BOT_QUEUE_RETENTION_MS = 60 * 60 * 1000;

/** Keep Chat SDK's 30-second lease alive for the bounded handler lifetime. */
export const configurePersistentBotState = (state: StateAdapter): void => {
  const acquire = state.acquireLock.bind(state);
  const extend = state.extendLock.bind(state);
  const leaseMs = BOT_OPERATION_WAIT_MS + 60_000;
  state.acquireLock = (id, ttl) => acquire(id, Math.max(ttl, leaseMs));
  state.extendLock = (lock, ttl) => extend(lock, Math.max(ttl, leaseMs));
};

export const waitForBotOperation = async (isRunning: () => Promise<boolean>): Promise<void> => {
  const deadline = Date.now() + BOT_OPERATION_WAIT_MS;
  while (await isRunning()) {
    if (Date.now() >= deadline) throw new Error('Bot operation exceeded the 30-minute queue wait');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};
