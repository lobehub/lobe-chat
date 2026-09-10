import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import { WorkspaceMemberModel } from '@/database/models/workspaceMember';
import type { AcceptanceItem } from '@/database/schemas/verify';
import { acceptances } from '@/database/schemas/verify';
import type { LobeChatDatabase } from '@/database/type';
import { isUuid } from '@/database/utils/uuid';

export interface AcceptanceCommentAccess {
  acceptance: AcceptanceItem;
  /** May write comments / approvals: the creator, or a non-viewer member of the acceptance's workspace. */
  canComment: boolean;
  isOwner: boolean;
}

/**
 * Who may take part in an acceptance's discussion.
 *
 * Reading follows the bundle: the creator, anyone when the acceptance is
 * `public`, or a member of the acceptance's OWN workspace (not the caller's
 * active one). Writing is narrower — a public link lets a visitor read the
 * discussion, never join it — and mirrors the write procedure's member gate:
 * workspace viewers stay read-only. A personal-scope acceptance has no
 * collaborators, so only its creator can write there.
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

  const canComment = isOwner || (Boolean(member) && member!.role !== 'viewer');
  return { acceptance, canComment, isOwner };
}
