import { describe, expect, it } from 'vitest';

import { mergeById, type RawContextItem, toEntity, uniqueById } from './adapt';

const row = (id: string, parent: string): RawContextItem => ({
  context: { currentStatus: 'ongoing', description: `${id} now`, id, title: id, type: 'project' },
  memory: { title: parent },
});

describe('uniqueById', () => {
  it('keeps one page per context when queryMemories returns it once per parent memory', () => {
    // A context whose userMemoryIds hold two live parents comes back twice from the join.
    const rows = [row('ctx-a', 'mem-1'), row('ctx-a', 'mem-2'), row('ctx-b', 'mem-3')];

    const entities = uniqueById(rows.map(toEntity));

    expect(entities.map((e) => e.id)).toEqual(['ctx-a', 'ctx-b']);
  });
});

describe('mergeById', () => {
  it('adds rows fetched later without duplicating loaded ones', () => {
    const loaded = [row('ctx-a', 'mem-1'), row('ctx-b', 'mem-2')].map(toEntity);
    const nextPage = [row('ctx-b', 'mem-2'), row('ctx-c', 'mem-4')].map(toEntity);

    expect(mergeById(loaded, nextPage).map((e) => e.id)).toEqual(['ctx-a', 'ctx-b', 'ctx-c']);
  });
});
