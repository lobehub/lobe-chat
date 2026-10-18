// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { goals, users, workspaces } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { GoalSearchRepo } from './index';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'goal-search-user';
const otherUserId = 'goal-search-other-user';
const workspaceId = 'ws_goal_search';

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
});

afterEach(async () => {
  await serverDB.delete(users);
});

const insertGoal = (values: Partial<typeof goals.$inferInsert> & { id: string; title: string }) =>
  serverDB.insert(goals).values({ userId, ...values });

describe('GoalSearchRepo', () => {
  it('finds goals by title or requirement, ranking title matches first', async () => {
    await insertGoal({
      id: 'goal_req',
      requirement: 'Prove the STAMP loop on a second domain',
      title: 'Second domain rollout',
    });
    await insertGoal({ id: 'goal_title', status: 'paused', title: 'Replica migration (STAMP)' });
    await insertGoal({ id: 'goal_miss', title: 'Unrelated' });

    const results = await new GoalSearchRepo(serverDB, userId).search({ query: 'stamp' });

    expect(results.map(({ id }) => id)).toEqual(['goal_title', 'goal_req']);
    expect(results[0]).toMatchObject({
      relevance: 3,
      status: 'paused',
      title: 'Replica migration (STAMP)',
      type: 'goal',
    });
    expect(results[1].description).toBe('Prove the STAMP loop on a second domain');
  });

  it('keeps goals whose lifetime overlaps the window', async () => {
    await insertGoal({
      createdAt: new Date('2026-09-01T00:00:00.000Z'),
      id: 'goal_stale',
      title: 'replica stale',
      updatedAt: new Date('2026-09-05T00:00:00.000Z'),
    });
    await insertGoal({
      createdAt: new Date('2026-10-01T00:00:00.000Z'),
      id: 'goal_active',
      title: 'replica active',
      updatedAt: new Date('2026-10-15T00:00:00.000Z'),
    });
    await insertGoal({
      createdAt: new Date('2026-10-20T00:00:00.000Z'),
      id: 'goal_future',
      title: 'replica future',
      updatedAt: new Date('2026-10-21T00:00:00.000Z'),
    });

    const results = await new GoalSearchRepo(serverDB, userId).search({
      endDate: new Date('2026-10-18T23:59:59.000Z'),
      query: 'replica',
      startDate: new Date('2026-10-12T00:00:00.000Z'),
    });

    expect(results.map(({ id }) => id)).toEqual(['goal_active']);
  });

  it('never returns other users, other scopes or trashed goals', async () => {
    await serverDB.insert(workspaces).values({
      id: workspaceId,
      name: 'Workspace',
      primaryOwnerId: userId,
      slug: 'goal-search-ws',
    });
    await insertGoal({ id: 'goal_own', title: 'harvest farm' });
    await insertGoal({ id: 'goal_other', title: 'harvest farm', userId: otherUserId });
    await insertGoal({ id: 'goal_ws', title: 'harvest farm', workspaceId });
    await insertGoal({ id: 'goal_trashed', isDeleted: true, title: 'harvest farm' });

    const personal = await new GoalSearchRepo(serverDB, userId).search({ query: 'harvest' });
    expect(personal.map(({ id }) => id)).toEqual(['goal_own']);

    const workspace = await new GoalSearchRepo(serverDB, userId, workspaceId).search({
      query: 'harvest',
    });
    expect(workspace.map(({ id }) => id)).toEqual(['goal_ws']);
  });

  it('returns nothing for a blank query or non-positive limit', async () => {
    await insertGoal({ id: 'goal_any', title: 'anything' });
    const repo = new GoalSearchRepo(serverDB, userId);

    expect(await repo.search({ query: '  ' })).toEqual([]);
    expect(await repo.search({ limit: 0, query: 'anything' })).toEqual([]);
  });
});
