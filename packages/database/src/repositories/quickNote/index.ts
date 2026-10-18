import isEqual from 'fast-deep-equal';

import { DocumentModel } from '../../models/document';
import { DocumentHistoryModel } from '../../models/documentHistory';
import type {
  AcceptQuickNoteAnnotationParams,
  ClaimQuickNoteRunParams,
  CreateQuickNoteParams,
  UpdateQuickNoteContentParams,
  UpdateQuickNoteProposalParams,
} from '../../models/quickNote';
import { QuickNoteModel } from '../../models/quickNote';
import { TaskModel } from '../../models/task';
import { TopicModel } from '../../models/topic';
import type { QuickNoteProposalItem } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { idGenerator } from '../../utils/idGenerator';

/**
 * Thrown inside a transaction when an owned row checked earlier in the same flow is no longer
 * writable, so the whole unit of work rolls back instead of committing half of it.
 */
export const QUICK_NOTE_SCOPE_LOST = 'QUICK_NOTE_SCOPE_LOST';

/** Line count stored beside a Document body, matching the Document service projection. */
const countLines = (content: string) => (content.length === 0 ? 0 : content.split('\n').length);

/**
 * Quick Note units of work that span the Quick Note aggregate and the Documents, Document
 * Histories, Topics, and Tasks it creates or edits.
 *
 * A Quick Note stores its source, Annotations, and Proposals as private Documents, chats in a
 * hidden Topic, and can convert a Proposal into a Task. Each of those has a lifecycle of its own,
 * so every flow that writes them together commits here in one transaction, composing the
 * single-aggregate models bound to the transaction handle, rather than inside
 * {@link QuickNoteModel}.
 *
 * Expects:
 * - `userId` owns every read and mutation; `workspaceId` is omitted in personal mode.
 */
export class QuickNoteRepository {
  constructor(
    private readonly db: LobeChatDatabase,
    private readonly userId: string,
    private readonly workspaceId?: string,
  ) {}

  private models = (tx: LobeChatDatabase) => ({
    document: new DocumentModel(tx, this.userId, this.workspaceId),
    history: new DocumentHistoryModel(tx, this.userId, this.workspaceId),
    quickNote: new QuickNoteModel(tx, this.userId, this.workspaceId),
  });

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

    return this.db.transaction(async (trx) => {
      const tx = trx as LobeChatDatabase;
      const { document, quickNote } = this.models(tx);

      await document.create({
        content,
        editorData,
        fileType: 'text/markdown',
        id: documentId,
        source: `quick-note:${quickNoteId}`,
        sourceType: 'quick-note',
        totalCharCount: content.length,
        totalLineCount: countLines(content),
        visibility: 'private',
      });
      await new TopicModel(tx, this.userId, this.workspaceId).create(
        { trigger: 'quick-note' },
        topicId,
      );

      return quickNote.createRecord({
        analyzeDueAt: params.analyzeDueAt,
        collection: params.collection,
        documentId,
        id: quickNoteId,
        location: params.location,
        tags: params.tags,
        topicId,
      });
    });
  };

  /**
   * Saves the mutable source projection without creating a processing Run.
   *
   * Use when:
   * - Debounced editor persistence reaches the server.
   *
   * Expects:
   * - `editorData` and `content` describe the same editor state.
   * - A rich-text change keeps the previous state as a bounded autosave Document History.
   * - Any source change marks current pending Proposals stale.
   *
   * Returns:
   * - The updated owner-scoped Quick Note, or `undefined` when inaccessible.
   */
  updateContent = async (id: string, params: UpdateQuickNoteContentParams) =>
    this.db.transaction(async (trx) => {
      const { document, history, quickNote: model } = this.models(trx as LobeChatDatabase);
      const quickNote = await model.findWithContent(id);

      if (!quickNote) return undefined;

      const savedAt = new Date();
      const currentEditorData = quickNote.editorData ?? { root: { children: [] } };
      const sourceChanged =
        quickNote.content !== params.content || !isEqual(currentEditorData, params.editorData);
      if (!isEqual(currentEditorData, params.editorData)) {
        await history.recordAutosave(quickNote.documentId, currentEditorData, savedAt);
      }

      await document.replaceContent(quickNote.documentId, params, savedAt);

      const updated = await model.recordContentSave(quickNote.id, {
        analyzeDueAt: params.analyzeDueAt,
        updatedAt: savedAt,
      });

      if (sourceChanged) await model.markPendingProposalsStale(quickNote.id, savedAt);

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
   * - Pending Proposal rows are locked in id order while their revisions are pinned, which
   *   serializes against {@link updateProposal}.
   *
   * Returns:
   * - The existing active Run, a new pending Run, or `undefined` when inaccessible.
   */
  claimRun = async (id: string, params: ClaimQuickNoteRunParams) =>
    this.db.transaction(async (trx) => {
      const { history: historyModel, quickNote: model } = this.models(trx as LobeChatDatabase);
      const quickNote = await model.findWithContent(id);

      if (!quickNote) return undefined;

      const activeRun = await model.findActiveRun(id, params.kind);

      if (activeRun) return activeRun;

      const history = await historyModel.append({
        documentId: quickNote.documentId,
        editorData: quickNote.editorData ?? { root: { children: [] } },
        saveSource: 'system',
        savedAt: new Date(),
      });

      const run = await model.insertPendingRun(quickNote.id, history.id, params);

      if (run) {
        const pinned = await model.pinRunInputs(run.id, quickNote.id, history.id);
        if (!pinned) throw new Error(QUICK_NOTE_SCOPE_LOST);

        return run;
      }

      // A concurrent claimant won the partial unique index after this transaction
      // created its snapshot. Remove the unused snapshot, then return that winner.
      await historyModel.delete(history.id);

      return model.findActiveRun(id, params.kind);
    });

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
   * - The stable Resource binding and accepted Annotation Document History, plus any Proposals.
   */
  acceptAnnotation = async (runId: string, params: AcceptQuickNoteAnnotationParams) =>
    this.db.transaction(async (trx) => {
      const { document, history, quickNote: model } = this.models(trx as LobeChatDatabase);
      const run = await model.findRunForAnnotation(runId);

      if (!run || !['pending', 'running'].includes(run.status)) return undefined;

      const existingResource = await model.findAnnotationResource(
        run.quickNoteId,
        run.sourceHistoryId,
      );

      const editorData = params.editorData ?? { root: { children: [] } };
      let resource = existingResource;

      if (resource) {
        const documentId = resource.documentId;
        if (!documentId) return undefined;

        await document.replaceContent(
          documentId,
          { content: params.content, editorData },
          new Date(),
        );
      } else {
        const documentId = idGenerator('documents', 16);
        await document.create({
          content: params.content,
          editorData,
          fileType: 'text/markdown',
          id: documentId,
          source: `quick-note:annotation:${run.quickNoteId}:${run.sourceHistoryId}`,
          sourceType: 'quick-note',
          totalCharCount: params.content.length,
          totalLineCount: countLines(params.content),
          visibility: 'private',
        });

        const created = await model.createAnnotationResource({
          documentId,
          quickNoteId: run.quickNoteId,
          sourceHistoryId: run.sourceHistoryId,
        });
        if (!created) throw new Error(QUICK_NOTE_SCOPE_LOST);
        resource = created;
      }

      const annotationDocumentId = resource.documentId;
      if (!annotationDocumentId) return undefined;

      const documentHistory = await history.append({
        documentId: annotationDocumentId,
        editorData,
        saveSource: 'llm_call',
        savedAt: new Date(),
      });

      const recorded = await model.recordRunResource({
        documentHistoryId: documentHistory.id,
        resourceId: resource.id,
        runId,
      });
      if (!recorded) throw new Error(QUICK_NOTE_SCOPE_LOST);

      const proposals: QuickNoteProposalItem[] = [];
      for (const proposalDraft of params.proposals ?? []) {
        const proposalDocumentId = idGenerator('documents', 16);
        const proposalEditorData = proposalDraft.editorData ?? { markdown: proposalDraft.content };
        await document.create({
          content: proposalDraft.content,
          editorData: proposalEditorData,
          fileType: 'text/markdown',
          id: proposalDocumentId,
          source: `quick-note:proposal:${run.quickNoteId}:${runId}`,
          sourceType: 'quick-note',
          totalCharCount: proposalDraft.content.length,
          totalLineCount: countLines(proposalDraft.content),
          visibility: 'private',
        });
        const proposalHistory = await history.append({
          documentId: proposalDocumentId,
          editorData: proposalEditorData,
          saveSource: 'llm_call',
          savedAt: new Date(),
        });
        const proposal = await model.createProposal({
          currentHistoryId: proposalHistory.id,
          documentId: proposalDocumentId,
          kind: proposalDraft.kind,
          quickNoteId: run.quickNoteId,
          runId,
          sourceHistoryId: run.sourceHistoryId,
        });
        proposals.push(proposal);
      }

      await model.completeAnnotationRun(runId, run, params.tags);

      return { documentHistory, proposals, resource };
    });

  /**
   * Edits a pending Proposal and advances its Document-backed current version.
   *
   * Use when:
   * - A user refines an Agent suggestion before deciding what to do with it.
   *
   * Expects:
   * - Accepted or dismissed Proposals are no longer editable through this path.
   * - The pointer update waits on {@link claimRun}'s Proposal lock, so a pinned revision is
   *   never advanced past before its Run Input commits.
   *
   * Returns:
   * - The updated Proposal with its new current Document History.
   */
  updateProposal = async (proposalId: string, params: UpdateQuickNoteProposalParams) =>
    this.db.transaction(async (trx) => {
      const { document, history: historyModel, quickNote } = this.models(trx as LobeChatDatabase);
      const proposal = await quickNote.findProposalForEdit(proposalId);
      if (!proposal || proposal.decisionStatus !== 'pending') return undefined;

      const savedAt = new Date();
      await document.replaceContent(proposal.documentId, params, savedAt);
      const history = await historyModel.append({
        documentId: proposal.documentId,
        editorData: params.editorData,
        saveSource: 'manual',
        savedAt,
      });
      const updated = await quickNote.setProposalCurrentHistory(proposal.id, history.id, savedAt);

      return { history, proposal: updated };
    });

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
  acceptTaskProposal = async (proposalId: string) =>
    this.db.transaction(async (trx) => {
      const tx = trx as LobeChatDatabase;
      const { quickNote } = this.models(tx);
      const proposal = await quickNote.lockAcceptableProposal(proposalId);
      if (!proposal || proposal.kind !== 'task' || !proposal.content?.trim()) return undefined;

      // Quick Notes are private captures, so an explicitly converted Task starts private too.
      const task = await new TaskModel(tx, this.userId, this.workspaceId).create(
        { instruction: proposal.content, visibility: 'private' },
        { maxRetries: 1 },
      );
      const acceptedProposal = await quickNote.recordTaskProposalAcceptance(proposal, task.id);
      // Roll back the new Task rather than leave it unlinked.
      if (!acceptedProposal) throw new Error(QUICK_NOTE_SCOPE_LOST);

      return { proposal: acceptedProposal, task };
    });

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
    this.db.transaction(async (trx) => {
      const tx = trx as LobeChatDatabase;
      const { document, quickNote } = this.models(tx);
      const deleted = await quickNote.deleteRecord(id);

      if (!deleted) return false;

      await document.batchDeleteIncludingTrashed([deleted.documentId]);
      await new TopicModel(tx, this.userId, this.workspaceId).batchDeleteIncludingTrashed([
        deleted.topicId,
      ]);
      await document.batchDeleteIncludingTrashed(deleted.generatedDocumentIds);

      return true;
    });
}
