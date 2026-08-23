import {
  DOCUMENT_HISTORY_AUTOSAVE_SOURCE_LIMIT,
  DOCUMENT_HISTORY_AUTOSAVE_WINDOW_MS,
} from '@lobechat/const';
import type { QuickNoteRunKind } from '@lobechat/types';
import { and, desc, eq, inArray, isNull, lte, sql } from 'drizzle-orm';
import isEqual from 'fast-deep-equal';

import {
  documentHistories,
  documents,
  quickNoteResources,
  quickNoteRunResources,
  quickNoteRuns,
  quickNotes,
  topics,
  userSettings,
} from '../schemas';
import type { LobeChatDatabase } from '../type';
import { idGenerator } from '../utils/idGenerator';

interface QuickNoteEditorData extends Record<string, unknown> {}

/** Input used to atomically create a Quick Note and its backing containers. */
export interface CreateQuickNoteParams {
  /** Optional collection label chosen by the user. */
  collection?: string | null;
  /** Plain-text projection of the rich-text editor content. */
  content?: string;
  /** Rich-text source stored in the backing Document. */
  editorData?: QuickNoteEditorData;
  /** Optional client-generated Quick Note identifier. */
  id?: string;
  /** Optional location hint attached directly to the capture. */
  location?: string | null;
  /** Lightweight labels attached directly to the capture. */
  tags?: string[];
}

/** Mutable source fields persisted by the editor autosave path. */
export interface UpdateQuickNoteContentParams {
  /** Plain-text projection of the rich-text editor content. */
  content: string;
  /** When Automatic Discovery becomes eligible for dispatch. */
  discoveryDueAt?: Date | null;
  /** Rich-text source stored in the backing Document. */
  editorData: QuickNoteEditorData;
}

/** Input used to claim an immutable processing Run. */
export interface ClaimQuickNoteRunParams {
  /** Processing mode to dispatch for the pinned source revision. */
  kind: QuickNoteRunKind;
}

/** Accepted lightweight interpretation produced by a Quick Note Run. */
export interface AcceptQuickNoteAnnotationParams {
  /** Concise Markdown projection shown by the existing Annotation panel. */
  content: string;
  /** Rich-text representation of the accepted Annotation revision. */
  editorData?: QuickNoteEditorData;
  /** Lightweight labels merged onto the Quick Note. */
  tags?: string[];
}

/**
 * Persists private Quick Notes and claims immutable processing snapshots.
 *
 * Use when:
 * - Saving the existing Quick Note editor without changing its UI contract.
 * - Dispatching Discovery or Dive against a stable source revision.
 *
 * Expects:
 * - `userId` identifies the owner of every read and mutation.
 * - `workspaceId` is omitted in personal mode and fixed for the model lifetime.
 *
 * Returns:
 * - Owner-scoped Quick Note records and immutable Run identities.
 */
export class QuickNoteModel {
  private readonly userId: string;
  private readonly workspaceId?: string;
  private readonly db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    this.db = db;
    this.userId = userId;
    this.workspaceId = workspaceId;
  }

  /**
   * Reads the default-off Automatic Discovery preference for one user.
   *
   * Use when:
   * - Claiming or dispatching background Quick Note work.
   *
   * Expects:
   * - Missing settings are treated as opt-out.
   *
   * Returns:
   * - `true` only for an explicit user opt-in.
   */
  static isAutomaticDiscoveryEnabled = async (db: LobeChatDatabase, userId: string) => {
    const [settings] = await db
      .select({ general: userSettings.general })
      .from(userSettings)
      .where(eq(userSettings.id, userId));
    const general = settings?.general as Record<string, unknown> | null | undefined;

    return general?.enableQuickNoteAutomaticDiscovery === true;
  };

  /**
   * Finds due captures whose owners explicitly enabled Automatic Discovery.
   *
   * Use when:
   * - The one-minute server sweep compensates for closed or disconnected clients.
   *
   * Expects:
   * - `limit` bounds one cron invocation and defaults to 100.
   * - Missing user settings mean opt-out.
   *
   * Returns:
   * - Owner/workspace routing identities ordered by oldest due time first.
   */
  static findDueDiscoveryCandidates = async (
    db: LobeChatDatabase,
    params: { limit?: number; now?: Date } = {},
  ) =>
    db
      .select({
        id: quickNotes.id,
        userId: quickNotes.userId,
        workspaceId: quickNotes.workspaceId,
      })
      .from(quickNotes)
      .innerJoin(userSettings, eq(userSettings.id, quickNotes.userId))
      .where(
        and(
          lte(quickNotes.discoveryDueAt, params.now ?? new Date()),
          sql`COALESCE((${userSettings.general} ->> 'enableQuickNoteAutomaticDiscovery')::boolean, false)`,
        ),
      )
      .orderBy(quickNotes.discoveryDueAt)
      .limit(params.limit ?? 100);

  /**
   * Atomically creates a Quick Note, private backing Document, and hidden Topic.
   *
   * Use when:
   * - The user starts a new capture.
   *
   * Expects:
   * - `content` is the searchable plain-text projection of `editorData`.
   *
   * Returns:
   * - The newly persisted Quick Note with stable Document and Topic IDs.
   */
  create = async (params: CreateQuickNoteParams) => {
    const quickNoteId = params.id ?? idGenerator('quickNotes');
    const documentId = idGenerator('documents', 16);
    const topicId = idGenerator('topics');
    const content = params.content ?? '';
    const editorData = params.editorData ?? { root: { children: [] } };

    return this.db.transaction(async (tx) => {
      await tx.insert(documents).values({
        content,
        editorData,
        fileType: 'text/markdown',
        source: `quick-note:${quickNoteId}`,
        sourceType: 'quick-note',
        totalCharCount: content.length,
        totalLineCount: content.length === 0 ? 0 : content.split('\n').length,
        userId: this.userId,
        visibility: 'private',
        workspaceId: this.workspaceId,
        id: documentId,
      });

      await tx.insert(topics).values({
        id: topicId,
        trigger: 'quick-note',
        userId: this.userId,
        workspaceId: this.workspaceId,
      });

      const [quickNote] = await tx
        .insert(quickNotes)
        .values({
          collection: params.collection,
          documentId,
          id: quickNoteId,
          location: params.location,
          tags: params.tags ?? [],
          topicId,
          userId: this.userId,
          workspaceId: this.workspaceId,
        })
        .returning();

      return quickNote;
    });
  };

  /**
   * Lists captures owned by the current user in the current workspace scope.
   *
   * Use when:
   * - Hydrating the Quick Note editor or capture selector.
   *
   * Expects:
   * - No caller-provided ownership filters; the model always applies them.
   *
   * Returns:
   * - Newest-updated Quick Notes first.
   */
  query = async () =>
    this.db
      .select()
      .from(quickNotes)
      .where(this.ownershipWhere())
      .orderBy(desc(quickNotes.updatedAt));

  /**
   * Reads one capture with its mutable backing Document projection.
   *
   * Use when:
   * - Hydrating the editor or preparing a Run prompt.
   *
   * Expects:
   * - `id` may refer only to the current owner's workspace scope.
   *
   * Returns:
   * - The capture plus Document content/editor data, or `undefined`.
   */
  findWithContent = async (id: string) => {
    const [result] = await this.db
      .select({
        collection: quickNotes.collection,
        content: documents.content,
        createdAt: quickNotes.createdAt,
        discoveryDueAt: quickNotes.discoveryDueAt,
        documentId: quickNotes.documentId,
        editorData: documents.editorData,
        id: quickNotes.id,
        location: quickNotes.location,
        tags: quickNotes.tags,
        topicId: quickNotes.topicId,
        updatedAt: quickNotes.updatedAt,
        userId: quickNotes.userId,
        workspaceId: quickNotes.workspaceId,
      })
      .from(quickNotes)
      .innerJoin(documents, eq(documents.id, quickNotes.documentId))
      .where(and(eq(quickNotes.id, id), this.ownershipWhere()));

    return result;
  };

  /**
   * Lists captures with editor projections and their latest accepted Annotation.
   *
   * Use when:
   * - Hydrating the unchanged Quick Note list and Annotation panel.
   *
   * Expects:
   * - Annotation selection is owner-scoped through the parent Quick Note.
   *
   * Returns:
   * - Newest captures first; Annotation is omitted until a Run accepts one.
   */
  queryDetails = async () => {
    const notes = await this.db
      .select({
        collection: quickNotes.collection,
        content: documents.content,
        createdAt: quickNotes.createdAt,
        documentId: quickNotes.documentId,
        editorData: documents.editorData,
        id: quickNotes.id,
        location: quickNotes.location,
        sourceEditorData: documents.editorData,
        tags: quickNotes.tags,
        topicId: quickNotes.topicId,
        updatedAt: quickNotes.updatedAt,
      })
      .from(quickNotes)
      .innerJoin(documents, eq(documents.id, quickNotes.documentId))
      .where(this.ownershipWhere())
      .orderBy(desc(quickNotes.updatedAt));

    if (notes.length === 0) return [];

    const annotations = await this.db
      .select({
        content: documents.content,
        createdAt: quickNoteRunResources.createdAt,
        quickNoteId: quickNoteResources.quickNoteId,
        sourceEditorData: documentHistories.editorData,
      })
      .from(quickNoteResources)
      .innerJoin(documents, eq(documents.id, quickNoteResources.documentId))
      .innerJoin(documentHistories, eq(documentHistories.id, quickNoteResources.sourceHistoryId))
      .innerJoin(quickNoteRunResources, eq(quickNoteRunResources.resourceId, quickNoteResources.id))
      .where(
        and(
          inArray(
            quickNoteResources.quickNoteId,
            notes.map(({ id }) => id),
          ),
          eq(quickNoteResources.role, 'annotation'),
        ),
      )
      .orderBy(desc(quickNoteRunResources.createdAt));

    const runs = await this.db
      .select({
        kind: quickNoteRuns.kind,
        operationId: quickNoteRuns.operationId,
        quickNoteId: quickNoteRuns.quickNoteId,
        status: quickNoteRuns.status,
        threadId: quickNoteRuns.threadId,
        updatedAt: quickNoteRuns.updatedAt,
      })
      .from(quickNoteRuns)
      .where(
        inArray(
          quickNoteRuns.quickNoteId,
          notes.map(({ id }) => id),
        ),
      )
      .orderBy(desc(quickNoteRuns.updatedAt));

    const latestAnnotations = new Map<string, { content: string; divedAt: Date }>();
    const noteSourceEditorData = new Map(
      notes.map((note) => [note.id, note.sourceEditorData] as const),
    );
    for (const annotation of annotations) {
      if (latestAnnotations.has(annotation.quickNoteId)) continue;
      const sourceEditorData = noteSourceEditorData.get(annotation.quickNoteId);
      if (!isEqual(annotation.sourceEditorData, sourceEditorData)) continue;
      latestAnnotations.set(annotation.quickNoteId, {
        content: annotation.content ?? '',
        divedAt: annotation.createdAt,
      });
    }

    const latestRuns = new Map<string, (typeof runs)[number]>();
    for (const run of runs) {
      const selected = latestRuns.get(run.quickNoteId);
      const isActive = ['pending', 'running'].includes(run.status);
      const selectedIsActive = selected && ['pending', 'running'].includes(selected.status);
      if (!selected || (isActive && !selectedIsActive)) latestRuns.set(run.quickNoteId, run);
    }

    return notes.map(({ sourceEditorData: _, ...note }) => ({
      ...note,
      annotation: latestAnnotations.get(note.id),
      run: latestRuns.get(note.id),
    }));
  };

  /**
   * Saves the mutable source projection without creating a processing Run.
   *
   * Use when:
   * - Debounced editor persistence reaches the server.
   *
   * Expects:
   * - `editorData` and `content` describe the same editor state.
   *
   * Returns:
   * - The updated owner-scoped Quick Note, or `undefined` when inaccessible.
   */
  updateContent = async (id: string, params: UpdateQuickNoteContentParams) =>
    this.db.transaction(async (tx) => {
      const [quickNote] = await tx
        .select({
          documentId: quickNotes.documentId,
          editorData: documents.editorData,
          id: quickNotes.id,
        })
        .from(quickNotes)
        .innerJoin(documents, eq(documents.id, quickNotes.documentId))
        .where(and(eq(quickNotes.id, id), this.ownershipWhere()));

      if (!quickNote) return undefined;

      const savedAt = new Date();
      const currentEditorData = quickNote.editorData ?? { root: { children: [] } };
      if (!isEqual(currentEditorData, params.editorData)) {
        const [latestHistory] = await tx
          .select()
          .from(documentHistories)
          .where(eq(documentHistories.documentId, quickNote.documentId))
          .orderBy(desc(documentHistories.savedAt), desc(documentHistories.id))
          .limit(1);
        // Match the canonical Document history policy: fixed clock buckets keep
        // continuous typing bounded without turning the anchor into a sliding window.
        const withinAutosaveWindow =
          latestHistory?.saveSource === 'autosave' &&
          Math.floor(latestHistory.savedAt.getTime() / DOCUMENT_HISTORY_AUTOSAVE_WINDOW_MS) ===
            Math.floor(savedAt.getTime() / DOCUMENT_HISTORY_AUTOSAVE_WINDOW_MS);

        if (withinAutosaveWindow) {
          await tx
            .update(documentHistories)
            .set({ editorData: currentEditorData, savedAt })
            .where(eq(documentHistories.id, latestHistory.id));
        } else {
          await tx.insert(documentHistories).values({
            documentId: quickNote.documentId,
            editorData: currentEditorData,
            saveSource: 'autosave',
            savedAt,
            userId: this.userId,
            workspaceId: this.workspaceId,
          });

          // Retain the same bounded autosave lineage as the Document service.
          const expiredAutosaves = await tx
            .select({ id: documentHistories.id })
            .from(documentHistories)
            .where(
              and(
                eq(documentHistories.documentId, quickNote.documentId),
                eq(documentHistories.saveSource, 'autosave'),
              ),
            )
            .orderBy(desc(documentHistories.savedAt), desc(documentHistories.id))
            .offset(DOCUMENT_HISTORY_AUTOSAVE_SOURCE_LIMIT);
          if (expiredAutosaves.length > 0) {
            await tx.delete(documentHistories).where(
              inArray(
                documentHistories.id,
                expiredAutosaves.map(({ id: historyId }) => historyId),
              ),
            );
          }
        }
      }

      await tx
        .update(documents)
        .set({
          content: params.content,
          editorData: params.editorData,
          totalCharCount: params.content.length,
          totalLineCount: params.content.length === 0 ? 0 : params.content.split('\n').length,
          updatedAt: savedAt,
        })
        .where(eq(documents.id, quickNote.documentId));

      const [updated] = await tx
        .update(quickNotes)
        .set({
          ...(params.discoveryDueAt === undefined ? {} : { discoveryDueAt: params.discoveryDueAt }),
          updatedAt: savedAt,
        })
        .where(eq(quickNotes.id, quickNote.id))
        .returning();

      return updated;
    });

  /**
   * Claims a Run and pins a non-coalescing system Document History snapshot.
   *
   * Use when:
   * - Dispatching Automatic Discovery, Signal enrichment, or an explicit Dive.
   *
   * Expects:
   * - Only one pending/running Run of the same kind is needed per capture.
   *
   * Returns:
   * - The existing active Run, a new pending Run, or `undefined` when inaccessible.
   */
  claimRun = async (id: string, params: ClaimQuickNoteRunParams) =>
    this.db.transaction(async (tx) => {
      const [quickNote] = await tx
        .select({
          documentId: quickNotes.documentId,
          editorData: documents.editorData,
          id: quickNotes.id,
        })
        .from(quickNotes)
        .innerJoin(documents, eq(documents.id, quickNotes.documentId))
        .where(and(eq(quickNotes.id, id), this.ownershipWhere()));

      if (!quickNote) return undefined;

      const [activeRun] = await tx
        .select()
        .from(quickNoteRuns)
        .where(
          and(
            eq(quickNoteRuns.quickNoteId, id),
            eq(quickNoteRuns.kind, params.kind),
            inArray(quickNoteRuns.status, ['pending', 'running']),
          ),
        )
        .limit(1);

      if (activeRun) return activeRun;

      const [history] = await tx
        .insert(documentHistories)
        .values({
          documentId: quickNote.documentId,
          editorData: quickNote.editorData ?? { root: { children: [] } },
          saveSource: 'system',
          savedAt: new Date(),
          userId: this.userId,
          workspaceId: this.workspaceId,
        })
        .returning();

      const [run] = await tx
        .insert(quickNoteRuns)
        .values({
          kind: params.kind,
          quickNoteId: quickNote.id,
          sourceHistoryId: history.id,
        })
        .onConflictDoNothing({
          target: [quickNoteRuns.quickNoteId, quickNoteRuns.kind],
          where: sql`${quickNoteRuns.status} IN ('pending', 'running')`,
        })
        .returning();

      if (run) return run;

      // A concurrent claimant won the partial unique index after this transaction
      // created its snapshot. Remove the unused snapshot, then return that winner.
      await tx.delete(documentHistories).where(eq(documentHistories.id, history.id));
      const [winner] = await tx
        .select()
        .from(quickNoteRuns)
        .where(
          and(
            eq(quickNoteRuns.quickNoteId, id),
            eq(quickNoteRuns.kind, params.kind),
            inArray(quickNoteRuns.status, ['pending', 'running']),
          ),
        )
        .limit(1);

      return winner;
    });

  /**
   * Accepts a concise Annotation revision and records its producing Run.
   *
   * Use when:
   * - Discovery, Signal enrichment, or Dive returns a user-visible projection.
   *
   * Expects:
   * - `runId` belongs to the current owner and is pending or running.
   * - The payload is a projection, not a copied Domain Agent transcript.
   *
   * Returns:
   * - The stable Resource binding and accepted Annotation Document History.
   */
  acceptAnnotation = async (runId: string, params: AcceptQuickNoteAnnotationParams) =>
    this.db.transaction(async (tx) => {
      const [run] = await tx
        .select({
          quickNoteId: quickNoteRuns.quickNoteId,
          sourceDocumentEditorData: documents.editorData,
          sourceHistoryId: quickNoteRuns.sourceHistoryId,
          sourceHistoryEditorData: documentHistories.editorData,
          status: quickNoteRuns.status,
          discoveryDueAt: quickNotes.discoveryDueAt,
          tags: quickNotes.tags,
        })
        .from(quickNoteRuns)
        .innerJoin(quickNotes, eq(quickNotes.id, quickNoteRuns.quickNoteId))
        .innerJoin(documents, eq(documents.id, quickNotes.documentId))
        .innerJoin(documentHistories, eq(documentHistories.id, quickNoteRuns.sourceHistoryId))
        .where(and(eq(quickNoteRuns.id, runId), this.ownershipWhere()));

      if (!run || !['pending', 'running'].includes(run.status)) return undefined;

      const [existingResource] = await tx
        .select()
        .from(quickNoteResources)
        .where(
          and(
            eq(quickNoteResources.quickNoteId, run.quickNoteId),
            eq(quickNoteResources.sourceHistoryId, run.sourceHistoryId),
            eq(quickNoteResources.role, 'annotation'),
          ),
        )
        .limit(1);

      const editorData = params.editorData ?? { root: { children: [] } };
      let resource = existingResource;

      if (resource) {
        await tx
          .update(documents)
          .set({
            content: params.content,
            editorData,
            totalCharCount: params.content.length,
            totalLineCount: params.content.length === 0 ? 0 : params.content.split('\n').length,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, resource.documentId));
      } else {
        const documentId = idGenerator('documents', 16);
        await tx.insert(documents).values({
          content: params.content,
          editorData,
          fileType: 'text/markdown',
          id: documentId,
          source: `quick-note:annotation:${run.quickNoteId}:${run.sourceHistoryId}`,
          sourceType: 'quick-note',
          totalCharCount: params.content.length,
          totalLineCount: params.content.length === 0 ? 0 : params.content.split('\n').length,
          userId: this.userId,
          visibility: 'private',
          workspaceId: this.workspaceId,
        });

        [resource] = await tx
          .insert(quickNoteResources)
          .values({
            documentId,
            quickNoteId: run.quickNoteId,
            role: 'annotation',
            sourceHistoryId: run.sourceHistoryId,
            userId: this.userId,
            workspaceId: this.workspaceId,
          })
          .returning();
      }

      const [documentHistory] = await tx
        .insert(documentHistories)
        .values({
          documentId: resource.documentId,
          editorData,
          saveSource: 'llm_call',
          savedAt: new Date(),
          userId: this.userId,
          workspaceId: this.workspaceId,
        })
        .returning();

      await tx.insert(quickNoteRunResources).values({
        documentHistoryId: documentHistory.id,
        resourceId: resource.id,
        runId,
        userId: this.userId,
        workspaceId: this.workspaceId,
      });

      await tx
        .update(quickNoteRuns)
        .set({ completedAt: new Date(), status: 'completed', updatedAt: new Date() })
        .where(eq(quickNoteRuns.id, runId));

      const sourceIsCurrent = isEqual(run.sourceDocumentEditorData, run.sourceHistoryEditorData);
      await tx
        .update(quickNotes)
        .set({
          discoveryDueAt: sourceIsCurrent ? null : run.discoveryDueAt,
          // A stale Run remains auditable, but its interpretation must not mutate current metadata.
          tags:
            sourceIsCurrent && params.tags ? [...new Set([...run.tags, ...params.tags])] : run.tags,
          updatedAt: new Date(),
        })
        .where(eq(quickNotes.id, run.quickNoteId));

      return { documentHistory, resource };
    });

  /**
   * Links an accessible existing Document as an accepted Run resource.
   *
   * Use when:
   * - A Context Provider candidate is judged clearly relevant by Discovery or Dive.
   *
   * Expects:
   * - The Document is owner-accessible (or public in the active workspace).
   * - `role` describes this Document's meaning for the Quick Note.
   *
   * Returns:
   * - The stable resource binding, or `undefined` when either side is inaccessible.
   */
  linkDocumentResource = async (runId: string, documentId: string, role = 'context') =>
    this.db.transaction(async (tx) => {
      const [run] = await tx
        .select({
          quickNoteId: quickNoteRuns.quickNoteId,
          sourceHistoryId: quickNoteRuns.sourceHistoryId,
        })
        .from(quickNoteRuns)
        .innerJoin(quickNotes, eq(quickNotes.id, quickNoteRuns.quickNoteId))
        .where(and(eq(quickNoteRuns.id, runId), this.ownershipWhere()));
      if (!run) return undefined;

      const documentOwnership = this.workspaceId
        ? and(
            eq(documents.workspaceId, this.workspaceId),
            sql`(${documents.visibility} = 'public' OR ${documents.userId} = ${this.userId})`,
          )
        : and(eq(documents.userId, this.userId), isNull(documents.workspaceId));
      const [document] = await tx
        .select({ id: documents.id })
        .from(documents)
        .where(and(eq(documents.id, documentId), documentOwnership));
      if (!document) return undefined;

      const [created] = await tx
        .insert(quickNoteResources)
        .values({
          documentId,
          quickNoteId: run.quickNoteId,
          role,
          sourceHistoryId: run.sourceHistoryId,
          userId: this.userId,
          workspaceId: this.workspaceId,
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
                eq(quickNoteResources.documentId, documentId),
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
          userId: this.userId,
          workspaceId: this.workspaceId,
        })
        .onConflictDoNothing();

      return resource;
    });

  /**
   * Connects an Agent Runtime operation and optional Dive Thread to a pending Run.
   *
   * Use when:
   * - Runtime startup succeeds after the domain Run has been claimed.
   *
   * Expects:
   * - `runId` belongs to the current owner and remains pending.
   *
   * Returns:
   * - The running Run, or `undefined` when inaccessible or no longer pending.
   */
  attachOperation = async (runId: string, params: { operationId: string; threadId?: string }) => {
    const [run] = await this.db
      .update(quickNoteRuns)
      .set({
        operationId: params.operationId,
        startedAt: new Date(),
        status: 'running',
        threadId: params.threadId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(quickNoteRuns.id, runId),
          eq(quickNoteRuns.status, 'pending'),
          inArray(
            quickNoteRuns.quickNoteId,
            this.db.select({ id: quickNotes.id }).from(quickNotes).where(this.ownershipWhere()),
          ),
        ),
      )
      .returning();

    return run;
  };

  /**
   * Marks an owned pending/running Run as failed with a diagnostic summary.
   *
   * Use when:
   * - Runtime startup or terminal execution fails before output is accepted.
   *
   * Expects:
   * - `error` contains no secrets or full trace payloads.
   *
   * Returns:
   * - The failed Run, or `undefined` when inaccessible or already terminal.
   */
  failRun = async (runId: string, error: string) => {
    const [run] = await this.db
      .update(quickNoteRuns)
      .set({ completedAt: new Date(), error, status: 'failed', updatedAt: new Date() })
      .where(
        and(
          eq(quickNoteRuns.id, runId),
          inArray(quickNoteRuns.status, ['pending', 'running']),
          inArray(
            quickNoteRuns.quickNoteId,
            this.db.select({ id: quickNotes.id }).from(quickNotes).where(this.ownershipWhere()),
          ),
        ),
      )
      .returning();

    return run;
  };

  /**
   * Reads the immutable source and container IDs for one owned Run.
   *
   * Use when:
   * - Building an Agent prompt or recovering Run status after refresh.
   *
   * Expects:
   * - Runtime consumers use `sourceEditorData`, never the mutable Document row.
   *
   * Returns:
   * - Run metadata with pinned editor data, or `undefined`.
   */
  getRunContext = async (runId: string) => {
    const [result] = await this.db
      .select({
        kind: quickNoteRuns.kind,
        operationId: quickNoteRuns.operationId,
        quickNoteId: quickNoteRuns.quickNoteId,
        sourceDocumentId: quickNotes.documentId,
        sourceEditorData: documentHistories.editorData,
        sourceHistoryId: quickNoteRuns.sourceHistoryId,
        status: quickNoteRuns.status,
        threadId: quickNoteRuns.threadId,
        topicId: quickNotes.topicId,
      })
      .from(quickNoteRuns)
      .innerJoin(quickNotes, eq(quickNotes.id, quickNoteRuns.quickNoteId))
      .innerJoin(documentHistories, eq(documentHistories.id, quickNoteRuns.sourceHistoryId))
      .where(and(eq(quickNoteRuns.id, runId), this.ownershipWhere()));

    return result;
  };

  /**
   * Deletes a capture and only the private Documents generated for it.
   *
   * Use when:
   * - The owner removes a Quick Note from the existing list UI.
   *
   * Expects:
   * - Non-Annotation resources may point at user-owned Documents and must survive.
   *
   * Returns:
   * - `true` when an owned Quick Note was removed, otherwise `false`.
   */
  delete = async (id: string): Promise<boolean> =>
    this.db.transaction(async (tx) => {
      const [quickNote] = await tx
        .select()
        .from(quickNotes)
        .where(and(eq(quickNotes.id, id), this.ownershipWhere()));

      if (!quickNote) return false;

      const generatedResources = await tx
        .select({ documentId: quickNoteResources.documentId })
        .from(quickNoteResources)
        .where(
          and(
            eq(quickNoteResources.quickNoteId, quickNote.id),
            eq(quickNoteResources.role, 'annotation'),
          ),
        );

      await tx.delete(quickNotes).where(eq(quickNotes.id, quickNote.id));
      await tx.delete(documents).where(eq(documents.id, quickNote.documentId));
      await tx.delete(topics).where(eq(topics.id, quickNote.topicId));

      if (generatedResources.length > 0) {
        await tx.delete(documents).where(
          inArray(
            documents.id,
            generatedResources.map(({ documentId }) => documentId),
          ),
        );
      }

      return true;
    });

  private ownershipWhere = () =>
    and(
      eq(quickNotes.userId, this.userId),
      this.workspaceId
        ? eq(quickNotes.workspaceId, this.workspaceId)
        : isNull(quickNotes.workspaceId),
    )!;
}
