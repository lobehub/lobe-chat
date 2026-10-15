/**
 * Schedule fields shared by `lh task create` and `lh task edit`.
 *
 * Commander gives `schedule` as the cron string for `--schedule <cron>` and `false` for
 * `--no-schedule`. The server validates the cron pattern and the timezone, so a bad value
 * fails the request instead of storing a schedule that never fires.
 */
export interface ScheduleOptions {
  schedule?: string | false;
  timezone?: string;
}

export interface ScheduleInput {
  automationMode?: 'schedule' | null;
  schedulePattern?: string;
  scheduleTimezone?: string;
}

/**
 * Builds the task fields for the schedule flags.
 *
 * - `--schedule <cron>` turns the task into a scheduled task: `automationMode: 'schedule'`
 *   plus the cron pattern. The dispatcher fires it from `backlog` or `scheduled`.
 * - `--no-schedule` turns automation off, as "Cancel schedule" in the app does; the
 *   pattern is kept so the schedule can be re-enabled.
 * - `--timezone <tz>` sets the IANA zone the pattern is evaluated in.
 */
export const buildScheduleInput = ({ schedule, timezone }: ScheduleOptions): ScheduleInput => {
  const input: ScheduleInput = {};

  if (schedule === false) {
    input.automationMode = null;
  } else if (typeof schedule === 'string') {
    const pattern = schedule.trim();
    if (!pattern) throw new Error('--schedule needs a cron pattern, e.g. "0 */6 * * *"');
    input.automationMode = 'schedule';
    input.schedulePattern = pattern;
  }

  if (timezone !== undefined) {
    const zone = timezone.trim();
    if (!zone) throw new Error('--timezone needs an IANA timezone, e.g. "Asia/Shanghai"');
    input.scheduleTimezone = zone;
  }

  return input;
};

/** One-line summary for `lh task view`, or undefined when the task is not scheduled. */
export const formatSchedule = (task: {
  automationMode?: string | null;
  schedule?: { pattern?: string | null; timezone?: string | null } | null;
}): string | undefined => {
  if (task.automationMode !== 'schedule' || !task.schedule?.pattern) return undefined;
  return `${task.schedule.pattern} (${task.schedule.timezone || 'UTC'})`;
};

/** The task fields `planScheduleEdit` needs; `task.find` returns them. */
export interface ScheduleTaskState {
  automationMode?: string | null;
  heartbeatInterval?: number | null;
  schedulePattern?: string | null;
  status?: string | null;
}

/**
 * Decides the status `lh task edit` sends with its schedule fields.
 *
 * - Turning a schedule on arms it: `status: 'scheduled'` goes in the same `task.update`
 *   as the pattern, so the server stamps `scheduleStartedAt` in that transaction. Without
 *   the stamp the dispatcher treats an occurrence inside its grace window (e.g. 09:00 when
 *   the schedule is set at 09:05) as missed and runs it. A running task is left alone;
 *   the dispatcher moves it to `scheduled` after the run.
 * - Turning the schedule off moves a `scheduled` task back to `backlog`, like "Cancel
 *   schedule" in the app.
 * - `--status scheduled` needs automation that can fire: a schedule with a pattern or a
 *   heartbeat with an interval. Otherwise the task would be parked forever.
 */
export const planScheduleEdit = (
  current: ScheduleTaskState,
  schedule: ScheduleInput,
  requestedStatus?: string,
): { error: string } | { status?: string } => {
  if (schedule.automationMode === 'schedule') {
    if (requestedStatus && requestedStatus !== 'scheduled') {
      return {
        error: `--schedule arms the task (status "scheduled"); drop --status ${requestedStatus} or use --status scheduled`,
      };
    }
    if (current.status === 'running') return { status: requestedStatus };
    return { status: 'scheduled' };
  }

  if (schedule.automationMode === null) {
    if (requestedStatus === 'scheduled') {
      return { error: '--no-schedule turns automation off, so the task cannot be "scheduled"' };
    }
    if (!requestedStatus && current.status === 'scheduled') return { status: 'backlog' };
    return { status: requestedStatus };
  }

  if (requestedStatus === 'scheduled') {
    const canFire =
      (current.automationMode === 'schedule' && !!current.schedulePattern) ||
      (current.automationMode === 'heartbeat' && (current.heartbeatInterval ?? 0) > 0);
    if (!canFire) {
      return {
        error:
          'The task has no schedule or heartbeat to run on; set one with --schedule "<cron>" (or a heartbeat) first',
      };
    }
  }

  return { status: requestedStatus };
};
