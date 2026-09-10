import type { Message } from 'chat';
import debug from 'debug';

import { getAgentRuntimeRedisClient } from '@/server/modules/AgentRuntime/redis';

const log = debug('lobe-server:bot:deferred-messages');

/**
 * Cross-process queue for inbound bot messages that arrive while the thread's
 * topic still has a live agent run.
 *
 * Why this exists: in queue mode the bridge hands the run to the job queue and
 * returns immediately, so both the Chat SDK thread lock and the in-process
 * `activeThreads` guard are released long before the agent finishes. A
 * follow-up that lands in that window (WeChat delivers "one image + one
 * sentence" as two messages a few hundred ms apart) used to race the
 * topic-start reservation, lose, and surface as "Agent Execution Failed".
 *
 * Instead the bridge parks the serialized message here, and the completion
 * callback replays every parked message through the Chat SDK once the run is
 * done — the same path a brand-new inbound message takes, so subscription /
 * mention / command routing stay untouched.
 *
 * Key layout: `bot:deferred-messages:<applicationId>:<platformThreadId>`.
 * Scoped by application because one WeChat user can talk to several bots and
 * their thread ids collide (`wechat:single:<userId>`).
 *
 * Entries are `Message.toJSON()` payloads. `raw` survives serialization, which
 * is what the per-platform `extractFiles` needs to re-download media after the
 * round-trip (the same contract the SDK's own queue relies on).
 */
export type DeferredBotMessage = ReturnType<Message['toJSON']>;

/** Matches the agent execution ceiling so a crashed run can't strand entries. */
const TTL_SECONDS = 30 * 60;

/** Hard cap so a runaway sender cannot grow the list unboundedly. */
const MAX_DEFERRED_PER_THREAD = 20;

export const buildDeferredMessagesKey = (applicationId: string, platformThreadId: string): string =>
  `bot:deferred-messages:${applicationId}:${platformThreadId}`;

/**
 * Whether deferral is available at all — it needs Redis because the replay
 * happens in the callback process, not the one that received the message.
 */
export const isDeferredMessagesAvailable = (): boolean => !!getAgentRuntimeRedisClient();

/**
 * Park messages (chronological) for replay after the running agent completes.
 * A merged message should be passed as its individual sources so each one
 * keeps its own `raw` for media re-download.
 *
 * @returns `true` when the messages were stored; `false` when Redis is
 * unavailable or the write failed — callers should then fall back to the
 * previous (fail-fast) behavior rather than drop the message silently.
 */
export async function deferBotMessages(
  applicationId: string,
  platformThreadId: string,
  messages: Message[],
): Promise<boolean> {
  const redis = getAgentRuntimeRedisClient();
  if (!redis || messages.length === 0) return false;

  const key = buildDeferredMessagesKey(applicationId, platformThreadId);
  try {
    const payloads = messages.map((message) => JSON.stringify(message.toJSON()));
    await redis
      .multi()
      .rpush(key, ...payloads)
      .ltrim(key, -MAX_DEFERRED_PER_THREAD, -1)
      .expire(key, TTL_SECONDS)
      .exec();
    log(
      'deferred %d message(s) [%s] for thread=%s app=%s',
      messages.length,
      messages.map((message) => message.id).join(','),
      platformThreadId,
      applicationId,
    );
    return true;
  } catch (error) {
    log('deferBotMessage failed for thread=%s: %O', platformThreadId, error);
    return false;
  }
}

/**
 * Atomically take every parked message for the thread, oldest first. Returns
 * an empty array when nothing is parked or Redis is unavailable.
 */
export async function drainDeferredBotMessages(
  applicationId: string,
  platformThreadId: string,
): Promise<DeferredBotMessage[]> {
  const redis = getAgentRuntimeRedisClient();
  if (!redis) return [];

  const key = buildDeferredMessagesKey(applicationId, platformThreadId);
  try {
    const results = await redis.multi().lrange(key, 0, -1).del(key).exec();
    const entries = (results?.[0]?.[1] as string[] | undefined) ?? [];
    const messages: DeferredBotMessage[] = [];
    for (const entry of entries) {
      try {
        messages.push(JSON.parse(entry) as DeferredBotMessage);
      } catch (error) {
        log(
          'drainDeferredBotMessages: dropping unparsable entry for thread=%s: %O',
          platformThreadId,
          error,
        );
      }
    }
    if (messages.length > 0) {
      log(
        'drained %d deferred message(s) for thread=%s app=%s',
        messages.length,
        platformThreadId,
        applicationId,
      );
    }
    return messages;
  } catch (error) {
    log('drainDeferredBotMessages failed for thread=%s: %O', platformThreadId, error);
    return [];
  }
}
