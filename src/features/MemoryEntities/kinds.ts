import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  CalendarDaysIcon,
  FolderKanbanIcon,
  type LucideIcon,
  ShapesIcon,
  TargetIcon,
  UsersRoundIcon,
} from 'lucide-react';

import { type ContextKind, type EntityStatus } from './types';

interface KindMeta {
  /** One concrete example, used by the empty state to explain what goes where. */
  example: string;
  icon: LucideIcon;
  label: string;
}

/** List order: what the user is driving first, then who and what happens around it. */
export const CONTEXT_KINDS: ContextKind[] = ['project', 'goal', 'relationship', 'event', 'other'];

export const KIND_META: Record<ContextKind, KindMeta> = {
  event: { example: '一次旅行、一场面试', icon: CalendarDaysIcon, label: '事件' },
  goal: { example: '考到雅思 7 分、减重 5 公斤', icon: TargetIcon, label: '目标' },
  other: { example: '其他持续关注的事', icon: ShapesIcon, label: '其他' },
  project: { example: '知识库迁移、写一本书', icon: FolderKanbanIcon, label: '项目' },
  relationship: { example: '和团队、家人的关系', icon: UsersRoundIcon, label: '关系' },
};

/**
 * The extractor writes `type` as free text: project (34%), relationship, other, goal and event
 * cover ~76% of rows, the rest is a long tail. Map the tail onto the nearest kind by word.
 */
const KIND_BY_TYPE: Record<string, ContextKind> = {
  activity: 'event',
  crisis: 'event',
  creative_project: 'project',
  event: 'event',
  goal: 'goal',
  incident: 'event',
  infrastructure: 'project',
  people: 'relationship',
  person: 'relationship',
  plan: 'project',
  process: 'project',
  project: 'project',
  relationship: 'relationship',
  research: 'project',
  social: 'relationship',
  strategy: 'goal',
  task: 'project',
  trip: 'event',
  work: 'project',
  workflow: 'project',
  workplace: 'project',
};

export const kindOfType = (type?: string | null): ContextKind => {
  const key = type?.trim().toLowerCase().replaceAll(/[\s-]+/g, '_');
  if (!key) return 'other';
  if (KIND_BY_TYPE[key]) return KIND_BY_TYPE[key];
  if (key.includes('project')) return 'project';
  if (key.includes('goal')) return 'goal';
  if (key.includes('relation') || key.includes('family') || key.includes('friend'))
    return 'relationship';
  if (key.includes('event') || key.includes('trip')) return 'event';
  return 'other';
};

/** Backend `currentStatus` values; anything else is shown as written. */
export const STATUS_VALUE_LABEL: Record<string, string> = {
  aborted: '已中止',
  cancelled: '已取消',
  completed: '已完成',
  on_hold: '搁置中',
  ongoing: '进行中',
  planned: '计划中',
};

export const statusOfValue = (value?: string | null): EntityStatus => {
  switch (value) {
    case 'completed':
    case 'aborted':
    case 'cancelled': {
      return 'closed';
    }
    case 'on_hold': {
      return 'dormant';
    }
    default: {
      return 'active';
    }
  }
};

export const statusLabelOf = (value?: string | null) =>
  value ? (STATUS_VALUE_LABEL[value] ?? value) : undefined;

/**
 * One hue per kind, used only on the kind icon. Everything else on the page stays neutral,
 * so the colour reads as "which kind" and nothing more.
 */
export const kindTint = stylex.create({
  event: { backgroundColor: cssVar.orangeFillSecondary, color: cssVar.orange },
  goal: { backgroundColor: cssVar.greenFillSecondary, color: cssVar.green },
  other: { backgroundColor: cssVar.colorFillSecondary, color: cssVar.colorTextSecondary },
  project: { backgroundColor: cssVar.geekblueFillSecondary, color: cssVar.geekblue },
  relationship: { backgroundColor: cssVar.goldFillSecondary, color: cssVar.gold },
});
