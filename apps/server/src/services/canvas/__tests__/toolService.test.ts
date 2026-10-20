// @vitest-environment node
import { getTestDB } from '@lobechat/database/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkModel } from '@/database/models/work';
import { agents, users, workspaceMembers, workspaces } from '@/database/schemas';

import { type CanvasBlobStore, CanvasStorageService } from '../storage';
import { CanvasToolServiceImpl } from '../toolService';

const serverDB = await getTestDB();
const userId = 'canvas-tool-user';
const agentId = 'canvas-tool-agent';

const memoryStore = (): CanvasBlobStore => {
  const objects = new Map<string, Uint8Array>();
  return {
    delete: async (keys) => keys.forEach((key) => objects.delete(key)),
    read: async (key) => {
      const value = objects.get(key);
      if (!value) throw new Error(`missing ${key}`);
      return value;
    },
    write: async (key, bytes) => {
      objects.set(key, bytes);
    },
  };
};

const page = (body: string) => `<!doctype html><html><body>${body}</body></html>`;

const setup = (
  overrides: {
    actorId?: string;
    findGuideState?: () => Promise<unknown>;
    store?: CanvasBlobStore;
    topicId?: string;
    workspaceId?: string;
  } = {},
) => {
  const actorId = overrides.actorId ?? userId;
  const store = overrides.store ?? memoryStore();
  const storageFor = (ownerId: string) =>
    new CanvasStorageService({
      db: serverDB,
      store,
      userId: ownerId,
      workspaceId: overrides.workspaceId,
    });
  const storage = storageFor(actorId);
  const workModel = new WorkModel(serverDB, actorId, overrides.workspaceId);
  const service = new CanvasToolServiceImpl({
    agentId,
    findGuideState: overrides.findGuideState ?? vi.fn().mockResolvedValue({ guideRead: true }),
    storage,
    storageFor,
    topicId: 'topicId' in overrides ? overrides.topicId : 'topic-1',
    workModel,
  });
  return { service, storage, workModel };
};

const registerFromOutcome = async (
  workModel: WorkModel,
  outcome: Awaited<ReturnType<CanvasToolServiceImpl['create']>>,
  toolCallId: string,
) => {
  if (!outcome.ok) throw new Error('save failed');
  await workModel.registerCanvas({
    agentId,
    canvasId: outcome.canvasId,
    description: outcome.description,
    metadata: outcome.metadata,
    title: outcome.title,
    toolCallId,
    toolIdentifier: 'lobe-canvas',
    toolName: 'createCanvas',
  });
};

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values({ id: userId });
  await serverDB.insert(agents).values({ id: agentId, userId });
});

describe('CanvasToolServiceImpl', () => {
  it('creates a canvas with a fresh id', async () => {
    const { service } = setup();

    const outcome = await service.create({
      description: 'Up 23%',
      files: [{ content: page('<lobe-tag>x</lobe-tag>'), path: 'index.html' }],
      title: 'Cost report',
    });

    expect(outcome).toMatchObject({ description: 'Up 23%', ok: true, title: 'Cost report' });
    if (outcome.ok) expect(outcome.canvasId).toMatch(/^cvs_/);
  });

  it('updates the latest version with edits and keeps the title when not given', async () => {
    const { service, storage, workModel } = setup();
    const created = await service.create({
      files: [{ content: page('<h1>Old</h1>'), path: 'index.html' }],
      title: 'Cost report',
    });
    await registerFromOutcome(workModel, created, 'call-1');
    if (!created.ok) return;

    const updated = await service.update({
      canvasId: created.canvasId,
      edits: [{ newText: 'New', oldText: 'Old', path: 'index.html' }],
    });

    expect(updated).toMatchObject({ canvasId: created.canvasId, ok: true, title: 'Cost report' });
    if (!updated.ok) return;
    const manifest = await storage.readManifest(updated.metadata.manifestKey);
    const file = await storage.readFile(manifest, 'index.html');
    expect(new TextDecoder().decode(file?.bytes)).toContain('<h1>New</h1>');
  });

  it('turns a bad edit or an unknown canvas into a failed outcome', async () => {
    const { service, workModel } = setup();
    const created = await service.create({
      files: [{ content: page('<h1>Old</h1>'), path: 'index.html' }],
      title: 'Cost report',
    });
    await registerFromOutcome(workModel, created, 'call-1');
    if (!created.ok) return;

    expect(
      await service.update({
        canvasId: created.canvasId,
        edits: [{ newText: 'x', oldText: 'missing', path: 'index.html' }],
      }),
    ).toMatchObject({ error: expect.stringContaining('0 times'), ok: false });
    expect(await service.update({ canvasId: 'cvs_nope', writes: [] })).toMatchObject({
      error: expect.stringContaining('cvs_nope'),
      ok: false,
    });
  });

  it('reads text files and lists binary ones by size', async () => {
    const { service, workModel } = setup();
    const created = await service.create({
      files: [
        { content: page('<img src="a.png">'), path: 'index.html' },
        { content: 'AQID', encoding: 'base64', path: 'a.png' },
      ],
      title: 'Cost report',
    });
    await registerFromOutcome(workModel, created, 'call-1');
    if (!created.ok) return;

    const read = await service.read({ canvasId: created.canvasId });

    expect(read?.files).toEqual([
      { path: 'a.png', size: 3 },
      { path: 'index.html', size: expect.any(Number) },
    ]);
    expect(read?.texts).toEqual([{ content: page('<img src="a.png">'), path: 'index.html' }]);
  });

  it('lets a teammate read a shared canvas but not overwrite it', async () => {
    const workspaceId = 'canvas-tool-ws';
    const mateId = 'canvas-tool-mate';
    await serverDB.insert(users).values({ id: mateId });
    await serverDB
      .insert(workspaces)
      .values({ id: workspaceId, name: 'ws', primaryOwnerId: userId, slug: workspaceId });
    await serverDB.insert(workspaceMembers).values([
      { role: 'owner', userId, workspaceId },
      { role: 'editor', userId: mateId, workspaceId },
    ]);
    const store = memoryStore();
    const owner = setup({ store, workspaceId });
    const outcome = await owner.service.create({
      files: [{ content: page('<lobe-tag>x</lobe-tag>'), path: 'index.html' }],
      title: 'Shared',
    });
    if (!outcome.ok) throw new Error('save failed');
    await owner.workModel.registerCanvas({
      canvasId: outcome.canvasId,
      metadata: outcome.metadata,
      title: outcome.title,
      toolCallId: 'call-shared',
      toolIdentifier: 'lobe-canvas',
      toolName: 'createCanvas',
      visibility: 'public',
    });
    const mate = setup({ actorId: mateId, store, workspaceId });

    const read = await mate.service.read({ canvasId: outcome.canvasId });
    const update = await mate.service.update({
      canvasId: outcome.canvasId,
      edits: [{ newText: 'y', oldText: '>x<', path: 'index.html' }],
    });

    expect(read?.texts[0].content).toContain('<lobe-tag>x</lobe-tag>');
    expect(update).toMatchObject({ ok: false });
    expect(update.ok === false && update.error).toContain('owner');
  });

  it('lists canvases made by the agent', async () => {
    const { service, workModel } = setup();
    const created = await service.create({
      files: [{ content: page('x'), path: 'index.html' }],
      title: 'Cost report',
    });
    await registerFromOutcome(workModel, created, 'call-1');

    const list = await service.list();

    expect(list).toEqual([expect.objectContaining({ title: 'Cost report' })]);
  });

  it('knows whether the guide was read in this topic', async () => {
    expect(await setup().service.hasReadGuide()).toBe(true);
    expect(
      await setup({ findGuideState: vi.fn().mockResolvedValue(undefined) }).service.hasReadGuide(),
    ).toBe(false);
    expect(
      await setup({
        findGuideState: vi.fn().mockResolvedValue(undefined),
        topicId: undefined,
      }).service.hasReadGuide(),
    ).toBe(true);
  });
});
