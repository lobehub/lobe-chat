// @vitest-environment node
import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { QuickNoteRepository } from '../../repositories/quickNote';
import {
  documents,
  quickNoteCommentRevisions,
  quickNoteComments,
  quickNoteRunResources,
  quickNotes,
  topics,
  users,
  userSettings,
} from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { QuickNoteModel } from '../quickNote';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'quick-note-model-user';
const otherUserId = 'quick-note-model-other-user';
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

describe('QuickNoteModel', () => {
  /** @example A second user cannot read or mutate another user's capture. */
  it('keeps Quick Notes isolated by owner', async () => {
    const note = await quickNoteRepo.create({ content: 'private note' });
    const otherModel = new QuickNoteModel(serverDB, otherUserId);

    const otherNotes = await otherModel.query();
    const updateResult = await otherRepo.updateContent(note.id, {
      content: 'hacked',
      editorData: { root: { children: [] } },
    });

    const [document] = await serverDB
      .select({ content: documents.content })
      .from(documents)
      .where(eq(documents.id, note.documentId));

    /** @example An unrelated owner receives an empty collection. */
    expect(otherNotes).toEqual([]);
    /** @example An unrelated owner cannot update the note. */
    expect(updateResult).toBeUndefined();
    /** @example The original Document remains unchanged. */
    expect(document?.content).toBe('private note');
  });

  /** @example Editing feedback preserves the submitted text that an earlier Run consumed. */
  it('keeps Comment revisions append-only and owner-scoped', async () => {
    const note = await quickNoteRepo.create({ content: 'An unresolved capture' });
    const created = await quickNoteModel.createComment(note.id, {
      content: 'Please consider the data requirement.',
      editorData: { markdown: 'Please consider the data requirement.' },
    });
    const updated = await quickNoteModel.updateComment(created!.comment.id, {
      content: 'Please consider the training data requirement.',
      editorData: { markdown: 'Please consider the training data requirement.' },
    });
    const otherModel = new QuickNoteModel(serverDB, otherUserId);
    const rejected = await otherModel.updateComment(created!.comment.id, {
      content: 'Cross-owner edit',
    });
    const rejectedCreate = await otherModel.createComment(note.id, { content: 'Cross-owner add' });
    const hiddenComments = await otherModel.queryComments(note.id);
    const revisions = await serverDB
      .select()
      .from(quickNoteCommentRevisions)
      .where(eq(quickNoteCommentRevisions.commentId, created!.comment.id))
      .orderBy(quickNoteCommentRevisions.createdAt, quickNoteCommentRevisions.id);
    const [comment] = await serverDB
      .select()
      .from(quickNoteComments)
      .where(eq(quickNoteComments.id, created!.comment.id));

    /** @example The lightweight Comment row contains only its current projection. */
    expect(comment.content).toBe('Please consider the training data requirement.');
    /** @example Create and edit each produce a stable revision identity. */
    expect(revisions.map(({ content }) => content)).toEqual([
      'Please consider the data requirement.',
      'Please consider the training data requirement.',
    ]);
    /** @example The edit API returns the newly submitted revision. */
    expect(updated?.revision.content).toBe('Please consider the training data requirement.');
    /** @example Another owner cannot rewrite the feedback stream. */
    expect(rejected).toBeUndefined();
    /** @example Another owner cannot append feedback to the capture. */
    expect(rejectedCreate).toBeUndefined();
    /** @example Another owner cannot list the feedback stream. */
    expect(hiddenComments).toEqual([]);
  });

  /** @example Refresh recovery exposes an active Dive even if another Run completed later. */
  it('prefers an active Run in the list projection', async () => {
    const note = await quickNoteRepo.create({ content: 'Dive while analyze completes' });
    const dive = await quickNoteRepo.claimRun(note.id, { kind: 'dive' });
    const analyze = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    await quickNoteRepo.acceptAnnotation(analyze!.id, { content: 'Light annotation' });

    const [details] = await quickNoteModel.queryDetails();

    /** @example The active Dive remains recoverable rather than being hidden by Analyze. */
    expect(details.run).toMatchObject({ kind: dive!.kind, status: 'pending' });
  });

  /** @example Analyze can accept typed owned resources but not another user's Document. */
  it('links only owner-accessible typed Context resources', async () => {
    const note = await quickNoteRepo.create({ content: 'Connect this note' });
    const run = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
    await serverDB.insert(documents).values([
      {
        content: 'Owned context',
        fileType: 'text/plain',
        id: 'quick-note-owned-context',
        source: 'manual',
        sourceType: 'api',
        title: 'Duplex training notes',
        totalCharCount: 13,
        totalLineCount: 1,
        userId,
      },
      {
        content: 'Foreign context',
        fileType: 'text/plain',
        id: 'quick-note-foreign-context',
        source: 'manual',
        sourceType: 'api',
        totalCharCount: 15,
        totalLineCount: 1,
        userId: otherUserId,
      },
    ]);

    const accepted = await quickNoteModel.linkDocumentResource(run!.id, 'quick-note-owned-context');
    const acceptedAgain = await quickNoteModel.linkDocumentResource(
      run!.id,
      'quick-note-owned-context',
    );
    const relatedTopicId = 'quick-note-related-topic';
    await serverDB
      .insert(topics)
      .values({ id: relatedTopicId, title: 'Duplex model discussion', userId });
    const acceptedTopic = await quickNoteModel.linkResource(run!.id, {
      id: relatedTopicId,
      type: 'topic',
    });
    const rejected = await quickNoteModel.linkDocumentResource(
      run!.id,
      'quick-note-foreign-context',
    );
    const provenance = await serverDB
      .select()
      .from(quickNoteRunResources)
      .where(eq(quickNoteRunResources.runId, run!.id));
    const details = await quickNoteModel.queryAgenticDetails(note.id);

    /** @example The owned canonical Document becomes a Context resource. */
    expect(accepted).toMatchObject({
      documentId: 'quick-note-owned-context',
      resourceId: 'quick-note-owned-context',
      resourceType: 'document',
      role: 'context',
      sourceHistoryId: run!.sourceHistoryId,
    });
    /** @example Cross-owner Documents cannot be attached through model output. */
    expect(rejected).toBeUndefined();
    /** @example Workflow retry resolves to the same stable binding. */
    expect(acceptedAgain?.id).toBe(accepted?.id);
    /** @example A related Topic is retained as a Topic reference without a fake Document id. */
    expect(acceptedTopic).toMatchObject({
      documentId: null,
      resourceId: relatedTopicId,
      resourceType: 'topic',
    });
    /** @example The producing Run records provenance without fabricating a Document History. */
    expect(provenance).toHaveLength(2);
    /** @example One provenance row points at the accepted resource; row order is unspecified. */
    expect(provenance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ documentHistoryId: null, resourceId: accepted!.id }),
      ]),
    );
    /** @example The detail projection resolves product-native labels for both resource families. */
    expect(details.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Duplex training notes',
          resourceId: 'quick-note-owned-context',
        }),
        expect.objectContaining({
          label: 'Duplex model discussion',
          resourceId: relatedTopicId,
        }),
      ]),
    );
  });

  /** @example Missing preferences enable Automatic Analyze while explicit false opts out. */
  it('defaults Automatic Analyze on unless explicitly disabled', async () => {
    /** @example A user without a settings row receives the default-on behavior. */
    expect(await QuickNoteModel.isAutomaticAnalyzeEnabled(serverDB, userId)).toBe(true);

    await serverDB.insert(userSettings).values({
      id: userId,
      quickNote: {
        analyzeAgentId: null,
        autoAnalyze: { enabled: false, idleDelayMs: 6000 },
        maxAnalyzeSteps: 4,
      },
    });

    /** @example An explicit false preference disables background Analyze. */
    expect(await QuickNoteModel.isAutomaticAnalyzeEnabled(serverDB, userId)).toBe(false);
  });

  /** @example Analyze settings preserve the Agent binding while bounding runtime costs. */
  it('resolves and bounds configurable Analyze settings', async () => {
    await serverDB.insert(userSettings).values({
      id: userId,
      quickNote: {
        analyzeAgentId: 'agt_research',
        autoAnalyze: { enabled: true, idleDelayMs: 100 },
        maxAnalyzeSteps: 99,
      },
    });

    const settings = await QuickNoteModel.getAnalyzeSettings(serverDB, userId);

    /** @example User choice is retained and unsafe bounds are normalized server-side. */
    expect(settings).toEqual({
      analyzeAgentId: 'agt_research',
      autoAnalyze: { enabled: true, idleDelayMs: 1000 },
      maxAnalyzeSteps: 20,
    });
  });

  /** @example The global sweep includes missing preferences and excludes explicit opt-outs. */
  it('lists bounded Automatic Analyze candidates from user settings', async () => {
    await serverDB.insert(userSettings).values({
      id: otherUserId,
      quickNote: {
        analyzeAgentId: null,
        autoAnalyze: { enabled: false, idleDelayMs: 6000 },
        maxAnalyzeSteps: 4,
      },
    });
    const defaultEnabled = await quickNoteRepo.create({ content: 'eligible' });
    const disabled = await otherRepo.create({ content: 'ineligible' });
    const dueAt = new Date('2026-08-24T00:00:00Z');
    await quickNoteRepo.updateContent(defaultEnabled.id, {
      content: 'eligible',
      analyzeDueAt: dueAt,
      editorData: { root: { children: [] } },
    });
    await otherRepo.updateContent(disabled.id, {
      content: 'ineligible',
      analyzeDueAt: dueAt,
      editorData: { root: { children: [] } },
    });

    const candidates = await QuickNoteModel.findDueAnalyzeCandidates(serverDB, {
      now: new Date('2026-08-24T00:01:00Z'),
    });

    /** @example Only the owner without an explicit opt-out is scheduled. */
    expect(candidates).toMatchObject([{ id: defaultEnabled.id, userId, workspaceId: null }]);
  });
  /** @example A due-time tie does not repeat or omit rows across sweep pages. */
  it('pages due notes after the last due-time and id pair', async () => {
    const dueAt = new Date('2026-08-24T00:00:00Z');
    const first = await quickNoteRepo.create({ id: 'qn_page_a', content: 'first' });
    const second = await quickNoteRepo.create({ id: 'qn_page_b', content: 'second' });
    await serverDB
      .update(quickNotes)
      .set({ analyzeDueAt: dueAt })
      .where(inArray(quickNotes.id, [first.id, second.id]));
    const next = await QuickNoteModel.findDueAnalyzeCandidates(serverDB, {
      after: { analyzeDueAt: dueAt, id: first.id },
      limit: 1,
      now: dueAt,
    });
    /** @example The tie-breaker advances to the second capture without skipping equal due times. */
    expect(next.map(({ id }) => id)).toEqual([second.id]);
  });
});
