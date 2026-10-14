import type { Command } from 'commander';
import pc from 'picocolors';

import { getTrpcClient } from '../../api/client';
import { outputJson } from '../../utils/format';
import { log } from '../../utils/logger';
import { resolveAssigneeUserId } from './assignee';
import { buildScheduleInput, planScheduleEdit } from './schedule';
import { resolveAppUrlBuilder, taskPath } from './url';

/**
 * `undefined` = flag not passed; `false` = resolution failed and was reported,
 * so the caller should stop without sending a half-applied edit.
 */
const resolveUserOption = async (
  client: Awaited<ReturnType<typeof getTrpcClient>>,
  value: string | undefined,
): Promise<string | undefined | false> => {
  if (!value) return undefined;
  try {
    return await resolveAssigneeUserId(client, value);
  } catch (error) {
    log.error((error as Error).message);
    process.exitCode = 1;
    return false;
  }
};

/**
 * `lh task create` and `lh task edit`: the commands that write a task's fields,
 * including its assignee and schedule.
 */
export function registerWriteCommands(task: Command) {
  // ── create ──────────────────────────────────────────────

  task
    .command('create')
    .description('Create a new task')
    .requiredOption('-i, --instruction <text>', 'Task instruction')
    .option('-n, --name <name>', 'Task name')
    .option('--agent <id>', 'Assign to agent')
    .option('--user <idOrEmail>', 'Assign to a workspace member (user id, email or username)')
    .option('--parent <id>', 'Parent task ID')
    .option('--priority <n>', 'Priority (0=none, 1=urgent, 2=high, 3=normal, 4=low)', '0')
    .option('--schedule <cron>', 'Run on a cron schedule, e.g. "0 */6 * * *" (every 6 hours)')
    .option('--timezone <tz>', 'IANA timezone for --schedule, e.g. Asia/Shanghai (default: UTC)')
    .option('--json [fields]', 'Output JSON')
    .action(
      async (options: {
        agent?: string;
        instruction: string;
        json?: string | boolean;
        name?: string;
        parent?: string;
        priority?: string;
        schedule?: string;
        timezone?: string;
        user?: string;
      }) => {
        let schedule: ReturnType<typeof buildScheduleInput>;
        try {
          schedule = buildScheduleInput(options);
        } catch (error) {
          log.error((error as Error).message);
          return;
        }

        const client = await getTrpcClient();
        const buildUrl = await resolveAppUrlBuilder(client);
        const assigneeUserId = await resolveUserOption(client, options.user);
        if (assigneeUserId === false) return;

        const input: Parameters<typeof client.task.create.mutate>[0] = {
          instruction: options.instruction,
        };
        if (options.name) input.name = options.name;
        if (options.agent) input.assigneeAgentId = options.agent;
        if (assigneeUserId) input.assigneeUserId = assigneeUserId;
        if (options.parent) input.parentTaskId = options.parent;
        if (options.priority) input.priority = Number.parseInt(options.priority, 10);
        // The pattern is stored now, but the task only becomes dispatchable in the
        // update below, which sets the mode and arms it (`scheduled`) in one transaction.
        // Creating it in schedule mode directly would let the dispatcher fire an
        // occurrence that passed just before (its grace window) with nothing armed.
        if (schedule.schedulePattern) input.schedulePattern = schedule.schedulePattern;
        if (schedule.scheduleTimezone) input.scheduleTimezone = schedule.scheduleTimezone;

        let result = await client.task.create.mutate(input);
        if (schedule.automationMode === 'schedule') {
          result = await client.task.update.mutate({
            automationMode: 'schedule',
            id: result.data.id,
            status: 'scheduled',
          });
        }
        const url = buildUrl(taskPath(result.data.identifier, result.data.name));

        if (options.json !== undefined) {
          outputJson({ ...result.data, url }, options.json);
          return;
        }

        log.info(`Task created: ${pc.bold(result.data.identifier)} ${result.data.name || ''}`);
        if (schedule.schedulePattern) {
          log.info(
            `Scheduled: ${schedule.schedulePattern} (${schedule.scheduleTimezone || 'UTC'})`,
          );
        }
        console.log(`${pc.bold('task')}: ${url}`);
      },
    );

  // ── edit ──────────────────────────────────────────────

  task
    .command('edit <id>')
    .description('Update a task')
    .option('-n, --name <name>', 'Task name')
    .option('-i, --instruction <text>', 'Task instruction')
    .option('--agent <id>', 'Assign to agent')
    .option('--user <idOrEmail>', 'Assign to a workspace member (user id, email or username)')
    .option('--priority <n>', 'Priority (0-4)')
    .option('--heartbeat-interval <n>', 'Heartbeat interval in seconds')
    .option('--heartbeat-timeout <n>', 'Heartbeat timeout in seconds (0 to disable)')
    .option('--description <text>', 'Task description')
    .option('--schedule <cron>', 'Run on a cron schedule, e.g. "0 */6 * * *" (every 6 hours)')
    .option('--no-schedule', 'Turn the schedule off (the pattern is kept)')
    .option('--timezone <tz>', 'IANA timezone for the schedule, e.g. Asia/Shanghai')
    .option(
      '--status <status>',
      'Set status (backlog, running, scheduled, paused, completed, failed, canceled)',
    )
    .option('--json [fields]', 'Output JSON')
    .action(
      async (
        id: string,
        options: {
          agent?: string;
          description?: string;
          heartbeatInterval?: string;
          heartbeatTimeout?: string;
          instruction?: string;
          json?: string | boolean;
          name?: string;
          priority?: string;
          schedule?: string | false;
          status?: string;
          timezone?: string;
          user?: string;
        },
      ) => {
        let schedule: ReturnType<typeof buildScheduleInput>;
        try {
          schedule = buildScheduleInput(options);
        } catch (error) {
          log.error((error as Error).message);
          return;
        }

        const client = await getTrpcClient();
        const assigneeUserId = await resolveUserOption(client, options.user);
        if (assigneeUserId === false) return;

        const input: Record<string, any> = { id };
        if (options.name) input.name = options.name;
        if (options.instruction) input.instruction = options.instruction;
        if (options.description) input.description = options.description;
        if (options.agent) input.assigneeAgentId = options.agent;
        if (assigneeUserId) input.assigneeUserId = assigneeUserId;
        if (options.priority) input.priority = Number.parseInt(options.priority, 10);
        if (options.heartbeatInterval)
          input.heartbeatInterval = Number.parseInt(options.heartbeatInterval, 10);
        if (options.heartbeatTimeout !== undefined) {
          const val = Number.parseInt(options.heartbeatTimeout, 10);
          input.heartbeatTimeout = val === 0 ? null : val;
        }
        Object.assign(input, schedule);

        const valid = [
          'backlog',
          'running',
          'scheduled',
          'paused',
          'completed',
          'failed',
          'canceled',
        ];
        if (options.status && !valid.includes(options.status)) {
          log.error(`Invalid status "${options.status}". Must be one of: ${valid.join(', ')}`);
          return;
        }

        // Schedule edits and `--status scheduled` depend on the task's current state:
        // arming a new schedule, sending a scheduled task back to the backlog, or
        // refusing to park a task that has nothing to run on.
        let status = options.status;
        if (schedule.automationMode !== undefined || options.status === 'scheduled') {
          const current = (await client.task.find.query({ id })).data;
          const plan = planScheduleEdit(current, schedule, options.status);
          if ('error' in plan) {
            log.error(plan.error);
            return;
          }
          status = plan.status;
        }

        const hasFieldEdits = Object.keys(input).length > 1;

        // Status-only edits use the lifecycle API. Combined edits go through
        // task.update so the server applies the fields and the lifecycle change in one
        // transaction (for a new schedule that also stamps when it was armed).
        if (status && !hasFieldEdits) {
          const result = await client.task.updateStatus.mutate({ id, status });
          log.info(`${pc.bold(result.data.identifier)} → ${status}`);
          return;
        }
        if (status) input.status = status;

        const result = await client.task.update.mutate(input as any);

        if (options.json !== undefined) {
          outputJson(result.data, typeof options.json === 'string' ? options.json : undefined);
          return;
        }

        const statusSuffix = status ? ` → ${status}` : '';
        log.info(`Task updated: ${pc.bold(result.data.identifier)}${statusSuffix}`);
      },
    );
}
