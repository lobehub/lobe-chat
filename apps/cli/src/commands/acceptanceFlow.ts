import { readFile } from 'node:fs/promises';

import type { Command } from 'commander';

import { getTrpcClient } from '../api/client';
import { outputJson } from '../utils/format';

/** Agent entry point: author a graph before exercising the product, then append real visits. */
export function attachAcceptanceFlowCommands(acceptance: Command) {
  const flow = acceptance
    .command('flow')
    .description('Publish a user-state graph and record its verification paths');
  flow
    .command('publish <acceptanceId>')
    .requiredOption('--file <path>', 'JSON: definition and optional flowId')
    .action(async (id: string, options: { file: string }) => {
      const client = await getTrpcClient();
      const input = JSON.parse(await readFile(options.file, 'utf8'));
      outputJson(await client.acceptance.publishFlow.mutate({ ...input, id }));
    });
  flow.command('view <acceptanceId>').action(async (id: string) => {
    const client = await getTrpcClient();
    outputJson((await client.acceptance.getBundle.query({ id })).flows);
  });
  flow
    .command('plan <acceptanceId>')
    .alias('start')
    .description('Prepare a frozen flow plan for inspection without executing checks')
    .requiredOption('--flow <id>')
    .option('--run <id>', 'Existing round; omit to create a fresh round for this flow')
    .option('--from-run <id>', 'Replay the frozen definition from a previous round')
    .action(async (id: string, options: { flow: string; run?: string; fromRun?: string }) => {
      const client = await getTrpcClient();
      outputJson(
        await client.acceptance.startFlow.mutate({
          id,
          flowId: options.flow,
          verifyRunId: options.run,
          sourceRunId: options.fromRun,
        }),
      );
    });
  flow
    .command('record <acceptanceId>')
    .requiredOption('--file <path>', 'JSON: verifyRunId, checkItemId, verdict, observation')
    .action(async (id: string, options: { file: string }) => {
      const client = await getTrpcClient();
      const input = JSON.parse(await readFile(options.file, 'utf8'));
      outputJson(await client.acceptance.recordFlowStep.mutate({ ...input, id }));
    });
  flow
    .command('complete <acceptanceId>')
    .requiredOption('--run <id>')
    .action(async (id: string, options: { run: string }) => {
      const client = await getTrpcClient();
      outputJson(await client.acceptance.completeFlow.mutate({ id, verifyRunId: options.run }));
    });
}
