import { AGENT_SIGNAL_SOURCE_TYPES } from '@lobechat/agent-signal/source';
import type { Context } from 'hono';

import { QuickNoteModel } from '@/database/models/quickNote';
import { getServerDB } from '@/database/server';
import { enqueueAgentSignalSourceEvent } from '@/server/services/agentSignal';

/**
 * Claims due Automatic Discovery Runs for clients that are no longer online.
 *
 * Call stack:
 *
 * QStash one-minute schedule
 *   -> {@link sweepQuickNoteDiscovery}
 *     -> {@link QuickNoteModel.findDueDiscoveryCandidates}
 *       -> {@link QuickNoteModel.claimRun}
 *         -> Agent Signal Workflow
 *
 * Use when:
 * - The deployment invokes the signed sweep route once per minute.
 *
 * Expects:
 * - Candidate selection already filters the default-off user setting.
 * - Agent Signal scope and Run constraints deduplicate client/sweep races.
 *
 * Returns:
 * - Claimed and enqueued Run counts for cron observability.
 */
export const sweepQuickNoteDiscovery = async (context: Context) => {
  try {
    const db = await getServerDB();
    const candidates = await QuickNoteModel.findDueDiscoveryCandidates(db);
    let enqueued = 0;

    for (const candidate of candidates) {
      const model = new QuickNoteModel(db, candidate.userId, candidate.workspaceId ?? undefined);
      const run = await model.claimRun(candidate.id, { kind: 'discovery' });
      if (!run) continue;

      const result = await enqueueAgentSignalSourceEvent(
        {
          payload: {
            quickNoteId: run.quickNoteId,
            runId: run.id,
            sourceHistoryId: run.sourceHistoryId,
            userId: candidate.userId,
          },
          scopeKey: `quick-note:${run.quickNoteId}`,
          sourceId: run.id,
          sourceType: AGENT_SIGNAL_SOURCE_TYPES.quickNoteDiscoveryRequested,
        },
        {
          userId: candidate.userId,
          workspaceId: candidate.workspaceId ?? undefined,
        },
      );
      if (result.accepted) enqueued += 1;
    }

    return context.json({ checked: candidates.length, enqueued, success: true });
  } catch (error) {
    console.error('[quick-note/sweep]', error);
    return context.json({ error: error instanceof Error ? error.message : 'Internal error' }, 500);
  }
};
