import { describe, expect, it, vi } from 'vitest';

import { linkSeedDependencies, parseTaskFile } from './seedTasks';

describe('parseTaskFile', () => {
  it('reads titles, briefs and dependsOn', () => {
    const { dependencies, tasks } = parseTaskFile(
      JSON.stringify(['Signal', { description: 'rules', dependsOn: ['Signal'], title: 'Policy' }]),
    );

    expect(tasks).toEqual(['Signal', { description: 'rules', title: 'Policy' }]);
    expect(dependencies).toEqual(new Map([['Policy', ['Signal']]]));
  });

  it('rejects a dependsOn naming a task that is not in the file', () => {
    expect(() =>
      parseTaskFile(JSON.stringify([{ dependsOn: ['Signl'], title: 'Policy' }, 'Signal'])),
    ).toThrow('"Policy" depends on "Signl", which is not in the file');
  });

  it('rejects duplicate titles once dependsOn has to name them', () => {
    expect(() =>
      parseTaskFile(JSON.stringify(['Signal', 'Signal', { dependsOn: ['Signal'], title: 'B' }])),
    ).toThrow('"Signal" appears twice');
  });

  it('rejects a task depending on itself', () => {
    expect(() => parseTaskFile(JSON.stringify([{ dependsOn: ['A'], title: 'A' }]))).toThrow(
      '"A" cannot depend on itself',
    );
  });

  it('allows duplicate titles when nothing depends on them', () => {
    expect(parseTaskFile(JSON.stringify(['A', 'A'])).tasks).toEqual(['A', 'A']);
  });
});

describe('linkSeedDependencies', () => {
  const graph = () =>
    ({
      edges: [],
      goal: { id: 'goal-1' },
      nodes: [
        { id: 'problem-id', kind: 'problem', title: 'Signal' },
        { id: 'signal-id', kind: 'task', title: 'Signal' },
        { id: 'policy-id', kind: 'task', title: 'Policy' },
      ],
    }) as any;

  it('draws each dependsOn as a depends_on edge between the seeded task nodes', async () => {
    const edge = { id: 'edge-1', kind: 'depends_on' };
    const client = { goal: { addEdge: { mutate: vi.fn().mockResolvedValue({ data: edge }) } } };
    const snapshot = graph();

    await linkSeedDependencies(client as any, snapshot, new Map([['Policy', ['Signal']]]));

    expect(client.goal.addEdge.mutate).toHaveBeenCalledWith({
      id: 'goal-1',
      kind: 'depends_on',
      sourceNodeId: 'policy-id',
      targetNodeId: 'signal-id',
    });
    expect(snapshot.edges).toEqual([edge]);
  });

  it('names the seed the server did not create', async () => {
    const client = { goal: { addEdge: { mutate: vi.fn() } } };

    await expect(
      linkSeedDependencies(client as any, graph(), new Map([['Missing', ['Signal']]])),
    ).rejects.toThrow('Seed task "Missing" is not on goal goal-1');
    expect(client.goal.addEdge.mutate).not.toHaveBeenCalled();
  });
});
