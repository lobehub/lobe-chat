import { Command } from 'commander';
import { expect, it, vi } from 'vitest';

import type * as Format from '../utils/format';
import { registerAcceptanceCommands } from './verifyAcceptance';

const { getBundle, outputJson } = vi.hoisted(() => ({ getBundle: vi.fn(), outputJson: vi.fn() }));
vi.mock('../api/client', () => ({
  getTrpcClient: async () => ({ acceptance: { getBundle: { query: getBundle } } }),
}));
vi.mock('../utils/format', async (original) => ({
  ...(await original<typeof Format>()),
  outputJson,
}));

it('includes flow regions and attachments, excluding superseded attempts from actionable feedback', async () => {
  const region = {
    evidenceId: 'image',
    comment: 'Clipped',
    rect: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
  };
  const attempt = {
    id: 'latest',
    checkResultId: 'flow-result',
    checkItemId: 'flow-check',
    nodeId: 'node',
    sequence: 2,
    incomingEdgeId: 'edge',
    review: 'rejected',
    reviewComment: 'Fix image',
    reviewDetail: { annotations: [region], fileIds: ['attachment'] },
    evidence: [{ id: 'image', description: 'proof.png' }],
  };
  getBundle.mockResolvedValue({
    checks: [
      {
        id: 'legacy-flow',
        result: { id: 'flow-result' },
        evidence: [],
        timeline: [],
        userReview: { action: 'reject', stale: false },
        reviews: [{ action: 'reject', comment: 'Duplicated flow review' }],
      },
    ],
    rounds: [{ run: { id: 'round', roundIndex: 1 } }],
    flows: [
      {
        versions: [
          {
            id: 'version',
            version: 1,
            nodes: [{ id: 'node', title: 'Ready' }],
            runs: [
              {
                id: 'run',
                verifyRunId: 'round',
                attempts: [{ ...attempt, id: 'old', sequence: 1 }, attempt],
              },
            ],
          },
        ],
      },
    ],
  });
  const program = new Command().exitOverride();
  registerAcceptanceCommands(program);
  await program.parseAsync([
    'node',
    'lh',
    'acceptance',
    'feedback',
    'acceptance-id',
    '--actionable',
    '--json',
  ]);
  const result = outputJson.mock.calls.at(-1)![0];
  expect(result.entries).toHaveLength(1);
  expect(result.entries[0]).toMatchObject({
    kind: 'flow',
    checkId: 'flow-check',
    comment: 'Fix image',
    fileIds: ['attachment'],
    annotations: [{ ...region, region: expect.stringContaining('proof.png') }],
  });
});
