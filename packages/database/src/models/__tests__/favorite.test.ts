// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { userFavorites, users, workspaces } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { FavoriteModel } from '../favorite';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'favorite-test-user';
const otherUserId = 'favorite-test-user-2';
const workspaceId = 'favorite-test-ws';

const personalModel = new FavoriteModel(serverDB, userId);
const workspaceModel = new FavoriteModel(serverDB, userId, workspaceId);

const topic = (id: string, title = id) => ({
  path: `/agent/agt_a/${id}`,
  targetId: id,
  title,
  type: 'topic' as const,
});

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.delete(workspaces);
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
  await serverDB
    .insert(workspaces)
    .values([{ id: workspaceId, name: 'Test WS', primaryOwnerId: userId, slug: 'favorite-ws' }]);
});

afterEach(async () => {
  await serverDB.delete(userFavorites);
  await serverDB.delete(users);
  await serverDB.delete(workspaces);
});

describe('FavoriteModel', () => {
  it('appends new favorites in the order they were added', async () => {
    await personalModel.add(topic('tpc_1'));
    await personalModel.add(topic('tpc_2'));
    await personalModel.add({
      path: '/projects',
      targetId: '/projects',
      title: 'Projects',
      type: 'route',
    });

    const items = await personalModel.query();
    expect(items.map((item) => item.targetId)).toEqual(['tpc_1', 'tpc_2', '/projects']);
    expect(items[0]).toMatchObject({ icon: null, path: '/agent/agt_a/tpc_1', type: 'topic' });
  });

  it('refreshes an existing favorite in place instead of duplicating it', async () => {
    await personalModel.add(topic('tpc_1', 'Old'));
    await personalModel.add(topic('tpc_2'));
    await personalModel.add({ ...topic('tpc_1', 'New'), icon: '🚀', path: '/group/cg_a/tpc_1' });

    const items = await personalModel.query();
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      icon: '🚀',
      path: '/group/cg_a/tpc_1',
      targetId: 'tpc_1',
      title: 'New',
    });
  });

  it('keeps personal, workspace and other members’ favorites apart', async () => {
    await personalModel.add(topic('tpc_personal'));
    await workspaceModel.add(topic('tpc_ws'));
    // The same target can be favorited in both sidebars.
    await workspaceModel.add(topic('tpc_personal'));
    await new FavoriteModel(serverDB, otherUserId, workspaceId).add(topic('tpc_other'));

    expect((await personalModel.query()).map((item) => item.targetId)).toEqual(['tpc_personal']);
    expect((await workspaceModel.query()).map((item) => item.targetId)).toEqual([
      'tpc_ws',
      'tpc_personal',
    ]);
  });

  it('removes only rows in the caller’s scope', async () => {
    const own = await workspaceModel.add(topic('tpc_1'));
    const other = await new FavoriteModel(serverDB, otherUserId, workspaceId).add(topic('tpc_1'));

    await workspaceModel.remove(other.id);
    expect(await new FavoriteModel(serverDB, otherUserId, workspaceId).query()).toHaveLength(1);

    await workspaceModel.remove(own.id);
    expect(await workspaceModel.query()).toHaveLength(0);
  });

  it('removes by target', async () => {
    await personalModel.add(topic('tpc_1'));
    await personalModel.add(topic('tpc_2'));

    await personalModel.removeByTarget('topic', 'tpc_1');

    expect((await personalModel.query()).map((item) => item.targetId)).toEqual(['tpc_2']);
  });

  it('reorders, keeping unlisted favorites after the listed ones', async () => {
    const a = await personalModel.add(topic('tpc_a'));
    const b = await personalModel.add(topic('tpc_b'));
    const c = await personalModel.add(topic('tpc_c'));
    const foreign = await workspaceModel.add(topic('tpc_ws'));

    await personalModel.reorder([c.id, foreign.id, a.id]);

    expect((await personalModel.query()).map((item) => item.id)).toEqual([c.id, a.id, b.id]);
    expect((await workspaceModel.query()).map((item) => item.id)).toEqual([foreign.id]);
  });

  it('updates the snapshot of a favorite in scope', async () => {
    const item = await personalModel.add(topic('tpc_1', 'Old'));

    await personalModel.update(item.id, { icon: '📄', title: 'Renamed' });

    expect((await personalModel.query())[0]).toMatchObject({ icon: '📄', title: 'Renamed' });
  });
});
