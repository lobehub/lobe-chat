import { HOME_FEED_EXCLUDED_BRIEF_TYPES, NEWS_BRIEF_TYPES } from '@lobechat/types';

import { type BriefItem } from '@/features/DailyBrief/types';

export interface SplitBriefs {
  /** Briefs the user must decide on — grouped as "Needs you". */
  needsYou: BriefItem[];
  /** `insight` + `result` briefs: nothing to decide, just worth a glance. */
  news: BriefItem[];
}

/**
 * A `result` brief is a completion report: the work already happened, reading
 * it is enough. Splitting on the parent task's *runtime* status proved fragile
 * (a paused/completed recurring task flipped its whole report history back
 * into the to-do pile), so results are news unconditionally — accepting a
 * one-off delivery stays available from the task page.
 */
const isNewsBrief = (brief: BriefItem): boolean => NEWS_BRIEF_TYPES.includes(brief.type);

/**
 * Splits the unresolved brief feed by whether the user has to *decide*
 * something. `decision` briefs block an agent until answered; `insight` and
 * `result` are pure knowledge and belong in a scannable list, not in a to-do
 * pile. Run failures are not decisions — they live in the notification center,
 * so legacy `error` briefs are dropped here too (the server already filters
 * them; this keeps stale caches from showing them).
 *
 * The server already sorts by priority then recency; the filter keeps that order.
 */
export const splitBriefs = (briefs: BriefItem[]): SplitBriefs => ({
  needsYou: briefs.filter(
    (brief) =>
      // A successful optimistic resolve stamps the row before the unresolved-list
      // SWR cache revalidates. Hide it immediately so "Ignore" actually closes the
      // card instead of leaving a resolved tombstone in the queue until remount.
      !brief.resolvedAt &&
      !isNewsBrief(brief) &&
      !HOME_FEED_EXCLUDED_BRIEF_TYPES.includes(brief.type),
  ),
  news: briefs.filter(isNewsBrief),
});
