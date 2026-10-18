// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import type { RecallDependencies } from './index';
import { RecallService } from './index';

const at = (iso: string) => new Date(iso);

const message = (id: string, topicId: string | null, createdAt: string, topicTitle = 'Topic') => ({
  agentId: null,
  contentLength: 10,
  createdAt: at(createdAt),
  id,
  role: 'user',
  snippet: id,
  threadId: null,
  topicId,
  topicTitle,
});

const createDeps = (overrides: Partial<RecallDependencies> = {}): RecallDependencies => ({
  searchEntities: vi.fn().mockResolvedValue([]),
  searchGoals: vi.fn().mockResolvedValue([]),
  searchMessages: vi.fn().mockResolvedValue({ hasMore: false, items: [] }),
  ...overrides,
});

describe('RecallService', () => {
  it('returns nothing and queries nothing for a blank query', async () => {
    const deps = createDeps();

    const result = await new RecallService(deps).recall({ query: '   ' });

    expect(result).toEqual({
      goals: [],
      messages: { hasMore: false, items: [] },
      pages: [],
      topics: [],
    });
    expect(deps.searchMessages).not.toHaveBeenCalled();
  });

  it('rolls message hits up into topics and merges title matches', async () => {
    const deps = createDeps({
      searchEntities: vi.fn().mockImplementation(async ({ type }) =>
        type === 'topic'
          ? [
              {
                id: 'tpc_a',
                title: 'A title',
                type: 'topic',
                updatedAt: at('2026-10-16T00:00:00Z'),
              },
              {
                id: 'tpc_c',
                title: 'C title',
                type: 'topic',
                updatedAt: at('2026-10-17T00:00:00Z'),
              },
              { id: 'tpc_old', title: 'Old', type: 'topic', updatedAt: at('2026-09-01T00:00:00Z') },
            ]
          : [],
      ),
      searchMessages: vi.fn().mockResolvedValue({
        hasMore: false,
        items: [
          message('m3', 'tpc_b', '2026-10-15T00:00:00Z', 'B'),
          message('m2', 'tpc_a', '2026-10-14T00:00:00Z', 'A'),
          message('m1', 'tpc_b', '2026-10-13T00:00:00Z', 'B'),
          message('m0', null, '2026-10-12T00:00:00Z'),
        ],
      }),
    });

    const result = await new RecallService(deps).recall({
      endDate: at('2026-10-18T23:59:59Z'),
      query: 'replica',
      startDate: at('2026-10-12T00:00:00Z'),
    });

    expect(result.topics).toEqual([
      {
        hitCount: 2,
        id: 'tpc_b',
        lastMatchedAt: at('2026-10-15T00:00:00Z'),
        matchedBy: ['messages'],
        title: 'B',
        updatedAt: null,
      },
      {
        hitCount: 1,
        id: 'tpc_a',
        lastMatchedAt: at('2026-10-14T00:00:00Z'),
        matchedBy: ['title', 'messages'],
        title: 'A',
        updatedAt: at('2026-10-16T00:00:00Z'),
      },
      {
        hitCount: 0,
        id: 'tpc_c',
        lastMatchedAt: null,
        matchedBy: ['title'],
        title: 'C title',
        updatedAt: at('2026-10-17T00:00:00Z'),
      },
    ]);
  });

  it('trims messages to the per-type limit while keeping the wider pool for topics', async () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      message(`m${i}`, `tpc_${i}`, `2026-10-1${5 - i}T00:00:00Z`),
    );
    const deps = createDeps({
      searchMessages: vi.fn().mockResolvedValue({ hasMore: false, items }),
    });

    const result = await new RecallService(deps).recall({ limitPerType: 2, query: 'x' });

    expect(deps.searchMessages).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
    expect(result.messages.items.map(({ id }) => id)).toEqual(['m0', 'm1']);
    expect(result.messages.hasMore).toBe(true);
    expect(result.topics).toHaveLength(2);
  });

  it('only runs the requested types', async () => {
    const deps = createDeps({
      searchGoals: vi.fn().mockResolvedValue([{ id: 'goal_1', type: 'goal' }]),
    });

    const result = await new RecallService(deps).recall({ query: 'x', types: ['goal'] });

    expect(result.goals).toEqual([{ id: 'goal_1', type: 'goal' }]);
    expect(deps.searchMessages).not.toHaveBeenCalled();
    expect(deps.searchEntities).not.toHaveBeenCalled();
  });

  it('keeps only pages updated inside the window', async () => {
    const deps = createDeps({
      searchEntities: vi.fn().mockImplementation(async ({ type }) =>
        type === 'page'
          ? [
              {
                description: null,
                id: 'p_in',
                title: 'In',
                type: 'page',
                updatedAt: at('2026-10-14T00:00:00Z'),
              },
              {
                description: null,
                id: 'p_out',
                title: 'Out',
                type: 'page',
                updatedAt: at('2026-10-01T00:00:00Z'),
              },
            ]
          : [],
      ),
    });

    const result = await new RecallService(deps).recall({
      query: 'x',
      startDate: at('2026-10-12T00:00:00Z'),
      types: ['page'],
    });

    expect(result.pages).toEqual([
      { description: null, id: 'p_in', title: 'In', updatedAt: at('2026-10-14T00:00:00Z') },
    ]);
  });
});
