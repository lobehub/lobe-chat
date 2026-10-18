// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { QuickNoteRepository } from '../../repositories/quickNote';
import {
  quickNoteProposals,
  quickNoteResources,
  quickNoteRunResources,
  quickNoteRuns,
  quickNotes,
  users,
} from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { QuickNoteModel } from '../quickNote';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'quick-note-write-scope-user';
const otherUserId = 'quick-note-write-scope-other-user';
const quickNoteRepo = new QuickNoteRepository(serverDB, userId);
const otherModel = new QuickNoteModel(serverDB, otherUserId);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
});

afterEach(async () => {
  await serverDB.delete(users);
});

/** Creates a note with an accepted Annotation, one pending Proposal, and an active Dive Run. */
const seed = async () => {
  const note = await quickNoteRepo.create({ content: 'Owner capture' });
  const analyze = await quickNoteRepo.claimRun(note.id, { kind: 'analyze' });
  const output = await quickNoteRepo.acceptAnnotation(analyze!.id, {
    content: 'Owner annotation',
    proposals: [{ content: 'Owner proposal', kind: 'task' }],
  });
  const dive = await quickNoteRepo.claimRun(note.id, { kind: 'dive' });

  return { dive: dive!, note, output: output! };
};

describe('QuickNoteModel write scope', () => {
  /** @example Single-aggregate write helpers refuse rows outside the caller's scope. */
  it('does not mutate another owner’s Quick Note rows', async () => {
    const { dive, note, output } = await seed();
    const proposal = output.proposals[0];
    const [noteBefore] = await serverDB.select().from(quickNotes).where(eq(quickNotes.id, note.id));

    const saved = await otherModel.recordContentSave(note.id, { updatedAt: new Date(0) });
    const deleted = await otherModel.deleteRecord(note.id);
    const pointed = await otherModel.setProposalCurrentHistory(
      proposal.id,
      output.documentHistory.id,
      new Date(0),
    );
    await otherModel.markPendingProposalsStale(note.id, new Date(0));
    const annotation = await otherModel.createAnnotationResource({
      documentId: output.resource.documentId!,
      quickNoteId: note.id,
      sourceHistoryId: dive.sourceHistoryId,
    });
    const recorded = await otherModel.recordRunResource({
      documentHistoryId: output.documentHistory.id,
      resourceId: output.resource.id,
      runId: dive.id,
    });
    await otherModel.completeAnnotationRun(dive.id, {
      analyzeDueAt: null,
      quickNoteId: note.id,
      sourceDocumentEditorData: null,
      sourceHistoryEditorData: null,
      tags: ['hijacked'],
    });

    const [noteAfter] = await serverDB.select().from(quickNotes).where(eq(quickNotes.id, note.id));
    const [proposalAfter] = await serverDB
      .select()
      .from(quickNoteProposals)
      .where(eq(quickNoteProposals.id, proposal.id));
    const [diveAfter] = await serverDB
      .select()
      .from(quickNoteRuns)
      .where(eq(quickNoteRuns.id, dive.id));
    const resources = await serverDB
      .select()
      .from(quickNoteResources)
      .where(eq(quickNoteResources.quickNoteId, note.id));
    const diveEvidence = await serverDB
      .select()
      .from(quickNoteRunResources)
      .where(eq(quickNoteRunResources.runId, dive.id));

    /** @example No helper reports a write for a foreign id. */
    expect({ annotation, deleted, pointed, recorded, saved }).toEqual({
      annotation: undefined,
      deleted: undefined,
      pointed: undefined,
      recorded: false,
      saved: undefined,
    });
    /** @example The note row keeps its timestamps and tags. */
    expect(noteAfter).toEqual(noteBefore);
    /** @example The Proposal keeps its revision pointer and stays current. */
    expect(proposalAfter).toMatchObject({
      currentHistoryId: proposal.currentHistoryId,
      validity: 'current',
    });
    /** @example The active Run is not completed by another owner. */
    expect(diveAfter?.status).toBe('pending');
    /** @example No foreign Annotation binding or Run evidence was added. */
    expect(resources).toHaveLength(1);
    expect(diveEvidence).toEqual([]);
  });
});
