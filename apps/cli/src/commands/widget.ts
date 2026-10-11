import { readFile } from 'node:fs/promises';

import { WIDGET_OUTPUT_TYPES, WIDGET_RUNTIMES } from '@lobechat/types';
import type { Command } from 'commander';
import pc from 'picocolors';

import { getTrpcClient } from '../api/client';
import { confirm, outputJson, printTable, timeAgo, truncate } from '../utils/format';
import { log } from '../utils/logger';

type WidgetRuntime = (typeof WIDGET_RUNTIMES)[number];
type WidgetOutputType = (typeof WIDGET_OUTPUT_TYPES)[number];

const parseJsonOption = (value: string | undefined, flag: string) => {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    throw new Error(`${flag} must be valid JSON`);
  }
};

const fail = (message: string) => {
  log.error(message);
  process.exitCode = 1;
};

interface RunLike {
  durationMs?: number | null;
  error?: unknown;
  id: string;
  output?: unknown;
  status: string;
  stderr?: string | null;
  stdout?: string | null;
  trigger?: string;
  versionId?: string | null;
}

/** A run's verdict, parsed output and logs — what an author needs to fix a script. */
const printRun = (run: RunLike) => {
  const color = run.status === 'succeeded' ? pc.green : run.status === 'failed' ? pc.red : pc.dim;
  console.log(`${pc.bold('Run')} ${pc.dim(run.id)} ${color(run.status)}`);
  if (run.versionId) console.log(`${pc.dim('Version:')} ${run.versionId}`);
  if (run.durationMs != null) console.log(`${pc.dim('Duration:')} ${run.durationMs}ms`);
  if (run.error) console.log(`\n${pc.red('Error:')}\n${JSON.stringify(run.error, null, 2)}`);
  if (run.output) console.log(`\n${pc.bold('Output:')}\n${JSON.stringify(run.output, null, 2)}`);
  if (run.stdout) console.log(`\n${pc.bold('stdout:')}\n${run.stdout}`);
  if (run.stderr) console.log(`\n${pc.bold('stderr:')}\n${run.stderr}`);
};

export function registerWidgetCommand(program: Command) {
  const widget = program
    .command('widget')
    .description('Build monitoring widgets: sandboxed scripts rendered as dashboard cards');

  widget
    .command('list')
    .description('List widgets')
    .option('--agent <agentId>', 'Only widgets owned by this agent')
    .option('--project <projectId>', "Every widget of a project, including its agents' widgets")
    .option('--json [fields]', 'Output JSON')
    .action(async (options: { agent?: string; json?: boolean | string; project?: string }) => {
      const client = await getTrpcClient();
      const { data } =
        options.project && !options.agent
          ? await client.widget.listByProject.query({ projectId: options.project })
          : await client.widget.list.query({ agentId: options.agent, projectId: options.project });
      if (options.json !== undefined) return outputJson(data, options.json);
      if (data.length === 0) return console.log('No widgets found.');
      printTable(
        data.map((item) => [
          item.id,
          truncate(item.title, 40),
          item.publishedVersionId ? 'live' : 'draft',
          item.lastRunStatus ?? '-',
          item.schedulePattern ?? '-',
          timeAgo(item.updatedAt),
        ]),
        ['ID', 'TITLE', 'STATE', 'LAST RUN', 'SCHEDULE', 'UPDATED'],
      );
    });

  widget
    .command('view <id>')
    .description('View a widget with its draft / live versions and the boards it is on')
    .option('--script', 'Also print the draft script')
    .option('--json [fields]', 'Output JSON')
    .action(async (id: string, options: { json?: boolean | string; script?: boolean }) => {
      const { data } = await (await getTrpcClient()).widget.detail.query({ id });
      if (options.json !== undefined) return outputJson(data, options.json);
      console.log(`\n${pc.bold(data.title)} ${pc.dim(data.id)}`);
      if (data.description) console.log(data.description);
      const describe = (version: typeof data.draftVersion) =>
        version
          ? `v${version.version} ${pc.dim(version.id)} (${version.runtime}, ${version.outputType})`
          : '-';
      console.log(`\n${pc.dim('Live:')}  ${describe(data.publishedVersion)}`);
      console.log(`${pc.dim('Draft:')} ${describe(data.draftVersion)}`);
      console.log(`${pc.dim('Schedule:')} ${data.schedulePattern ?? '-'}`);
      console.log(`${pc.dim('Last run:')} ${data.lastRunStatus ?? '-'}`);
      if (data.dashboards.length > 0) {
        console.log(`${pc.dim('Boards:')} ${data.dashboards.map((d) => d.title).join(', ')}`);
      }
      if (options.script && data.draftVersion) console.log(`\n${data.draftVersion.script}`);
    });

  widget
    .command('create')
    .description('Create a widget (no script yet; save one with `widget draft`)')
    .requiredOption('-t, --title <title>', 'Short card title')
    .option('-d, --description <text>', 'Metric definition: source, filters, time window, unit')
    .option('--agent <agentId>', 'Owning agent (pass your own agent id when you author it)')
    .option('--project <projectId>', 'Owning project')
    .option('--dashboard <dashboardId>', 'Place the widget on this board right away')
    .option('--json [fields]', 'Output JSON')
    .action(
      async (options: {
        agent?: string;
        dashboard?: string;
        description?: string;
        json?: boolean | string;
        project?: string;
        title: string;
      }) => {
        const { data } = await (
          await getTrpcClient()
        ).widget.create.mutate({
          agentId: options.agent,
          dashboardId: options.dashboard,
          description: options.description,
          projectId: options.project,
          title: options.title,
        });
        if (options.json !== undefined) return outputJson(data, options.json);
        console.log(`${pc.green('✓')} Created widget ${pc.bold(data.id)}`);
      },
    );

  widget
    .command('edit <id>')
    .description('Rename a widget or rewrite its metric definition')
    .option('-t, --title <title>', 'Card title')
    .option('-d, --description <text>', 'Metric definition')
    .action(async (id: string, options: { description?: string; title?: string }) => {
      await (await getTrpcClient()).widget.update.mutate({ id, value: options });
      console.log(`${pc.green('✓')} Updated widget ${pc.bold(id)}`);
    });

  widget
    .command('draft <widgetId>')
    .description(
      "Save a new draft version; omitted fields keep the current draft's values. Nothing goes live",
    )
    .option('--script-file <path>', 'Read the script from a file')
    .option('--script <code>', 'The script inline')
    .option('--runtime <runtime>', `Runtime (${WIDGET_RUNTIMES.join(', ')})`)
    .option('--output-type <type>', `Printed JSON shape (${WIDGET_OUTPUT_TYPES.join(', ')})`)
    .option('--manifest <json>', 'Manifest JSON: env, network, schedule, metric, timeoutMs')
    .option('--view <json>', 'View hints JSON: chart, columns, limit')
    .option('--note <text>', 'One line on what changed')
    .option('--json [fields]', 'Output JSON')
    .action(
      async (
        widgetId: string,
        options: {
          json?: boolean | string;
          manifest?: string;
          note?: string;
          outputType?: string;
          runtime?: string;
          script?: string;
          scriptFile?: string;
          view?: string;
        },
      ) => {
        const client = await getTrpcClient();
        const { data: current } = await client.widget.detail.query({ id: widgetId });
        const base = current.draftVersion ?? current.publishedVersion;

        const script = options.scriptFile
          ? await readFile(options.scriptFile, 'utf8')
          : (options.script ?? base?.script);
        const runtime = options.runtime ?? base?.runtime;
        const outputType = options.outputType ?? base?.outputType;
        if (!script || !runtime || !outputType) {
          return fail('The first draft needs a script, --runtime and --output-type.');
        }
        if (!WIDGET_RUNTIMES.includes(runtime as WidgetRuntime)) {
          return fail(`--runtime must be one of: ${WIDGET_RUNTIMES.join(', ')}`);
        }
        if (!WIDGET_OUTPUT_TYPES.includes(outputType as WidgetOutputType)) {
          return fail(`--output-type must be one of: ${WIDGET_OUTPUT_TYPES.join(', ')}`);
        }

        const { data } = await client.widget.saveDraft.mutate({
          changeNote: options.note,
          manifest: (parseJsonOption(options.manifest, '--manifest') ?? base?.manifest) as any,
          outputType: outputType as WidgetOutputType,
          runtime: runtime as WidgetRuntime,
          script,
          view: (parseJsonOption(options.view, '--view') ?? base?.view) as any,
          widgetId,
        });
        if (options.json !== undefined) return outputJson(data, options.json);
        console.log(`${pc.green('✓')} Saved draft v${data.version} ${pc.bold(data.id)}`);
        console.log(pc.dim(`Next: lh widget dry-run ${widgetId} --version ${data.id}`));
      },
    );

  widget
    .command('dry-run <widgetId>')
    .description('Run a draft once in the sandbox and print its real output and logs')
    .option('--version <versionId>', 'Draft version to run (default: the current draft)')
    .option('--json [fields]', 'Output JSON')
    .action(async (widgetId: string, options: { json?: boolean | string; version?: string }) => {
      const { data } = await (
        await getTrpcClient()
      ).widget.dryRun.mutate({ versionId: options.version, widgetId });
      if (options.json !== undefined) return outputJson(data, options.json);
      printRun(data);
      if (data.status !== 'succeeded') process.exitCode = 1;
    });

  widget
    .command('publish <widgetId>')
    .description('Make a draft version live; it must have succeeded in a dry run')
    .requiredOption('--version <versionId>', 'Exact draft version to publish')
    .option('--yes', 'Skip confirmation')
    .action(async (widgetId: string, options: { version: string; yes?: boolean }) => {
      if (!options.yes && !(await confirm('Publish this version? It runs on its schedule.'))) {
        return;
      }
      const client = await getTrpcClient();
      const { data } = await client.widget.publish.mutate({ versionId: options.version, widgetId });
      console.log(`${pc.green('✓')} Published v${data.version.version} of ${pc.bold(widgetId)}`);
      // Fill the live card right away instead of waiting for the first tick.
      const run = await client.widget.run.mutate({ widgetId }).catch((error: Error) => {
        log.warn(`First run after publish failed: ${error.message}`);
        return undefined;
      });
      if (run) console.log(`${pc.dim('First run:')} ${run.data.status}`);
    });

  widget
    .command('run <widgetId>')
    .description('Refresh the live version now')
    .option('--json [fields]', 'Output JSON')
    .action(async (widgetId: string, options: { json?: boolean | string }) => {
      const { data } = await (await getTrpcClient()).widget.run.mutate({ widgetId });
      if (options.json !== undefined) return outputJson(data, options.json);
      printRun(data);
    });

  widget
    .command('runs <widgetId>')
    .description('Recent runs (scheduled, manual, preview), newest first')
    .option('--run <runId>', "Print one run's full output and logs")
    .option('-L, --limit <n>', 'How many runs to list', '10')
    .option('--json [fields]', 'Output JSON')
    .action(
      async (
        widgetId: string,
        options: { json?: boolean | string; limit: string; run?: string },
      ) => {
        const client = await getTrpcClient();
        if (options.run) {
          const { data } = await client.widget.getRun.query({ runId: options.run, widgetId });
          if (options.json !== undefined) return outputJson(data, options.json);
          return printRun(data);
        }
        const { data } = await client.widget.listRuns.query({
          limit: Number.parseInt(options.limit, 10),
          widgetId,
        });
        if (options.json !== undefined) return outputJson(data, options.json);
        if (data.length === 0) return console.log('No runs yet.');
        printTable(
          data.map((run) => [
            run.id,
            run.trigger,
            run.status,
            run.durationMs != null ? `${run.durationMs}ms` : '-',
            timeAgo(run.startedAt ?? run.createdAt),
          ]),
          ['ID', 'TRIGGER', 'STATUS', 'DURATION', 'STARTED'],
        );
      },
    );

  widget
    .command('schedule <widgetId> <pattern>')
    .description('Set the refresh cron pattern of the live widget, or "off" to clear it')
    .option('--timezone <tz>', 'IANA timezone, e.g. Asia/Shanghai')
    .action(async (widgetId: string, pattern: string, options: { timezone?: string }) => {
      await (
        await getTrpcClient()
      ).widget.setSchedule.mutate({
        id: widgetId,
        pattern: pattern === 'off' ? null : pattern,
        timezone: options.timezone,
      });
      console.log(
        `${pc.green('✓')} Schedule ${pattern === 'off' ? 'cleared' : `set to ${pattern}`}`,
      );
    });
}
