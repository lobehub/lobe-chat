import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerAgentRunCommand } from './run';

const { mockExecAgent, mockGetTrpcClient } = vi.hoisted(() => ({
  mockExecAgent: vi.fn(),
  mockGetTrpcClient: vi.fn(),
}));

vi.mock('../../api/client', () => ({ getTrpcClient: mockGetTrpcClient }));
vi.mock('../../api/http', () => ({ getAgentStreamAuthInfo: vi.fn() }));
vi.mock('../../utils/agentStream', () => ({
  replayAgentEvents: vi.fn(),
  streamAgentEvents: vi.fn(),
  streamAgentEventsViaWebSocket: vi.fn(),
}));
vi.mock('../../utils/device', () => ({ resolveLocalDeviceId: vi.fn(() => 'device-1') }));

const runAgent = async (...args: string[]) => {
  const program = new Command();
  program.exitOverride();
  registerAgentRunCommand(program.command('agent'));
  await program.parseAsync(['node', 'lh', 'agent', 'run', '--detach', ...args]);
  return mockExecAgent.mock.calls[0]?.[0];
};

describe('lh agent run', () => {
  beforeEach(() => {
    mockExecAgent.mockResolvedValue({ operationId: 'op-1', success: true, topicId: 'tpc-1' });
    mockGetTrpcClient.mockResolvedValue({
      aiAgent: { execAgent: { mutate: mockExecAgent } },
      device: {
        listDevices: { query: vi.fn().mockResolvedValue([{ deviceId: 'device-1', online: true }]) },
      },
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockExecAgent.mockReset();
  });

  it('enables each --tool for the run, as an @-mention in chat does', async () => {
    const input = await runAgent(
      '--agent-id',
      'agt-1',
      '--prompt',
      'Check the build',
      '--tool',
      'lobe-computer-use',
      '--tool',
      'my-mcp',
    );

    expect(input.selectedToolIds).toEqual(['lobe-computer-use', 'my-mcp']);
  });

  it('selects each --skill for the run, as picking it in chat does', async () => {
    const input = await runAgent(
      '--agent-id',
      'agt-1',
      '--prompt',
      'Audit the page',
      '--skill',
      'ux-audit',
      '--skill',
      'agent-skills:review',
    );

    expect(input.selectedSkillIds).toEqual(['ux-audit', 'agent-skills:review']);
  });

  it.each([
    [[], undefined],
    [
      ['--device', 'local'],
      {
        initialTopicMetadata: {
          workingDirectory: process.cwd(),
          workingDirectoryConfig: { path: process.cwd() },
        },
      },
    ],
    [['--device', 'local', '--topic-id', 'tpc-1'], { topicId: 'tpc-1' }],
    [['--device', 'device-1'], undefined],
  ] as const)('sends only the requested optional fields for %j', async (args, appContext) => {
    const input = await runAgent('--agent-id', 'agt-1', '--prompt', 'Hello', ...args);

    expect(input).not.toHaveProperty('selectedToolIds');
    expect(input).not.toHaveProperty('selectedSkillIds');
    expect(input.appContext).toEqual(appContext);
  });
});
