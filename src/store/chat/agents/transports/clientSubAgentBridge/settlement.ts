import { debug } from 'debug';

import { aiAgentService } from '@/services/aiAgent';

import { type SubAgentBridgeOutcome } from './types';

const log = debug('lobe-store:client-subagent-bridge');

/**
 * Settle the child thread (status + metadata) — the parked child skipped the
 * normal completion path's `updateClientTaskThreadStatus`, so without this
 * the thread list / sidebar shows processing forever.
 *
 * P2 (round-9): the settlement is the ONLY path that clears the child's
 * `processing` status. Swallowing a transient rejection here left the thread
 * permanently displayed and polled as running while the fire continued into
 * the parent resume and the success path deleted the registration + persisted
 * coordinates — no retry could ever settle it. Bounded retry (3 attempts,
 * linear backoff), then rethrow so the outer catch restores the registry
 * claim + barrier slot and keeps the persisted coordinates — the next
 * terminal boundary or a post-reload reconstruction can re-fire the bridge
 * and settle the thread.
 *
 * Extracted from fire.ts (source-layout §3: the file crossed the 800-line
 * limit; this closure is the cohesive settlement stage).
 */
export const settleChildThread = async (params: {
  childThreadId: string;
  metrics: { totalTokens?: number; toolCalls?: number };
  outcome: SubAgentBridgeOutcome;
  resultContent: string;
  succeeded: boolean;
  threadMessageCount: number;
}): Promise<void> => {
  const { childThreadId, metrics, outcome, resultContent, succeeded, threadMessageCount } = params;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await aiAgentService.updateClientTaskThreadStatus({
        // P2 (round-8): pass the terminal outcome verbatim — the server maps
        // `interrupted` to ThreadStatus.Cancel; recording it as `error`
        // persisted a cancelled child as failed.
        completionReason: outcome.status,
        error: succeeded ? undefined : resultContent,
        metadata: {
          // P2 (round-8): include the child's final cost — the settlement
          // overwrites thread.metadata.totalCost, so omitting it zeroed the
          // parked child's spend on refresh (ordinary completion paths
          // persist it).
          totalCost: outcome.cost,
          totalMessages: threadMessageCount,
          totalTokens: metrics.totalTokens,
          totalToolCalls: metrics.toolCalls,
        },
        resultContent,
        threadId: childThreadId,
      });
      return;
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      log(
        'bridge: thread settlement attempt %d/%d failed for %s, retrying: %O',
        attempt,
        maxAttempts,
        childThreadId,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};
