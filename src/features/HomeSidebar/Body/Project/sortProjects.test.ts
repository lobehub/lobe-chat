import { describe, expect, it } from 'vitest';

import { sortProjects } from './sortProjects';

const projects = [
  { createdAt: '2026-01-02', id: 'a', updatedAt: '2026-03-01' },
  { createdAt: '2026-01-03', id: 'b', updatedAt: '2026-02-01' },
  { createdAt: '2026-01-01', id: 'c', updatedAt: '2026-04-01' },
];
const ids = (items: { id: string }[]) => items.map((i) => i.id);

describe('sortProjects', () => {
  it('keeps the server (manual) order', () => {
    expect(ids(sortProjects(projects, 'manual'))).toEqual(['a', 'b', 'c']);
  });

  it('puts the newest created project first', () => {
    expect(ids(sortProjects(projects, 'createdAt'))).toEqual(['b', 'a', 'c']);
  });

  it('puts the most recently updated project first', () => {
    expect(ids(sortProjects(projects, 'updatedAt'))).toEqual(['c', 'a', 'b']);
  });
});
