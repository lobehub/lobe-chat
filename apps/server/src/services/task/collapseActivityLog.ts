import type { TaskActivityLogPayload, TaskActivityLogType } from '@lobechat/types';

/**
 * How long a run of edits to one property by one person stays a single line.
 * A product knob, not a correctness one: shorter shows more intermediate
 * states, longer hides more fiddling.
 */
export const ACTIVITY_COLLAPSE_WINDOW_MS = 30 * 60_000;

interface CollapsibleRow {
  actorAgentId: string | null;
  actorUserId: string | null;
  createdAt: Date | string;
  id: string;
  payload: TaskActivityLogPayload | null;
  type: TaskActivityLogType;
}

const at = (row: CollapsibleRow): number => new Date(row.createdAt).getTime();

const sameValue = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** True when the row's start and end are the same value — nothing to tell. */
const isNetNoop = (payload: TaskActivityLogPayload | null): boolean =>
  !!payload &&
  sameValue(payload.from, payload.to) &&
  (payload.fromId ?? null) === (payload.toId ?? null);

/**
 * Fold a burst of edits to the same property by the same person into one
 * entry, the way an issue tracker shows "moved from A to C" rather than every
 * hop in between — and shows nothing at all when the value ended up back where
 * it started.
 *
 * Read-time only. The rows in `task_activities` stay append-only, so the full
 * hop-by-hop history is still there for audit or a "show all" view; this only
 * decides what a reader is shown by default. `rows` must be oldest-first, as
 * `getActivities` returns them.
 *
 * The merged entry keeps the LAST row's id and time (the feed sorts by it and
 * a reader wants "when did it settle"), the FIRST row's starting value, and the
 * last row's ending value. Different actors never merge: A moving it and B
 * moving it back are two decisions, not a cancelled one.
 */
export const collapseActivityLog = <T extends CollapsibleRow>(
  rows: T[],
  windowMs: number = ACTIVITY_COLLAPSE_WINDOW_MS,
): T[] => {
  const out: T[] = [];
  // Per (property, actor): where the open run sits in `out`, its first row
  // (for the starting value) and its last row (for the sliding window).
  const open = new Map<string, { first: T; index: number; last: T }>();

  for (const row of rows) {
    const key = `${row.type}|${row.actorAgentId ?? ''}|${row.actorUserId ?? ''}`;
    const run = open.get(key);

    if (run && at(row) - at(run.last) <= windowMs) {
      out[run.index] = {
        ...row,
        payload: {
          ...run.first.payload,
          to: row.payload?.to,
          toId: row.payload?.toId,
        },
      };
      run.last = row;
      continue;
    }

    out.push(row);
    open.set(key, { first: row, index: out.length - 1, last: row });
  }

  return out.filter((row) => !isNetNoop(row.payload));
};
