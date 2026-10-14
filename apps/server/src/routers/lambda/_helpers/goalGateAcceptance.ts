import { TRPCError } from '@trpc/server';

import { GoalModel } from '@/database/models/goal';
import type { AcceptanceItem } from '@/database/schemas/verify';
import type { LobeChatDatabase } from '@/database/type';
import { GoalService } from '@/server/services/goal';
import { scheduleGoalAdvance } from '@/server/services/goal/scheduler';
import { requireDecidableAcceptance } from '@/server/services/verify/acceptanceDecision';
import type { AcceptanceService } from '@/server/services/verify/acceptanceService';

/**
 * A Goal release gate is decided by its acceptance: accepting releases the
 * held wave, rejecting sends the plan back to the main Agent with the
 * reviewer's comment as the correction.
 *
 * The report is checked first, so a decision it cannot take (closed in another
 * tab, still verifying) never moves the goal. The goal answers next, so a
 * refused answer (a revision without a correction) leaves the report open; a
 * retry after the report's own write failed finds the goal already answered
 * and lets the report catch up. Returns the goal to advance once the report is
 * written.
 */
const answerGoalGate = async (
  db: LobeChatDatabase,
  service: AcceptanceService,
  acceptance: AcceptanceItem,
  optionId: 'release' | 'revise',
  comment?: string,
): Promise<string | undefined> => {
  if (acceptance.subjectType !== 'goal_gate') return undefined;
  await requireDecidableAcceptance(service.acceptanceModel, acceptance.id);
  return new GoalService(
    db,
    acceptance.userId,
    acceptance.workspaceId ?? undefined,
  ).answerReleaseGate(acceptance.subjectId, optionId, comment);
};

/**
 * Record a report's decision with the gate it decides: the goal answers first
 * ({@link answerGoalGate}), the report's own write follows, and the goal
 * advances only once both landed.
 */
export const withGoalGateAnswer = async <T>(
  db: LobeChatDatabase,
  service: AcceptanceService,
  acceptance: AcceptanceItem,
  optionId: 'release' | 'revise',
  comment: string | undefined,
  write: () => Promise<T>,
): Promise<T> => {
  const goalId = await answerGoalGate(db, service, acceptance, optionId, comment);
  const written = await write();
  if (goalId)
    await scheduleGoalAdvance({
      goalId,
      trigger: 'decide',
      userId: acceptance.userId,
      workspaceId: acceptance.workspaceId ?? undefined,
    });
  return written;
};

/**
 * A report a batch is still held on is that batch's only way forward: the
 * goal refuses inline answers while it exists. Closing, force-accepting,
 * deleting or merging it away would strand the batch, so only its own accept
 * or reject may settle it.
 */
export const assertNotHoldingRelease = async (db: LobeChatDatabase, acceptance: AcceptanceItem) => {
  if (acceptance.subjectType !== 'goal_gate') return;
  const goal = await new GoalModel(
    db,
    acceptance.userId,
    acceptance.workspaceId ?? undefined,
  ).findByNode(acceptance.subjectId);
  const state = goal?.config?.rolloutState;
  if (
    state?.releaseGateAcceptanceId === acceptance.id &&
    (state.phase === 'release_review' || state.phase === 'plan_revision')
  )
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'This report holds a batch release — approve it or send the plan back',
    });
};
