import { Icon } from '@lobehub/ui';
import { Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { openDeclareMetricModal } from '@/features/AgentGoals/NorthStarMetrics/DeclareMetricModal';
import { openRecordObservationModal } from '@/features/AgentGoals/NorthStarMetrics/RecordObservationModal';
import { type PortalMoreMenuConfig } from '@/features/Portal/components/PortalMoreMenu/types';
import { usePermission } from '@/hooks/usePermission';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { goalSelectors, useGoalStore } from '@/store/goal';

export const useGoalNorthStarMoreMenu = (): PortalMoreMenuConfig | undefined => {
  const { t } = useTranslation('chat');
  const view = useChatStore(chatPortalSelectors.goalNorthStarView);
  const { allowed: canEdit } = usePermission('create_content');
  const [refreshGoalGraph, refreshGoalMetricSeries] = useGoalStore((s) => [
    s.refreshGoalGraph,
    s.refreshGoalMetricSeries,
  ]);
  const criterion = useGoalStore((s) =>
    view
      ? goalSelectors
          .goalGraph(view.goalId)(s)
          ?.goal.config?.acceptance?.metrics?.find((item) => item.key === view.metricKey)
      : undefined,
  );

  if (!view) return;
  const { goalId } = view;

  return {
    // The clause's actions sit beside its title, out of the reading flow of
    // the number, the trend and the history.
    extraItems:
      canEdit && criterion
        ? [
            {
              icon: <Icon icon={Plus} />,
              key: 'record',
              label: t('goalProcess.northStar.record.title'),
              onClick: () =>
                openRecordObservationModal(goalId, criterion.key, criterion.title || criterion.key),
            },
            {
              icon: <Icon icon={Pencil} />,
              key: 'edit',
              label: t('goalProcess.northStar.edit.title'),
              onClick: () => openDeclareMetricModal(goalId, criterion),
            },
          ]
        : undefined,
    // A clause lives in its goal's config and its numbers in the goal's metric
    // series, so refreshing re-reads both.
    refresh: () => Promise.all([refreshGoalGraph(goalId), refreshGoalMetricSeries(goalId)]),
  };
};
