// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

// serverDatabase middleware calls getServerDB(); stub it (the model mock
// ignores the db handle anyway).
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(function () {
    return {};
  }),
}));

const mockAdd = vi.fn();
const mockUpdate = vi.fn();
const modelScopes: unknown[][] = [];

vi.mock('@/database/models/favorite', () => ({
  FavoriteLimitError: class FavoriteLimitError extends Error {},
  FavoriteModel: vi.fn(function (...args: unknown[]) {
    modelScopes.push(args.slice(1));
    return { add: mockAdd, update: mockUpdate };
  }),
}));

const { favoriteRouter } = await import('../favorite');

describe('favoriteRouter', () => {
  const ctx: any = { serverDB: {}, userId: 'user-1', workspaceId: 'ws-1' };
  const input = { path: '/page/docs_a', targetId: 'docs_a', title: 'Spec', type: 'page' as const };

  beforeEach(() => {
    vi.clearAllMocks();
    modelScopes.length = 0;
  });

  it('scopes favorites to the caller and the active workspace', async () => {
    mockAdd.mockResolvedValue({ ...input, icon: null, id: 'fav_1' });

    await favoriteRouter.createCaller(ctx).add(input);

    expect(modelScopes).toEqual([['user-1', 'ws-1']]);
    expect(mockAdd).toHaveBeenCalledWith(input);
  });

  it.each(['https://evil.example', '//evil.example/page', '/\\evil.example', 'page/docs_a'])(
    'refuses a link that leaves the app: %s',
    async (path) => {
      await expect(favoriteRouter.createCaller(ctx).add({ ...input, path })).rejects.toThrow();
      await expect(
        favoriteRouter.createCaller(ctx).update({ id: 'fav_1', value: { path } }),
      ).rejects.toThrow();

      expect(mockAdd).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    },
  );

  it('reports a full sidebar as a bad request', async () => {
    const { FavoriteLimitError } = await import('@/database/models/favorite');
    mockAdd.mockRejectedValue(new FavoriteLimitError());

    await expect(favoriteRouter.createCaller(ctx).add(input)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  it('refuses a blank title', async () => {
    await expect(
      favoriteRouter.createCaller(ctx).add({ ...input, title: '   ' }),
    ).rejects.toThrow();
  });
});
