import type { TaskItem } from '@lobechat/types';

import type { TaskModel } from '@/database/models/task';

/**
 * Consecutive dispatches of a Task that could not reach its device, kept on
 * `task.context`.
 *
 * The offline schedule (`holdForOfflineDevice`) counts offline runs, but a
 * dispatch can fail before `runTask` records a run. Counted from runs alone,
 * such a Task stayed at the first retry forever: every failure refreshed
 * `task.updatedAt`, so the schedule restarted at 30 minutes and never reached
 * its retry cap or the gate. Every device-unavailable dispatch counts here,
 * with a run or without one; the schedule reads the larger of the two counts.
 */
const CONTEXT_KEY = 'deviceDispatch';

interface DeviceDispatchStreak {
  failures: number;
  lastFailedAt?: string;
}

export const readDeviceDispatchStreak = (
  task: Pick<TaskItem, 'context'>,
): { failures: number; lastFailedAt?: Date } => {
  const streak = (task.context as Record<string, unknown> | null)?.[CONTEXT_KEY] as
    DeviceDispatchStreak | undefined;
  const failures = typeof streak?.failures === 'number' ? streak.failures : 0;
  return {
    failures,
    lastFailedAt: streak?.lastFailedAt ? new Date(streak.lastFailedAt) : undefined,
  };
};

/**
 * Park a claimed Task whose dispatch could not reach its device: `paused` with
 * the device error, so the next advance takes the offline schedule, and one more
 * failure on the streak, so that schedule ends at its gate.
 */
export const parkDeviceUnavailableDispatch = async (
  taskModel: TaskModel,
  task: Pick<TaskItem, 'context' | 'id'>,
  error: string,
) => {
  const parked = await taskModel.updateStatusIfCurrent(task.id, 'running', 'paused', { error });
  if (!parked) return;
  const streak: DeviceDispatchStreak = {
    failures: readDeviceDispatchStreak(task).failures + 1,
    lastFailedAt: new Date().toISOString(),
  };
  await taskModel.updateContext(task.id, { [CONTEXT_KEY]: streak });
};

/** A dispatch got through: the next device failure starts a new streak. */
export const clearDeviceDispatchStreak = async (
  taskModel: TaskModel,
  task: Pick<TaskItem, 'context' | 'id'>,
) => {
  if (!readDeviceDispatchStreak(task).failures) return;
  await taskModel.updateContext(task.id, { [CONTEXT_KEY]: { failures: 0 } });
};
