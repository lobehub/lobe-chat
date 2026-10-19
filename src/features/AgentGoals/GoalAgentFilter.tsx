'use client';

import { Button, type DropdownItem, DropdownMenu, Icon, Text } from '@lobehub/ui';
import { ChevronDownIcon, UsersIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AssigneeAvatar from '@/features/AgentTasks/features/AssigneeAvatar';
import { renderMenuCheck } from '@/features/AgentTasks/features/menuExtra';
import { useAgentDisplayMeta } from '@/features/AgentTasks/shared/useAgentDisplayMeta';

import type { GoalAgentFilterOption } from './goalAgentFilterOptions';

const AgentName = memo<{ agentId: string }>(({ agentId }) => {
  const meta = useAgentDisplayMeta(agentId);
  return <>{meta?.title ?? agentId}</>;
});

AgentName.displayName = 'GoalAgentFilterName';

interface GoalAgentFilterProps {
  onChange: (agentId?: string) => void;
  options: GoalAgentFilterOption[];
  value?: string;
}

/**
 * Narrows the cross-agent goals page to one agent's goals, the way an agent's
 * own Goals page would show them, without leaving the workspace.
 */
const GoalAgentFilter = memo<GoalAgentFilterProps>(({ onChange, options, value }) => {
  const { t } = useTranslation('chat');

  const items = useMemo<DropdownItem[]>(
    () => [
      {
        extra: renderMenuCheck(!value),
        icon: <Icon icon={UsersIcon} size={16} />,
        key: 'all',
        label: t('goalPage.agentFilter.all'),
        onClick: () => onChange(undefined),
      },
      ...options.map(({ agentId, count }) => ({
        extra: renderMenuCheck(agentId === value) ?? (
          <Text fontSize={12} type={'secondary'}>
            {count}
          </Text>
        ),
        icon: <AssigneeAvatar agentId={agentId} size={18} />,
        key: agentId,
        label: <AgentName agentId={agentId} />,
        onClick: () => onChange(agentId),
      })),
    ],
    [onChange, options, t, value],
  );

  return (
    <DropdownMenu items={items} placement={'bottomRight'}>
      <Button
        icon={value ? <AssigneeAvatar agentId={value} size={16} /> : <Icon icon={UsersIcon} />}
        size={'small'}
        title={t('goalPage.agentFilter.title')}
      >
        {value ? <AgentName agentId={value} /> : t('goalPage.agentFilter.all')}
        <Icon icon={ChevronDownIcon} size={14} />
      </Button>
    </DropdownMenu>
  );
});

GoalAgentFilter.displayName = 'GoalAgentFilter';

export default GoalAgentFilter;
