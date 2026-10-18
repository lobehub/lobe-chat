import { and, desc, eq } from 'drizzle-orm';
import isEqual from 'fast-deep-equal';

import { quickNoteCommentRevisions, quickNoteComments, quickNotes } from '../../schemas';
import { type QuickNoteContext, quickNoteOwnershipWhere } from './context';
import type { CreateQuickNoteCommentParams, UpdateQuickNoteCommentParams } from './types';

export const createComment = async (
  ctx: QuickNoteContext,
  quickNoteId: string,
  params: CreateQuickNoteCommentParams,
) =>
  ctx.db.transaction(async (tx) => {
    const [quickNote] = await tx
      .select({ id: quickNotes.id })
      .from(quickNotes)
      .where(and(eq(quickNotes.id, quickNoteId), quickNoteOwnershipWhere(ctx)));
    if (!quickNote) return undefined;

    const [comment] = await tx
      .insert(quickNoteComments)
      .values({
        authorUserId: ctx.userId,
        content: params.content,
        editorData: params.editorData,
        quickNoteId,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
      })
      .returning();
    const [revision] = await tx
      .insert(quickNoteCommentRevisions)
      .values({
        commentId: comment.id,
        content: params.content,
        editorData: params.editorData,
        editorUserId: ctx.userId,
      })
      .returning();

    return { comment, revision };
  });

export const queryComments = async (ctx: QuickNoteContext, quickNoteId: string) =>
  ctx.db
    .select({
      authorUserId: quickNoteComments.authorUserId,
      content: quickNoteComments.content,
      createdAt: quickNoteComments.createdAt,
      editorData: quickNoteComments.editorData,
      id: quickNoteComments.id,
      updatedAt: quickNoteComments.updatedAt,
    })
    .from(quickNoteComments)
    .innerJoin(quickNotes, eq(quickNotes.id, quickNoteComments.quickNoteId))
    .where(and(eq(quickNoteComments.quickNoteId, quickNoteId), quickNoteOwnershipWhere(ctx)))
    .orderBy(quickNoteComments.createdAt, quickNoteComments.id);

export const updateComment = async (
  ctx: QuickNoteContext,
  commentId: string,
  params: UpdateQuickNoteCommentParams,
) =>
  ctx.db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        content: quickNoteComments.content,
        editorData: quickNoteComments.editorData,
        id: quickNoteComments.id,
      })
      .from(quickNoteComments)
      .innerJoin(quickNotes, eq(quickNotes.id, quickNoteComments.quickNoteId))
      .where(and(eq(quickNoteComments.id, commentId), quickNoteOwnershipWhere(ctx)));
    if (!existing) return undefined;

    if (existing.content === params.content && isEqual(existing.editorData, params.editorData)) {
      const [revision] = await tx
        .select()
        .from(quickNoteCommentRevisions)
        .where(eq(quickNoteCommentRevisions.commentId, commentId))
        .orderBy(desc(quickNoteCommentRevisions.createdAt), desc(quickNoteCommentRevisions.id))
        .limit(1);
      return { comment: existing, revision };
    }

    const [comment] = await tx
      .update(quickNoteComments)
      .set({ content: params.content, editorData: params.editorData, updatedAt: new Date() })
      .where(eq(quickNoteComments.id, commentId))
      .returning();
    const [revision] = await tx
      .insert(quickNoteCommentRevisions)
      .values({
        commentId,
        content: params.content,
        editorData: params.editorData,
        editorUserId: ctx.userId,
      })
      .returning();

    return { comment, revision };
  });
