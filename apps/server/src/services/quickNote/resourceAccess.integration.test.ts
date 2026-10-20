// @vitest-environment node
import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDB } from '@/database/core/getTestDB';
import {
  documents,
  quickNoteResources,
  users,
  workspaceMembers,
  workspaces,
} from '@/database/schemas';

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
});
