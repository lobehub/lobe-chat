import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  Building2Icon,
  FlagIcon,
  FolderKanbanIcon,
  type LucideIcon,
  MapPinIcon,
  PackageIcon,
  UserRoundIcon,
} from 'lucide-react';

import { type ContextKind, type EntityKind, type EntityStatus } from './types';

interface KindMeta {
  /** One concrete example, used by the empty state to explain what goes where. */
  example: string;
  icon: LucideIcon;
  label: string;
}

/** List order: what the user is driving first, then what it happens around. */
export const CONTEXT_KINDS: ContextKind[] = ['project', 'event', 'thing', 'place', 'org'];

export const KIND_META: Record<EntityKind, KindMeta> = {
  event: { example: '妹妹的婚礼、一次面试', icon: FlagIcon, label: '事' },
  org: { example: '公司、学校、考试机构', icon: Building2Icon, label: '组织' },
  person: { example: '同事、老师、家人', icon: UserRoundIcon, label: '人物' },
  place: { example: '办公室、常去的健身房', icon: MapPinIcon, label: '地点' },
  project: { example: '雅思备考、知识库迁移', icon: FolderKanbanIcon, label: '项目' },
  thing: { example: '相机、车、在养的猫', icon: PackageIcon, label: '物' },
};

export const STATUS_LABEL: Record<EntityStatus, string> = {
  active: '进行中',
  closed: '已结束',
  dormant: '沉寂',
};

/**
 * One hue per kind, used only on the kind icon. Everything else on the page stays neutral,
 * so the colour reads as "which kind" and nothing more.
 */
export const kindTint = stylex.create({
  event: { backgroundColor: cssVar.orangeFillSecondary, color: cssVar.orange },
  org: { backgroundColor: cssVar.purpleFillSecondary, color: cssVar.purple },
  person: { backgroundColor: cssVar.goldFillSecondary, color: cssVar.gold },
  place: { backgroundColor: cssVar.greenFillSecondary, color: cssVar.green },
  project: { backgroundColor: cssVar.geekblueFillSecondary, color: cssVar.geekblue },
  thing: { backgroundColor: cssVar.cyanFillSecondary, color: cssVar.cyan },
});
