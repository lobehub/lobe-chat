import { type EntityLinks } from './link';
import { type MemoryActivity, type MemoryEntity } from './types';

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

export const groupByMonth = <T extends { activity: MemoryActivity }>(entries: T[]) => {
  const groups: { entries: T[]; label: string }[] = [];
  for (const entry of entries) {
    const label = formatMonth(entry.activity.when);
    const last = groups.at(-1);
    if (last?.label === label) last.entries.push(entry);
    else groups.push({ entries: [entry], label });
  }
  return groups;
};

/** When the page last moved: its newest linked activity, or its own last update. */
export const lastTouchedOf = (entity: MemoryEntity, links?: EntityLinks) => {
  const latest = links?.activities.get(entity.id)?.find((e) => !e.activity.planned)?.activity.when;
  return latest && latest > entity.updatedAt ? latest : entity.updatedAt;
};
