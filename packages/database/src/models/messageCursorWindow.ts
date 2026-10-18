import type { SQL } from 'drizzle-orm';
import { and, desc, gte, isNull, lt, or, sql } from 'drizzle-orm';

import { messages } from '../schemas';
import type { LobeChatDatabase } from '../type';
import type { MessageRoundCursor } from './message';

export interface RowBound {
  createdAt: string;
  id: string;
}

interface WindowRow {
  createdAtIso: string;
  id: string;
  role: string;
}

/**
 * Microsecond-precision UTC string. `createdAt` is a timestamptz whose now()
 * default can carry microseconds, but a JS Date keeps only milliseconds — a
 * Date-derived cursor would round sub-millisecond boundaries and let rows leak
 * between adjacent pages. Carry the lossless value in the cursor and compare it
 * back with a ::timestamptz cast.
 */
const createdAtIso = sql<string>`to_char(${messages.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

/**
 * `(createdAt, id)` strictly before the cursor — the "older than" half-open
 * bound. Compares against the cursor's lossless microsecond string cast to
 * `timestamptz`, so sub-millisecond boundaries stay exact.
 */
export const messageStrictlyBefore = (cursor: MessageRoundCursor) =>
  or(
    sql`${messages.createdAt} < ${cursor.createdAt}::timestamptz`,
    and(sql`${messages.createdAt} = ${cursor.createdAt}::timestamptz`, lt(messages.id, cursor.id)),
  );

/** `(createdAt, id)` at or after the lower bound — the inclusive window start. */
export const messageAtOrAfter = (bound: RowBound) =>
  or(
    sql`${messages.createdAt} > ${bound.createdAt}::timestamptz`,
    and(sql`${messages.createdAt} = ${bound.createdAt}::timestamptz`, gte(messages.id, bound.id)),
  );

/**
 * Resolve the round window for a backward cursor page: walk mainline rows
 * newest-first and stop at the `roundLimit`-th round boundary (a `user` message)
 * or the `countBudget` safety cap, whichever comes first. Returns the lower bound
 * (the oldest included round's start) and whether older rounds remain. Rows
 * folded into a message group never count toward the window.
 */
export const resolveBackwardRoundWindow = async (
  db: LobeChatDatabase,
  {
    countBudget,
    cursor,
    roundLimit,
    where,
  }: {
    countBudget: number;
    cursor?: MessageRoundCursor | null;
    roundLimit: number;
    where: SQL | undefined;
  },
): Promise<{ hasMore: boolean; lowerBound: RowBound | null }> => {
  const olderThanCursor = cursor ? messageStrictlyBefore(cursor) : undefined;

  const rows = (await db
    .select({ createdAtIso, id: messages.id, role: messages.role })
    .from(messages)
    .where(and(where, isNull(messages.messageGroupId), olderThanCursor))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(countBudget + 1)) as WindowRow[];

  if (rows.length === 0) return { hasMore: false, lowerBound: null };

  let rounds = 0;
  let boundaryIndex = -1;
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].role === 'user') {
      rounds += 1;
      boundaryIndex = i;
      if (rounds >= roundLimit) break;
    }
    // Safety cap: once a full budget has been walked and at least one whole
    // round is captured, stop at the last boundary instead of scanning further.
    if (i + 1 >= countBudget && rounds >= 1) break;
  }

  // No `user` turn in the visible window — an oversized newest round, or a tail
  // with no user turn. Fall back to the oldest fetched row; that slice is a
  // partial round the renderer roots as an orphan chain. Lazy step loading is
  // the proper fix (a later stage).
  if (boundaryIndex === -1) boundaryIndex = rows.length - 1;

  const boundaryRow = rows[boundaryIndex];
  const hasMore = boundaryIndex < rows.length - 1 || rows.length > countBudget;

  return { hasMore, lowerBound: { createdAt: boundaryRow.createdAtIso, id: boundaryRow.id } };
};
