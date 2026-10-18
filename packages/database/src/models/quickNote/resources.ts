import type { QuickNoteResourceRole } from '@lobechat/types';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import isEqual from 'fast-deep-equal';

import {
  documentHistories,
  documents,
  quickNoteResources,
  quickNoteRunResources,
  quickNoteRuns,
  quickNotes,
  tasks,
  topics,
} from '../../schemas';
import { type QuickNoteContext, quickNoteOwnershipWhere } from './context';
import type { LinkQuickNoteResourceParams } from './types';

/** Resource-side Document alias used beside the Quick Note source Document. */
const quickNoteResourceDocuments = alias(documents, 'quick_note_resource_documents');

export const queryResources = async (ctx: QuickNoteContext, quickNoteId: string) => {
  const rows = await ctx.db
    .select({
      agentId: topics.agentId,
      createdAt: quickNoteResources.createdAt,
      documentContent: quickNoteResourceDocuments.content,
      documentFilename: quickNoteResourceDocuments.filename,
      documentTitle: quickNoteResourceDocuments.title,
      id: quickNoteResources.id,
      noteEditorData: documents.editorData,
      resourceId: quickNoteResources.resourceId,
      resourceType: quickNoteResources.resourceType,
      role: quickNoteResources.role,
      selector: quickNoteResources.selector,
      sourceEditorData: documentHistories.editorData,
      taskIdentifier: tasks.identifier,
      taskName: tasks.name,
      taskStatus: tasks.status,
      topicContent: topics.content,
      topicTitle: topics.title,
    })
    .from(quickNoteResources)
    .innerJoin(quickNotes, eq(quickNotes.id, quickNoteResources.quickNoteId))
    .innerJoin(documents, eq(documents.id, quickNotes.documentId))
    .innerJoin(documentHistories, eq(documentHistories.id, quickNoteResources.sourceHistoryId))
    .leftJoin(
      quickNoteResourceDocuments,
      eq(quickNoteResourceDocuments.id, quickNoteResources.resourceId),
    )
    .leftJoin(topics, eq(topics.id, quickNoteResources.resourceId))
    .leftJoin(tasks, eq(tasks.id, quickNoteResources.resourceId))
    .where(
      and(
        eq(quickNoteResources.quickNoteId, quickNoteId),
        eq(quickNoteResources.role, 'context'),
        quickNoteOwnershipWhere(ctx),
      ),
    )
    .orderBy(desc(quickNoteResources.createdAt), desc(quickNoteResources.id));

  const seen = new Set<string>();
  return rows.flatMap(
    ({
      documentContent,
      documentFilename,
      documentTitle,
      noteEditorData,
      sourceEditorData,
      taskIdentifier,
      taskName,
      topicContent,
      topicTitle,
      ...resource
    }) => {
      if (!isEqual(noteEditorData, sourceEditorData)) return [];
      const identity = `${resource.resourceType}:${resource.resourceId}:${JSON.stringify(resource.selector)}`;
      if (seen.has(identity)) return [];
      seen.add(identity);

      return [
        {
          ...resource,
          label:
            taskName ??
            taskIdentifier ??
            topicTitle ??
            documentTitle ??
            documentFilename ??
            topicContent ??
            documentContent ??
            null,
          taskIdentifier,
        },
      ];
    },
  );
};

/**
 * Reads an owned Run with the source snapshots and Quick Note metadata Annotation acceptance needs.
 *
 * Returns:
 * - The Run snapshot, or `undefined` when inaccessible.
 */
export const findRunForAnnotation = async (ctx: QuickNoteContext, runId: string) => {
  const [run] = await ctx.db
    .select({
      quickNoteId: quickNoteRuns.quickNoteId,
      sourceDocumentEditorData: documents.editorData,
      sourceHistoryId: quickNoteRuns.sourceHistoryId,
      sourceHistoryEditorData: documentHistories.editorData,
      status: quickNoteRuns.status,
      analyzeDueAt: quickNotes.analyzeDueAt,
      tags: quickNotes.tags,
    })
    .from(quickNoteRuns)
    .innerJoin(quickNotes, eq(quickNotes.id, quickNoteRuns.quickNoteId))
    .innerJoin(documents, eq(documents.id, quickNotes.documentId))
    .innerJoin(documentHistories, eq(documentHistories.id, quickNoteRuns.sourceHistoryId))
    .where(and(eq(quickNoteRuns.id, runId), quickNoteOwnershipWhere(ctx)));

  return run;
};

/** The Annotation Resource bound to one Quick Note source revision, if any. */
export const findAnnotationResource = async (
  ctx: QuickNoteContext,
  quickNoteId: string,
  sourceHistoryId: string,
) => {
  const [resource] = await ctx.db
    .select()
    .from(quickNoteResources)
    .where(
      and(
        eq(quickNoteResources.quickNoteId, quickNoteId),
        eq(quickNoteResources.sourceHistoryId, sourceHistoryId),
        eq(quickNoteResources.role, 'annotation'),
      ),
    )
    .limit(1);

  return resource;
};

/** Binds a generated Annotation Document to one Quick Note source revision. */
export const createAnnotationResource = async (
  ctx: QuickNoteContext,
  params: { documentId: string; quickNoteId: string; sourceHistoryId: string },
) => {
  const [resource] = await ctx.db
    .insert(quickNoteResources)
    .values({
      documentId: params.documentId,
      quickNoteId: params.quickNoteId,
      resourceId: params.documentId,
      resourceType: 'document',
      role: 'annotation',
      sourceHistoryId: params.sourceHistoryId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    })
    .returning();

  return resource;
};

/** Records which Run produced one accepted Resource revision. */
export const recordRunResource = async (
  ctx: QuickNoteContext,
  params: { documentHistoryId: string; resourceId: string; runId: string },
) => {
  await ctx.db.insert(quickNoteRunResources).values({
    documentHistoryId: params.documentHistoryId,
    resourceId: params.resourceId,
    runId: params.runId,
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
  });
};

export const linkResource = async (
  ctx: QuickNoteContext,
  runId: string,
  params: LinkQuickNoteResourceParams,
) =>
  ctx.db.transaction(async (tx) => {
    const [run] = await tx
      .select({
        quickNoteId: quickNoteRuns.quickNoteId,
        sourceHistoryId: quickNoteRuns.sourceHistoryId,
      })
      .from(quickNoteRuns)
      .innerJoin(quickNotes, eq(quickNotes.id, quickNoteRuns.quickNoteId))
      .where(and(eq(quickNoteRuns.id, runId), quickNoteOwnershipWhere(ctx)));
    if (!run) return undefined;

    let documentId: string | undefined;
    if (params.type === 'document' || params.type === 'page') {
      const documentOwnership = ctx.workspaceId
        ? and(
            eq(documents.workspaceId, ctx.workspaceId),
            sql`(${documents.visibility} = 'public' OR ${documents.userId} = ${ctx.userId})`,
          )
        : and(eq(documents.userId, ctx.userId), isNull(documents.workspaceId));
      const [document] = await tx
        .select({ id: documents.id })
        .from(documents)
        .where(and(eq(documents.id, params.id), documentOwnership));
      if (!document) return undefined;
      documentId = document.id;
    } else if (params.type === 'topic' || params.type === 'conversation') {
      const topicOwnership = ctx.workspaceId
        ? eq(topics.workspaceId, ctx.workspaceId)
        : and(eq(topics.userId, ctx.userId), isNull(topics.workspaceId));
      const [topic] = await tx
        .select({ id: topics.id })
        .from(topics)
        .where(and(eq(topics.id, params.id), topicOwnership));
      if (!topic) return undefined;
    } else {
      // TODO: Add native authorization providers for Message, Thread, Task, Turn, and generic Resource.
      return undefined;
    }

    const role = params.role ?? 'context';

    const [created] = await tx
      .insert(quickNoteResources)
      .values({
        documentId,
        quickNoteId: run.quickNoteId,
        resourceId: params.id,
        resourceType: params.type,
        role,
        selector: params.selector,
        sourceHistoryId: run.sourceHistoryId,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
      })
      .onConflictDoNothing()
      .returning();
    const resource =
      created ??
      (
        await tx
          .select()
          .from(quickNoteResources)
          .where(
            and(
              eq(quickNoteResources.quickNoteId, run.quickNoteId),
              eq(quickNoteResources.sourceHistoryId, run.sourceHistoryId),
              eq(quickNoteResources.resourceId, params.id),
              eq(quickNoteResources.resourceType, params.type),
              eq(quickNoteResources.role, role),
            ),
          )
      )[0];
    if (!resource) return undefined;

    await tx
      .insert(quickNoteRunResources)
      .values({
        resourceId: resource.id,
        runId,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
      })
      .onConflictDoNothing();

    return resource;
  });

export const linkDocumentResource = async (
  ctx: QuickNoteContext,
  runId: string,
  documentId: string,
  role: QuickNoteResourceRole = 'context',
) => linkResource(ctx, runId, { id: documentId, role, type: 'document' });
