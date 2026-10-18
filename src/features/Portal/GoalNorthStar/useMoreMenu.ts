import { type PortalMoreMenuConfig } from '@/features/Portal/components/PortalMoreMenu/types';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { useGoalStore } from '@/store/goal';

export const useGoalNorthStarMoreMenu = (): PortalMoreMenuConfig | undefined => {
  const view = useChatStore(chatPortalSelectors.goalNorthStarView);
  const [refreshGoalGraph, refreshGoalMetricSeries] = useGoalStore((s) => [
    s.refreshGoalGraph,
    s.refreshGoalMetricSeries,
  ]);

  if (!view) return;
  const { goalId } = view;

  // A clause lives in its goal's config and its numbers in the goal's metric
  // series, so refreshing re-reads both.
  return {
    refresh: () => Promise.all([refreshGoalGraph(goalId), refreshGoalMetricSeries(goalId)]),
  };
};
