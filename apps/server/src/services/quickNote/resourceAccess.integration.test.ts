// @vitest-environment node
import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDB } from '@/database/core/getTestDB';
import { QuickNoteRepository } from '@/database/repositories/quickNote';
import {
  documents,
  quickNoteResources,
  users,
  workspaceMembers,
  workspaces,
} from '@/database/schemas';

import { QuickNoteProcessingService } from '.';
import { renderQuickNoteSourceText as renderSourceText } from './sourceText';

// NOTICE:
// Route tests reuse the isolated migration-backed database instead of an application connection.
// Source: packages/trpc/src/lambda/middleware/serverDatabase.ts.
vi.mock('@/database/core/db-adaptor', () => ({ getServerDB: () => getTestDB() }));
vi.mock('@/server/services/agentSignal', () => ({ enqueueAgentSignalSourceEvent: vi.fn() }));
vi.mock('@/server/services/quickNote/featureGate', () => ({ assertQuickNoteEnabled: vi.fn() }));

const db = await getTestDB();
const userId = 'quick-note-resource-access-member';
const authorId = 'quick-note-resource-access-author';
const workspaceId = 'quick-note-resource-access-ws';
const { quickNoteRouter } = await import('@/server/routers/lambda/quickNote');
const caller = quickNoteRouter.createCaller({ userId, workspaceId });
const repo = new QuickNoteRepository(db, userId, workspaceId);
const service = new QuickNoteProcessingService(db, userId, workspaceId);

/** Document ids the Analyze context and the Agent-hint lookup would offer for a note. */
const collectAnalyzeDocumentIds = async () => {
  const note = await caller.create({ content: 'Author', editorData: { markdown: 'Author' } });
  const run = await repo.claimRun(note.id, {
    kind: 'analyze',
    renderSourceText,
    trigger: 'manual',
  });
  const candidates: { id: string; type: string }[] = await service['collectContextCandidates'](
    note.id,
    run!.sourceHistoryId,
  );
  const found: { id: string; type: string }[] = await service['findContextResources'](
    ['Author'],
    note.documentId,
  );

  return {
    candidates: candidates.filter(({ type }) => type === 'document').map(({ id }) => id),
    found: found.filter(({ type }) => type === 'document').map(({ id }) => id),
  };
};

beforeEach(async () => {
  await db.insert(users).values([{ id: userId }, { id: authorId }]);
  await db
    .insert(workspaces)
    .values({ id: workspaceId, name: 'ws', primaryOwnerId: authorId, slug: workspaceId });
  await db.insert(workspaceMembers).values({ userId, workspaceId });
  await db.insert(documents).values({
    content: 'Author page',
    fileType: 'text/plain',
    id: 'qn-access-public-page',
    source: 'manual',
    sourceType: 'api',
    title: 'Author page',
    totalCharCount: 11,
    totalLineCount: 1,
    userId: authorId,
    visibility: 'public',
    workspaceId,
  });
});

afterEach(async () => {
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  await db.delete(users).where(inArray(users.id, [userId, authorId]));
  vi.restoreAllMocks();
});

/** @example Linking a Document to a Quick Note never bypasses Document view permission. */
describe('Quick Note resource access', () => {
  /** @example A member without `DOCUMENT_READ` cannot attach another member's public page. */
  it('skips a workspace Document the caller may not view', async () => {
    // ROOT CAUSE:
    // `create.resources` was authorized by workspace and visibility only, so a member without the
    // workspace `DOCUMENT_READ` grant could link (and then read back) another member's page.
    // A role outside the built-in matrix expands to no grants, so it has no `DOCUMENT_READ`.
    await db
      .update(workspaceMembers)
      .set({ role: 'restricted' })
      .where(eq(workspaceMembers.userId, userId));
    const note = await caller.create({
      content: 'Sent from a page',
      resources: [{ id: 'qn-access-public-page', type: 'page' }],
    });

    const links = await db
      .select()
      .from(quickNoteResources)
      .where(eq(quickNoteResources.quickNoteId, note.id));
    /** @example The inaccessible page is not linked. */
    expect(links).toEqual([]);
    /** @example The detail surface does not return it either. */
    expect((await caller.agenticDetails({ id: note.id })).resources).toEqual([]);
  });

  /** @example An ordinary member still links a public page of the same workspace. */
  it('links a workspace Document the caller may view', async () => {
    const note = await caller.create({
      content: 'Sent from a page',
      resources: [{ id: 'qn-access-public-page', type: 'page' }],
    });

    /** @example The viewable page is linked and returned. */
    expect((await caller.agenticDetails({ id: note.id })).resources).toMatchObject([
      { label: 'Author page', resourceId: 'qn-access-public-page' },
    ]);
  });

  /** @example Analyze never reads a public page the caller may not view into its prompt. */
  it('keeps an unviewable workspace Document out of Analyze context', async () => {
    // ROOT CAUSE:
    // Analyze context admitted any workspace-public Document by visibility alone and read its
    // content into the prompt; only the later link step applied the per-Document view check.
    await db
      .update(workspaceMembers)
      .set({ role: 'restricted' })
      .where(eq(workspaceMembers.userId, userId));

    const { candidates, found } = await collectAnalyzeDocumentIds();

    /** @example Neither the recent-context read nor the hint lookup offers the page. */
    expect(candidates).not.toContain('qn-access-public-page');
    expect(found).not.toContain('qn-access-public-page');
  });

  /** @example A member who may view the page still gets it as Analyze context. */
  it('keeps a viewable workspace Document in Analyze context', async () => {
    const { candidates, found } = await collectAnalyzeDocumentIds();

    expect(candidates).toContain('qn-access-public-page');
    expect(found).toContain('qn-access-public-page');
  });
});
