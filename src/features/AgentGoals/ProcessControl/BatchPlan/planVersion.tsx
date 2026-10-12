'use client';

import { createContext, memo, type PropsWithChildren, use, useMemo, useState } from 'react';

import { useClientDataSWR } from '@/libs/swr';
import { userSkillService } from '@/services/userSkill';

import type { GoalGraphView } from '../goalGraphViewModel';
import type { BatchModel, BatchRound } from '../Graph/batchModel';
import { skillVersionContent } from './skillVersions';

/**
 * The plan version a reader picked in the panel's header, shared with its body.
 * Undefined until they pick one: the panel shows the round it opened on.
 */
const PlanVersionContext = createContext<{
  selected?: number;
  setSelected: (revision: number) => void;
}>({ setSelected: () => {} });

export const PlanVersionProvider = memo<PropsWithChildren>(({ children }) => {
  const [selected, setSelected] = useState<number>();
  const value = useMemo(() => ({ selected, setSelected }), [selected]);
  return <PlanVersionContext value={value}>{children}</PlanVersionContext>;
});

PlanVersionProvider.displayName = 'GoalPlanVersionProvider';

export const usePlanVersionSelection = () => use(PlanVersionContext);

export interface PlanVersion {
  /** `SKILL.md` as kept, frontmatter included. */
  content: string;
  revision: number;
}

/**
 * Every version of a batch's plan, oldest first. The plan is a skill in the
 * user's library — round N is its version N; a batch from before the plan
 * became a skill falls back to its plan nodes' text.
 */
export const usePlanVersions = (graph: GoalGraphView, model: BatchModel) => {
  const planSkill = model.planSkill;
  // Keyed by the round count, so a revision the panel is open on loads its version.
  const { data: skill, isLoading } = useClientDataSWR(
    planSkill ? ['goal-plan-skill', planSkill.id, model.rounds.length] : null,
    () => userSkillService.get(planSkill!.id),
  );
  const versions: PlanVersion[] = model.rounds
    .filter((item) => item.templateId)
    .map((item: BatchRound) => ({
      content:
        skillVersionContent(skill?.versions, item.revision) ??
        ((item.templateId && graph.byId[item.templateId]?.node.description) || ''),
      revision: item.revision,
    }));
  // A skill's scripts are its latest set; versions keep `SKILL.md` alone.
  return { files: skill?.files ?? [], isLoading: !!planSkill && isLoading, versions };
};
