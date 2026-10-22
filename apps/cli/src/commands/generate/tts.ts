import { writeFile } from 'node:fs/promises';

import type { Command } from 'commander';
import pc from 'picocolors';

import { getTrpcClient } from '../../api/client';

export function registerTtsCommand(parent: Command) {
  parent
    .command('tts <text>')
    .description('Convert text to speech')
    .option('-o, --output <file>', 'Output audio file path', 'output.mp3')
    .option('--voice <voice>', 'Voice name', 'alloy')
    .option('--speed <n>', 'Speed multiplier (0.25-4.0)', '1')
    .option('-m, --model <model>', 'Model ID (provider/model format)', 'tts-1')
    .option('-p, --provider <provider>', 'Provider name (derived from model if omitted)')
    .action(
      async (
        text: string,
        options: {
          model: string;
          output: string;
          provider?: string;
          speed: string;
          voice: string;
        },
      ) => {
        const parts = options.model.split('/');
        const provider = options.provider || (parts.length > 1 ? parts[0] : 'openai');
        const model = parts.length > 1 ? parts.slice(1).join('/') : options.model;
        const client = await getTrpcClient();

        const result = await client.tts.synthesize.mutate({
          input: text,
          model,
          provider,
          speed: Number.parseFloat(options.speed),
          voice: options.voice,
        });

        const buffer = Buffer.from(result.audioBase64, 'base64');
        await writeFile(options.output, buffer);
        console.log(
          `${pc.green('✓')} Audio saved to ${pc.bold(options.output)} (${Math.round(buffer.length / 1024)}KB)`,
        );
      },
    );
}
