import { type EntityKind, type MemoryActivity, type MemoryEntity } from './types';

const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const daysFromToday = (iso: string) =>
  Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / DAY);

export const formatMonthDay = (iso: string) => {
  const date = new Date(iso);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const formatWeekday = (iso: string) => WEEKDAYS[new Date(iso).getDay()];

export const formatMonth = (iso: string) => {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return sameYear ? `${date.getMonth() + 1} 月` : `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
};

/** "今天" / "3 天前" / "2 个月前": for list rows, where only the rough age matters. */
export const formatAgo = (iso: string) => {
  const days = -daysFromToday(iso);
  if (days <= 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return `${Math.floor(days / 365)} 年前`;
};

export const formatUntil = (iso: string) => {
  const days = daysFromToday(iso);
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  return `${days} 天后`;
};

export const activitiesOf = (activities: MemoryActivity[], id: string) =>
  activities.filter((activity) => activity.links.some((link) => link.id === id));

/** Planned entries, soonest first; done entries, newest first. */
export const splitTimeline = (entries: MemoryActivity[]) => ({
  past: entries
    .filter((entry) => entry.status === 'done')
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
  upcoming: entries
    .filter((entry) => entry.status === 'planned')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
});

export const groupByMonth = (entries: MemoryActivity[]) => {
  const groups: { label: string; entries: MemoryActivity[] }[] = [];
  for (const entry of entries) {
    const label = formatMonth(entry.startsAt);
    const last = groups.at(-1);
    if (last?.label === label) last.entries.push(entry);
    else groups.push({ entries: [entry], label });
  }
  return groups;
};

export interface RelatedEntity {
  count: number;
  entity: MemoryEntity;
}

/**
 * Related pages are not stored: they are whatever shares a timeline entry with this page,
 * ranked by how often.
 */
export const relatedOf = (
  entities: MemoryEntity[],
  activities: MemoryActivity[],
  id: string,
): RelatedEntity[] => {
  const counts = new Map<string, number>();
  for (const activity of activitiesOf(activities, id)) {
    for (const link of activity.links) {
      if (link.id === id) continue;
      counts.set(link.id, (counts.get(link.id) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([relatedId, count]) => ({ count, entity: entities.find((e) => e.id === relatedId) }))
    .filter((item): item is RelatedEntity => !!item.entity)
    .sort((a, b) => b.count - a.count);
};

/** When the page last moved: its newest done entry, or the last time "now" was rewritten. */
export const lastTouchedOf = (entity: MemoryEntity, activities: MemoryActivity[]) => {
  const latest = splitTimeline(activitiesOf(activities, entity.id)).past[0]?.startsAt;
  return latest && latest > entity.nowUpdatedAt ? latest : entity.nowUpdatedAt;
};

export const isPerson = (kind: EntityKind) => kind === 'person';
