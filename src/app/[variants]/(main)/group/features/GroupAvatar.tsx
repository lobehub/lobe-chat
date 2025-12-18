'use client';

import { GroupAvatar } from '@lobehub/ui';
import React, { PropsWithChildren, memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { SkeletonItem } from '@/features/NavPanel/components/SkeletonList';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';

const SupervisorAvatar = memo<PropsWithChildren>(() => {
  const [isGroupsInit, groupMeta, agents] = useAgentGroupStore((s) => [
    agentGroupSelectors.isGroupsInit(s),
    agentGroupSelectors.currentGroupMeta(s),
    agentGroupSelectors.currentGroupAgents(s),
  ]);

  if (isGroupsInit) return <SkeletonItem height={32} padding={0} />;

  return (
    <GroupAvatar
      avatarShape={'square'}
      avatars={agents.map((agent) => ({
        avatar: agent.avatar || DEFAULT_AVATAR,
        background: agent.backgroundColor || undefined,
        style: { borderRadius: 3 },
      }))}
      cornerShape={'square'}
      size={28}
      title={groupMeta?.title || undefined}
    />
  );
});

export default SupervisorAvatar;
