// @vitest-environment node
import { getTestDB } from '@lobechat/database/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkModel } from '@/database/models/work';
import { users, workspaceMembers, workspaces } from '@/database/schemas';
import { verifyCanvasPreviewToken } from '@/server/services/canvas/serve';

import { canvasRouter } from '../canvas';

const serverDB = await getTestDB();

vi.mock('@/business/server/trpc-middlewares/workspaceAuth', async () => {
  const mod = await vi.importActual<{ trpc: any }>('@/libs/trpc/lambda/init');
  return {
    requireWorkspaceRoleWhenScoped: () => mod.trpc.middleware(async (opts: any) => opts.next()),
    wsCompatProcedure: mod.trpc.procedure,
  };
});

const publishing = vi.hoisted(() => ({
  enabled: true,
  publish: vi.fn(async (_params: any) => ({
    deploymentId: 'dep_1',
    url: 'https://cost.lobehub.sites',
  })),
}));

vi.mock('@/business/server/canvasPublish', () => ({
  isCanvasPublishEnabled: () => publishing.enabled,
  publishCanvasSite: publishing.publish,
}));

const committed = vi.hoisted(() => ({ calls: 0 }));

vi.mock('@/server/services/canvas', () => ({
  createCanvasStorageService: (_db: unknown, ownerId: string) => ({
    commit: async () => {
      committed.calls += 1;
      return {
        manifest: {},
        metadata: {
          entry: 'index.html',
          fileCount: 1,
          manifestKey: `canvas/${ownerId}/cvs_new/manifests/m.json`,
          runtimeMajor: 1,
          totalSize: 40,
        },
        ok: true,
      };
    },
    ownerId,
    readFile: async () => ({
      bytes: new TextEncoder().encode('<html><head></head><body>hi</body></html>'),
      contentType: 'text/html; charset=utf-8',
    }),
    readManifest: async () => ({
      entry: 'index.html',
      files: { 'index.html': { contentType: 'text/html; charset=utf-8', hash: 'h1', size: 40 } },
      runtimeMajor: 1,
      schemaVersion: 1,
    }),
  }),
}));

vi.mock('@/libs/trpc/lambda/middleware', () => ({
  serverDatabase: async (opts: any) => opts.next({ ctx: { ...opts.ctx, serverDB } }),
}));

const userId = 'canvas-router-user';
const caller = (id = userId) => canvasRouter.createCaller({ serverDB, userId: id } as any);

const metadata = (key: string) => ({
  entry: 'index.html',
  fileCount: 1,
  manifestKey: `canvas/${userId}/cvs_1/manifests/${key}.json`,
  runtimeMajor: 1,
  totalSize: 10,
});

beforeEach(async () => {
  vi.stubEnv('KEY_VAULTS_SECRET', 'test-secret');
  publishing.enabled = true;
  committed.calls = 0;
  publishing.publish.mockClear();
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: 'stranger' }]);
  const model = new WorkModel(serverDB, userId);
  for (const [index, key] of ['a', 'b'].entries()) {
    await model.registerCanvas({
      canvasId: 'cvs_1',
      description: 'Up 23%',
      metadata: metadata(key),
      title: 'Cost report',
      toolCallId: `call-${index}`,
      toolIdentifier: 'lobe-canvas',
      toolName: 'createCanvas',
    });
  }
});

describe('canvasRouter.getVersion', () => {
  it('returns the latest version with a signed preview URL for its manifest', async () => {
    const result = await caller().getVersion({ canvasId: 'cvs_1' });

    expect(result).toMatchObject({
      canvasId: 'cvs_1',
      description: 'Up 23%',
      latestVersion: 2,
      title: 'Cost report',
      version: 2,
    });
    const token = result!.previewUrl.split('/')[2];
    expect(verifyCanvasPreviewToken(token)).toMatchObject({
      manifestKey: metadata('b').manifestKey,
      userId,
    });
    expect(result!.runtimeUrl).toBe('/canvas-runtime/v1/canvas-runtime.js');
    expect(result!.previewUrl).toBe(`/canvas-preview/${token}/index.html`);
  });

  it('returns a pinned version', async () => {
    const result = await caller().getVersion({ canvasId: 'cvs_1', version: 1 });

    expect(result).toMatchObject({ latestVersion: 2, version: 1 });
    expect(verifyCanvasPreviewToken(result!.previewUrl.split('/')[2])?.manifestKey).toBe(
      metadata('a').manifestKey,
    );
  });

  it('signs a teammate preview with the owner so the owner-scoped manifest resolves', async () => {
    const workspaceId = 'canvas-router-ws';
    await serverDB
      .insert(workspaces)
      .values({ id: workspaceId, name: 'ws', primaryOwnerId: userId, slug: workspaceId });
    await serverDB.insert(workspaceMembers).values([
      { role: 'owner', userId, workspaceId },
      { role: 'editor', userId: 'stranger', workspaceId },
    ]);
    await new WorkModel(serverDB, userId, workspaceId).registerCanvas({
      canvasId: 'cvs_ws',
      metadata: metadata('ws'),
      title: 'Shared',
      toolCallId: 'call-ws',
      toolIdentifier: 'lobe-canvas',
      toolName: 'createCanvas',
      visibility: 'public',
    });

    const result = await canvasRouter
      .createCaller({ serverDB, userId: 'stranger', workspaceId } as any)
      .getVersion({ canvasId: 'cvs_ws' });

    expect(verifyCanvasPreviewToken(result!.previewUrl.split('/')[2])).toMatchObject({
      userId,
      workspaceId,
    });
  });

  it('returns null for another user or a missing version', async () => {
    expect(await caller('stranger').getVersion({ canvasId: 'cvs_1' })).toBeNull();
    expect(await caller().getVersion({ canvasId: 'cvs_1', version: 9 })).toBeNull();
  });
});

describe('canvasRouter.publish', () => {
  beforeEach(() => {
    vi.stubEnv('CANVAS_RUNTIME_BASE_URL', 'https://cdn.test/canvas-runtime');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('publishes the current version, then republishes to the same site', async () => {
    const first = await caller().publish({ canvasId: 'cvs_1' });
    await caller().publish({ canvasId: 'cvs_1' });

    expect(first).toEqual({ publishedVersion: 2, url: 'https://cost.lobehub.sites' });
    expect(publishing.publish.mock.calls[0][0]).toMatchObject({
      canvasId: 'cvs_1',
      deploymentId: undefined,
      title: 'Cost report',
      userId,
    });
    expect(publishing.publish.mock.calls[0][0].bundle.html).toContain(
      'https://cdn.test/canvas-runtime/v1/canvas-runtime.js',
    );
    expect(publishing.publish.mock.calls[1][0].deploymentId).toBe('dep_1');
    expect(await caller().getVersion({ canvasId: 'cvs_1' })).toMatchObject({
      canPublish: true,
      publishedUrl: 'https://cost.lobehub.sites',
      publishedVersion: 2,
    });
  });

  it('refuses when publishing is unavailable or the canvas is not visible', async () => {
    await expect(caller('stranger').publish({ canvasId: 'cvs_1' })).rejects.toThrow();
    publishing.enabled = false;

    await expect(caller().publish({ canvasId: 'cvs_1' })).rejects.toThrow();
    expect(publishing.publish).not.toHaveBeenCalled();
    expect((await caller().getVersion({ canvasId: 'cvs_1' }))?.canPublish).toBe(false);
  });
});

describe('canvasRouter.runAgentTool', () => {
  it('returns the guide for a browser-run agent loop', async () => {
    const result = await caller().runAgentTool({ apiName: 'readCanvasGuide', args: {} });

    expect(result.output).toMatchObject({ state: { guideRead: true }, success: true });
    expect(result.output.content).toContain('lobe-');
    expect(result.intent).toBeUndefined();
  });

  it('saves a canvas and hands back the Work intent for the client to register', async () => {
    const result = await caller().runAgentTool({
      apiName: 'createCanvas',
      args: { files: [{ content: '<p>x</p>', path: 'index.html' }], title: 'Cost' },
    });

    expect(committed.calls).toBe(1);
    expect(result.output.success).toBe(true);
    expect(result.intent).toMatchObject({
      canvas: {
        metadata: { manifestKey: `canvas/${userId}/cvs_new/manifests/m.json` },
        title: 'Cost',
      },
      type: 'canvas',
    });
  });

  it('runs for any account, with no lab to turn on first', async () => {
    const result = await caller('stranger').runAgentTool({
      apiName: 'readCanvasGuide',
      args: {},
    });

    expect(result.output.success).toBe(true);
  });
});

describe('canvasRouter.listVersions', () => {
  it('lists versions newest first', async () => {
    const versions = await caller().listVersions({ canvasId: 'cvs_1' });

    expect(versions.map((item) => item.version)).toEqual([2, 1]);
  });
});
