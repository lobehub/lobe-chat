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
    .command('start <acceptanceId>')
    .requiredOption('--flow-version <id>')
    .option('--run <id>', 'Existing round; omit to create a fresh round for this version')
    .action(async (id: string, options: { flowVersion: string; run?: string }) => {
      const client = await getTrpcClient();
      outputJson(
        await client.acceptance.startFlow.mutate({
          id,
          versionId: options.flowVersion,
          verifyRunId: options.run,
        }),
      );
    });
  flow
    .command('record <acceptanceId>')
    .requiredOption(
      '--file <path>',
      'JSON visit with flowRunId, nodeKey, requestId, verdict, observation and optional previousAttemptId/incomingEdgeKey',
    )
    .action(async (id: string, options: { file: string }) => {
      const client = await getTrpcClient();
      const input = JSON.parse(await readFile(options.file, 'utf8'));
      outputJson(await client.acceptance.recordFlowStep.mutate({ ...input, id }));
    });
  flow
    .command('complete <acceptanceId>')
    .requiredOption('--flow-run <id>')
    .action(async (id: string, options: { flowRun: string }) => {
      const client = await getTrpcClient();
      outputJson(await client.acceptance.completeFlow.mutate({ id, flowRunId: options.flowRun }));
    });
}
