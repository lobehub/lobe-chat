import { kindOfType, statusOfValue } from './kinds';
import { type AssociatedName, type MemoryActivity, type MemoryEntity } from './types';

type Dateish = Date | string | null | undefined;
type NameRow = { name?: string | null; type?: string | null } | null;

/**
 * `queryMemories` selects every non-vector column, but its declared list-item types omit the
 * associated names and the activity narrative. These describe what actually arrives.
 */
export interface RawMemoryRow {
  capturedAt?: Dateish;
  createdAt?: Dateish;
  summary?: string | null;
  tags?: string[] | null;
  title?: string | null;
  updatedAt?: Dateish;
}

export interface RawContextItem {
  context: {
    associatedObjects?: NameRow[] | null;
    associatedSubjects?: NameRow[] | null;
    capturedAt?: Dateish;
    currentStatus?: string | null;
    description?: string | null;
    id: string;
    tags?: string[] | null;
    title?: string | null;
    type?: string | null;
    updatedAt?: Dateish;
  };
  memory: RawMemoryRow;
}

export interface RawActivityItem {
  activity: {
    associatedLocations?: NameRow[] | null;
    associatedObjects?: NameRow[] | null;
    associatedSubjects?: NameRow[] | null;
    capturedAt?: Dateish;
    id: string;
    narrative?: string | null;
    startsAt?: Dateish;
    status?: string | null;
  };
  memory: RawMemoryRow;
}

const iso = (...values: Dateish[]) => {
  for (const value of values) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date(0).toISOString();
};

const namesOf = (...lists: (NameRow[] | null | undefined)[]): AssociatedName[] => {
  const seen = new Set<string>();
  const names: AssociatedName[] = [];
  for (const row of lists.flat()) {
    const name = row?.name?.trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    names.push({ name, type: row?.type ?? undefined });
  }
  return names;
};

export const toEntity = ({ context, memory }: RawContextItem): MemoryEntity => ({
  capturedAt: iso(context.capturedAt, memory.capturedAt, memory.createdAt),
  description: context.description?.trim() || '',
  id: context.id,
  kind: kindOfType(context.type),
  names: namesOf(context.associatedSubjects, context.associatedObjects),
  rawType: context.type ?? undefined,
  status: statusOfValue(context.currentStatus),
  statusValue: context.currentStatus ?? undefined,
  summary: memory.summary?.trim() || '',
  tags: [...new Set([...(context.tags ?? []), ...(memory.tags ?? [])])],
  title: context.title?.trim() || memory.title?.trim() || '未命名情境',
  updatedAt: iso(context.updatedAt, memory.updatedAt, context.capturedAt),
});

export const toActivity = ({ activity, memory }: RawActivityItem): MemoryActivity => ({
  id: activity.id,
  names: namesOf(
    activity.associatedSubjects,
    activity.associatedObjects,
    activity.associatedLocations,
  ),
  narrative: activity.narrative?.trim() || memory.summary?.trim() || '',
  // Only ~1% of planned activities carry a future date, so the status decides 「接下来」.
  planned: activity.status === 'planned',
  statusValue: activity.status ?? undefined,
  title: memory.title?.trim() || '',
  when: iso(activity.startsAt, activity.capturedAt, memory.capturedAt, memory.createdAt),
  whenIsExact: !!activity.startsAt,
});
