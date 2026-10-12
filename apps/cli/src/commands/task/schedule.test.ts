import { describe, expect, it } from 'vitest';

import { buildScheduleInput, formatSchedule } from './schedule';

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
