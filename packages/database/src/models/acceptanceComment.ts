import type {
  AcceptanceCommentAttachmentRef,
  AcceptanceCommentKind,
  AcceptanceReviewAnnotation,
  DocumentCommentJson,
} from '@lobechat/types';
import { and, count, desc, eq, isNull, ne } from 'drizzle-orm';

import type { AcceptanceCommentRow } from '../schemas/acceptanceComment';
import { acceptanceComments } from '../schemas/acceptanceComment';
import type { LobeChatDatabase } from '../type';

export const ACCEPTANCE_COMMENT_PARENT_NOT_FOUND = 'Parent comment not found in this acceptance';

/**
 * One person's emoji on one comment is one row, and the idempotency key is
 * derived rather than supplied: the unique index on
 * (acceptance, author, client_id) is then what stops the same person reacting
 * twice with the same emoji, with no read-modify-write in between.
 */
export const acceptanceReactionClientId = (commentId: string, emoji: string) =>
  `reaction:${commentId}:${emoji}`;

const MAX_COMMENTS_PER_ACCEPTANCE = 1000;

export interface CreateAcceptanceCommentParams {
  acceptanceId: string;
  /** Present only for `evidence` anchors; replies and approvals carry none. */
  anchor?: {
    checkItemId: string;
    evidenceId: string;
    rect: AcceptanceReviewAnnotation['rect'];
  };
  /** Files to hang on the remark, kept apart from the body. */
  attachments?: AcceptanceCommentAttachmentRef[];
  /** Sign the row as this agent; ownership still keys on `authorUserId`. */
  authorAgentId?: string;
  authorUserId: string;
  clientId: string;
  content: string;
  contextRunId?: string;
  /** The editor's JSON, when a person wrote the body in one. */
  editorData?: DocumentCommentJson;
  kind?: AcceptanceCommentKind;
  parentCommentId?: string;
  workspaceId?: string | null;
}

export interface CreateAcceptanceCommentResult {
  comment: AcceptanceCommentRow;
  /** true when the idempotency key already existed and nothing new was written. */
  isDuplicate: boolean;
}

/**
 * Collaboration rows on an acceptance. Deliberately NOT ownership-scoped: who
 * may read or write a given acceptance's discussion is decided by the router
 * from the acceptance's own visibility and workspace, the same rule the bundle
 * read uses. The model only guarantees structural integrity (threads stay
 * inside one acceptance, tombstones keep replies readable).
 */
export class AcceptanceCommentModel {
  private readonly db: LobeChatDatabase;

  constructor(db: LobeChatDatabase) {
    this.db = db;
  }

  create = async (
    params: CreateAcceptanceCommentParams,
  ): Promise<CreateAcceptanceCommentResult> => {
    return this.db.transaction(async (tx) => {
      let parentCommentId: string | undefined;
      if (params.parentCommentId) {
        const [parent] = await tx
          .select({
            acceptanceId: acceptanceComments.acceptanceId,
            id: acceptanceComments.id,
            parentCommentId: acceptanceComments.parentCommentId,
          })
          .from(acceptanceComments)
          .where(eq(acceptanceComments.id, params.parentCommentId))
          .limit(1)
          .for('key share');
        if (!parent || parent.acceptanceId !== params.acceptanceId) {
          throw new Error(ACCEPTANCE_COMMENT_PARENT_NOT_FOUND);
        }
        // Replies to a reply flatten onto the thread root. A reaction does not:
        // it answers the exact comment it was clicked on, reply or root.
        parentCommentId =
          params.kind === 'reaction' ? parent.id : (parent.parentCommentId ?? parent.id);
      }

      const isReaction = params.kind === 'reaction';
      const isReply = Boolean(parentCommentId) && !isReaction;
      const anchor = parentCommentId ? undefined : params.anchor;
      const [inserted] = await tx
        .insert(acceptanceComments)
        .values({
          acceptanceId: params.acceptanceId,
          anchorRect: anchor?.rect ?? null,
          anchorType: anchor ? 'evidence' : 'acceptance',
          attachments: params.attachments?.length ? params.attachments : null,
          authorAgentId: params.authorAgentId ?? null,
          authorUserId: params.authorUserId,
          checkItemId: anchor?.checkItemId ?? null,
          clientId: params.clientId,
          content: params.content,
          contextRunId: params.contextRunId ?? null,
          editorData: params.editorData ?? null,
          evidenceId: anchor?.evidenceId ?? null,
          kind: isReply ? 'comment' : (params.kind ?? 'comment'),
          parentCommentId: parentCommentId ?? null,
          workspaceId: params.workspaceId ?? null,
        })
        .onConflictDoNothing({
          target: [
            acceptanceComments.acceptanceId,
            acceptanceComments.authorUserId,
            acceptanceComments.clientId,
          ],
        })
        .returning();

      if (inserted) return { comment: inserted, isDuplicate: false };

      const [existing] = await tx
        .select()
        .from(acceptanceComments)
        .where(
          and(
            eq(acceptanceComments.acceptanceId, params.acceptanceId),
            eq(acceptanceComments.authorUserId, params.authorUserId),
            eq(acceptanceComments.clientId, params.clientId),
          ),
        )
        .limit(1);
      return { comment: existing, isDuplicate: true };
    });
  };

  findById = async (id: string) => {
    const [row] = await this.db
      .select()
      .from(acceptanceComments)
      .where(eq(acceptanceComments.id, id))
      .limit(1);
    return row;
  };

  /**
   * Every row of one acceptance, oldest first. A discussion on one delivery is
   * small by nature (a handful of people over a handful of rounds), so the page
   * reads it whole and groups threads client-side.
   *
   * The cap takes the NEWEST rows and hands them back in reading order. Taking
   * the oldest would mean that past the cap a successful post never appears —
   * the write succeeds, the reload drops it, and the author is told nothing.
   * Losing the far end of a very long history is the better failure.
   */
  listByAcceptance = async (acceptanceId: string) => {
    const rows = await this.db
      .select()
      .from(acceptanceComments)
      .where(eq(acceptanceComments.acceptanceId, acceptanceId))
      .orderBy(desc(acceptanceComments.createdAt), desc(acceptanceComments.id))
      .limit(MAX_COMMENTS_PER_ACCEPTANCE);
    return rows.reverse();
  };

  /**
   * Delete the author's own comment. A root that still has replies becomes a
   * tombstone so the replies keep their context; a reply whose tombstoned root
   * has no other replies takes the root with it.
   */
  delete = async (id: string, authorUserId: string): Promise<'hard' | 'soft' | false> => {
    return this.db.transaction(async (tx) => {
      const [comment] = await tx
        .select({
          deletedAt: acceptanceComments.deletedAt,
          id: acceptanceComments.id,
          parentCommentId: acceptanceComments.parentCommentId,
        })
        .from(acceptanceComments)
        .where(
          and(eq(acceptanceComments.id, id), eq(acceptanceComments.authorUserId, authorUserId)),
        )
        .limit(1)
        .for('update');
      if (!comment || comment.deletedAt) return false;

      // Reactions are children but not replies: a comment nobody answered is
      // still deletable outright, and its reactions go with it.
      const [replyCount] = await tx
        .select({ total: count() })
        .from(acceptanceComments)
        .where(
          and(eq(acceptanceComments.parentCommentId, id), ne(acceptanceComments.kind, 'reaction')),
        );

      if ((replyCount?.total ?? 0) > 0) {
        await tx
          .update(acceptanceComments)
          .set({ content: '', deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(acceptanceComments.id, id));
        return 'soft';
      }

      await tx.delete(acceptanceComments).where(eq(acceptanceComments.parentCommentId, id));
      await tx.delete(acceptanceComments).where(eq(acceptanceComments.id, id));

      if (comment.parentCommentId) {
        const [parent] = await tx
          .select({ deletedAt: acceptanceComments.deletedAt, id: acceptanceComments.id })
          .from(acceptanceComments)
          .where(eq(acceptanceComments.id, comment.parentCommentId))
          .limit(1);
        if (parent?.deletedAt) {
          const [siblings] = await tx
            .select({ total: count() })
            .from(acceptanceComments)
            .where(
              and(
                eq(acceptanceComments.parentCommentId, parent.id),
                ne(acceptanceComments.kind, 'reaction'),
              ),
            );
          if ((siblings?.total ?? 0) === 0) {
            await tx
              .delete(acceptanceComments)
              .where(eq(acceptanceComments.parentCommentId, parent.id));
            await tx.delete(acceptanceComments).where(eq(acceptanceComments.id, parent.id));
          }
        }
      }
      return 'hard';
    });
  };

  /** Take back one's own emoji. Absent rows are a no-op, so a double click is safe. */
  removeReaction = async (params: {
    acceptanceId: string;
    authorUserId: string;
    commentId: string;
    emoji: string;
  }) => {
    const deleted = await this.db
      .delete(acceptanceComments)
      .where(
        and(
          eq(acceptanceComments.acceptanceId, params.acceptanceId),
          eq(acceptanceComments.authorUserId, params.authorUserId),
          eq(
            acceptanceComments.clientId,
            acceptanceReactionClientId(params.commentId, params.emoji),
          ),
          eq(acceptanceComments.kind, 'reaction'),
        ),
      )
      .returning({ id: acceptanceComments.id });
    return deleted.length > 0;
  };

  /** Mark a thread root handled (or reopen it). Replies are not resolvable. */
  setResolved = async (rootId: string, resolved: boolean, userId: string) => {
    const [row] = await this.db
      .update(acceptanceComments)
      .set(
        resolved
          ? { resolvedAt: new Date(), resolvedByUserId: userId, updatedAt: new Date() }
          : { resolvedAt: null, resolvedByUserId: null, updatedAt: new Date() },
      )
      .where(and(eq(acceptanceComments.id, rootId), isNull(acceptanceComments.parentCommentId)))
      .returning();
    return row;
  };
}
