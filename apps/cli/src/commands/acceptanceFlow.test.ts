import { Command } from 'commander';
import { expect, it, vi } from 'vitest';

import { attachAcceptanceFlowCommands } from './acceptanceFlow';

const { startFlow, outputJson } = vi.hoisted(() => ({
  startFlow: vi.fn().mockResolvedValue({ id: 'flow-run' }),
  outputJson: vi.fn(),
}));

vi.mock('../api/client', () => ({
  getTrpcClient: async () => ({ acceptance: { startFlow: { mutate: startFlow } } }),
}));
vi.mock('../utils/format', () => ({ outputJson }));

it('starts the requested flow version without triggering the root CLI version option', async () => {
  const program = new Command().version('0.0.52').exitOverride();
  attachAcceptanceFlowCommands(program.command('acceptance'));
  await program.parseAsync([
    'node',
    'lh',
    'acceptance',
    'flow',
    'start',
    'acceptance-id',
    '--flow',
    'version-id',
    '--run',
    'verify-run',
  ]);
  expect(startFlow).toHaveBeenCalledWith({
    id: 'acceptance-id',
    flowId: 'version-id',
    sourceRunId: undefined,
    verifyRunId: 'verify-run',
  });
  expect(outputJson).toHaveBeenCalledWith({ id: 'flow-run' });
});

it('allows a fresh verification round when --run is omitted', async () => {
  startFlow.mockClear();
  const program = new Command().exitOverride();
  attachAcceptanceFlowCommands(program.command('acceptance'));
  await program.parseAsync([
    'node',
    'lh',
    'acceptance',
    'flow',
    'start',
    'acceptance-id',
    '--flow',
    'version-id',
  ]);
  expect(startFlow).toHaveBeenCalledWith({
    id: 'acceptance-id',
    flowId: 'version-id',
    sourceRunId: undefined,
    verifyRunId: undefined,
  });
});
