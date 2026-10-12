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
