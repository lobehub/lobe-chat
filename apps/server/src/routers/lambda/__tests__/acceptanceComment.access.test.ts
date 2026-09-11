// @vitest-environment node
import { randomUUID } from 'node:crypto';

import { type LobeChatDatabase } from '@lobechat/database';
import { acceptances, verifyRuns } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { acceptanceCommentRouter } from '../acceptanceComment';
import { cleanupTestUser, createTestUser } from './integration/setup';

let testDB: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(() => testDB),
}));

/**
 * A public acceptance is handed around as a link so other people can answer the
 * evidence in it. Reading it and remarking on it are therefore the same right;
 * approving a round, introducing one, and closing someone else's thread are not
 * — those speak for the delivery, and stay with its creator and their
 * workspace.
 */
describe('acceptanceCommentRouter access', () => {
  let serverDB: LobeChatDatabase;
  let ownerId: string;
  let visitorId: string;
  let publicAcceptanceId: string;
  let privateAcceptanceId: string;
  let publicRunId: string;

  beforeEach(async () => {
    serverDB = await getTestDB();
    testDB = serverDB;
    ownerId = await createTestUser(serverDB);
    visitorId = await createTestUser(serverDB);

    const [open, closed] = await serverDB
      .insert(acceptances)
      .values([
        {
          subjectId: randomUUID(),
          subjectType: 'standalone',
          userId: ownerId,
          visibility: 'public',
        },
        {
          subjectId: randomUUID(),
          subjectType: 'standalone',
          userId: ownerId,
          visibility: 'private',
        },
      ])
      .returning();
    publicAcceptanceId = open.id;
    privateAcceptanceId = closed.id;

    const [run] = await serverDB
      .insert(verifyRuns)
      .values({ acceptanceId: publicAcceptanceId, roundIndex: 1, userId: ownerId })
      .returning();
    publicRunId = run.id;
  });

  afterEach(async () => {
    await cleanupTestUser(serverDB, visitorId);
    await cleanupTestUser(serverDB, ownerId);
    vi.clearAllMocks();
  });

  const caller = (userId: string) =>
    acceptanceCommentRouter.createCaller({ jwtPayload: { userId }, userId } as any);

  const comment = (userId: string, acceptanceId: string, content: string) =>
    caller(userId).create({ acceptanceId, clientId: `c-${randomUUID()}`, content });

  it('lets a visitor remark on a public acceptance', async () => {
    const { data } = await comment(visitorId, publicAcceptanceId, 'the second screenshot is stale');

    expect(data.authorUserId).toBe(visitorId);
  });

  it('lets a visitor react to a comment on a public acceptance', async () => {
    const { data: owned } = await comment(ownerId, publicAcceptanceId, 'round 1 is up');

    await expect(
      caller(visitorId).react({ emoji: '👍', id: owned.id, on: true }),
    ).resolves.toMatchObject({ data: { on: true } });
  });

  it('tells a visitor they may comment but not approve', async () => {
    const list = await caller(visitorId).list({ acceptanceId: publicAcceptanceId });

    expect(list).toMatchObject({ canApprove: false, canComment: true });
  });

  it('refuses a visitor an approval', async () => {
    await expect(
      caller(visitorId).create({
        acceptanceId: publicAcceptanceId,
        clientId: `c-${randomUUID()}`,
        content: 'looks good to me',
        contextRunId: publicRunId,
        kind: 'approval',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it("refuses a visitor a round's own introduction", async () => {
    await expect(
      caller(visitorId).create({
        acceptanceId: publicAcceptanceId,
        clientId: `c-${randomUUID()}`,
        content: 'round 2 delivered',
        contextRunId: publicRunId,
        kind: 'proposal',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it("refuses a visitor closing someone else's thread", async () => {
    const { data: owned } = await comment(ownerId, publicAcceptanceId, 'is this expected?');

    await expect(
      caller(visitorId).setResolved({ id: owned.id, resolved: true }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('lets a visitor close the thread they opened', async () => {
    const { data: mine } = await comment(visitorId, publicAcceptanceId, 'never mind, my mistake');

    const { data } = await caller(visitorId).setResolved({ id: mine.id, resolved: true });

    expect(data.resolvedAt).not.toBeNull();
  });

  it('keeps a private acceptance invisible to a visitor', async () => {
    await expect(comment(visitorId, privateAcceptanceId, 'hello?')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
