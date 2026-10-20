'use client';

import { Breadcrumb, Icon, Text } from '@lobehub/ui';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { styles } from '@/features/AgentTasks/shared/style';
import WorkspaceLink from '@/features/Workspace/WorkspaceLink';
import { useUserStore } from '@/store/user';
import { labPreferSelectors } from '@/store/user/selectors';

interface GoalWorkspaceBreadcrumbProps {
  title: string;
}

/**
 * The bare `/goal/:goalId` page's way back: the cross-agent goal list, the way
 * a bare task detail leads back to `/tasks`. The list sits behind the goals
 * lab, so with it off the crumb is only the goal's title.
 */
const GoalWorkspaceBreadcrumb = memo<GoalWorkspaceBreadcrumbProps>(({ title }) => {
  const { t } = useTranslation('chat');
  const goalsEnabled = useUserStore(labPreferSelectors.enableGoals);

  const titleCrumb = {
    key: 'goal',
    title: (
      <Text ellipsis color={'inherit'} style={{ maxWidth: 320 }} weight={500}>
        {title}
      </Text>
    ),
  };

  return (
    <Breadcrumb
      className={styles.breadcrumb}
      separator={<Icon icon={ChevronRight} />}
      items={
        goalsEnabled
          ? [
              {
                key: 'goals',
                title: (
                  <WorkspaceLink to={'/goals'}>
                    <Text color={'inherit'} weight={500}>
                      {t('goalList.title')}
                    </Text>
                  </WorkspaceLink>
                ),
              },
              titleCrumb,
            ]
          : [titleCrumb]
      }
    />
  );
});

GoalWorkspaceBreadcrumb.displayName = 'GoalWorkspaceBreadcrumb';

export default GoalWorkspaceBreadcrumb;
