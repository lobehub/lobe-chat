// @vitest-environment node
import { and, eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import {
  documentHistories,
  documents,
  quickNoteResources,
  quickNoteRunResources,
  quickNoteRuns,
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

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
});

afterEach(async () => {
  await serverDB.delete(users);
});

/** @example A capture creates its private content and conversation containers atomically. */
describe('QuickNoteModel', () => {
  /** @example Creating "Remember Tokyo" returns the persisted note and backing IDs. */
  it('creates a Quick Note with one backing Document and Topic', async () => {
    const note = await quickNoteModel.create({
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

  /** @example A second user cannot read or mutate another user's capture. */
  it('keeps Quick Notes isolated by owner', async () => {
    const note = await quickNoteModel.create({ content: 'private note' });
    const otherModel = new QuickNoteModel(serverDB, otherUserId);

    const otherNotes = await otherModel.query();
    const updateResult = await otherModel.updateContent(note.id, {
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

  /** @example Rich-text autosaves retain bounded Document History revisions. */
  it('coalesces source edits through the shared Document History window', async () => {
    const firstEditorData = { root: { children: [{ text: 'Version one' }] } };
    const secondEditorData = { root: { children: [{ text: 'Version two' }] } };
    const note = await quickNoteModel.create({
      content: 'Version one',
      editorData: firstEditorData,
    });

    await quickNoteModel.updateContent(note.id, {
      content: 'Version two',
      editorData: secondEditorData,
    });
    await quickNoteModel.updateContent(note.id, {
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
    const note = await quickNoteModel.create({ content: 'Version one', editorData });

    const run = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });

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
  });

  /** @example A pending Discovery for unchanged content is claimed only once. */
  it('deduplicates active Runs for the same source snapshot and kind', async () => {
    const note = await quickNoteModel.create({
      content: 'Stable content',
      editorData: { root: { children: [] } },
    });

    const first = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    const second = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    const runs = await serverDB
      .select()
      .from(quickNoteRuns)
      .where(and(eq(quickNoteRuns.quickNoteId, note.id), eq(quickNoteRuns.kind, 'discovery')));

    /** @example Both claim callers observe the same active Run. */
    expect(second?.id).toBe(first?.id);
    /** @example Only one active Run row exists. */
    expect(runs).toHaveLength(1);
  });

  /** @example Refresh recovery exposes an active Dive even if another Run completed later. */
  it('prefers an active Run in the list projection', async () => {
    const note = await quickNoteModel.create({ content: 'Dive while discovery completes' });
    const dive = await quickNoteModel.claimRun(note.id, { kind: 'dive' });
    const discovery = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    await quickNoteModel.acceptAnnotation(discovery!.id, { content: 'Light annotation' });

    const [details] = await quickNoteModel.queryDetails();

    /** @example The active Dive remains recoverable rather than being hidden by Discovery. */
    expect(details.run).toMatchObject({ kind: dive!.kind, status: 'pending' });
  });

  /** @example Discovery accepts one Document-backed Annotation for its pinned source history. */
  it('persists accepted Annotation output with Run provenance', async () => {
    const note = await quickNoteModel.create({ content: 'Unclassified thought' });
    const run = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });

    const output = await quickNoteModel.acceptAnnotation(run!.id, {
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
      .where(eq(documents.id, resource.documentId));
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

  /** @example Editing the source creates a separate Annotation lineage on the next Run. */
  it('keeps Annotation resources separate across source histories', async () => {
    const note = await quickNoteModel.create({ content: 'Version one' });
    const firstRun = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    await quickNoteModel.acceptAnnotation(firstRun!.id, { content: 'Annotation one' });

    await quickNoteModel.updateContent(note.id, {
      content: 'Version two',
      editorData: { root: { children: [{ text: 'Version two' }] } },
    });
    const secondRun = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    await quickNoteModel.acceptAnnotation(secondRun!.id, { content: 'Annotation two' });

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
    const note = await quickNoteModel.create({ content: 'Version one' });
    const oldRun = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    const dueAt = new Date('2026-08-24T01:00:00Z');
    await quickNoteModel.updateContent(note.id, {
      content: 'Version two',
      discoveryDueAt: dueAt,
      editorData: { root: { children: [{ text: 'Version two' }] } },
    });

    await quickNoteModel.acceptAnnotation(oldRun!.id, {
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
    /** @example The newer edit remains eligible for a fresh Discovery claim. */
    expect(persistedNote.discoveryDueAt).toEqual(dueAt);
    /** @example Stale interpretation metadata cannot leak into the current source revision. */
    expect(persistedNote.tags).toEqual([]);
  });

  /** @example Discovery can accept an owned recent Document but not another user's Document. */
  it('links only owner-accessible Documents as Context resources', async () => {
    const note = await quickNoteModel.create({ content: 'Connect this note' });
    const run = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    await serverDB.insert(documents).values([
      {
        content: 'Owned context',
        fileType: 'text/plain',
        id: 'quick-note-owned-context',
        source: 'manual',
        sourceType: 'api',
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
    const rejected = await quickNoteModel.linkDocumentResource(
      run!.id,
      'quick-note-foreign-context',
    );
    const provenance = await serverDB
      .select()
      .from(quickNoteRunResources)
      .where(eq(quickNoteRunResources.runId, run!.id));

    /** @example The owned canonical Document becomes a Context resource. */
    expect(accepted).toMatchObject({
      documentId: 'quick-note-owned-context',
      role: 'context',
      sourceHistoryId: run!.sourceHistoryId,
    });
    /** @example Cross-owner Documents cannot be attached through model output. */
    expect(rejected).toBeUndefined();
    /** @example Workflow retry resolves to the same stable binding. */
    expect(acceptedAgain?.id).toBe(accepted?.id);
    /** @example The producing Run records provenance without fabricating a Document History. */
    expect(provenance).toHaveLength(1);
    /** @example The single provenance row points at the accepted resource. */
    expect(provenance[0]).toMatchObject({
      documentHistoryId: null,
      resourceId: accepted!.id,
    });
  });

  /** @example Removing a Quick Note cleans generated private containers and outputs. */
  it('deletes generated Documents and Topic without touching unrelated Documents', async () => {
    const note = await quickNoteModel.create({ content: 'Disposable' });
    const run = await quickNoteModel.claimRun(note.id, { kind: 'discovery' });
    const output = await quickNoteModel.acceptAnnotation(run!.id, { content: 'Generated' });
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

    const deleted = await quickNoteModel.delete(note.id);
    const remainingDocuments = await serverDB
      .select({ id: documents.id })
      .from(documents)
      .where(
        inArray(documents.id, [note.documentId, output!.resource.documentId, unrelatedDocumentId]),
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

  /** @example The global sweep only sees due captures for users who opted in. */
  it('lists bounded Automatic Discovery candidates from user settings', async () => {
    await serverDB.insert(userSettings).values([
      { general: { enableQuickNoteAutomaticDiscovery: true }, id: userId },
      { general: { enableQuickNoteAutomaticDiscovery: false }, id: otherUserId },
    ]);
    const enabled = await quickNoteModel.create({ content: 'eligible' });
    const disabledModel = new QuickNoteModel(serverDB, otherUserId);
    const disabled = await disabledModel.create({ content: 'ineligible' });
    const dueAt = new Date('2026-08-24T00:00:00Z');
    await quickNoteModel.updateContent(enabled.id, {
      content: 'eligible',
      discoveryDueAt: dueAt,
      editorData: { root: { children: [] } },
    });
    await disabledModel.updateContent(disabled.id, {
      content: 'ineligible',
      discoveryDueAt: dueAt,
      editorData: { root: { children: [] } },
    });

    const candidates = await QuickNoteModel.findDueDiscoveryCandidates(serverDB, {
      now: new Date('2026-08-24T00:01:00Z'),
    });

    /** @example Only the opted-in owner is scheduled. */
    expect(candidates).toEqual([{ id: enabled.id, userId, workspaceId: null }]);
  });
});
