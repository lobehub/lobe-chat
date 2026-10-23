import { appEnv } from '@/envs/app';
import { QueueService } from '@/server/services/queue';
import { LocalQueueServiceImpl } from '@/server/services/queue/impls';

const localWakeups = new Map<string, ReturnType<typeof setTimeout>>();

/** A persisted message/job is the outbox. Queue delivery only wakes its idempotent consumer. */
export const wakeChannel = async (channelId: string, delay = 0) => {
  const queue = new QueueService();
  const local = queue.getImpl();
  if (local instanceof LocalQueueServiceImpl) {
    const key = `${channelId}:${delay ? 'reconcile' : 'now'}`;
    if (localWakeups.has(key)) return key;
    localWakeups.set(
      key,
      setTimeout(async () => {
        localWakeups.delete(key);
        try {
          const [{ getServerDB }, { ChannelCoordinator }] = await Promise.all([
            import('@/database/core/db-adaptor'),
            import('./ChannelCoordinator'),
          ]);
          await new ChannelCoordinator(await getServerDB()).advance(channelId);
        } catch (error) {
          console.error('[channel:advance]', error);
          await wakeChannel(channelId, 60_000);
        }
      }, delay),
    );
    return key;
  }
  return queue.scheduleMessage({
    delay,
    ...(delay
      ? { deduplicationId: `channel:${channelId}:${Math.floor((Date.now() + delay) / 60_000)}` }
      : {}),
    endpoint: new URL(
      '/api/agent/channel/advance',
      appEnv.INTERNAL_APP_URL || appEnv.APP_URL,
    ).toString(),
    operationId: channelId,
    payload: { channelId },
    retries: 3,
    stepIndex: 0,
  });
};
