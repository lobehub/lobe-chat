import {
  DEFAULT_QUICK_NOTE_SETTINGS,
  DOCUMENT_HISTORY_AUTOSAVE_SOURCE_LIMIT,
  DOCUMENT_HISTORY_AUTOSAVE_WINDOW_MS,
} from '@lobechat/const';
import type { UserQuickNoteSettings } from '@lobechat/types';
import { and, desc, eq, gt, inArray, lte, or, sql } from 'drizzle-orm';
import isEqual from 'fast-deep-equal';

import {
  documentHistories,
  documents,
  quickNoteProposals,
  quickNoteResources,
  quickNoteRunResources,
  quickNoteRuns,
  quickNotes,
  topics,
  userSettings,
} from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { idGenerator } from '../../utils/idGenerator';
import * as comments from './comments';
import { type QuickNoteArgs, type QuickNoteContext, quickNoteOwnershipWhere } from './context';
import * as proposals from './proposals';
import * as resources from './resources';
import * as runs from './runs';
import type { CreateQuickNoteParams, UpdateQuickNoteContentParams } from './types';

export type * from './types';

/**
 * Persists private Quick Notes and claims immutable processing snapshots.
 *
 * Use when:
 * - Saving the existing Quick Note editor without changing its UI contract.
 * - Dispatching Analyze or Dive against a stable source revision.
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

  private readonly ctx: QuickNoteContext;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    this.db = db;
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.ctx = { db, userId, workspaceId };
  }

  /**
   * Resolves the effective Quick Note Analyze configuration for one user.
   *
   * Use when:
   * - Claiming or dispatching background Quick Note work.
   * - Resolving the Agent binding and immutable execution limits for a new Run.
   *
   * Expects:
   * - Missing fields fall back independently to {@link DEFAULT_QUICK_NOTE_SETTINGS}.
   * - Earlier `general.enableQuickNoteAutomaticDiscovery` values remain readable during rollout.
   *
   * Returns:
   * - A complete, bounded configuration suitable for scheduling and execution.
   */
  static getAnalyzeSettings = async (
    db: LobeChatDatabase,
    userId: string,
  ): Promise<UserQuickNoteSettings> => {
    const [settings] = await db
      .select({ general: userSettings.general, quickNote: userSettings.quickNote })
      .from(userSettings)
      .where(eq(userSettings.id, userId));
    const general = settings?.general as Record<string, unknown> | null | undefined;
    const stored = settings?.quickNote;
    const legacyEnabled = general?.enableQuickNoteAutomaticDiscovery;

    return {
      analyzeAgentId: stored?.analyzeAgentId ?? DEFAULT_QUICK_NOTE_SETTINGS.analyzeAgentId,
      autoAnalyze: {
        enabled:
          stored?.autoAnalyze?.enabled ??
          (typeof legacyEnabled === 'boolean'
            ? legacyEnabled
            : DEFAULT_QUICK_NOTE_SETTINGS.autoAnalyze.enabled),
        idleDelayMs: Math.min(
          300_000,
          Math.max(
            1000,
            stored?.autoAnalyze?.idleDelayMs ?? DEFAULT_QUICK_NOTE_SETTINGS.autoAnalyze.idleDelayMs,
          ),
        ),
      },
      maxAnalyzeSteps: Math.min(
        20,
        Math.max(1, stored?.maxAnalyzeSteps ?? DEFAULT_QUICK_NOTE_SETTINGS.maxAnalyzeSteps),
      ),
    };
  };

  /**
   * Resolves whether automatic Analyze may be scheduled for one user.
   *
   * Use when:
   * - A client edit or server sweep is about to schedule Analyze.
   *
   * Expects:
   * - Missing settings resolve through {@link DEFAULT_QUICK_NOTE_SETTINGS}.
   *
   * Returns:
   * - The effective automatic Analyze toggle.
   */
  static isAutomaticAnalyzeEnabled = async (db: LobeChatDatabase, userId: string) => {
    const settings = await QuickNoteModel.getAnalyzeSettings(db, userId);

    return settings.autoAnalyze.enabled;
  };

  /**
   * Finds due captures whose owners did not explicitly disable Automatic Analyze.
   *
   * Use when:
   * - The one-minute server sweep compensates for closed or disconnected clients.
   *
   * Expects:
   * - `limit` bounds one page and defaults to 100; `after` advances the due-time/id cursor.
   * - Missing user settings mean enabled.
   *
   * Returns:
   * - Owner/workspace routing identities ordered by due time, then ID for stable paging.
   */
  static findDueAnalyzeCandidates = async (
    db: LobeChatDatabase,
    params: {
      /** Resume after a previously scanned due-time/id pair. */
      after?: { analyzeDueAt: Date; id: string };
      /** Maximum rows in one page. @default 100 */
      limit?: number;
      /** Stable due-time cutoff across pages. @default new Date() */
      now?: Date;
    } = {},
  ) =>
    db
      .select({
        analyzeDueAt: quickNotes.analyzeDueAt,
        id: quickNotes.id,
        userId: quickNotes.userId,
        workspaceId: quickNotes.workspaceId,
      })
      .from(quickNotes)
      .leftJoin(userSettings, eq(userSettings.id, quickNotes.userId))
      .where(
        and(
          lte(quickNotes.analyzeDueAt, params.now ?? new Date()),
          params.after &&
            or(
              gt(quickNotes.analyzeDueAt, params.after.analyzeDueAt),
              and(
                eq(quickNotes.analyzeDueAt, params.after.analyzeDueAt),
                gt(quickNotes.id, params.after.id),
              ),
            ),
          sql`COALESCE((${userSettings.quickNote} -> 'autoAnalyze' ->> 'enabled')::boolean, (${userSettings.general} ->> 'enableQuickNoteAutomaticDiscovery')::boolean, true)`,
        ),
      )
      .orderBy(quickNotes.analyzeDueAt, quickNotes.id)
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
          analyzeDueAt: params.analyzeDueAt,
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
   * Appends user feedback and its first immutable revision to a Quick Note.
   *
   * Use when:
   * - A user adds context or correction for later Quick Note Runs.
   *
   * Expects:
   * - The parent Quick Note belongs to the model's owner/workspace scope.
   *
   * Returns:
   * - The current Comment and the exact revision future Runs can pin.
   */
  createComment = (...args: QuickNoteArgs<typeof comments.createComment>) =>
    comments.createComment(this.ctx, ...args);

  /**
   * Lists the current Comment projections for one owned Quick Note.
   *
   * Use when:
   * - Rendering or collecting the user-to-agent feedback stream.
   *
   * Expects:
   * - Historical text is read through revisions, not this current projection.
   *
   * Returns:
   * - Comments ordered by creation time.
   */
  queryComments = (...args: QuickNoteArgs<typeof comments.queryComments>) =>
    comments.queryComments(this.ctx, ...args);

  /**
   * Edits a Comment and appends the new immutable content revision.
   *
   * Use when:
   * - A user corrects context previously supplied to processing Agents.
   *
   * Expects:
   * - Existing Run inputs continue pointing at their earlier revision IDs.
   *
   * Returns:
   * - The updated Comment and new revision, or `undefined` when inaccessible.
   */
  updateComment = (...args: QuickNoteArgs<typeof comments.updateComment>) =>
    comments.updateComment(this.ctx, ...args);

  /**
   * Lists editable downstream suggestions with their current Document content.
   *
   * Use when:
   * - Presenting Agent-generated actions without executing them.
   *
   * Expects:
   * - Decision state and source validity remain separate dimensions.
   *
   * Returns:
   * - Newest Proposals first, including current rich-text content.
   */
  queryProposals = (...args: QuickNoteArgs<typeof proposals.queryProposals>) =>
    proposals.queryProposals(this.ctx, ...args);

  /**
   * Lists current typed Context Resources for one owned Quick Note revision.
   *
   * Use when:
   * - Rendering resources selected by Analyze or Dive beside the source note.
   *
   * Expects:
   * - Stale links from earlier source revisions remain stored but are not returned.
   *
   * Returns:
   * - Current Context links with the best available product-native display label.
   */
  queryResources = (...args: QuickNoteArgs<typeof resources.queryResources>) =>
    resources.queryResources(this.ctx, ...args);

  /**
   * Reads all Agent-owned sidecar data for one Quick Note detail surface.
   *
   * Use when:
   * - Hydrating Annotation-adjacent Resources, Proposals, and feedback together.
   *
   * Expects:
   * - Every child query applies the same owner/workspace boundary.
   *
   * Returns:
   * - Independent lists that can be refreshed with one client request.
   */
  queryAgenticDetails = async (quickNoteId: string) => {
    const [comments, proposals, resources] = await Promise.all([
      this.queryComments(quickNoteId),
      this.queryProposals(quickNoteId),
      this.queryResources(quickNoteId),
    ]);

    return { comments, proposals, resources };
  };

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
        analyzeDueAt: quickNotes.analyzeDueAt,
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
        analyzeDueAt: quickNotes.analyzeDueAt,
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
        agentId: quickNoteRuns.agentId,
        executionConfig: quickNoteRuns.executionConfig,
        kind: quickNoteRuns.kind,
        operationId: quickNoteRuns.operationId,
        quickNoteId: quickNoteRuns.quickNoteId,
        status: quickNoteRuns.status,
        threadId: quickNoteRuns.threadId,
        trigger: quickNoteRuns.trigger,
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
          content: documents.content,
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
      const sourceChanged =
        quickNote.content !== params.content || !isEqual(currentEditorData, params.editorData);
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
          ...(params.analyzeDueAt === undefined ? {} : { analyzeDueAt: params.analyzeDueAt }),
          updatedAt: savedAt,
        })
        .where(eq(quickNotes.id, quickNote.id))
        .returning();

      if (sourceChanged) {
        await tx
          .update(quickNoteProposals)
          .set({ updatedAt: savedAt, validity: 'stale' })
          .where(
            and(
              eq(quickNoteProposals.quickNoteId, quickNote.id),
              eq(quickNoteProposals.decisionStatus, 'pending'),
              eq(quickNoteProposals.validity, 'current'),
            ),
          );
      }

      return updated;
    });

  /**
   * Claims a Run and pins a non-coalescing system Document History snapshot.
   *
   * Use when:
   * - Dispatching Automatic Analyze, Signal enrichment, or an explicit Dive.
   *
   * Expects:
   * - Only one pending/running Run of the same kind is needed per capture.
   *
   * Returns:
   * - The existing active Run, a new pending Run, or `undefined` when inaccessible.
   */
  claimRun = (...args: QuickNoteArgs<typeof runs.claimRun>) => runs.claimRun(this.ctx, ...args);

  /**
   * Accepts a concise Annotation revision and records its producing Run.
   *
   * Use when:
   * - Analyze, Signal enrichment, or Dive returns a user-visible projection.
   *
   * Expects:
   * - `runId` belongs to the current owner and is pending or running.
   * - The payload is a projection, not a copied Domain Agent transcript.
   *
   * Returns:
   * - The stable Resource binding and accepted Annotation Document History.
   */
  acceptAnnotation = (...args: QuickNoteArgs<typeof resources.acceptAnnotation>) =>
    resources.acceptAnnotation(this.ctx, ...args);

  /**
   * Edits a pending Proposal and advances its Document-backed current version.
   *
   * Use when:
   * - A user refines an Agent suggestion before deciding what to do with it.
   *
   * Expects:
   * - Accepted or dismissed Proposals are no longer editable through this path.
   *
   * Returns:
   * - The updated Proposal with its new current Document History.
   */
  updateProposal = (...args: QuickNoteArgs<typeof proposals.updateProposal>) =>
    proposals.updateProposal(this.ctx, ...args);

  /**
   * Converts one current Task Proposal into a private Task and records the accepted revision.
   *
   * Use when:
   * - The user explicitly chooses Create task on a Quick Note Proposal.
   *
   * Expects:
   * - The Proposal is still pending, current, and owned by the active workspace scope.
   *
   * Returns:
   * - The created Task and terminal Proposal, or `undefined` for an inaccessible/stale Proposal.
   */
  acceptTaskProposal = (...args: QuickNoteArgs<typeof proposals.acceptTaskProposal>) =>
    proposals.acceptTaskProposal(this.ctx, ...args);

  /**
   * Records a user's Proposal decision without treating source validity as feedback.
   *
   * Use when:
   * - A user accepts the current revision or dismisses the suggestion.
   *
   * Expects:
   * - Only pending Proposals can receive their first terminal decision.
   *
   * Returns:
   * - The decided Proposal, with the accepted revision pinned when applicable.
   */
  decideProposal = (...args: QuickNoteArgs<typeof proposals.decideProposal>) =>
    proposals.decideProposal(this.ctx, ...args);

  /**
   * Links an accessible typed product resource as accepted Run evidence.
   *
   * Use when:
   * - A Context Provider candidate is judged clearly relevant by Analyze or Dive.
   * - A Quick Note annotates a Topic or Document without converting either object.
   *
   * Expects:
   * - V1 runtime linking accepts scoped `document` and `topic` references.
   * - Other resource families remain representable in storage for later native providers.
   *
   * Returns:
   * - The stable resource binding, or `undefined` when either side is inaccessible.
   */
  linkResource = (...args: QuickNoteArgs<typeof resources.linkResource>) =>
    resources.linkResource(this.ctx, ...args);

  /**
   * Links an accessible existing Document through the typed Resource Link path.
   *
   * Use when:
   * - Existing callers still provide a Document identifier directly.
   *
   * Expects:
   * - The Document passes the same owner/workspace authorization as {@link linkResource}.
   *
   * Returns:
   * - The stable Document resource binding when accessible.
   */
  linkDocumentResource = (...args: QuickNoteArgs<typeof resources.linkDocumentResource>) =>
    resources.linkDocumentResource(this.ctx, ...args);

  /**
   * Attaches the isolated conversation Thread used by one pending Run.
   *
   * Use when:
   * - Analyze or Dive needs a fresh message boundary inside the stable Quick Note Topic.
   *
   * Expects:
   * - The Thread already belongs to the Quick Note Topic selected for this Run.
   *
   * Returns:
   * - The pending Run with its Thread, or `undefined` when inaccessible or already started.
   */
  attachThread = (...args: QuickNoteArgs<typeof runs.attachThread>) =>
    runs.attachThread(this.ctx, ...args);

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
  attachOperation = (...args: QuickNoteArgs<typeof runs.attachOperation>) =>
    runs.attachOperation(this.ctx, ...args);

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
  failRun = (...args: QuickNoteArgs<typeof runs.failRun>) => runs.failRun(this.ctx, ...args);

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
   * - Run metadata with every pinned content revision, or `undefined`.
   */
  getRunContext = (...args: QuickNoteArgs<typeof runs.getRunContext>) =>
    runs.getRunContext(this.ctx, ...args);

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
      const proposalDocuments = await tx
        .select({ documentId: quickNoteProposals.documentId })
        .from(quickNoteProposals)
        .where(eq(quickNoteProposals.quickNoteId, quickNote.id));

      await tx.delete(quickNotes).where(eq(quickNotes.id, quickNote.id));
      await tx.delete(documents).where(eq(documents.id, quickNote.documentId));
      await tx.delete(topics).where(eq(topics.id, quickNote.topicId));

      const generatedDocumentIds = [
        ...generatedResources.map(({ documentId }) => documentId),
        ...proposalDocuments.map(({ documentId }) => documentId),
      ].filter((documentId): documentId is string => Boolean(documentId));
      if (generatedDocumentIds.length > 0) {
        await tx.delete(documents).where(inArray(documents.id, generatedDocumentIds));
      }

      return true;
    });

  private ownershipWhere = () => quickNoteOwnershipWhere(this.ctx);
}
