// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { users, workspaceMembers, workspaces } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { CanvasFileModel } from '../canvasFile';
import { FileModel } from '../file';

const serverDB: LobeChatDatabase = await getTestDB();
const userId = 'canvas-file-user';
const otherUserId = 'canvas-file-user-2';

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
});

afterEach(async () => {
  await serverDB.delete(users);
});

const blob = (hash: string, size = 10) => ({
  contentType: 'text/html',
  hash,
  name: 'index.html',
  size,
  url: `canvas/${userId}/blobs/${hash}`,
});

describe('CanvasFileModel', () => {
  it('registers one file row per canvas blob and counts it toward storage usage', async () => {
    const model = new CanvasFileModel(serverDB, userId);
    await model.register('cvs_a', [blob('h1', 100), blob('h2', 50)]);
    await model.register('cvs_a', [blob('h1', 100)]);

    expect(
      (await model.listByHashes(['h1', 'h2'])).map((row) => [row.canvasId, row.fileHash]),
    ).toEqual(
      expect.arrayContaining([
        ['cvs_a', 'h1'],
        ['cvs_a', 'h2'],
      ]),
    );
    expect(await new FileModel(serverDB, userId).countUsage()).toBe(150);
  });

  it('keeps blobs owned per user', async () => {
    await new CanvasFileModel(serverDB, userId).register('cvs_a', [blob('h1')]);

    expect(await new CanvasFileModel(serverDB, otherUserId).listByHashes(['h1'])).toEqual([]);
  });

  it('does not reuse a teammate canvas blob in a shared workspace', async () => {
    const workspaceId = 'canvas-file-ws';
    await serverDB
      .insert(workspaces)
      .values({ id: workspaceId, name: 'ws', primaryOwnerId: userId, slug: workspaceId });
    await serverDB.insert(workspaceMembers).values([
      { role: 'owner', userId, workspaceId },
      { role: 'editor', userId: otherUserId, workspaceId },
    ]);
    await new CanvasFileModel(serverDB, userId, workspaceId).register('cvs_a', [blob('h1')]);

    expect(
      await new CanvasFileModel(serverDB, otherUserId, workspaceId).listByHashes(['h1']),
    ).toEqual([]);
  });

  it('removes a canvas and reports blobs no other canvas still uses', async () => {
    const model = new CanvasFileModel(serverDB, userId);
    await model.register('cvs_a', [blob('shared'), blob('only-a')]);
    await model.register('cvs_b', [blob('shared')]);

    const orphaned = await model.deleteByCanvas('cvs_a');

    expect(orphaned).toEqual([`canvas/${userId}/blobs/only-a`]);
    expect((await model.listByHashes(['shared', 'only-a'])).map((row) => row.canvasId)).toEqual([
      'cvs_b',
    ]);
  });
});
