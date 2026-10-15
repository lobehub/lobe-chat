import { describe, expect, it } from 'vitest';

import { buildScheduleInput, formatSchedule, planScheduleEdit } from './schedule';

describe('buildScheduleInput', () => {
  it('returns nothing when no schedule flag is passed', () => {
    expect(buildScheduleInput({})).toEqual({});
  });

  it('turns --schedule into schedule mode with the cron pattern', () => {
    expect(buildScheduleInput({ schedule: ' 0 */6 * * * ' })).toEqual({
      automationMode: 'schedule',
      schedulePattern: '0 */6 * * *',
    });
  });

  it('adds the timezone, alone or with a pattern', () => {
    expect(buildScheduleInput({ timezone: 'Asia/Shanghai' })).toEqual({
      scheduleTimezone: 'Asia/Shanghai',
    });
    expect(buildScheduleInput({ schedule: '0 9 * * 1', timezone: 'Asia/Shanghai' })).toEqual({
      automationMode: 'schedule',
      schedulePattern: '0 9 * * 1',
      scheduleTimezone: 'Asia/Shanghai',
    });
  });

  it('turns automation off for --no-schedule and keeps the stored pattern', () => {
    expect(buildScheduleInput({ schedule: false })).toEqual({ automationMode: null });
  });

  it('rejects an empty pattern or timezone instead of sending a schedule that never fires', () => {
    expect(() => buildScheduleInput({ schedule: '  ' })).toThrow(/cron pattern/);
    expect(() => buildScheduleInput({ timezone: '' })).toThrow(/IANA timezone/);
  });
});

describe('formatSchedule', () => {
  it('shows the pattern and zone of a scheduled task', () => {
    expect(
      formatSchedule({
        automationMode: 'schedule',
        schedule: { pattern: '0 */6 * * *', timezone: 'Asia/Shanghai' },
      }),
    ).toBe('0 */6 * * * (Asia/Shanghai)');
    expect(formatSchedule({ automationMode: 'schedule', schedule: { pattern: '0 9 * * *' } })).toBe(
      '0 9 * * * (UTC)',
    );
  });

  it('shows nothing when automation is off or another mode', () => {
    expect(formatSchedule({ automationMode: null, schedule: { pattern: '0 9 * * *' } })).toBe(
      undefined,
    );
    expect(formatSchedule({ automationMode: 'heartbeat', schedule: null })).toBe(undefined);
  });
});

describe('planScheduleEdit', () => {
  const on = { automationMode: 'schedule' as const, schedulePattern: '0 */6 * * *' };
  const off = { automationMode: null };

  it('arms a new schedule in the same update so a just-passed occurrence is not replayed', () => {
    expect(planScheduleEdit({ status: 'backlog' }, on)).toEqual({ status: 'scheduled' });
    expect(planScheduleEdit({ status: 'paused' }, on)).toEqual({ status: 'scheduled' });
    expect(planScheduleEdit({ status: 'scheduled' }, on, 'scheduled')).toEqual({
      status: 'scheduled',
    });
  });

  it('leaves a running task alone when its schedule changes', () => {
    expect(planScheduleEdit({ status: 'running' }, on)).toEqual({ status: undefined });
  });

  it('rejects --schedule with a status that would leave it unarmed', () => {
    expect(planScheduleEdit({ status: 'backlog' }, on, 'paused')).toEqual({
      error: expect.stringMatching(/arms the task/),
    });
  });

  it('sends a scheduled task back to the backlog when the schedule is turned off', () => {
    expect(planScheduleEdit({ status: 'scheduled' }, off)).toEqual({ status: 'backlog' });
    expect(planScheduleEdit({ status: 'running' }, off)).toEqual({ status: undefined });
    expect(planScheduleEdit({ status: 'scheduled' }, off, 'paused')).toEqual({
      status: 'paused',
    });
    expect(planScheduleEdit({ status: 'backlog' }, off, 'scheduled')).toEqual({
      error: expect.stringMatching(/automation off/),
    });
  });

  it('refuses --status scheduled for a task with nothing to run on', () => {
    expect(planScheduleEdit({ automationMode: null, status: 'backlog' }, {}, 'scheduled')).toEqual({
      error: expect.stringMatching(/no schedule or heartbeat/),
    });
    expect(
      planScheduleEdit({ automationMode: 'schedule', schedulePattern: null }, {}, 'scheduled'),
    ).toEqual({ error: expect.stringMatching(/no schedule or heartbeat/) });
    expect(
      planScheduleEdit({ automationMode: 'heartbeat', heartbeatInterval: 0 }, {}, 'scheduled'),
    ).toEqual({ error: expect.stringMatching(/no schedule or heartbeat/) });
  });

  it('allows --status scheduled once a schedule or heartbeat is configured', () => {
    expect(
      planScheduleEdit(
        { automationMode: 'schedule', schedulePattern: '0 9 * * *' },
        {},
        'scheduled',
      ),
    ).toEqual({ status: 'scheduled' });
    expect(
      planScheduleEdit({ automationMode: 'heartbeat', heartbeatInterval: 600 }, {}, 'scheduled'),
    ).toEqual({ status: 'scheduled' });
  });

  it('passes other statuses through unchanged', () => {
    expect(planScheduleEdit({ status: 'running' }, {}, 'paused')).toEqual({ status: 'paused' });
    expect(planScheduleEdit({ status: 'running' }, {})).toEqual({ status: undefined });
  });
});
