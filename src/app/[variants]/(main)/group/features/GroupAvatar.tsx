'use client';

import { Avatar, GroupAvatar, Skeleton } from '@lobehub/ui';
import React, { memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';

const SupervisorAvatar = memo<{ size?: number }>(({ size = 28 }) => {
  const meta = useAgentStore(agentSelectors.currentAgentMeta);
  const [isGroupsInit, groupMeta, agents] = useAgentGroupStore((s) => [
    agentGroupSelectors.isGroupsInit(s),
    agentGroupSelectors.currentGroupMeta(s),
    agentGroupSelectors.currentGroupAgents(s),
  ]);

  if (isGroupsInit) return <Skeleton.Avatar shape={'square'} size={size} />;

  if (meta?.avatar && meta?.avatar !== DEFAULT_AVATAR)
    return <Avatar avatar={meta.avatar} background={meta?.backgroundColor} size={size} />;

  return (
    <GroupAvatar
      avatarShape={'square'}
      avatars={agents.map((agent) => ({
        avatar: agent.avatar || DEFAULT_AVATAR,
        background: agent.backgroundColor || undefined,
        style: { borderRadius: 3 },
      }))}
      cornerShape={'square'}
      size={size}
      title={groupMeta?.title || undefined}
    />
  );
});

export default SupervisorAvatar;
