import { INBOX_SESSION_ID } from '@lobechat/const';
import { sql } from 'drizzle-orm';

import { agents } from '../../schemas';

/**
 * SQL predicate for the per-agent self-iteration opt-in on the `agents` table.
 *
 * Use when:
 * - A query targets agents that participate in Agent Signal self-iteration
 *   (nightly review candidates, review/reflection ownership checks)
 *
 * Expects:
 * - The query selects from or joins `agents`
 *
 * Returns:
 * - Lobe AI (inbox slug): true unless `chatConfig.selfIteration.optedOut` is `true`. A stored
 *   `enabled: false` is ignored: default-merged configs persist it on inbox rows, so it is not
 *   a user choice.
 * - Other agents: true only when `chatConfig.selfIteration.enabled` is explicitly `true`
 *
 * Mirrors `isAgentSelfIterationOptedIn` in the server Agent Signal feature gate; keep both in sync.
 */
export const agentSelfIterationOptedInSql = () => sql`(
  CASE
    WHEN ${agents.slug} = ${INBOX_SESSION_ID}
      THEN COALESCE((${agents.chatConfig}->'selfIteration'->>'optedOut')::boolean, false) = false
    ELSE COALESCE((${agents.chatConfig}->'selfIteration'->>'enabled')::boolean, false) = true
  END
)`;
