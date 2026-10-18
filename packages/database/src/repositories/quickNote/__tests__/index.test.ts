// @vitest-environment node
import { and, eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../../core/getTestDB';
import { QuickNoteModel } from '../../../models/quickNote';
import {
  documentHistories,
  documents,
  quickNoteResources,
  quickNoteRunInputs,
  quickNoteRunResources,
  quickNoteRuns,
  quickNotes,
  tasks,
  topics,
  users,
} from '../../../schemas';
import type { LobeChatDatabase } from '../../../type';
import { QuickNoteRepository } from '../index';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'quick-note-repo-user';
const otherUserId = 'quick-note-repo-other-user';
const quickNoteModel = new QuickNoteModel(serverDB, userId);
const quickNoteRepo = new QuickNoteRepository(serverDB, userId);
const otherRepo = new QuickNoteRepository(serverDB, otherUserId);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
});

afterEach(async () => {
  await serverDB.delete(users);
});

/** @example A capture creates its private content and conversation containers atomically. */
describe('QuickNoteRepository', () => {
  /** @example Creating "Remember Tokyo" returns the persisted note and backing IDs. */
  it('creates a Quick Note with one backing Document and Topic', async () => {
    const note = await quickNoteRepo.create({
      content: 'Remember Tokyo',
      editorData: { root: { children: [] } },
      location: 'Shanghai',
      tags: ['travel'],
    });

    const [document] = await serverDB
      .select()
      .from(documents)
      .where(eq(documents.id, note.documentId));
    const [topic] = await serverDB.select().from(topics).where(eq(topics.id, note.topicId));

    /** @example The source content remains in the hidden backing Document. */
    expect(document).toMatchObject({
      content: 'Remember Tokyo',
      sourceType: 'quick-note',
      userId,
      visibility: 'private',
    });
    /** @example The hidden Topic is scoped to the same owner. */
    expect(topic).toMatchObject({ trigger: 'quick-note', userId });
    /** @example The main record owns organization rather than copied content. */
    expect(note).toMatchObject({ location: 'Shanghai', tags: ['travel'], userId });
  });

  /** @example Rich-text autosaves retain bounded Document History revisions. */
  it('coalesces source edits through the shared Document History window', async () => {
    const firstEditorData = { root: { children: [{ text: 'Version one' }] } };
    const secondEditorData = { root: { children: [{ text: 'Version two' }] } };
    const note = await quickNoteRepo.create({
      content: 'Version one',
      editorData: firstEditorData,
    });

    await quickNoteRepo.updateContent(note.id, {
      content: 'Version two',
      editorData: secondEditorData,
    });
    await quickNoteRepo.updateContent(note.id, {
      content: 'Version three',
      editorData: { root: { children: [{ text: 'Version three' }] } },
    });
    const autosaves = await serverDB
      .select()
      .from(documentHistories)
      .where(
        and(
          eq(documentHistories.documentId, note.documentId),
          eq(documentHistories.saveSource, 'autosave'),
        ),
      );

    /** @example Continuous edits share one bounded autosave row. */
    expect(autosaves).toHaveLength(1);
    /** @example The row preserves the immediately previous rich-text revision. */
    expect(autosaves[0].editorData).toEqual(secondEditorData);
  });

  /** @example A background Run reads a stable source snapshot, not the mutable autosave row. */
  it('claims a Run against a non-coalescing Document History snapshot', async () => {
    const editorData = { root: { children: [{ text: 'Version one' }] } };
    const note = await quickNoteRepo.create({ content: 'Version one', editorData });

    const run = await quickNoteRepo.claimRun(note.id, { kind: 'analyze', trigger: 'manual' });

    const [history] = await serverDB
      .select()
      .from(documentHistories)
      .where(eq(documentHistories.id, run?.sourceHistoryId ?? 'missing'));
    const [persistedRun] = await serverDB
      .select()
      .from(quickNoteRuns)
      .where(eq(quickNoteRuns.id, run?.id ?? '00000000-0000-0000-0000-000000000000'));

    /** @example The Run pins a system snapshot that autosave will not coalesce. */
    expect(history).toMatchObject({
      documentId: note.documentId,
      editorData,
      saveSource: 'system',
    });
    /** @example The domain Run stores the same immutable source identity. */
    expect(persistedRun?.sourceHistoryId).toBe(history?.id);
    /** @example Trigger provenance is pinned with the source revision. */
    expect(persistedRun?.trigger).toBe('manual');
  });

  /** @example A pending Analyze for unchanged content is claimed only once. */
  it('deduplicates active Runs for the same source snapshot and kind', async () => {
    const note = await quickNoteRepo.create({
      content: 'Stable content',
      editorData: { root: { children: [] } },
    });

    const first = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    const second = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    const runs = await serverDB
      .select()
      .from(quickNoteRuns)
      .where(and(eq(quickNoteRuns.quickNoteId, note.id), eq(quickNoteRuns.kind, 'analyze')));

    /** @example Both claim callers observe the same active Run. */
    expect(second?.id).toBe(first?.id);
    /** @example Only one active Run row exists. */
    expect(runs).toHaveLength(1);
  });

  /** @example Analyze accepts one Document-backed Annotation for its pinned source history. */
  it('persists accepted Annotation output with Run provenance', async () => {
    const note = await quickNoteRepo.create({ content: 'Unclassified thought' });
    const run = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });

    const output = await quickNoteRepo.acceptAnnotation(run!.id, {
      content: 'A concise interpretation',
      editorData: { root: { children: [{ text: 'A concise interpretation' }] } },
      tags: ['idea'],
    });

    const [resource] = await serverDB
      .select()
      .from(quickNoteResources)
      .where(eq(quickNoteResources.id, output!.resource.id));
    const [annotationDocument] = await serverDB
      .select()
      .from(documents)
      .where(eq(documents.id, resource.documentId!));
    const [outputHistory] = await serverDB
      .select()
      .from(documentHistories)
      .where(eq(documentHistories.id, output!.documentHistory.id));
    const [runResource] = await serverDB
      .select()
      .from(quickNoteRunResources)
      .where(eq(quickNoteRunResources.runId, run!.id));

    /** @example Annotation is a private canonical Document, not copied into the binding. */
    expect(annotationDocument).toMatchObject({
      content: 'A concise interpretation',
      sourceType: 'quick-note',
      visibility: 'private',
    });
    /** @example Annotation lineage belongs to the exact source snapshot read by the Run. */
    expect(resource).toMatchObject({ role: 'annotation', sourceHistoryId: run!.sourceHistoryId });
    /** @example Accepted output uses an immutable LLM-authored Document History. */
    expect(outputHistory).toMatchObject({ saveSource: 'llm_call' });
    /** @example Provenance connects the producing Run to the accepted output revision. */
    expect(runResource).toMatchObject({
      documentHistoryId: outputHistory.id,
      resourceId: resource.id,
    });
  });

  /** @example Analyze emits an inert Document-backed Task Proposal with independent state. */
  it('versions Proposal content and separates source validity from user decision', async () => {
    const note = await quickNoteRepo.create({ content: 'An actionable note' });
    const run = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    const output = await quickNoteRepo.acceptAnnotation(run!.id, {
      content: 'A concise interpretation',
      proposals: [{ content: 'Prepare a small training-data experiment.', kind: 'task' }],
    });
    const proposal = output!.proposals[0];
    const edited = await quickNoteRepo.updateProposal(proposal.id, {
      content: 'Prepare and review a small training-data experiment.',
      editorData: { markdown: 'Prepare and review a small training-data experiment.' },
    });

    await quickNoteRepo.updateContent(note.id, {
      content: 'The source changed after the suggestion.',
      editorData: { markdown: 'The source changed after the suggestion.' },
    });
    const [stale] = await quickNoteModel.queryProposals(note.id);
    const otherModel = new QuickNoteModel(serverDB, otherUserId);
    const rejectedDecision = await otherModel.decideProposal(proposal.id, 'dismissed');
    const rejectedEdit = await otherRepo.updateProposal(proposal.id, {
      content: 'Cross-owner proposal edit',
      editorData: { markdown: 'Cross-owner proposal edit' },
    });
    const hiddenProposals = await otherModel.queryProposals(note.id);
    const accepted = await quickNoteModel.decideProposal(proposal.id, 'accepted');
    const [proposalDocument] = await serverDB
      .select()
      .from(documents)
      .where(eq(documents.id, proposal.documentId));

    /** @example Proposal text lives in a private Document rather than the lifecycle row. */
    expect(proposalDocument).toMatchObject({
      content: 'Prepare and review a small training-data experiment.',
      sourceType: 'quick-note',
      visibility: 'private',
    });
    /** @example User editing advances the current Document History identity. */
    expect(edited?.proposal.currentHistoryId).toBe(edited?.history.id);
    /** @example A source edit invalidates but does not dismiss the pending Proposal. */
    expect(stale).toMatchObject({ decisionStatus: 'pending', validity: 'stale' });
    /** @example Acceptance pins the exact edited version while retaining stale provenance. */
    expect(accepted).toMatchObject({
      acceptedHistoryId: edited?.history.id,
      decisionStatus: 'accepted',
      validity: 'stale',
    });
    /** @example Another owner cannot edit or list the Proposal. */
    expect(rejectedEdit).toBeUndefined();
    /** @example Another owner cannot decide the Proposal. */
    expect(rejectedDecision).toBeUndefined();
    /** @example Proposal reads remain scoped through the parent Quick Note. */
    expect(hiddenProposals).toEqual([]);
  });

  /** @example Accepting a current Task Proposal creates exactly the explicit downstream object. */
  it('converts an accepted Task Proposal and links the created Task', async () => {
    const note = await quickNoteRepo.create({ content: 'Ship the duplex model experiment' });
    const run = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    const output = await quickNoteRepo.acceptAnnotation(run!.id, {
      content: 'A concrete next action',
      proposals: [{ content: 'Train a small duplex model experiment.', kind: 'task' }],
    });

    const accepted = await quickNoteRepo.acceptTaskProposal(output!.proposals[0].id);
    const [task] = await serverDB.select().from(tasks).where(eq(tasks.id, accepted!.task.id));
    const details = await quickNoteModel.queryAgenticDetails(note.id);
    const acceptedAgain = await quickNoteRepo.acceptTaskProposal(output!.proposals[0].id);

    /** @example The created Task keeps the edited Proposal body as its instruction. */
    expect(task).toMatchObject({
      instruction: 'Train a small duplex model experiment.',
      visibility: 'private',
    });
    /** @example The exact Proposal version becomes terminally accepted. */
    expect(accepted?.proposal).toMatchObject({
      acceptedHistoryId: output!.proposals[0].currentHistoryId,
      decisionStatus: 'accepted',
    });
    /** @example The created Task is immediately visible as typed Quick Note context. */
    expect(details.resources).toEqual([
      expect.objectContaining({
        resourceId: task.id,
        resourceType: 'task',
        taskIdentifier: task.identifier,
      }),
    ]);
    /** @example Repeated acceptance cannot create a second Task. */
    expect(acceptedAgain).toBeUndefined();
  });

  /** @example A Run records the exact current source, Comment, and Proposal revisions it sees. */
  it('pins all mutable context through immutable Run Inputs', async () => {
    const note = await quickNoteRepo.create({ content: 'A note with follow-up context' });
    const comment = await quickNoteModel.createComment(note.id, {
      content: 'Initial feedback',
    });
    const analyze = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    const analyzeContext = await quickNoteModel.getRunContext(analyze!.id);
    await quickNoteModel.updateComment(comment!.comment.id, { content: 'Revised feedback' });
    const output = await quickNoteRepo.acceptAnnotation(analyze!.id, {
      content: 'A concise interpretation',
      proposals: [{ content: 'Review this later.', kind: 'task' }],
    });
    const editedProposal = await quickNoteRepo.updateProposal(output!.proposals[0].id, {
      content: 'Review this with the latest feedback.',
      editorData: { markdown: 'Review this with the latest feedback.' },
    });

    const dive = await quickNoteRepo.claimRun(note.id, { kind: 'dive' });
    const diveContext = await quickNoteModel.getRunContext(dive!.id);
    const persistedInputs = await serverDB
      .select()
      .from(quickNoteRunInputs)
      .where(eq(quickNoteRunInputs.runId, dive!.id));

    /** @example The first Run remains fixed to the Comment text present at claim time. */
    expect(analyzeContext?.inputs.find(({ role }) => role === 'comment')?.commentContent).toBe(
      'Initial feedback',
    );
    /** @example A later Run consumes the latest Comment revision. */
    expect(diveContext?.inputs.find(({ role }) => role === 'comment')?.commentContent).toBe(
      'Revised feedback',
    );
    /** @example The later Run pins the edited Proposal Document History. */
    expect(diveContext?.inputs.find(({ role }) => role === 'proposal')?.documentHistoryId).toBe(
      editedProposal?.history.id,
    );
    /** @example Source, Comment, and Proposal are three independently auditable inputs. */
    expect(persistedInputs.map(({ role }) => role).sort()).toEqual([
      'comment',
      'proposal',
      'source',
    ]);
  });

  /** @example Editing the source creates a separate Annotation lineage on the next Run. */
  it('keeps Annotation resources separate across source histories', async () => {
    const note = await quickNoteRepo.create({ content: 'Version one' });
    const firstRun = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    await quickNoteRepo.acceptAnnotation(firstRun!.id, { content: 'Annotation one' });

    await quickNoteRepo.updateContent(note.id, {
      content: 'Version two',
      editorData: { root: { children: [{ text: 'Version two' }] } },
    });
    const secondRun = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    await quickNoteRepo.acceptAnnotation(secondRun!.id, { content: 'Annotation two' });

    const resources = await serverDB
      .select()
      .from(quickNoteResources)
      .where(eq(quickNoteResources.quickNoteId, note.id));

    /** @example Each pinned source version has its own Annotation Document lineage. */
    expect(resources).toHaveLength(2);
    /** @example Source histories never share the same lineage identity. */
    expect(new Set(resources.map((resource) => resource.sourceHistoryId)).size).toBe(2);
  });

  /** @example An old Run remains auditable but cannot become the current Annotation after editing. */
  it('does not project a stale Run over a newer source revision', async () => {
    const note = await quickNoteRepo.create({ content: 'Version one' });
    const oldRun = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    const dueAt = new Date('2026-08-24T01:00:00Z');
    await quickNoteRepo.updateContent(note.id, {
      content: 'Version two',
      analyzeDueAt: dueAt,
      editorData: { root: { children: [{ text: 'Version two' }] } },
    });

    await quickNoteRepo.acceptAnnotation(oldRun!.id, {
      content: 'Stale annotation',
      tags: ['stale-tag'],
    });
    const [details] = await quickNoteModel.queryDetails();
    const [persistedNote] = await serverDB
      .select()
      .from(quickNotes)
      .where(eq(quickNotes.id, note.id));

    /** @example The old output is retained in resources but hidden from the current projection. */
    expect(details.annotation).toBeUndefined();
    /** @example The newer edit remains eligible for a fresh Analyze claim. */
    expect(persistedNote.analyzeDueAt).toEqual(dueAt);
    /** @example Stale interpretation metadata cannot leak into the current source revision. */
    expect(persistedNote.tags).toEqual([]);
  });

  /** @example Removing a Quick Note cleans generated private containers and outputs. */
  it('deletes generated Documents and Topic without touching unrelated Documents', async () => {
    const note = await quickNoteRepo.create({ content: 'Disposable' });
    const run = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    const output = await quickNoteRepo.acceptAnnotation(run!.id, {
      content: 'Generated',
      proposals: [{ content: 'Generated proposal', kind: 'task' }],
    });
    await quickNoteModel.createComment(note.id, { content: 'Disposable feedback' });
    const unrelatedDocumentId = 'quick-note-unrelated-document';
    await serverDB.insert(documents).values({
      content: 'Keep me',
      fileType: 'text/plain',
      id: unrelatedDocumentId,
      source: 'manual',
      sourceType: 'api',
      totalCharCount: 7,
      totalLineCount: 1,
      userId,
    });

    const deleted = await quickNoteRepo.delete(note.id);
    const remainingDocuments = await serverDB
      .select({ id: documents.id })
      .from(documents)
      .where(
        inArray(documents.id, [
          note.documentId,
          output!.resource.documentId!,
          output!.proposals[0].documentId,
          unrelatedDocumentId,
        ]),
      );
    const remainingTopics = await serverDB
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.id, note.topicId));

    /** @example The owner can delete the capture exactly once. */
    expect(deleted).toBe(true);
    /** @example Only the unrelated user Document remains. */
    expect(remainingDocuments).toEqual([{ id: unrelatedDocumentId }]);
    /** @example The hidden Topic is removed with the capture. */
    expect(remainingTopics).toEqual([]);
  });
});
