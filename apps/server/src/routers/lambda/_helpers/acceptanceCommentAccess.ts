import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import { WorkspaceMemberModel } from '@/database/models/workspaceMember';
import type { AcceptanceItem } from '@/database/schemas/verify';
import { acceptances } from '@/database/schemas/verify';
import type { LobeChatDatabase } from '@/database/type';
import { isUuid } from '@/database/utils/uuid';

export interface AcceptanceCommentAccess {
  acceptance: AcceptanceItem;
  /**
   * May speak for the delivery itself — approve a round, or post the round's
   * own introduction. The creator, or a non-viewer member of the acceptance's
   * workspace.
   */
  canApprove: boolean;
  /** May write comments, annotations and reactions: anyone signed in who can read it. */
  canComment: boolean;
  isOwner: boolean;
}

/**
 * Who may take part in an acceptance's discussion.
 *
 * Reading follows the bundle: the creator, anyone when the acceptance is
 * `public`, or a member of the acceptance's OWN workspace (not the caller's
 * active one). Remarking is as wide as reading, minus anonymity — whoever was
 * handed the link can answer the evidence in front of them, and a shared
 * delivery nobody outside the team may reply to is a report, not a review.
 *
 * Speaking FOR the delivery stays narrow. An approval and a round introduction
 * are the delivery's own voice, so they need the creator or a workspace
 * teammate; the acceptance decision itself is narrower still and lives on the
 * bundle's `canReview`.
 *
 * Missing access reads as NOT_FOUND, like the bundle, so existence never leaks.
 */
export async function resolveAcceptanceCommentAccess(
  db: LobeChatDatabase,
  userId: string | null | undefined,
  acceptanceId: string,
): Promise<AcceptanceCommentAccess> {
  const [acceptance] = isUuid(acceptanceId)
    ? await db.select().from(acceptances).where(eq(acceptances.id, acceptanceId)).limit(1)
    : [];
  if (!acceptance) throw new TRPCError({ code: 'NOT_FOUND', message: 'Acceptance not found' });

  const isOwner = Boolean(userId) && userId === acceptance.userId;
  const member =
    !isOwner && userId && acceptance.workspaceId
      ? await new WorkspaceMemberModel(db, userId).getMember(acceptance.workspaceId, userId)
      : undefined;

  const canRead = isOwner || acceptance.visibility === 'public' || Boolean(member);
  if (!canRead) throw new TRPCError({ code: 'NOT_FOUND', message: 'Acceptance not found' });

  return {
    acceptance,
    canApprove: isOwner || (Boolean(member) && member!.role !== 'viewer'),
    // Read access is already settled above, so a signed-in caller here is a
    // caller the acceptance was shared with.
    canComment: Boolean(userId),
    isOwner,
  };
}
