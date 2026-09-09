import debug from 'debug';

import { getAgentRuntimeRedisClient } from '@/server/modules/AgentRuntime/redis';

const log = debug('bot-platform:feishu:reaction-tracker');

/**
 * Remembers which reaction the bot placed on a message, so it can take it back.
 *
 * Feishu/Lark's delete endpoint (`protocol-spec.md` §5.2) is keyed by
 * `reaction_id`, and that id is handed out exactly once — in the response to
 * the add call. Without holding onto it the bot can only ever add, so a single
 * run stacks its whole progress sequence (received → thinking → working) on the
 * user's message and never clears it.
 *
 * Redis rather than process memory because queue-mode step callbacks land in a
 * different process from the one that placed the first reaction — the same
 * reason `../../reactionState.ts` exists. Keyed by `messageId` (not thread) so
 * concurrent mentions in one chat don't clobber each other, and TTL'd to the
 * agent execution ceiling so a crashed run can't leak the key forever.
 *
 * With Redis disabled every operation is a no-op and the caller degrades to
 * add-only behaviour — the same stacking as before, never an error.
 */
const TTL_SECONDS = 30 * 60;

const buildKey = (platform: string, applicationId: string, messageId: string): string =>
  `bot:feishu-reaction-id:${platform}:${applicationId}:${messageId}`;

/** The `reaction_id` the bot last placed on `messageId`, if any. */
export async function readReactionId(
  platform: string,
  applicationId: string,
  messageId: string,
): Promise<string | null> {
  const redis = getAgentRuntimeRedisClient();
  if (!redis) return null;
  try {
    return await redis.get(buildKey(platform, applicationId, messageId));
  } catch (error) {
    log('readReactionId failed: %O', error);
    return null;
  }
}

export async function writeReactionId(
  platform: string,
  applicationId: string,
  messageId: string,
  reactionId: string,
): Promise<void> {
  const redis = getAgentRuntimeRedisClient();
  if (!redis || !reactionId) return;
  try {
    await redis.set(buildKey(platform, applicationId, messageId), reactionId, 'EX', TTL_SECONDS);
  } catch (error) {
    log('writeReactionId failed: %O', error);
  }
}

export async function deleteReactionId(
  platform: string,
  applicationId: string,
  messageId: string,
): Promise<void> {
  const redis = getAgentRuntimeRedisClient();
  if (!redis) return;
  try {
    await redis.del(buildKey(platform, applicationId, messageId));
  } catch (error) {
    log('deleteReactionId failed: %O', error);
  }
}
