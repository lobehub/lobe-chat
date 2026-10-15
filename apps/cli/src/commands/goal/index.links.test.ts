import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerGoalCommand } from '.';

const { mockClient } = vi.hoisted(() => ({
  mockClient: {
    goal: {
      addEdge: { mutate: vi.fn() },
      create: { mutate: vi.fn() },
      graph: { query: vi.fn() },
      list: { query: vi.fn() },
    },
  },
}));

const taskFile = JSON.stringify([
  'Signal',
  { description: 'rules', dependsOn: ['Signal'], title: 'Policy' },
]);
vi.mock('node:fs/promises', () => ({ readFile: async () => taskFile }));
vi.mock('../../api/client', () => ({ getTrpcClient: vi.fn().mockResolvedValue(mockClient) }));
vi.mock('../task/url', () => ({
  resolveAppUrlBuilder: vi
    .fn()
    .mockResolvedValue((pathname: string) => `https://app.lobehub.com${pathname}`),
}));

const run = (...args: string[]) => {
  const program = new Command();
  program.exitOverride();
  registerGoalCommand(program);
  return program.parseAsync(['node', 'test', 'goal', ...args]);
};

const output = () =>
  vi
    .mocked(console.log)
    .mock.calls.map(([value]) => (value === undefined ? '' : String(value)))
    .join('\n');

const snapshot = () => ({
  decisions: [],
  edges: [] as unknown[],
  events: [],
  goal: { id: 'goal-1', requirement: null, status: 'draft', title: 'Wake' },
  nodes: [
    { id: 'signal-id', kind: 'task', status: 'proposed', taskId: null, title: 'Signal' },
    { id: 'policy-id', kind: 'task', status: 'proposed', taskId: null, title: 'Policy' },
  ],
  workVersions: [],
});

beforeEach(() => {
  vi.clearAllMocks();
  // An operation token switches reads to their operation twins; these tests use the plain ones.
  vi.stubEnv('LOBEHUB_JWT', undefined);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => vi.unstubAllEnvs());

describe('goal links', () => {
  it('show prints the goal page and puts it in --json', async () => {
    mockClient.goal.graph.query.mockResolvedValue({ data: snapshot() });

    await run('show', 'goal-1');
    expect(output()).toContain('https://app.lobehub.com/goal/goal-1');

    vi.mocked(console.log).mockClear();
    await run('show', 'goal-1', '--json');
    expect(JSON.parse(output())).toMatchObject({ url: 'https://app.lobehub.com/goal/goal-1' });
  });

  it('list --json carries each goal page', async () => {
    mockClient.goal.list.query.mockResolvedValue({ goals: [{ goal: { id: 'goal-1' } }] });

    await run('list', '--json');

    expect(JSON.parse(output())).toEqual([
      { goal: { id: 'goal-1' }, url: 'https://app.lobehub.com/goal/goal-1' },
    ]);
  });
});

describe('goal create --task-file dependsOn', () => {
  it('draws the seed order on the draft before printing it', async () => {
    vi.stubEnv('LOBEHUB_OPERATION_ID', 'op-1');
    mockClient.goal.create.mutate.mockResolvedValue({ data: snapshot() });
    mockClient.goal.addEdge.mutate.mockResolvedValue({
      data: {
        id: 'edge-1',
        kind: 'depends_on',
        sourceNodeId: 'policy-id',
        targetNodeId: 'signal-id',
      },
    });

    await run('create', 'Wake', '--topic', '--task-file', 'tasks.json');

    expect(mockClient.goal.create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ tasks: ['Signal', { description: 'rules', title: 'Policy' }] }),
    );
    expect(mockClient.goal.addEdge.mutate).toHaveBeenCalledWith({
      id: 'goal-1',
      kind: 'depends_on',
      sourceNodeId: 'policy-id',
      targetNodeId: 'signal-id',
    });
    // The printed graph already shows the edge: Signal blocks Policy.
    expect(output()).toContain('blocks policy-i');
  });

  it('refuses dependsOn on a standalone goal, which would dispatch before the edges exist', async () => {
    await expect(run('create', 'Wake', '--task-file', 'tasks.json')).rejects.toThrow(
      '--task-file dependsOn needs --topic',
    );
    expect(mockClient.goal.create.mutate).not.toHaveBeenCalled();
  });
});
