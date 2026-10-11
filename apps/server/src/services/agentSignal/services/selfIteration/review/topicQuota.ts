import debug from 'debug';

import { AGENT_SIGNAL_DEFAULTS, AGENT_SIGNAL_KEYS } from '../../../constants';
import { getRedisClient } from '../../../store/adapters/redis/shared';

const log = debug('lobe-server:agent-signal:nightly-topic-quota');

/** Input for claiming nightly review topics against the per-user nightly quota. */
export interface ClaimNightlyReviewTopicsInput {
  /** User-local review date (`YYYY-MM-DD`) shared by every agent reviewed that night. */
  localDate: string;
  /** Candidate topic ids, in priority order. Duplicates are ignored. */
  topicIds: string[];
  /** User whose nightly review is being bounded. */
  userId: string;
}

/** Outcome of one nightly topic claim. */
export interface ClaimNightlyReviewTopicsResult {
  /** Topic ids that may be processed: already counted for this night, or newly counted. */
  admitted: string[];
  /** Why some candidates were refused, when any were. */
  reason?: 'exhausted' | 'unavailable';
}

/** Claims topics against the per-user nightly quota. Injected so collectors stay pure. */
export type ClaimNightlyReviewTopics = (
  input: ClaimNightlyReviewTopicsInput,
) => Promise<ClaimNightlyReviewTopicsResult>;

/**
 * Admits candidate topic ids into the night's set while it holds fewer than `limit` members.
 * Ids already in the set are admitted without counting again, so a replayed run (or the
 * expertise pass reading topics the review already took) never double-counts.
 *
 * KEYS[1] = set key; ARGV[1] = limit; ARGV[2] = ttl seconds; ARGV[3..] = topic ids
 */
const CLAIM_TOPICS_SCRIPT = `
local admitted = {}
local count = redis.call('SCARD', KEYS[1])
local limit = tonumber(ARGV[1])
for i = 3, #ARGV do
  local id = ARGV[i]
  if redis.call('SISMEMBER', KEYS[1], id) == 1 then
    table.insert(admitted, id)
  elseif count < limit then
    redis.call('SADD', KEYS[1], id)
    count = count + 1
    table.insert(admitted, id)
  end
end
redis.call('EXPIRE', KEYS[1], ARGV[2])
return admitted
`;

/**
 * Claims topics against the user's nightly review quota in Redis.
 *
 * Use when:
 * - A nightly review is about to feed topics to an agent's review context, or the nightly
 *   expertise pass is about to ingest topics
 *
 * Expects:
 * - Every caller for the same user and night passes the same `localDate`
 *
 * Returns:
 * - The admitted subset in input order; `reason: 'exhausted'` when the night's
 *   {@link AGENT_SIGNAL_DEFAULTS.nightlyReviewTopicLimitPerUser} distinct topics are used up
 * - Nothing admitted with `reason: 'unavailable'` when Redis is missing or errors: nightly
 *   review is optional work billed to the user, so an unenforceable cap skips it
 */
export const claimNightlyReviewTopics: ClaimNightlyReviewTopics = async (input) => {
  const topicIds = [...new Set(input.topicIds.filter(Boolean))];
  if (topicIds.length === 0) return { admitted: [] };

  const redis = getRedisClient();
  if (!redis) {
    log('nightly topic quota unavailable user=%s date=%s', input.userId, input.localDate);
    return { admitted: [], reason: 'unavailable' };
  }

  try {
    const admitted = (await redis.eval(
      CLAIM_TOPICS_SCRIPT,
      1,
      AGENT_SIGNAL_KEYS.nightlyTopicQuota(input.userId, input.localDate),
      AGENT_SIGNAL_DEFAULTS.nightlyReviewTopicLimitPerUser,
      AGENT_SIGNAL_DEFAULTS.nightlyReviewTopicQuotaTtlSeconds,
      ...topicIds,
    )) as string[];

    if (admitted.length < topicIds.length) {
      log(
        'nightly topic quota exhausted user=%s date=%s admitted=%d refused=%d limit=%d',
        input.userId,
        input.localDate,
        admitted.length,
        topicIds.length - admitted.length,
        AGENT_SIGNAL_DEFAULTS.nightlyReviewTopicLimitPerUser,
      );
      return { admitted, reason: 'exhausted' };
    }

    return { admitted };
  } catch (error) {
    console.error('[AgentSignal] Failed to claim nightly review topics, skipping:', {
      error,
      userId: input.userId,
    });
    return { admitted: [], reason: 'unavailable' };
  }
};
